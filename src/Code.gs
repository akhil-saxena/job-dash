/**
 * Code.gs — Menu setup, triggers, onEdit handler
 */

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('JobDash')
    .addItem('Add Application', 'showAddApplicationSidebar')
    .addItem('Add Interview Round', 'showAddInterviewSidebar')
    .addItem('Update Status', 'showUpdateStatusSidebar')
    .addItem('Add Deadline', 'showAddDeadlineSidebar')
    .addSeparator()
    .addItem('Save Job Description', 'saveJobDescription')
    .addItem('Log Form Answer', 'showLogFormAnswerSidebar')
    .addSeparator()
    .addItem('Sort Dashboard', 'sortDashboard')
    .addItem('Archive Rejected', 'archiveRejected')
    .addItem('Refresh Stats', 'refreshStats')
    .addItem('View Sankey Diagram', 'showSankeyDialog')
    .addToUi();
}

// ========== SIDEBAR LAUNCHERS ==========

function showAddApplicationSidebar() {
  var html = HtmlService.createTemplateFromFile('Sidebar').evaluate().setTitle('New Application');
  SpreadsheetApp.getUi().showSidebar(html);
}

function showAddInterviewSidebar() {
  var html = HtmlService.createTemplateFromFile('InterviewForm').evaluate().setTitle('Add Interview Round');
  SpreadsheetApp.getUi().showSidebar(html);
}

function showUpdateStatusSidebar() {
  var html = HtmlService.createTemplateFromFile('StatusForm').evaluate().setTitle('Update Status');
  SpreadsheetApp.getUi().showSidebar(html);
}

function showAddDeadlineSidebar() {
  var html = HtmlService.createTemplateFromFile('DeadlineForm').evaluate().setTitle('Add Deadline');
  SpreadsheetApp.getUi().showSidebar(html);
}

function showLogFormAnswerSidebar() {
  var html = HtmlService.createTemplateFromFile('FormAnswerForm').evaluate().setTitle('Log Form Answer');
  SpreadsheetApp.getUi().showSidebar(html);
}

function showSankeyDialog() {
  var html = HtmlService.createHtmlOutputFromFile('SankeyDialog').setWidth(800).setHeight(520);
  SpreadsheetApp.getUi().showModalDialog(html, 'Pipeline Flow');
}

// ========== ON EDIT HANDLER ==========

function onEditHandler(e) {
  var sheet = e.source.getActiveSheet();
  var range = e.range;

  if (sheet.getName() !== 'Dashboard') return;

  var row = range.getRow();
  if (row < 3) return;

  var col = range.getColumn();

  // Update Last Updated (column 9) on any edit
  sheet.getRange(row, 9).setValue(new Date());

  // If Status column (3) changed
  if (col === 3) {
    var newStatus = range.getValue();
    var oldStatus = e.oldValue || '';

    // Update Status Changed Date (hidden column 17)
    sheet.getRange(row, 17).setValue(new Date());

    // Reset Days in Status
    sheet.getRange(row, 11).setValue(0);

    // Auto-set Applied Date if transitioning from Wishlist
    if (oldStatus === 'Wishlist' && newStatus !== 'Wishlist') {
      sheet.getRange(row, 8).setValue(new Date());
    }

    // Update status cell color
    var statusColors = getStatusColors();
    var color = statusColors[newStatus];
    if (color) {
      range.setBackground(color.bg).setFontColor(color.text);
    }

    // Update tab color and log activity
    var company = sheet.getRange(row, 1).getValue();
    var role = sheet.getRange(row, 2).getValue();
    var tabName = findJobTab(company, role);
    if (tabName) {
      var jobSheet = e.source.getSheetByName(tabName);
      if (jobSheet && color) {
        jobSheet.setTabColor(color.bg);
      }
      if (jobSheet) {
        appendActivityLog(jobSheet, 'Status: ' + oldStatus + ' → ' + newStatus);
      }
    }

    // Un-grey Post-Process if concluded
    if (['Accepted', 'Rejected', 'Withdrawn'].indexOf(newStatus) !== -1) {
      if (tabName) {
        var js = e.source.getSheetByName(tabName);
        if (js) js.getRange('A40:E45').setFontColor('#555555');
      }
    }
  }
}

// ========== TRIGGERS ==========

function installTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    var fn = trigger.getHandlerFunction();
    if (fn === 'onEditHandler' || fn === 'dailyRefresh') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger('onEditHandler')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onEdit()
    .create();

  ScriptApp.newTrigger('dailyRefresh')
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .create();
}

// ========== DAILY REFRESH ==========

function dailyRefresh() {
  refreshDaysInStatus();
  refreshStats();
}

function refreshDaysInStatus() {
  var dashboard = getDashboardSheet();
  var lastRow = dashboard.getLastRow();
  if (lastRow < 3) return;

  var today = new Date();
  today.setHours(0, 0, 0, 0);

  for (var r = 3; r <= lastRow; r++) {
    var statusChangedDate = dashboard.getRange(r, 17).getValue();
    if (statusChangedDate) {
      var changed = new Date(statusChangedDate);
      changed.setHours(0, 0, 0, 0);
      var days = Math.floor((today - changed) / (1000 * 60 * 60 * 24));
      dashboard.getRange(r, 11).setValue(days);
    }
  }
}

// ========== SANKEY DATA ==========

function getSankeyData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabNames = getJobTabNames();
  var transitions = {};

  for (var t = 0; t < tabNames.length; t++) {
    var sheet = ss.getSheetByName(tabNames[t]);
    if (!sheet) continue;
    var lastRow = sheet.getLastRow();
    if (lastRow < 48) continue;

    var logData = sheet.getRange(48, 2, lastRow - 47, 1).getValues();
    for (var i = 0; i < logData.length; i++) {
      var text = String(logData[i][0]);
      var match = text.match(/(?:Status:\s*)?(.+?)\s*→\s*(.+)/);
      if (match) {
        var key = match[1].trim() + '|' + match[2].trim();
        transitions[key] = (transitions[key] || 0) + 1;
      }
    }
  }

  var result = [];
  for (var key in transitions) {
    var parts = key.split('|');
    result.push([parts[0], parts[1], transitions[key]]);
  }
  return result;
}

// ========== INITIAL SETUP ==========

