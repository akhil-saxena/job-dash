/**
 * FormHandlers.gs — Server-side handlers for all sidebar forms
 */

/**
 * Creates a new application: adds Dashboard row + clones _Template tab.
 */
function createApplication(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = getDashboardSheet();
  var template = ss.getSheetByName('_Template');

  var tabName = generateTabName(data.company, data.role);

  // Clone template
  var newSheet = template.copyTo(ss);
  newSheet.setName(tabName);
  newSheet.showSheet();

  // Set tab color
  var statusColors = getStatusColors();
  var statusColor = statusColors[data.status];
  if (statusColor) newSheet.setTabColor(statusColor.bg);

  // Populate job detail tab
  newSheet.getRange('A1').setValue(data.company + ' — ' + data.role);
  var subtitle = [data.location, data.locationCity, data.source].filter(Boolean).join(' · ');
  newSheet.getRange('A2').setValue(subtitle);

  if (data.jobUrl) newSheet.getRange('B6').setValue(data.jobUrl);
  if (data.locationCity) newSheet.getRange('B7').setValue(data.locationCity);
  var now = new Date();
  var appliedDate = (data.status !== 'Wishlist') ? now : '';
  if (appliedDate) newSheet.getRange('B8').setValue(formatDate(appliedDate));
  if (data.tags) newSheet.getRange('B10').setValue(data.tags);
  if (data.salaryRange) newSheet.getRange('B11').setValue(data.salaryRange);
  if (data.referral) newSheet.getRange('B16').setValue(data.referral);

  if (data.resumeName && data.resumeLink) {
    newSheet.getRange('B19').setValue(data.resumeName);
    newSheet.getRange('B19').setFormula('=HYPERLINK("' + data.resumeLink + '", "' + data.resumeName + ' ↗")');
    newSheet.getRange('B19').setFontColor('#7b9ec4');
  } else if (data.resumeName) {
    newSheet.getRange('B19').setValue(data.resumeName);
  }

  // Activity Log
  newSheet.getRange('A48').setValue(formatDateShort(now));
  newSheet.getRange('B48').setValue('Application created');
  newSheet.getRange('A48').setFontColor('#bbbbbb').setFontSize(11);
  newSheet.getRange('B48').setFontColor('#999999').setFontSize(11);

  // Dashboard row
  var nextRow = dashboard.getLastRow() + 1;
  if (nextRow < 3) nextRow = 3;

  dashboard.getRange(nextRow, 1, 1, 17).setValues([[
    data.company,
    data.role,
    data.status,
    data.priority,
    data.location + (data.locationCity ? ' · ' + data.locationCity : ''),
    data.salaryRange || '',
    data.source,
    appliedDate || '',
    now,
    '',
    0,
    '',
    data.referral || '',
    data.tags || '',
    data.jobUrl || '',
    '',
    now
  ]]);

  // Details hyperlink
  var detailsLink = '=HYPERLINK("#gid=' + newSheet.getSheetId() + '", "→ Open")';
  dashboard.getRange(nextRow, 16).setFormula(detailsLink).setFontColor('#7b9ec4');

  // Status color
  if (statusColor) {
    dashboard.getRange(nextRow, 3).setBackground(statusColor.bg).setFontColor(statusColor.text);
  }

  hideEmptyRows(newSheet);

  return { tabName: tabName };
}

/**
 * Adds an interview round to a job's detail tab.
 */
