/**
 * DriveHelper.gs — Google Drive folder/doc management
 */

function getOrCreateRootFolder() {
  var folderName = 'Job Interviews';
  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(folderName);
}

function getOrCreateJobFolder(tabName) {
  var root = getOrCreateRootFolder();
  var folders = root.getFoldersByName(tabName);
  if (folders.hasNext()) return folders.next();
  return root.createFolder(tabName);
}

function createJDDoc(tabName) {
  var folder = getOrCreateJobFolder(tabName);

  var existingDocs = folder.getFilesByName(tabName + ' — Job Description');
  if (existingDocs.hasNext()) return existingDocs.next().getUrl();

  var doc = DocumentApp.create(tabName + ' — Job Description');
  var body = doc.getBody();

  body.appendParagraph(tabName).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph('Job Description — Captured ' + formatDate(new Date()))
    .setForegroundColor('#888888').setFontSize(11);
  body.appendHorizontalRule();
  body.appendParagraph('Paste the full job description below:')
    .setForegroundColor('#aaaaaa').setItalic(true);

  doc.saveAndClose();

  var file = DriveApp.getFileById(doc.getId());
  file.moveTo(folder);

  return doc.getUrl();
}

function getOrCreateFormAnswersDoc(tabName) {
  var folder = getOrCreateJobFolder(tabName);

  var existingDocs = folder.getFilesByName(tabName + ' — Form Answers');
  if (existingDocs.hasNext()) return existingDocs.next().getUrl();

  var doc = DocumentApp.create(tabName + ' — Form Answers');
  var body = doc.getBody();

  body.appendParagraph(tabName).setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph('Application Form Questions & Answers')
    .setForegroundColor('#888888').setFontSize(11);
  body.appendHorizontalRule();

  doc.saveAndClose();

  var file = DriveApp.getFileById(doc.getId());
  file.moveTo(folder);

  return doc.getUrl();
}

function appendFormAnswer(tabName, question, answer) {
  var url = getOrCreateFormAnswersDoc(tabName);
  var docId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)[1];
  var doc = DocumentApp.openById(docId);
  var body = doc.getBody();

  body.appendHorizontalRule();
  var qParagraph = body.appendParagraph('Q: ' + question);
  qParagraph.setBold(true).setFontSize(12);
  var aParagraph = body.appendParagraph('A: ' + answer);
  aParagraph.setBold(false).setFontSize(11);

  doc.saveAndClose();
  return url;
}
