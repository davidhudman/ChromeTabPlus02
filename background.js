/*************************
// file:    Background.js
// author:  David Hudman
// purpose: Runs periodically in the background to obtain market information
**************************/

var spreadsheetKey = "1izdSqLvPfus1qVo12UopD4Z1CDHtC_UREPDh1GJvbf4";
var stockArray = []; // an array of objects
var stockArrayLabels = [
  "date",
  "symbol",
  "shares",
  "Total Paid",
  "Paid / share",
  "Price",
  "Ystrday",
  "$ Today",
  "% Today",
  "$ Profit Total",
  "% Profit Total",
];
var uniqueDates = []; // an array of objects
var uniqueDatesLabels = [
  "date",
  "Total Paid",
  "Current",
  "$ Profit",
  "% Profit",
  "CloseYest$",
  "$ Today",
  "% Today",
];
var uniqueStocks = [];
var uniqueStocksLabels = [];
var totalValue; // an object
var totalValueLabels = [
  "date",
  "Total Paid",
  "Current",
  "$ Profit",
  "% Profit",
  "CloseYest$",
  "$ Today",
  "% Today",
];

var pollInterval = 1000 * 10; // in milliseconds
var counter = 0;

var needTotalInBadge = true;

startRequest();

function startRequest() {
  // requestUpdatedInfo();
  // updateBadgeOld();
  updateBadge();
  window.setTimeout(startRequest, pollInterval);
}

function updateBadge() {
  chrome.storage.sync.get(
    {
      currentTemperature: "N/A",
    },
    function () {
      // badgeText = items.currentTemperature;
      // badgeText = badgeText.substring(0, 4);
      badgeText = "";

      chrome.browserAction.setBadgeBackgroundColor({
        color: [30, 144, 255, 255],
      });

      chrome.browserAction.setBadgeText({ text: badgeText });
    }
  );
}

function updateBadgeOld() {
  // counter++;
  // document.cookie = counter + "abcde";
  splitText = document.cookie;
  splitText = splitText.split(";");

  if (needTotalInBadge == true) {
    // define what badgeText is
    // badgeText = splitText[0];

    chrome.storage.sync.get(
      {
        badgeTextCS: "N/A",
      },
      function (items) {
        badgeText = items.badgeTextCS;

        if (badgeText.charAt(0) == "-") {
          // negative number
          badgeText = badgeText.substring(1, 5);
        } else {
          // Zero or positive number
          badgeText = badgeText.substring(0, 4);
        }

        if (badgeText >= 0) {
          chrome.browserAction.setBadgeBackgroundColor({
            color: [0, 0, 0, 255],
          }); // black
        } else {
          chrome.browserAction.setBadgeBackgroundColor({
            color: [255, 0, 0, 255],
          }); // red
        }

        chrome.browserAction.setBadgeText({ text: badgeText });
      }
    );

    if (badgeText.charAt(0) == "-") {
      // negative number
      badgeText = badgeText.substring(1, 5);
    } else {
      // Zero or positive number
      badgeText = badgeText.substring(0, 4);
    }

    if (badgeText >= 0) {
      chrome.browserAction.setBadgeBackgroundColor({ color: [0, 0, 0, 255] }); // black
    } else {
      chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255] }); // red
    }

    chrome.browserAction.setBadgeText({ text: badgeText });

    // needTotalInBadge = false;
  } else {
    badgeText = splitText[1];
    badgeText = badgeText.substring(0, 4);

    // badgeText = document.cookie.split(';');

    chrome.browserAction.setBadgeBackgroundColor({
      color: [30, 144, 255, 255],
    });

    chrome.browserAction.setBadgeText({ text: badgeText });
  }

  // needTotalInBadge = !needTotalInBadge;
}

function requestUpdatedInfo() {
  var spreadsheetLink = "";

  // https://docs.google.com/spreadsheets/d/1izdSqLvPfus1qVo12UopD4Z1CDHtC_UREPDh1GJvbf4/edit#gid=1629427870
  // https://docs.google.com/spreadsheets/d/1izdSqLvPfus1qVo12UopD4Z1CDHtC_UREPDh1GJvbf4/export?gid=1629427870&format=csv"

  chrome.storage.sync.get(
    {
      favoriteColor: "red",
      sheetLink: "type your entire link",
      sheetKey: "type your key",
      sheetGid: "type your gid",
      importKey: "type your key",
      importLink: "type your link",
      likesColor: true,
    },
    function (items) {
      // solution: all the request stuff just needed to be inside the function
      var request = new XMLHttpRequest();

      // handle the request
      request.onreadystatechange = function () {
        // set the text for the popup html page
        tempVar = request.responseText;

        // split the feedback into rows based on line breaks
        tempVar = tempVar.split("\n");

        // split each row into a cell - create makeshift database - start at row 1 to avoid headers
        for (var i = 0; i < tempVar.length; i++) {
          tempVar[i] = tempVar[i].split(",");
          stockArray[i] = {
            0: tempVar[i][0],
            1: tempVar[i][1],
            2: Number(tempVar[i][2]),
            3: Number(tempVar[i][3]),
            4: Number(tempVar[i][4]),
            5: Number(0),
          };
        }

        // put each stock into a string to send in the GET request to Yahoo Finance
        stockStringHolder = "";
        for (var i = 0; i < tempVar.length; i++) {
          stockStringHolder += "+" + tempVar[i][1];
        }

        // test output
        // $('#div1').html(stockStringHolder.substring(0, 30) + "<br />" + stockStringHolder.substring(30, 60) + "<br />" + stockStringHolder.substring(60, 90) + "<br />" + stockStringHolder.substring(90, 120));

        // ask yahoo for the current price of these stocks
        requestYahooFinance(stockStringHolder);
      };

      // put it in the variable
      spreadsheetLink = items.sheetLink;

      // parse the variable, put it in the variable
      spreadsheetLink =
        items.sheetLink.substr(0, items.sheetLink.search("edit")) +
        "export?" +
        "gid=" +
        items.sheetLink.substr(items.sheetLink.search("gid") + 4) +
        "&format=csv";

      // use the variable to make the request
      request.open("GET", spreadsheetLink, true);
      request.send();
    }
  );
}