function addInterviewRound(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var jobSheet = ss.getSheetByName(data.application);
  if (!jobSheet) throw new Error('Tab not found: ' + data.application);

  // Count existing rounds
  var roundNumber = 0;
  var roundStartRow = 14;
  var colD = jobSheet.getRange('D14:D100').getValues();
  for (var i = 0; i < colD.length; i++) {
    if (String(colD[i][0]).match(/^R\d+$/)) roundNumber++;
  }
  roundNumber++;

  var insertRow = roundStartRow + ((roundNumber - 1) * 14);

  if (insertRow > jobSheet.getMaxRows() - 20) {
    jobSheet.insertRowsAfter(jobSheet.getMaxRows(), 20);
  }

  var roundType = data.roundType === 'Custom' ? data.customTypeName : data.roundType;
  var isScheduled = data.status === 'Scheduled';

  // Round header
  jobSheet.getRange(insertRow, 4).setValue('R' + roundNumber);
  jobSheet.getRange(insertRow, 5).setValue(roundType);
  jobSheet.getRange(insertRow, 4).setFontWeight('bold').setFontColor('#2d2d2d').setFontSize(13);
  jobSheet.getRange(insertRow, 5).setFontColor('#888888').setFontSize(12);

  // Status + Outcome
  var statusText = data.status;
  if (data.outcome) statusText += '  |  Outcome: ' + data.outcome;
  jobSheet.getRange(insertRow + 1, 4).setValue('Status:');
  jobSheet.getRange(insertRow + 1, 5).setValue(statusText);
  jobSheet.getRange(insertRow + 1, 4).setFontColor('#999999').setFontSize(11);
  jobSheet.getRange(insertRow + 1, 5).setFontSize(11);

  // Date, duration, interviewer
  var dateStr = data.date ? formatDateShort(new Date(data.date)) : '';
  var details = [dateStr, data.duration + 'm', data.interviewer].filter(Boolean).join(' · ');
  jobSheet.getRange(insertRow + 2, 4).setValue(details);
  jobSheet.getRange(insertRow + 2, 4).setFontColor('#888888').setFontSize(11);

  // Interviewer LinkedIn
  if (data.interviewerLinkedin) {
    jobSheet.getRange(insertRow + 2, 5).setFormula(
      '=HYPERLINK("' + data.interviewerLinkedin + '", "LinkedIn ↗")'
    ).setFontColor('#7b9ec4').setFontSize(11);
  }

  // Meeting link
  if (data.meetingLink) {
    jobSheet.getRange(insertRow + 3, 4).setFormula(
      '=HYPERLINK("' + data.meetingLink + '", "Join Meeting ↗")'
    ).setFontColor('#7b9ec4').setFontSize(11);
  }

  // Questions to ask them
  if (data.questionsToAsk) {
    jobSheet.getRange(insertRow + 4, 4).setValue('Qs to ask:');
    jobSheet.getRange(insertRow + 4, 4).setFontWeight('bold').setFontColor('#555555').setFontSize(11);
    jobSheet.getRange(insertRow + 4, 5).setValue(data.questionsToAsk).setFontColor('#555555').setFontSize(11);
  }

  // Editable field labels
  var labels = ['Qs:', 'My answers:', 'Notes:', 'Feedback:', 'Self-rating:', 'Thank-you sent:'];
  for (var i = 0; i < labels.length; i++) {
    jobSheet.getRange(insertRow + 5 + i, 4).setValue(labels[i]);
    jobSheet.getRange(insertRow + 5 + i, 4).setFontWeight('bold').setFontColor('#555555').setFontSize(11);
    jobSheet.getRange(insertRow + 5 + i, 5).setFontColor('#555555').setFontSize(11);
  }

  // Scheduled round: amber border
  if (isScheduled) {
    var roundRange = jobSheet.getRange(insertRow, 4, 13, 2);
    roundRange.setBorder(null, true, null, null, null, null, '#d4a574', SpreadsheetApp.BorderStyle.SOLID_MEDIUM);
  }

  // Separator
  jobSheet.getRange(insertRow + 12, 4, 1, 2).setBorder(null, null, true, null, null, null, '#e5e2dc', SpreadsheetApp.BorderStyle.SOLID);

  appendActivityLog(jobSheet, 'Round ' + roundNumber + ' (' + roundType + ') added');

  return { roundNumber: roundNumber, roundType: roundType };
}

/**
 * Updates status for an application via sidebar.
 */
