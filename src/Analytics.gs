/**
 * Analytics.gs — Chart data computation and chart creation
 */

function refreshAnalytics() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var analyticsSheet = ss.getSheetByName('Analytics');
  if (!analyticsSheet) return;

  var dashboard = getDashboardSheet();
  var lastRow = dashboard.getLastRow();
  if (lastRow < 3) return;

  var data = dashboard.getRange(3, 1, lastRow - 2, 17).getValues();

  // Chart 1: Status Funnel (row 30+)
  var statusCounts = {};
  var statusOrder = getStatuses();
  statusOrder.forEach(function(s) { statusCounts[s] = 0; });
  data.forEach(function(row) {
    if (row[2] && statusCounts.hasOwnProperty(row[2])) statusCounts[row[2]]++;
  });

  analyticsSheet.getRange('A30').setValue('STATUS');
  analyticsSheet.getRange('B30').setValue('COUNT');
  statusOrder.forEach(function(status, i) {
    analyticsSheet.getRange(31 + i, 1).setValue(status);
    analyticsSheet.getRange(31 + i, 2).setValue(statusCounts[status]);
  });

  // Chart 2: Source Effectiveness (row 42+)
  var sources = getSources();
  var sourceTotal = {};
  var sourceAdvanced = {};
  sources.forEach(function(s) { sourceTotal[s] = 0; sourceAdvanced[s] = 0; });
  var advancedStatuses = ['Screening', 'Interviewing', 'Offer', 'Accepted'];
  data.forEach(function(row) {
    var source = row[6];
    if (source && sourceTotal.hasOwnProperty(source)) {
      sourceTotal[source]++;
      if (advancedStatuses.indexOf(row[2]) !== -1) sourceAdvanced[source]++;
    }
  });

  analyticsSheet.getRange('A42').setValue('SOURCE');
  analyticsSheet.getRange('B42').setValue('TOTAL');
  analyticsSheet.getRange('C42').setValue('ADVANCED');
  sources.forEach(function(source, i) {
    analyticsSheet.getRange(43 + i, 1).setValue(source);
    analyticsSheet.getRange(43 + i, 2).setValue(sourceTotal[source]);
    analyticsSheet.getRange(43 + i, 3).setValue(sourceAdvanced[source]);
  });

  // Chart 3: Applications Over Time (row 55+)
  var weekCounts = {};
  data.forEach(function(row) {
    if (row[7]) {
      var d = new Date(row[7]);
      var weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      var key = Utilities.formatDate(weekStart, 'Asia/Kolkata', 'MMM dd');
      weekCounts[key] = (weekCounts[key] || 0) + 1;
    }
  });
  var weeks = Object.keys(weekCounts).sort();
  analyticsSheet.getRange('A55').setValue('WEEK');
  analyticsSheet.getRange('B55').setValue('APPS');
  weeks.forEach(function(week, i) {
    analyticsSheet.getRange(56 + i, 1).setValue(week);
    analyticsSheet.getRange(56 + i, 2).setValue(weekCounts[week]);
  });

  // Chart 4: Pipeline Aging (row 75+)
  var buckets = { '0-7 days': 0, '8-14 days': 0, '15-30 days': 0, '30+ days': 0 };
  var concluded = ['Rejected', 'Withdrawn', 'Accepted'];
  data.forEach(function(row) {
    if (row[2] && concluded.indexOf(row[2]) === -1 && row[10]) {
      var days = parseInt(row[10], 10);
      if (days <= 7) buckets['0-7 days']++;
      else if (days <= 14) buckets['8-14 days']++;
      else if (days <= 30) buckets['15-30 days']++;
      else buckets['30+ days']++;
    }
  });
  analyticsSheet.getRange('A75').setValue('BUCKET');
  analyticsSheet.getRange('B75').setValue('COUNT');
  var bucketKeys = Object.keys(buckets);
  bucketKeys.forEach(function(bucket, i) {
    analyticsSheet.getRange(76 + i, 1).setValue(bucket);
    analyticsSheet.getRange(76 + i, 2).setValue(buckets[bucket]);
  });

  // Chart 5: Response Rate (row 85+)
  analyticsSheet.getRange('A85').setValue('SOURCE');
  analyticsSheet.getRange('B85').setValue('RESPONSE_RATE');
  sources.forEach(function(source, i) {
    var total = sourceTotal[source] || 0;
    var responded = sourceAdvanced[source] || 0;
    var rate = total > 0 ? Math.round((responded / total) * 100) : 0;
    analyticsSheet.getRange(86 + i, 1).setValue(source);
    analyticsSheet.getRange(86 + i, 2).setValue(rate);
  });

  // Hide aggregation rows
  try { analyticsSheet.hideRows(30, analyticsSheet.getMaxRows() - 29); } catch(e) {}
}

function createAnalyticsCharts() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Analytics');
  if (!sheet) return;

  sheet.getCharts().forEach(function(c) { sheet.removeChart(c); });
  refreshAnalytics();

  var chart1 = sheet.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(sheet.getRange('A30:B38'))
    .setPosition(4, 1, 0, 0)
    .setOption('title', 'Pipeline by Status')
    .setOption('legend', { position: 'none' })
    .setOption('colors', ['#7b9ec4'])
    .setOption('backgroundColor', '#faf9f6')
    .setOption('width', 480).setOption('height', 280)
    .build();
  sheet.insertChart(chart1);

  var chart2 = sheet.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(sheet.getRange('A42:C49'))
    .setPosition(4, 6, 0, 0)
    .setOption('title', 'Source Effectiveness')
    .setOption('colors', ['#b0b0b0', '#7c9a72'])
    .setOption('backgroundColor', '#faf9f6')
    .setOption('width', 480).setOption('height', 280)
    .build();
  sheet.insertChart(chart2);

  var chart3 = sheet.newChart()
    .setChartType(Charts.ChartType.LINE)
    .addRange(sheet.getRange('A55:B70'))
    .setPosition(20, 1, 0, 0)
    .setOption('title', 'Applications Over Time')
    .setOption('legend', { position: 'none' })
    .setOption('colors', ['#7b9ec4'])
    .setOption('backgroundColor', '#faf9f6')
    .setOption('width', 480).setOption('height', 280)
    .build();
  sheet.insertChart(chart3);

  var chart4 = sheet.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(sheet.getRange('A75:B79'))
    .setPosition(20, 6, 0, 0)
    .setOption('title', 'Pipeline Aging')
    .setOption('legend', { position: 'none' })
    .setOption('colors', ['#d4a574'])
    .setOption('backgroundColor', '#faf9f6')
    .setOption('width', 480).setOption('height', 280)
    .build();
  sheet.insertChart(chart4);

  var chart5 = sheet.newChart()
    .setChartType(Charts.ChartType.PIE)
    .addRange(sheet.getRange('A85:B92'))
    .setPosition(36, 1, 0, 0)
    .setOption('title', 'Response Rate by Source')
    .setOption('backgroundColor', '#faf9f6')
    .setOption('colors', ['#7b9ec4', '#7c9a72', '#d4a574', '#d4887a', '#7c6c9a', '#b0b0b0', '#888888'])
    .setOption('width', 480).setOption('height', 280)
    .build();
  sheet.insertChart(chart5);

  SpreadsheetApp.getActiveSpreadsheet().toast('Charts created.', 'JobPilot');
}
