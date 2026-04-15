/**
 * DashboardActions.gs — Sort, archive, stats refresh
 */

function sortDashboard() {
  var dashboard = getDashboardSheet();
  var lastRow = dashboard.getLastRow();
  if (lastRow < 3) return;

  var statusColors = getStatusColors();
  var numCols = 17;
  var dataRange = dashboard.getRange(3, 1, lastRow - 2, numCols);
  var data = dataRange.getValues();

  data.sort(function(a, b) {
    var statusA = statusColors[a[2]] ? statusColors[a[2]].sort : 99;
    var statusB = statusColors[b[2]] ? statusColors[b[2]].sort : 99;
    if (statusA !== statusB) return statusA - statusB;
    var deadlineA = a[9] ? new Date(a[9]).getTime() : Infinity;
    var deadlineB = b[9] ? new Date(b[9]).getTime() : Infinity;
    return deadlineA - deadlineB;
  });

  dataRange.setValues(data);

  // Re-apply status colors and details links
  for (var i = 0; i < data.length; i++) {
    var status = data[i][2];
    var color = statusColors[status];
    if (color) {
      dashboard.getRange(i + 3, 3).setBackground(color.bg).setFontColor(color.text);
    }
  }

  reapplyDetailsLinks();
  SpreadsheetApp.getActiveSpreadsheet().toast('Dashboard sorted.', 'JobDash');
}

function reapplyDetailsLinks() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = getDashboardSheet();
  var lastRow = dashboard.getLastRow();

  for (var r = 3; r <= lastRow; r++) {
    var company = dashboard.getRange(r, 1).getValue();
    var role = dashboard.getRange(r, 2).getValue();
    var tabName = findJobTab(company, role);
    if (tabName) {
      var jobSheet = ss.getSheetByName(tabName);
      if (jobSheet) {
        var gid = jobSheet.getSheetId();
        dashboard.getRange(r, 16).setFormula('=HYPERLINK("#gid=' + gid + '", "→ Open")').setFontColor('#7b9ec4');
      }
    }
  }
}

function archiveRejected() {
  sortDashboard();
  SpreadsheetApp.getActiveSpreadsheet().toast('Rejected/withdrawn moved to bottom.', 'JobDash');
}

function refreshStats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dashboard = getDashboardSheet();
  var lastRow = dashboard.getLastRow();
  if (lastRow < 3) {
    SpreadsheetApp.getActiveSpreadsheet().toast('No data yet.', 'JobDash');
    return;
  }

  var data = dashboard.getRange(3, 1, lastRow - 2, 17).getValues();

  // Total Active
  var concluded = ['Rejected', 'Withdrawn', 'Accepted'];
  var active = data.filter(function(row) { return row[2] && concluded.indexOf(row[2]) === -1; });
  dashboard.getRange('B1').setValue(active.length);

  // Offer Rate
  var applied = data.filter(function(row) { return row[2] && row[2] !== 'Wishlist'; });
  var offers = data.filter(function(row) { return ['Offer', 'Accepted'].indexOf(row[2]) !== -1; });
  var offerRate = applied.length > 0 ? Math.round((offers.length / applied.length) * 100) : 0;
  dashboard.getRange('H1').setValue(offerRate + '%');

  // Interviews This Week
  var today = new Date();
  var weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);
  var weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  var interviewsThisWeek = 0;
  var tabNames = getJobTabNames();
  for (var t = 0; t < tabNames.length; t++) {
    var jobSheet = ss.getSheetByName(tabNames[t]);
    if (!jobSheet) continue;
    var jLastRow = jobSheet.getLastRow();
    if (jLastRow < 14) continue;
    var roundData = jobSheet.getRange(14, 4, jLastRow - 13, 1).getValues();
    for (var i = 0; i < roundData.length; i++) {
      var text = String(roundData[i][0]);
      var dateMatch = text.match(/^([A-Z][a-z]{2}\s+\d{1,2})/);
      if (dateMatch) {
        var year = today.getFullYear();
        var parsed = new Date(dateMatch[1] + ', ' + year);
        if (parsed >= weekStart && parsed < weekEnd) interviewsThisWeek++;
      }
    }
  }
  dashboard.getRange('D1').setValue(interviewsThisWeek);

  // Avg Days to Response
  var responseDays = [];
  for (var i = 0; i < data.length; i++) {
    if (data[i][7] && data[i][16]) {
      var appliedD = new Date(data[i][7]);
      var changedD = new Date(data[i][16]);
      var diff = Math.floor((changedD - appliedD) / (1000 * 60 * 60 * 24));
      if (diff > 0) responseDays.push(diff);
    }
  }
  var avgDays = responseDays.length > 0
    ? Math.round(responseDays.reduce(function(a, b) { return a + b; }, 0) / responseDays.length)
    : null;
  dashboard.getRange('F1').setValue(avgDays ? avgDays + 'd' : '—');

  // Refresh analytics
  try { refreshAnalytics(); } catch(e) {}

  SpreadsheetApp.getActiveSpreadsheet().toast('Stats refreshed.', 'JobDash');
}
