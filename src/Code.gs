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

  // If Status column (C=3) changed
  if (col === 3) {
    var newStatus = range.getValue();
    var oldStatus = e.oldValue || '';

    // Update StatusChanged (hidden K=11)
    sheet.getRange(row, 11).setValue(new Date());

    // Reset Days in Status (H=8)
    sheet.getRange(row, 8).setValue(0);

    // Auto-set Applied Date (G=7) if transitioning from Wishlist
    if (oldStatus === 'Wishlist' && newStatus !== 'Wishlist') {
      sheet.getRange(row, 7).setValue(new Date());
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
    var statusChangedDate = dashboard.getRange(r, 11).getValue(); // K=11
    if (statusChangedDate) {
      var changed = new Date(statusChangedDate);
      changed.setHours(0, 0, 0, 0);
      var days = Math.floor((today - changed) / (1000 * 60 * 60 * 24));
      dashboard.getRange(r, 8).setValue(days); // H=8
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
    'All tabs, triggers, and charts created. You are ready to go!\n\nReload the spreadsheet to see the JobDash menu.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Resets and re-applies formatting to an existing application tab.
 * Use if you want to refresh the look of an existing job tab.
 */
function reformatExistingTabs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabNames = getJobTabNames();
  for (var t = 0; t < tabNames.length; t++) {
    var sheet = ss.getSheetByName(tabNames[t]);
    if (sheet) applyJobTabFormatting(sheet);
  }
  SpreadsheetApp.getActiveSpreadsheet().toast('All job tabs reformatted.', 'JobDash');
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
    var sheet1 = ss.getSheetByName('Sheet1');
    if (sheet1) { sheet1.setName('Dashboard'); sheet = sheet1; }
    else { sheet = ss.insertSheet('Dashboard'); }
  }
  sheet.clear();
  sheet.clearConditionalFormatRules();
  sheet.setTabColor('#7c9a72');

  // === NEW SLIM DASHBOARD: 10 visible columns + 1 hidden ===
  // A=Company B=Role C=Status D=Priority E=Location F=Source G=Applied H=Days I=NextAction J=Details K=StatusChanged(hidden)

  // Whole sheet background
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns()).setBackground('#faf9f6')
    .setFontFamily('Google Sans').setFontSize(11).setFontColor('#555555');

  // Row 1: Summary stats
  sheet.getRange('A1:B1').mergeAcross();
  sheet.getRange('C1:D1').mergeAcross();
  sheet.getRange('E1:F1').mergeAcross();
  sheet.getRange('G1:H1').mergeAcross();

  sheet.getRange('A1').setValue('  Active: 0').setFontWeight('bold').setFontColor('#2d2d2d');
  sheet.getRange('C1').setValue('  Interviews: 0').setFontWeight('bold').setFontColor('#2d2d2d');
  sheet.getRange('E1').setValue('  Avg Response: —').setFontWeight('bold').setFontColor('#2d2d2d');
  sheet.getRange('G1').setValue('  Offer Rate: 0%').setFontWeight('bold').setFontColor('#2d2d2d');

  sheet.getRange('A1:J1').setBackground('#f0eeea').setFontSize(11)
    .setBorder(null, null, true, null, null, null, '#e5e2dc', SpreadsheetApp.BorderStyle.SOLID);
  sheet.setRowHeight(1, 36);

  // Row 2: Column headers
  var headers = ['Company', 'Role', 'Status', 'Priority', 'Location', 'Source', 'Applied', 'Days', 'Next Action', 'Details', 'StatusChanged'];
  sheet.getRange(2, 1, 1, headers.length).setValues([headers]);
  sheet.getRange('A2:K2').setBackground('#f0eeea').setFontColor('#999999').setFontSize(10)
    .setFontWeight('bold').setVerticalAlignment('middle')
    .setBorder(null, null, true, null, null, null, '#e5e2dc', SpreadsheetApp.BorderStyle.SOLID);
  sheet.setRowHeight(2, 32);

  sheet.setFrozenRows(2);
  sheet.hideColumns(11); // Hide StatusChanged

  // Column widths
  var widths = [150, 200, 115, 85, 95, 95, 90, 55, 220, 70, 80];
  for (var i = 0; i < widths.length; i++) {
    sheet.setColumnWidth(i + 1, widths[i]);
  }

  // Data row defaults
  sheet.getRange('A3:K200').setVerticalAlignment('middle').setFontSize(11);
  sheet.setRowHeightsForced(3, 198, 32);

  // Alternating row colors
  var banding = sheet.getRange('A3:J200').applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY);
  banding.setFirstRowColor('#faf9f6').setSecondRowColor('#f5f3ef');
  banding.setHeaderRowColor(null);

  // Company column bold
  sheet.getRange('A3:A200').setFontWeight('bold').setFontColor('#2d2d2d');

  // Details column style
  sheet.getRange('J3:J200').setFontColor('#7b9ec4');

  // Data validation
  var configSheet = getConfigSheet();
  sheet.getRange('C3:C200').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInRange(configSheet.getRange('A2:A9')).build()
  );
  sheet.getRange('D3:D200').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInRange(configSheet.getRange('A12:A14')).build()
  );
  sheet.getRange('E3:E200').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInRange(configSheet.getRange('A50:A52')).build()
  );
  sheet.getRange('F3:F200').setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInRange(configSheet.getRange('A17:A23')).build()
  );

  // Conditional formatting
  var rules = [];
  var statusColors = getStatusColors();
  var statuses = getStatuses();

  for (var i = 0; i < statuses.length; i++) {
    var c = statusColors[statuses[i]];
    if (!c) continue;
    rules.push(SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(statuses[i])
      .setBackground(c.bg).setFontColor(c.text).setBold(true)
      .setRanges([sheet.getRange('C3:C200')]).build());
  }

  // Row dimming for Rejected/Withdrawn
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=OR($C3="Rejected",$C3="Withdrawn")')
    .setFontColor('#cccccc')
    .setRanges([sheet.getRange('A3:J200')]).build());

  // Days in Status — amber at 7+
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThanOrEqualTo(7)
    .setFontColor('#b8860b')
    .setRanges([sheet.getRange('H3:H200')]).build());

  // Days in Status — red at 14+
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenNumberGreaterThanOrEqualTo(14)
    .setFontColor('#c0705e').setBold(true)
    .setRanges([sheet.getRange('H3:H200')]).build());

  sheet.setConditionalFormatRules(rules);
}