function initialSetup() {
  setupConfigTab();
  setupDashboardTab();
  setupTemplateTab();
  setupAnalyticsTab();
  installTriggers();
  createAnalyticsCharts();
  SpreadsheetApp.getUi().alert(
    'Setup Complete',
    'All tabs, triggers, and charts created. You are ready to go!',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function setupConfigTab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('_Config');
  if (!sheet) sheet = ss.insertSheet('_Config');
  sheet.clear();

  var data = [
    ['STATUSES', 'STATUS_BG', 'STATUS_TEXT', 'STATUS_SORT'],
    ['Wishlist', '#ececec', '#888888', 5],
    ['Applied', '#e3eef8', '#5a7fa8', 4],
    ['Screening', '#ede8f5', '#7c6c9a', 3],
    ['Interviewing', '#fef3e2', '#b8860b', 1],
    ['Offer', '#e5f0e8', '#6a8f72', 2],
    ['Accepted', '#dff0e8', '#4a7a5a', 6],
    ['Rejected', '#f5e5e5', '#a67272', 7],
    ['Withdrawn', '#eaeaea', '#999999', 8],
    [''],
    ['PRIORITIES', 'PRIORITY_DOT'],
    ['High', '#d4887a'],
    ['Medium', '#d4b574'],
    ['Low', '#b0b0b0'],
    [''],
    ['SOURCES'],
    ['LinkedIn'],
    ['Referral'],
    ['Naukri'],
    ['Company Site'],
    ['Indeed'],
    ['AngelList'],
    ['Other'],
    [''],
    ['ROUND_TYPES'],
    ['Phone Screen'],
    ['Recruiter Call'],
    ['Technical'],
    ['System Design'],
    ['Behavioral'],
    ['Hiring Manager'],
    ['Bar Raiser'],
    ['Take-Home'],
    ['Panel'],
    ['Custom'],
    [''],
    ['ROUND_STATUSES'],
    ['Scheduled'],
    ['Completed'],
    ['Cancelled'],
    ['No-Show'],
    [''],
    ['ROUND_OUTCOMES'],
    ['Pass'],
    ['Fail'],
    ['Unclear'],
    ['Waiting'],
    [''],
    ['LOCATIONS'],
    ['Remote'],
    ['Hybrid'],
    ['Onsite']
  ];

  sheet.getRange(1, 1, data.length, 4).setValues(
    data.map(function(row) {
      while (row.length < 4) row.push('');
      return row;
    })
  );
  sheet.hideSheet();
}

function setupDashboardTab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Dashboard');
  if (!sheet) {
    // Rename Sheet1 if it exists, otherwise create
    var sheet1 = ss.getSheetByName('Sheet1');
    if (sheet1) {
      sheet1.setName('Dashboard');
      sheet = sheet1;
    } else {
      sheet = ss.insertSheet('Dashboard');
    }
  }
  sheet.clear();
  sheet.setTabColor('#7c9a72');

  // Row 1: Summary stats
  sheet.getRange('A1').setValue('Total Active');
  sheet.getRange('C1').setValue('Interviews');
  sheet.getRange('E1').setValue('Avg Response');
  sheet.getRange('G1').setValue('Offer Rate');
  sheet.getRange('B1').setValue(0);
  sheet.getRange('D1').setValue(0);
  sheet.getRange('F1').setValue('—');
  sheet.getRange('H1').setValue('0%');

  var statsRange = sheet.getRange('A1:Q1');
  statsRange.setBackground('#f0eeea').setFontSize(11);
  sheet.getRange('A1').setFontWeight('bold');
  sheet.getRange('C1').setFontWeight('bold');
  sheet.getRange('E1').setFontWeight('bold');
  sheet.getRange('G1').setFontWeight('bold');

  // Row 2: Column headers
  var headers = [
    'Company', 'Role', 'Status', 'Priority', 'Location', 'Salary Range',
    'Source', 'Applied', 'Last Updated', 'Next Deadline', 'Days in Status',
    'Next Action', 'Referral', 'Tags', 'Job URL', 'Details', 'Status Changed'
  ];
  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  var headerRange = sheet.getRange('A2:Q2');
  headerRange.setBackground('#f0eeea').setFontColor('#888888').setFontSize(10)
    .setFontWeight('bold');

  // Freeze rows 1-2
  sheet.setFrozenRows(2);

  // Hide column Q (Status Changed Date)
  sheet.hideColumns(17);

  // Column widths
  var widths = [120, 140, 110, 80, 100, 90, 90, 80, 80, 90, 60, 150, 100, 100, 60, 60, 80];
  for (var i = 0; i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }

  // Data validation
  var configSheet = getConfigSheet();
  var statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(configSheet.getRange('A2:A9')).build();
  sheet.getRange('C3:C1000').setDataValidation(statusRule);

  var priorityRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(configSheet.getRange('A12:A14')).build();
  sheet.getRange('D3:D1000').setDataValidation(priorityRule);

  var locationRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(configSheet.getRange('A50:A52')).build();
  sheet.getRange('E3:E1000').setDataValidation(locationRule);

  var sourceRule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(configSheet.getRange('A17:A23')).build();
  sheet.getRange('G3:G1000').setDataValidation(sourceRule);

  // Conditional formatting: status colors
  var statusColors = getStatusColors();
  var statuses = getStatuses();
  for (var i = 0; i < statuses.length; i++) {
    var status = statuses[i];
    var c = statusColors[status];
    if (!c) continue;
    var rule = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(status)
      .setBackground(c.bg)
      .setFontColor(c.text)
      .setRanges([sheet.getRange('C3:C1000')])
      .build();
    var rules = sheet.getConditionalFormatRules();
    rules.push(rule);
    sheet.setConditionalFormatRules(rules);
  }

  // Row dimming for Rejected/Withdrawn
  var dimRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=OR($C3="Rejected",$C3="Withdrawn")')
    .setFontColor('#cccccc')
    .setRanges([sheet.getRange('A3:Q1000')])
    .build();
  var allRules = sheet.getConditionalFormatRules();
  allRules.push(dimRule);
  sheet.setConditionalFormatRules(allRules);

  // Background
  sheet.getRange('A3:Q1000').setBackground('#faf9f6');
}