function updateApplicationStatus(tabName, newStatus) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = getDashboardSheet();
  var jobSheet = ss.getSheetByName(tabName);
  if (!jobSheet) throw new Error('Tab not found: ' + tabName);

  var targetRow = findDashboardRowByTab(tabName);
  if (!targetRow) throw new Error('Dashboard row not found for: ' + tabName);

  var oldStatus = dashboard.getRange(targetRow, 3).getValue();
  var now = new Date();
  var statusColors = getStatusColors();
  var color = statusColors[newStatus];

  dashboard.getRange(targetRow, 3).setValue(newStatus);
  dashboard.getRange(targetRow, 9).setValue(now);
  dashboard.getRange(targetRow, 17).setValue(now);
  dashboard.getRange(targetRow, 11).setValue(0);

  if (oldStatus === 'Wishlist' && newStatus !== 'Wishlist') {
    dashboard.getRange(targetRow, 8).setValue(now);
  }

  if (color) {
    dashboard.getRange(targetRow, 3).setBackground(color.bg).setFontColor(color.text);
    jobSheet.setTabColor(color.bg);
  }

  appendActivityLog(jobSheet, 'Status: ' + oldStatus + ' → ' + newStatus);

  if (['Accepted', 'Rejected', 'Withdrawn'].indexOf(newStatus) !== -1) {
    jobSheet.getRange('A40:E45').setFontColor('#555555');
  }
}

/**
 * Adds a deadline.
 */
function addDeadline(tabName, dateStr, description) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = getDashboardSheet();
  var jobSheet = ss.getSheetByName(tabName);
  if (!jobSheet) throw new Error('Tab not found: ' + tabName);

  var deadlineDate = new Date(dateStr);

  var targetRow = findDashboardRowByTab(tabName);
  if (targetRow) {
    dashboard.getRange(targetRow, 10).setValue(deadlineDate);
  }

  jobSheet.getRange('B9').setValue(formatDateShort(deadlineDate) + ' — ' + description);
  appendActivityLog(jobSheet, 'Deadline added: ' + description + ' (' + formatDateShort(deadlineDate) + ')');
}

/**
 * Save Job Description — creates/opens Google Doc.
 */
function saveJobDescription() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var activeSheet = ss.getActiveSheet();
  var reserved = ['Dashboard', 'Analytics', '_Template', '_Config'];
  var tabName;

  if (reserved.indexOf(activeSheet.getName()) === -1) {
    tabName = activeSheet.getName();
  } else {
    var response = ui.prompt('Save Job Description', 'Enter the job tab name:', ui.ButtonSet.OK_CANCEL);
    if (response.getSelectedButton() !== ui.Button.OK) return;
    tabName = response.getResponseText().trim();
  }

  var jobSheet = ss.getSheetByName(tabName);
  if (!jobSheet) { ui.alert('Tab not found: ' + tabName); return; }

  var url = createJDDoc(tabName);
  jobSheet.getRange('B21').setFormula('=HYPERLINK("' + url + '", "View JD ↗")');
  jobSheet.getRange('B21').setFontColor('#7b9ec4');
  hideEmptyRows(jobSheet);

  var htmlOutput = HtmlService.createHtmlOutput(
    '<script>window.open("' + url + '");google.script.host.close();</script>'
  ).setWidth(1).setHeight(1);
  ui.showModalDialog(htmlOutput, 'Opening...');
}

/**
 * Logs a form Q&A to Google Doc.
 */
function logFormAnswer(tabName, question, answer) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var jobSheet = ss.getSheetByName(tabName);
  if (!jobSheet) throw new Error('Tab not found: ' + tabName);

  var url = appendFormAnswer(tabName, question, answer);

  var existing = jobSheet.getRange('B22').getValue();
  if (!existing) {
    jobSheet.getRange('B22').setFormula('=HYPERLINK("' + url + '", "View Form Answers ↗")');
    jobSheet.getRange('B22').setFontColor('#7b9ec4');
    hideEmptyRows(jobSheet);
  }

  return { url: url };
}
