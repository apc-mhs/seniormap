function installTriggers() {
  uninstallExistingTriggers();

  ScriptApp
    .newTrigger('onFormSubmit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onFormSubmit()
    .create();
}

function onFormSubmit() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('raw');
  var trimmableRange = sheet.getRange(2, 3, sheet.getMaxRows(), 4);
  var data = trimmableRange.getValues();

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < data[0].length; j++) {
      if (data[i][j].trim) {
        data[i][j] = data[i][j].trim();
      }
    }
  }

  trimmableRange.setValues(data);
}

function uninstallExistingTriggers() {
  const allTriggers = ScriptApp.getProjectTriggers();
  for (let trigger of allTriggers) {
    ScriptApp.deleteTrigger(trigger);
  }
}
