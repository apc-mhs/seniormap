function installTriggers() {
  uninstallExistingTriggers();

  const dataSheetId = '1VZmrdC-rm6noqxMoFWiPimOiM3-zmhk5kOmJ8RppU9w';
  const dataSheetsSpreadsheet = SpreadsheetApp.openById(dataSheetId);

  const dataSheetsSheet = dataSheetsSpreadsheet.getSheetByName('main');
  const dataSheetsValues = dataSheetsSheet.getRange(
    2,
    1,
    dataSheetsSheet.getLastRow(), 
    dataSheetsSheet.getLastColumn()
  ).getValues();

  for (let [ _, sheetId] of dataSheetsValues) {
    // sheetId can be empty
    if (!sheetId) continue;

    const spreadsheet = SpreadsheetApp.openById(sheetId);
    ScriptApp
      .newTrigger('onFormSubmit')
      .forSpreadsheet(spreadsheet)
      .onFormSubmit()
      .create();
  }
}

function onFormSubmit(e) {
  const dataSheetId = '1VZmrdC-rm6noqxMoFWiPimOiM3-zmhk5kOmJ8RppU9w';
  const dataSheetsSpreadsheet = SpreadsheetApp.openById(dataSheetId);
  const activeSheet = SpreadsheetApp.getActiveSpreadsheet();
  const studentDataSheet = activeSheet.getSheetByName('raw');
  const sheetYear = activeSheet.getName().replace(/\D/g, '');

  const statsSheet = dataSheetsSpreadsheet.getSheetByName('stats');
  const statsYearValues = statsSheet.getRange(2, 1, statsSheet.getLastRow()).getValues();

  let statsYearRow = 2;
  for (let i = 0; i < statsYearValues.length; i++) {
    if (statsYearValues[i][0] == sheetYear) {
      statsYearRow = i + 2;
    }
  }
  
  const columnData = studentDataSheet.getRange(1, 1, 1, studentDataSheet.getMaxColumns()).getValues()[0];
  let institutionColumn = 1;
  for (let i = 0; i < columnData.length; i++) {
    if (columnData[i] == 'Institution name') {
      institutionColumn = i + 1;
    }
  }

  const institutionData = studentDataSheet.getRange(2, institutionColumn, studentDataSheet.getMaxRows()).getValues();

  const institutions = new Set();
  for (let i = 0; i < institutionData.length; i++) {
    if (institutionData[i][0].trim() == '') continue;
    institutions.add(institutionData[i][0].trim());
  }

  const [ states, countries ] = getLocationStats(Array.from(institutions));

  const statsRange = statsSheet.getRange(statsYearRow, 2, 1, 3);
  statsRange.setValues([ [ institutions.size, states, countries ] ]);
}

function getLocationStats(locations) {
  const KEY = PropertiesService.getScriptProperties().getProperty('MAPBOX_KEY');

  const responses = UrlFetchApp.fetchAll(locations.map((location) => {
    return `https://api.mapbox.com/geocoding/v5/mapbox.places/${location}.json?access_token=${KEY}`;
  }));

  const states = new Set();
  const countries = new Set();
  for (let response of responses) {
    const json = JSON.parse(response.getContentText());
    const location = json['features'][0];
    const [ stateCode, countryCode ] = getLocationData(location);
    if (countryCode === 'us') {
      states.add(stateCode);
    }
    countries.add(countryCode);
  }
  return [states.size, countries.size]
}

function getLocationData(location) {
  const data = ['', ''];

  if (!('context' in location)) {
    data[1] = location.properties.short_code;
    return data;
  }

  for (let information of location['context']) {
    if (information.id.startsWith('region')) {
      const stateCode = information.short_code;
      data[0] = stateCode;
    } else if (information.id.startsWith('country')) {
      const countryCode = information.short_code;
      data[1] = countryCode;
    }
  }

  return data;
}

function uninstallExistingTriggers() {
  const allTriggers = ScriptApp.getProjectTriggers();
  for (let trigger of allTriggers) {
    ScriptApp.deleteTrigger(trigger);
  }
}