function setupTemplateTab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('_Template');
  if (!sheet) sheet = ss.insertSheet('_Template');
  sheet.clear();

  // Ensure enough rows/columns
  if (sheet.getMaxRows() < 60) sheet.insertRowsAfter(sheet.getMaxRows(), 60 - sheet.getMaxRows());
  if (sheet.getMaxColumns() < 6) sheet.insertColumnsAfter(sheet.getMaxColumns(), 6 - sheet.getMaxColumns());

  // Full background + font
  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns())
    .setBackground('#faf9f6').setFontFamily('Google Sans').setFontColor('#555555').setFontSize(11);

  // Column widths
  sheet.setColumnWidth(1, 130);  // Labels
  sheet.setColumnWidth(2, 280);  // Values
  sheet.setColumnWidth(3, 30);   // Gutter
  sheet.setColumnWidth(4, 130);  // Right labels
  sheet.setColumnWidth(5, 280);  // Right values
  sheet.setColumnWidth(6, 30);

  // ====== HEADER ======
  sheet.getRange('A1:E1').mergeAcross().setBackground('#f0eeea');
  sheet.getRange('A1').setValue('{Company} — {Role}')
    .setFontSize(20).setFontWeight('bold').setFontColor('#2d2d2d');
  sheet.setRowHeight(1, 44);

  sheet.getRange('A2:E2').mergeAcross().setBackground('#f0eeea');
  sheet.getRange('A2').setValue('{Team} · {Location} · {Source}')
    .setFontSize(12).setFontColor('#999999');
  sheet.setRowHeight(2, 28);

  // Row 3: spacer
  sheet.setRowHeight(3, 8);
  sheet.getRange('A3:E3').setBackground('#faf9f6');

  // ====== HELPER FUNCTIONS ======
  var sectionHeader = function(row, startCol, endCol, text) {
    var range = sheet.getRange(row, startCol, 1, endCol - startCol + 1);
    range.mergeAcross();
    sheet.getRange(row, startCol).setValue(text);
    range.setFontSize(10).setFontColor('#b0b0b0').setFontWeight('bold')
      .setBackground('#f5f3ef')
      .setBorder(null, null, true, null, null, null, '#e5e2dc', SpreadsheetApp.BorderStyle.SOLID);
    sheet.setRowHeight(row, 28);
  };

  var labelCell = function(row, col, text) {
    sheet.getRange(row, col).setValue(text).setFontColor('#b0b0b0').setFontSize(11);
  };

  var valueCell = function(row, col) {
    sheet.getRange(row, col).setFontColor('#2d2d2d').setFontSize(11);
  };

  var rowBorder = function(row, startCol, endCol) {
    sheet.getRange(row, startCol, 1, endCol - startCol + 1)
      .setBorder(null, null, true, null, null, null, '#f0eeea', SpreadsheetApp.BorderStyle.SOLID);
  };

  // ====== LEFT COLUMN: JOB INFO (rows 4-11) ======
  sectionHeader(4, 1, 2, 'JOB INFO');
  var jobLabels = ['Posting URL', 'Team / Org', 'Applied', 'Next Deadline', 'Tags', 'Salary Range'];
  for (var i = 0; i < jobLabels.length; i++) {
    labelCell(5 + i, 1, jobLabels[i]);
    valueCell(5 + i, 2);
    rowBorder(5 + i, 1, 2);
    sheet.setRowHeight(5 + i, 26);
  }

  // Row 11: spacer
  sheet.setRowHeight(11, 10);

  // ====== LEFT COLUMN: PEOPLE (rows 12-16) ======
  sectionHeader(12, 1, 2, 'PEOPLE');
  var peopleLabels = ['Recruiter', 'Hiring Manager', 'Referral'];
  for (var i = 0; i < peopleLabels.length; i++) {
    labelCell(13 + i, 1, peopleLabels[i]);
    valueCell(13 + i, 2);
    rowBorder(13 + i, 1, 2);
    sheet.setRowHeight(13 + i, 26);
  }

  // Row 16: spacer
  sheet.setRowHeight(16, 10);

  // ====== LEFT COLUMN: DOCUMENTS (rows 17-22) ======
  sectionHeader(17, 1, 2, 'DOCUMENTS');
  var docLabels = ['Resume', 'Offer Letter', 'View JD', 'Form Answers'];
  for (var i = 0; i < docLabels.length; i++) {
    labelCell(18 + i, 1, docLabels[i]);
    valueCell(18 + i, 2);
    rowBorder(18 + i, 1, 2);
    sheet.setRowHeight(18 + i, 26);
  }

  // ====== RIGHT COLUMN: RESEARCH & PREP (rows 4-11) ======
  sectionHeader(4, 4, 5, 'RESEARCH & PREP');
  sheet.getRange(5, 4, 6, 2).mergeAcross();
  sheet.getRange(5, 4).setFontColor('#555555').setFontSize(11)
    .setVerticalAlignment('top').setWrap(true);
  sheet.getRange(5, 4).setNote('Interview style, known questions, tech stack, green/red flags');

  // ====== RIGHT COLUMN: INTERVIEW ROUNDS (row 12+) ======
  sectionHeader(12, 4, 5, 'INTERVIEW ROUNDS');
  // Rounds will be inserted by script starting row 14

  // ====== FULL WIDTH: POST-PROCESS (row 40) ======
  sectionHeader(40, 1, 5, 'POST-PROCESS  (unlocks when concluded)');
  var postLabelsLeft = ['Rating', 'Review'];
  var postLabelsRight = ['Rejection Reason', 'Rejection Stage', 'Re-apply?', 'Reapply After', 'Key Learnings'];
  for (var i = 0; i < postLabelsLeft.length; i++) {
    labelCell(41 + i, 1, postLabelsLeft[i]);
    sheet.getRange(41 + i, 2).setFontColor('#cccccc');
    sheet.setRowHeight(41 + i, 26);
  }
  for (var i = 0; i < postLabelsRight.length; i++) {
    labelCell(41 + i, 4, postLabelsRight[i]);
    sheet.getRange(41 + i, 5).setFontColor('#cccccc');
    sheet.setRowHeight(41 + i, 26);
  }
  // Grey everything in post-process
  sheet.getRange('A41:E45').setFontColor('#cccccc');

  // ====== FULL WIDTH: ACTIVITY LOG (row 47) ======
  sectionHeader(47, 1, 5, 'ACTIVITY LOG');
  // Row 48+ filled by script

  sheet.hideSheet();
}

/**
 * Applies formatting to a job detail tab (called after clone from template).
 */
function applyJobTabFormatting(sheet) {
  hideEmptyRows(sheet);
}

function setupAnalyticsTab() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Analytics');
  if (!sheet) sheet = ss.insertSheet('Analytics');
  sheet.clear();
  sheet.setTabColor('#7b9ec4');

  sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns())
    .setBackground('#faf9f6').setFontFamily('Google Sans');

  sheet.getRange('A1:J1').mergeAcross();
  sheet.getRange('A1').setValue('Analytics')
    .setFontSize(20).setFontWeight('bold').setFontColor('#2d2d2d');
  sheet.setRowHeight(1, 44);

  sheet.getRange('A2:J2').mergeAcross();
  sheet.getRange('A2').setValue('Refresh via JobDash → Refresh Stats  |  Auto-refreshes daily')
    .setFontSize(11).setFontColor('#b0b0b0');
  sheet.setRowHeight(2, 28);

  sheet.getRange('A1:J2').setBackground('#f0eeea');
}