function requestYahooFinance(stockString) {
  var request = new XMLHttpRequest();

  // handle the request
  request.onreadystatechange = function () {
    // set the text for the popup html page
    tempVar = request.responseText;

    // split the feedback into rows based on line breaks
    unParsedRows = tempVar.split("\n");

    for (var i = 0; i < unParsedRows.length; i++) {
      // split the data that was sent from Yahoo
      parsedRow = unParsedRows[i].split(",");

      // assign the current price to the last column in each row of the stockArray - I left off here after I couldn't figure it out
      if (i < unParsedRows.length - 1) {
        // if the symbol from yahoo matches our stock array from Google Sheets
        if (
          parsedRow[0].substring(1, parsedRow[0].length - 1) == stockArray[i][1]
        ) {
          // assign the current price from yahoo to the new column in our stockArray
          stockArray[i][5] = parsedRow[1];

          // assign yesterday's price from yahoo to another new column in our stockArray
          stockArray[i][6] = parsedRow[2];

          // assign $ profit since yesterday to a new column in stockArray
          stockArray[i][7] = (
            (stockArray[i][5] - stockArray[i][6]) *
            stockArray[i][2]
          ).toFixed(2);

          // assign % profit since yesterday to a new column in stockArray
          stockArray[i][8] = (
            ((stockArray[i][5] - stockArray[i][6]) / stockArray[i][6]) *
            100
          ).toFixed(2);

          // assign $ profit total to a new column in stockArray
          stockArray[i][9] = (
            stockArray[i][5] * stockArray[i][2] -
            stockArray[i][3]
          ).toFixed(2);

          // assign % profit total to a new column in stockArray
          stockArray[i][10] = (
            (stockArray[i][9] / stockArray[i][3]) *
            100
          ).toFixed(2);
        } else {
          // nothing
        }
      }
    }
    // createUniqueDatesTable();
    createTotalPurchasesArray();
    // createUniqueStocksTable();
  };

  request.open(
    "GET",
    "http://finance.yahoo.com/d/quotes.csv?s=" + stockString + "&f=sbp",
    true
  );
  request.send();
}

function createTotalPurchasesArray() {
  totalValue = {
    0: stockArray[0][0],
    1: Number(0),
    2: Number(0),
    3: Number(0),
    4: Number(0),
    5: Number(0),
    6: Number(0),
    7: Number(0),
  };

  // assign the price paid and the price current to the totalValue array by adding the values for each stock to the totalValue columns
  for (var i = 0; i < stockArray.length; i++) {
    totalValue[1] = totalValue[1] + stockArray[i][3];
    totalValue[2] = totalValue[2] + stockArray[i][2] * stockArray[i][5];
    totalValue[5] = Number(totalValue[5] + stockArray[i][6] * stockArray[i][2]);
  }

  totalValue[3] = totalValue[2].toFixed(2) - totalValue[1].toFixed(2);
  totalValue[4] = ((totalValue[2] - totalValue[1]) / totalValue[1]) * 100;
  totalValue[6] = totalValue[2] - totalValue[5];
  totalValue[7] = (totalValue[6] / totalValue[5]) * 100;

  chrome.storage.sync.get(
    {
      favoriteColor: "blue",
      /*sheetLink: "type your entire link",
        sheetKey: "type your key",
        sheetGid: 'type your gid',
        importKey: 'type your key',
        importLink: 'type your link',
        likesColor: true,
		zip: 'type your zipcode',
		badgeStock: 'type your stock to display in the badge'*/
    },
    function (items) {
      document.cookie = items.favoriteColor + "; hello";

      /*
		for (int i = 0; i < countProperties(stockArray); i++) {
			if (stockArray[i][1] == items.badgeStock) {		// if the symbol matches
				document.cookie = stockArray[i][5] + ";" + totalValue[6];	// put the price in the cookie
				break;
			}
		}
		
		updateBadgeOld();*/
    }
  );

  // document.cookie = stockArray[countProperties(stockArray)-1][5] + ";" + totalValue[6];
  // document.cookie = "go" + ";" + "mom";

  updateBadgeOld();

  // column 0: date
  // column 1: total price paid
  // column 2: total price current
  // column 3: profit $
  // column 4: profit %
}

// count the number of elements in an object
function countProperties(obj) {
  var count = 0;

  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) ++count;
  }

  return count;
}
