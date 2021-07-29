// Sheet1
// id=0
// spreadsheetKey=

/*
Instructions:

1. Save your file
2. At the top of the editor, go to "Publish"
3. Then select "Deploy as web app"
4. Set the Project Version to "New" and type something in the box to tell what changed (it required me to type something)
5. Set "Execute the app as" to "Me" - your email address might follow the word "Me"
6. Set "Who has access to the app" to "Anyone, even annonymous"
7. Now, you should be able to use the link it gives you and add "?arg=yourText" to the end and submit that in your browser like you would with any other website URL and it will add "yourText" to the spreadsheet and return "yourText" in HTML

Google Apps Script has some special classes that you can use, but you basically just write all your code in Javascript and can use the standard classes that it offers
*/

function doGet(e) {
  try {
    PropertiesService.getScriptProperties().setProperty(
      "firstVar",
      e.parameter.arg
    );
  } catch (e) {}
  try {
    PropertiesService.getScriptProperties().setProperty(
      "meetingDate",
      e.parameter.date
    );
  } catch (e) {}
  try {
    PropertiesService.getScriptProperties().setProperty(
      "meetingOdds",
      e.parameter.chance
    );
  } catch (e) {
    PropertiesService.getScriptProperties().setProperty(
      "meetingOdds",
      "default"
    );
  }
  try {
    PropertiesService.getScriptProperties().setProperty(
      "rate",
      e.parameter.rate
    );
  } catch (e) {}
  try {
    PropertiesService.getScriptProperties().setProperty(
      "jsonData",
      e.parameter.data
    );
  } catch (e) {
    PropertiesService.getScriptProperties().setProperty("jsonData", "default");
  }

  Logger.log("log test");

  if (
    PropertiesService.getScriptProperties().getProperty("jsonData") != "default"
  ) {
    var jsonData =
      PropertiesService.getScriptProperties().getProperty("jsonData");
    var meeting = [];
    meeting = jsonData.split("!"); // split data into individual meetings

    for (var i = 0; i < meeting.length; i++) {
      meeting[i] = meeting[i].split(";"); // split each meeting into each set of potential rates and corresponding chances
      for (var j = 0; j < meeting[i].length; j++) {
        meeting[i][j] = meeting[i][j].split(",");
      }
    }

    // meeting[0] = meeting[0].split(",");
    // meeting[1] = meeting[1].split(",");
    /*
        PropertiesService.getScriptProperties().setProperty('meetingDate', meeting[0][0]);
        PropertiesService.getScriptProperties().setProperty('meetingOdds', meeting[0][1]);
        PropertiesService.getScriptProperties().setProperty('rate', meeting[0][2]);
        */
    printSpreadsheetRow(meeting, "made if statement");
    return printHTML();
  } else {
    printSpreadsheetRow("did not make it to if statement");
  }
}

// handle a PUT Request - not being used
function doPut() {
  // put code here if you want to use this
}

// for manual submissions through the Script editor
function manualSubmission() {
  var sheet = SpreadsheetApp.getActiveSheet();
  sheet.appendRow(["manual", "second cell would go here"]);
}

// print an HTML response
function printHTML() {
  var firstVar =
    PropertiesService.getScriptProperties().getProperty("firstVar");
  var meetingDate =
    PropertiesService.getScriptProperties().getProperty("meetingDate");
  var meetingOdds =
    PropertiesService.getScriptProperties().getProperty("meetingOdds");
  var rate = PropertiesService.getScriptProperties().getProperty("rate");
  var jsonData =
    PropertiesService.getScriptProperties().getProperty("jsonData");

  return HtmlService.createHtmlOutput(
    "<h2><table border='1'>" +
      "<tr><td>firstVar:</td><td>" +
      firstVar +
      "</td></tr>" +
      "<tr><td>meetingDate:</td><td>" +
      meetingDate +
      "</td></tr>" +
      "<tr><td>meetingOdds:</td><td>" +
      meetingOdds +
      "</td></tr>" +
      "<tr><td>rate:</td><td>" +
      rate +
      "</td></tr>" +
      "</table></h2>"
  );
  // return HtmlService.createHtmlOutput("<h2>Hello</h2>");
}