function setupTemplateTab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('_Template');
  if (!sheet) sheet = ss.insertSheet('_Template');
  sheet.clear();

  // Set background
  sheet.getRange('A1:F60').setBackground('#faf9f6');

  // Header
  sheet.getRange('A1').setValue('{Company} — {Role}').setFontSize(18).setFontWeight('bold').setFontColor('#2d2d2d');
  sheet.getRange('A2').setValue('{Team} · {Location} · {Source}').setFontSize(12).setFontColor('#888888');

  // Left column sections
  var sectionStyle = function(range) {
    range.setFontSize(11).setFontColor('#aaaaaa').setFontWeight('bold');
    range.setBorder(null, null, true, null, null, null, '#eceae5', SpreadsheetApp.BorderStyle.SOLID);
  };
  var labelStyle = function(range) {
    range.setFontSize(12).setFontColor('#999999');
  };
  var valueStyle = function(range) {
    range.setFontSize(12).setFontColor('#555555');
  };

  // JOB INFO
  sheet.getRange('A5').setValue('JOB INFO');
  sectionStyle(sheet.getRange('A5:B5'));
  var jobLabels = ['Posting URL', 'Team / Org', 'Applied', 'Next Deadline', 'Tags', 'Salary Range'];
  for (var i = 0; i < jobLabels.length; i++) {
    sheet.getRange(6 + i, 1).setValue(jobLabels[i]);
    labelStyle(sheet.getRange(6 + i, 1));
    valueStyle(sheet.getRange(6 + i, 2));
  }

  // PEOPLE
  sheet.getRange('A13').setValue('PEOPLE');
  sectionStyle(sheet.getRange('A13:B13'));
  var peopleLabels = ['Recruiter', 'Hiring Manager', 'Referral'];
  for (var i = 0; i < peopleLabels.length; i++) {
    sheet.getRange(14 + i, 1).setValue(peopleLabels[i]);
    labelStyle(sheet.getRange(14 + i, 1));
    valueStyle(sheet.getRange(14 + i, 2));
  }

  // DOCUMENTS
  sheet.getRange('A18').setValue('DOCUMENTS');
  sectionStyle(sheet.getRange('A18:B18'));
  var docLabels = ['Resume', 'Offer Letter', 'View JD', 'Form Answers'];
  for (var i = 0; i < docLabels.length; i++) {
    sheet.getRange(19 + i, 1).setValue(docLabels[i]);
    labelStyle(sheet.getRange(19 + i, 1));
    valueStyle(sheet.getRange(19 + i, 2));
  }

  // Right column: RESEARCH & PREP
  sheet.getRange('D5').setValue('RESEARCH & PREP');
  sectionStyle(sheet.getRange('D5:E5'));
  sheet.getRange('D6').setFontSize(12).setFontColor('#555555');
  sheet.getRange('D6').setNote('Interview style, known questions, tech stack, green/red flags');

  // INTERVIEW ROUNDS header
  sheet.getRange('D13').setValue('INTERVIEW ROUNDS');
  sectionStyle(sheet.getRange('D13:E13'));

  // POST-PROCESS (greyed out)
  sheet.getRange('A40').setValue('POST-PROCESS (unlocks when concluded)');
  sectionStyle(sheet.getRange('A40:E40'));
  var postLabels = [
    ['Rating', '', 'Rejection Reason', ''],
    ['Review', '', 'Rejection Stage', ''],
    ['', '', 'Re-apply?', ''],
    ['', '', 'Reapply After', ''],
    ['', '', 'Key Learnings', '']
  ];
  sheet.getRange(41, 1, postLabels.length, 4).setValues(postLabels);
  sheet.getRange('A41:E45').setFontColor('#cccccc').setFontSize(11);

  // ACTIVITY LOG
  sheet.getRange('A47').setValue('ACTIVITY LOG (auto)');
  sectionStyle(sheet.getRange('A47:E47'));

  // Column widths
  sheet.setColumnWidth(1, 120);
  sheet.setColumnWidth(2, 250);
  sheet.setColumnWidth(3, 20);
  sheet.setColumnWidth(4, 120);
  sheet.setColumnWidth(5, 250);

  sheet.hideSheet();
}

function setupAnalyticsTab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Analytics');
  if (!sheet) sheet = ss.insertSheet('Analytics');
  sheet.clear();
  sheet.setTabColor('#7b9ec4');
  sheet.getRange('A1:J50').setBackground('#faf9f6');
  sheet.getRange('A1').setValue('Analytics').setFontSize(16).setFontWeight('bold').setFontColor('#2d2d2d');
  sheet.getRange('A2').setValue('Refresh via JobDash menu or auto-refreshes daily').setFontSize(11).setFontColor('#aaaaaa');
}
