/**
 * Utils.gs — Config readers, date formatting, helpers
 */

function getConfigSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('_Config');
}

function getDashboardSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Dashboard');
}

/**
 * Reads a config list from _Config tab.
 * Starts reading from the row AFTER the header label, stops at first empty cell.
 */
function getConfigList(headerLabel, col) {
  var sheet = getConfigSheet();
  var data = sheet.getRange(1, col, sheet.getLastRow(), 1).getValues();
  var startIdx = -1;
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === headerLabel) {
      startIdx = i + 1;
      break;
    }
  }
  if (startIdx === -1) return [];
  var result = [];
  for (var i = startIdx; i < data.length; i++) {
    if (data[i][0] === '' || data[i][0] === null) break;
    result.push(data[i][0]);
  }
  return result;
}

function getStatuses() { return getConfigList('STATUSES', 1); }
function getSources() { return getConfigList('SOURCES', 1); }
function getRoundTypes() { return getConfigList('ROUND_TYPES', 1); }
function getRoundStatuses() { return getConfigList('ROUND_STATUSES', 1); }
function getRoundOutcomes() { return getConfigList('ROUND_OUTCOMES', 1); }
function getPriorities() { return getConfigList('PRIORITIES', 1); }
function getLocations() { return getConfigList('LOCATIONS', 1); }

/**
 * Gets status color mapping: { status: { bg, text, sort } }
 */
function getStatusColors() {
  var sheet = getConfigSheet();
  var data = sheet.getRange(1, 1, sheet.getLastRow(), 4).getValues();
  var startIdx = -1;
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === 'STATUSES') {
      startIdx = i + 1;
      break;
    }
  }
  if (startIdx === -1) return {};
  var colors = {};
  for (var i = startIdx; i < data.length; i++) {
    if (data[i][0] === '' || data[i][0] === null) break;
    colors[data[i][0]] = {
      bg: data[i][1],
      text: data[i][2],
      sort: parseInt(data[i][3], 10)
    };
  }
  return colors;
}

function formatDate(date) {
  if (!date) return '';
  var d = new Date(date);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
}

function formatDateShort(date) {
  if (!date) return '';
  var d = new Date(date);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return months[d.getMonth()] + ' ' + d.getDate();
}

/**
 * Generates a unique tab name. Appends (2), (3) if duplicate.
 */
function generateTabName(company, role) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets().map(function(s) { return s.getName(); });
  var base = company + ' - ' + role;
  if (sheets.indexOf(base) === -1) return base;
  var counter = 2;
  while (sheets.indexOf(base + ' (' + counter + ')') !== -1) {
    counter++;
  }
  return base + ' (' + counter + ')';
}

/**
 * Finds the Dashboard row for a job tab by matching company + role.
 */
function findDashboardRowByTab(tabName) {
  var sheet = getDashboardSheet();
  var lastRow = sheet.getLastRow();
  if (lastRow < 3) return null;
  var data = sheet.getRange(3, 1, lastRow - 2, 2).getValues();
  var cleaned = tabName.replace(/\s*\(\d+\)$/, '');
  var sepIdx = cleaned.indexOf(' - ');
  var company = sepIdx >= 0 ? cleaned.substring(0, sepIdx) : cleaned;
  var role = sepIdx >= 0 ? cleaned.substring(sepIdx + 3) : '';
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === company && data[i][1] === role) return i + 3;
  }
  return null;
}

/**
 * Gets all active job tab names (excludes system tabs).
 */
function getJobTabNames() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var reserved = ['Dashboard', 'Analytics', '_Template', '_Config'];
  return ss.getSheets()
    .map(function(s) { return s.getName(); })
    .filter(function(n) { return reserved.indexOf(n) === -1; });
}

/**
 * Finds the job tab name by company and role.
 */
function findJobTab(company, role) {
  var tabNames = getJobTabNames();
  var target = company + ' - ' + role;
  if (tabNames.indexOf(target) !== -1) return target;
  for (var i = 0; i < tabNames.length; i++) {
    if (tabNames[i].indexOf(target) === 0) return tabNames[i];
  }
  return null;
}

/**
 * Appends an entry to the Activity Log section of a job tab.
 */
function appendActivityLog(jobSheet, description) {
  var logStart = 48;
  var lastRow = jobSheet.getLastRow();
  var nextRow = Math.max(logStart, lastRow + 1);
  jobSheet.getRange(nextRow, 1).setValue(formatDateShort(new Date()));
  jobSheet.getRange(nextRow, 2).setValue(description);
  jobSheet.getRange(nextRow, 1).setFontColor('#bbbbbb').setFontSize(11);
  jobSheet.getRange(nextRow, 2).setFontColor('#999999').setFontSize(11);
}

/**
 * Hides rows with empty values in a job detail tab.
 */
function hideEmptyRows(sheet) {
  var leftValueRows = [6,7,8,9,10,11, 14,15,16, 19,20,21,22];
  for (var i = 0; i < leftValueRows.length; i++) {
    var row = leftValueRows[i];
    var val = sheet.getRange(row, 2).getValue();
    if (!val || val === '') {
      sheet.hideRows(row);
    } else {
      sheet.showRows(row);
    }
  }
}

/**
 * Returns dropdown options for sidebar forms.
 */
function getFormDropdowns() {
  return {
    statuses: getStatuses(),
    priorities: getPriorities(),
    locations: getLocations(),
    sources: getSources(),
    roundTypes: getRoundTypes(),
    roundStatuses: getRoundStatuses(),
    roundOutcomes: getRoundOutcomes(),
    jobTabs: getJobTabNames()
  };
}

/**
 * HTML include helper for templating.
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