// print a row in the Google Spreadsheet
function printSpreadsheetRow(meetingObj, logString) {
  var d = new Date();
  var timeStamp = d.getTime(); // Number of ms since Jan 1, 1970
  var currentTime = d.toLocaleTimeString(); // "12:35 PM", for instance
  var dateTimeStamp =
    d.getFullYear() +
    "-" +
    (d.getMonth() + 1) +
    "-" +
    d.getDate() +
    " " +
    d.getHours() +
    ":" +
    d.getMinutes() +
    ":" +
    d.getSeconds();
  // var myvalue = PropertiesService.getScriptProperties().getProperty('

  var firstVar =
    PropertiesService.getScriptProperties().getProperty("firstVar");
  var meetingDate =
    PropertiesService.getScriptProperties().getProperty("meetingDate");
  var meetingOdds =
    PropertiesService.getScriptProperties().getProperty("meetingOdds");
  var rate = PropertiesService.getScriptProperties().getProperty("rate");
  var jsonData =
    PropertiesService.getScriptProperties().getProperty("jsonData");

  // var sheet = SpreadsheetApp.getActiveSheet();

  // for each meeting date
  for (var i = 0; i < meetingObj.length; i++) {
    // for each set of odds correlating to future rate possibilities
    //for (var j=0; j < meetingObj[i].length; j++) {
    // pick a sheet based on the 0 element in this meetingObj[i][j]
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
      meetingObj[i][0][0]
    );
    if (sheet != null) {
      sheet.appendRow([
        dateTimeStamp,
        meetingObj[i][0][0],
        meetingObj[i][0][1],
        meetingObj[i][0][2],
        meetingObj[i][1][0],
        meetingObj[i][1][1],
        meetingObj[i][1][2],
        meetingObj[i][2][0],
        meetingObj[i][2][1],
        meetingObj[i][2][2],
        meetingObj[i][3][0],
        meetingObj[i][3][1],
        meetingObj[i][3][2],
        meetingObj[i][4][0],
        meetingObj[i][4][1],
        meetingObj[i][4][2],
        meetingObj[i][5][0],
        meetingObj[i][5][1],
        meetingObj[i][5][2],
        meetingObj[i][6][0],
        meetingObj[i][6][1],
        meetingObj[i][6][2],
        meetingObj[i][7][0],
        meetingObj[i][7][1],
        meetingObj[i][7][2],
        jsonData,
        logString +
          " " +
          firstVar +
          " " +
          sheet.getName() +
          " " +
          "Multiple lines",
      ]);
      // append the row to this sheet within the spreadsheet
      /*if (meetingObj[i][4][0] != null) {
              sheet.appendRow([dateTimeStamp, 
                               meetingObj[i][0][0], meetingObj[i][0][1], meetingObj[i][0][2], 
                               meetingObj[i][1][0], meetingObj[i][1][1], meetingObj[i][1][2], 
                               meetingObj[i][2][0], meetingObj[i][2][1], meetingObj[i][2][2], 
                               meetingObj[i][3][0], meetingObj[i][3][1], meetingObj[i][3][2], 
                               meetingObj[i][4][0], meetingObj[i][4][1], meetingObj[i][4][2],
                               jsonData, logString + " " + firstVar + " " + sheet.getName() + " " + "Multiple lines"]);
            }
            else {
              if (meetingObj[i][3][0] != null) {
                sheet.appendRow([dateTimeStamp, 
                               meetingObj[i][0][0], meetingObj[i][0][1], meetingObj[i][0][2], 
                               meetingObj[i][1][0], meetingObj[i][1][1], meetingObj[i][1][2], 
                               meetingObj[i][2][0], meetingObj[i][2][1], meetingObj[i][2][2], 
                               meetingObj[i][3][0], meetingObj[i][3][1], meetingObj[i][3][2], 
                               jsonData, logString + " " + firstVar + " " + sheet.getName() + " " + "Multiple lines"]);
              }
              else {
                if (meetingObj[i][2][0] != null) {
                  sheet.appendRow([dateTimeStamp, 
                               meetingObj[i][0][0], meetingObj[i][0][1], meetingObj[i][0][2], 
                               meetingObj[i][1][0], meetingObj[i][1][1], meetingObj[i][1][2], 
                               meetingObj[i][2][0], meetingObj[i][2][1], meetingObj[i][2][2], 
                               jsonData, logString + " " + firstVar + " " + sheet.getName() + " " + "Multiple lines"]);
                }
                else {
                  if (meetingObj[i][1][0] != null) {
                    sheet.appendRow([dateTimeStamp, 
                               meetingObj[i][0][0], meetingObj[i][0][1], meetingObj[i][0][2], 
                               meetingObj[i][1][0], meetingObj[i][1][1], meetingObj[i][1][2], 
                               jsonData, logString + " " + firstVar + " " + sheet.getName() + " " + "Multiple lines"]);
                    
                  }
                  else {
                    if (meetingObj[i][0][0] != null) {
                      sheet.appendRow([dateTimeStamp, 
                               meetingObj[i][0][0], meetingObj[i][0][1], meetingObj[i][0][2], 
                               jsonData, logString + " " + firstVar + " " + sheet.getName() + " " + "Multiple lines"]);
                    }
                    else {
                      // don't display anything
                      sheet.appendRow([dateTimeStamp, 
                               meetingObj[i][0][0], meetingObj[i][0][1], meetingObj[i][0][2], 
                               jsonData, logString + " " + firstVar + " " + sheet.getName() + " " + "Multiple lines"]);
                    }
                  }
                }
              }
            }*/
    } else {
      // create the spreadsheet for this new meeting date
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(
        meetingObj[i][0][0]
      );
      // append the row to this sheet within the spreadsheet
      sheet.appendRow([
        "Timestamp",
        "Meeting Date",
        "Chance of Rate1",
        "Rate1",
        "Meeting Date",
        "Chance of Rate2",
        "Rate2",
        "Meeting Date",
        "Chance of Rate3",
        "Rate3",
        "Meeting Date",
        "Chance of Rate4",
        "Rate4",
        "Meeting Date",
        "Chance of Rate5",
        "Rate5",
        "jsonData",
        "Log Message",
      ]);
      sheet.appendRow([
        dateTimeStamp,
        meetingObj[i][0][0],
        meetingObj[i][0][1],
        meetingObj[i][0][2],
        meetingObj[i][1][0],
        meetingObj[i][1][1],
        meetingObj[i][1][2],
        /*meetingObj[i][2][0], meetingObj[i][2][1], meetingObj[i][2][2], 
                             meetingObj[i][3][0], meetingObj[i][3][1], meetingObj[i][3][2], 
                             meetingObj[i][4][0], meetingObj[i][4][1], meetingObj[i][4][2], */
        jsonData,
        logString +
          " " +
          firstVar +
          " " +
          sheet.getName() +
          " " +
          "Multiple lines",
      ]);
    }
    //}
  }
}
