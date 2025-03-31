// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
var displayLabels = true;

var oddsMeeting = [];
numberOfMeetings = 8;
numberOfRates = 6;
meetingOddsDisplayed = 0;
rateDisplayed = 0;

var todaysDate;
var globalZipcode;

function clickHandlers() {
  // sheetsAPI
  $("#sheetsAPI").click(function () {
    sheetsWriteRequest();
  });
}

function displaySunriseSunset() {
  chrome.storage.sync.get(
    {
      favoriteColor: "red",
      sheetKey: "type your key",
      sheetGid: "type your gid",
      importKey: "type your key",
      importLink: "type your link",
      likesColor: true,
      zip: 35244,
    },
    function (items) {
      // globalZipcode = items.zip;
      getLatitudeAndLongitudeThenSunset(items.zip);
    }
  );
  // zipcode = globalZipcode;
  //getLatitudeAndLongitudeThenSunset(zipcode);
}

function getLatitudeAndLongitudeThenSunset(zip) {
  var request = new XMLHttpRequest();

  // handle the request
  request.onreadystatechange = function () {
    // put the JSON text into a new object
    obj = JSON.parse(request.responseText);

    latitude = obj.results[0].geometry.location.lat;
    longitude = obj.results[0].geometry.location.lng;

    getSunriseSunset(latitude, longitude);
  };

  request.open(
    "GET",
    "http://maps.googleapis.com/maps/api/geocode/json?address=" + zip,
    true
  );
  request.send();
}

function getSunriseSunset(lat, lng) {
  var request = new XMLHttpRequest();

  // handle the request
  request.onreadystatechange = function () {
    // put the JSON text into a new object
    obj = JSON.parse(request.responseText);

    // put it inside a new div, and append it to the body - for some reason, this gets appended twice.
    $("#sunset").html(
      "<div>" +
        "sunrise: " +
        convertUTCtoTimeZone(obj.results.sunrise) +
        " AM" +
        "<br />" +
        "sunset: " +
        convertUTCtoTimeZone(obj.results.sunset) +
        " PM" +
        "</div>"
    );

    chrome.storage.sync.set(
      {
        sunrise: convertUTCtoTimeZone(obj.results.sunrise),
        sunset: convertUTCtoTimeZone(obj.results.sunset),
      },
      function () {}
    );
  };

  request.open(
    "GET",
    "http://api.sunrise-sunset.org/json?lat=" +
      lat +
      "&lng=" +
      lng +
      "&date=today",
    true
  );
  request.send();
}

function convertUTCtoTimeZone(time) {
  var d = new Date();

  timeZoneAdjustmentHours = d.getTimezoneOffset() / 60;

  // parse the hour out of the string
  hour = time.substring(0, time.indexOf(":"));

  // subtract however many hours needed to convert to CST
  hour = hour - timeZoneAdjustmentHours;
  if (hour < 1) {
    hour += 12;
  }

  // add the new hour back to the original string
  newTime = hour + time.substring(time.indexOf(":"));

  newTime = newTime.substring(0, 8);

  // return the value
  return newTime;
}

function getDataForBadge() {
  chrome.storage.sync.set(
    {
      // likesColor: likesColor
      badgeTextCS: stockArray[26][5],
    },
    function () {}
  );
}

function getCurrentWeatherData() {
  chrome.storage.sync.get(
    {
      zip: 35244,
    },
    function (items) {
      getLatitudeAndLongitudeThenWeather(items.zip);
    }
  );
}

function getLatitudeAndLongitudeThenWeather(zip) {
  var request = new XMLHttpRequest();

  // handle the request
  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
      // put the JSON text into a new object
      obj = JSON.parse(request.responseText);

      latitude = obj.results[0].geometry.location.lat;
      longitude = obj.results[0].geometry.location.lng;

      getOpenMeteoWeather(latitude, longitude);
    }
  };

  request.open(
    "GET",
    "http://maps.googleapis.com/maps/api/geocode/json?address=" + zip,
    true
  );
  request.send();
}

function getOpenMeteoWeather(lat, lng) {
  var request = new XMLHttpRequest();

  // handle the request
  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
      // Store the raw JSON response
      const rawJsonResponse = request.responseText;

      // Parse the JSON
      obj = JSON.parse(rawJsonResponse);

      // Create a container with the raw JSON and basic styling
      let weatherHTML = `
        <div class="weather-container" style="background-color: rgba(0, 0, 0, 0.05); border-radius: 10px; padding: 15px; margin-bottom: 15px; cursor: pointer;" title="Click to refresh weather data">
          <div style="font-size: 14px; margin-bottom: 10px;">Click to refresh weather data</div>
          <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; max-height: 300px; overflow: auto; font-size: 12px;">${JSON.stringify(
            obj,
            null,
            2
          )}</pre>
        </div>
      `;

      // Replace the weather display with our raw JSON display
      $("#currentTemp").html(weatherHTML);
      $("#highLowTemp").hide(); // Hide this since we're displaying raw data

      // Add click handler to refresh weather data
      $(".weather-container").click(function () {
        // Show a loading message
        $(this).html(
          '<div style="text-align: center; padding: 20px;">Refreshing weather data...</div>'
        );
        // Refresh the weather data
        getCurrentWeatherData();
      });

      // Store the essential weather data in Chrome Storage
      chrome.storage.sync.set(
        {
          currentTemperature: obj.current_weather.temperature,
          minTemperature: obj.daily.temperature_2m_min[0],
          maxTemperature: obj.daily.temperature_2m_max[0],
          precipitationProbability: obj.daily.precipitation_probability_max[0],
          weatherRawJson: rawJsonResponse,
        },
        function () {}
      );
    }
  };

  request.open(
    "GET",
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto`,
    true
  );
  request.send();
}

// Helper function to convert WMO weather codes to descriptions
function getWeatherDescription(code) {
  const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };

  return weatherCodes[code] || "Unknown";
}

function getForecastWeatherData() {
  var request = new XMLHttpRequest();

  // handle the request
  request.onreadystatechange = function () {
    // put the JSON text into a new object
    obj = JSON.parse(request.responseText);

    // parse the data from the JSON object
    lowTemp = JSON.stringify(obj.list[0].eve) * 1.8 - 459.67;
    highTemp = JSON.stringify(obj.list[0].max) * 1.8 - 459.67;

    // display the data in HTML
    $("#highLowTemp").html(
      "<div>Hi/eve Temp: " + JSON.stringify(obj.list[0].eve) + "</div>"
    );
  };

  request.open(
    "GET",
    "http://api.openweathermap.org/data/2.5/forecast/daily?zip=35226&appid=ecf2399bb46bd55b5ca7f129182dbef6",
    true
  );
  request.send();

  // http://api.openweathermap.org/data/2.5/forecast?zip=35226&appid=ecf2399bb46bd55b5ca7f129182dbef6
}

function getFxPrices() {
  var request = new XMLHttpRequest(); // create a new request variable so we can make an HTTP GET request on our API

  // handle the request
  request.onreadystatechange = function () {
    // put the JSON text into a new object
    obj = JSON.parse(request.responseText);

    // define a string to hold all currency quotes
    fxString = "";

    // create a function to parse currency price once we have our list of currencies
    function parseCurrencyPrice(currencyName) {
      try {
        fxString +=
          currencyName +
          ": " +
          Math.round(10000 * JSON.stringify(obj.quotes[currencyName])) / 10000 +
          " : " +
          Math.round(10000 * (1 / JSON.stringify(obj.quotes[currencyName]))) /
            10000 +
          "<br>";
      } catch (e) {
        fxString += "Failed to load " + currencyName + "<br>";
      }
    }

    // define our list of currencies
    currencyList = [
      "USDEUR",
      "USDJPY",
      "USDGBP",
      "USDCAD",
      "USDSEK",
      "USDCHF",
      "USDCNY",
      "USDHKD",
      "USDRUB",
      "USDAUD",
    ];

    // calculate dollar index
    fxString += "$DXY: ";
    fxString +=
      Math.round(
        10000 *
          50.14348 *
          Math.pow(1 / JSON.stringify(obj.quotes["USDEUR"]), -0.576) *
          Math.pow(JSON.stringify(obj.quotes["USDJPY"]), 0.136) *
          Math.pow(1 / JSON.stringify(obj.quotes["USDGBP"]), -0.119) *
          Math.pow(JSON.stringify(obj.quotes["USDCAD"]), 0.091) *
          Math.pow(JSON.stringify(obj.quotes["USDSEK"]), 0.042) *
          Math.pow(JSON.stringify(obj.quotes["USDCHF"]), 0.036)
      ) / 10000;
    fxString += "<br>";

    // iterate through the list of currencies to obtain the quotes
    for (var i = 0; i < currencyList.length; i++) {
      parseCurrencyPrice(currencyList[i]);
    }

    // display the quotes in HTML
    $("#FX").html("<div>" + fxString + "</div>");
  };

  // request data from a FX provider
  request.open(
    "GET",
    "http://apilayer.net/api/live?access_key=8d3ccddf951ea87e5c412a7a439e814c&format=1",
    true
  );
  request.send();
}

function getStockPrices() {
  stockListHolder = "";

  chrome.storage.sync.get(
    {
      stocks: "MSFT FB AAPL",
    },
    function (items) {
      // define a list of stocks to be used in the API call
      stockListHolder = items.stocks.split(" ");
    }
  );

  stockList = ["GDX", "GDXJ", "RGLD", "MSFT", "FB", "AAPL"]; // stockListHolder;

  var request = new XMLHttpRequest(); // create a new request variable so we can make an HTTP GET request on our API

  // handle the request
  request.onreadystatechange = function () {
    // put the JSON text into a new object
    obj = JSON.parse(request.responseText);

    // define a string to hold all stock quotes
    stockString = "";

    // create a function to parse currency price once we have our list of currencies
    function parseStockPrice(stockName, index) {
      try {
        stockString +=
          stockName +
          ": " +
          JSON.stringify(obj["Stock Quotes"][i]["2. price"]) +
          "<br>";
      } catch (e) {
        stockString += "Failed to load " + stockName + "<br>";
      }
    }

    // iterate through the list of stocks to obtain the quotes
    for (var i = 0; i < stockList.length; i++) {
      parseStockPrice(stockList[i], i);
    }

    // display the quotes in HTML
    $("#Stocks").html(
      "<div>User entered: " + stockListHolder + "<br>" + stockString + "</div>"
    );
  };

  // request data from a FX provider
  request.open(
    "GET",
    "https://www.alphavantage.co/query?function=BATCH_STOCK_QUOTES&symbols=" +
      stockList +
      "&apikey=G6C1DAA6ODS1Y2JV",
    true
  );
  request.send();
}

function getNews() {
  var request = new XMLHttpRequest();

  // handle the request
  request.onreadystatechange = function () {
    // put the JSON text into a new object
    obj = JSON.parse(request.responseText);

    // define a string to hold all news text
    newsString = "";

    // parse the data from the JSON object
    for (var i = 0; i < 10; i++) {
      newsString +=
        "<details>" +
        "<summary>" +
        JSON.stringify(obj.query.results.rss.channel.item[i].title) +
        "</summary>" +
        "<p>" +
        JSON.stringify(obj.query.results.rss.channel.item[i].description) +
        "</p>" +
        "</details>";
    }

    // display the data in HTML
    $("#News").html("<div>" + newsString + "</div>");
  };

  request.open(
    "GET",
    "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%20%3D%20%27https%3A%2F%2Ffeeds.feedburner.com%2Fzerohedge%2Ffeed%27&format=json",
    true
  );
  request.send();
}

// When the document loads, ask for the data
document.addEventListener("DOMContentLoaded", function () {
  // getDataForBadge();
  // displaySunriseSunset();
  getCurrentWeatherData();
  // getForecastWeatherData();
  getCryptoPrices();
  getFxPrices();
  // getStockPrices();
  // getNews();
});

let wsObj;
let wsUrl = "wss://www.gasinfo.io/ws/v1/";

let cryptos = {};
let gasAmount = 21000;

// prettier-ignore
let updatePageGasPriceData = (data) => {
  let ethUsd = cryptos["ETH"];
  console.log(data.gasPrices);
  if (data && data.gasPrices) {
    let rapidObj = document.getElementById("rapid");
    let fastObj = document.getElementById("fast");
    let standardObj = document.getElementById("standard");
    let slowObj = document.getElementById("slow");
    rapidObj.innerHTML = Math.round(data.gasPrices.rapid / 1000000000) + " - $" + ((data.gasPrices.rapid / 1000000000000000000) * gasAmount * ethUsd).toFixed(2)
    fastObj.innerHTML = Math.round(data.gasPrices.fast / 1000000000) + " - $" + ((data.gasPrices.fast / 1000000000000000000) * gasAmount * ethUsd).toFixed(2)
    standardObj.innerHTML = Math.round(data.gasPrices.standard / 1000000000) + " - $" + ((data.gasPrices.standard / 1000000000000000000) * gasAmount * ethUsd).toFixed(2)
    slowObj.innerHTML = Math.round(data.gasPrices.slow / 1000000000) + " - $" + ((data.gasPrices.slow / 1000000000000000000) * gasAmount * ethUsd).toFixed(2)
  }
};

function getCryptoPrices() {
  var request = new XMLHttpRequest(); // create a new request variable so we can make an HTTP GET request on our API

  // handle the request
  request.onreadystatechange = function () {
    // put the JSON text into a new object
    obj = JSON.parse(request.responseText);

    // define a string to hold all currency quotes
    coinString = "";

    // create a function to parse currency price once we have our list of currencies
    function parseCoinPrice(coinName) {
      try {
        coinString +=
          coinName + ": " + JSON.stringify(obj[coinName].USD) + "<br>";
        cryptos[coinName] = obj[coinName].USD;
      } catch (e) {
        coinString += "Failed to load " + coinName + "<br>";
      }
    }

    // define our list of currencies
    coinList = ["BTC", "ETH", "BCH", "ZEC", "XMR", "DOGE"];

    // iterate through the list of currencies to obtain the quotes
    for (var i = 0; i < coinList.length; i++) {
      parseCoinPrice(coinList[i]);
    }

    // get ETH gas prices
    getEthGasPrices();

    // get BTC transaction prices
    getBtcTransxPrices();

    // show BTC to BCH ratio from coin list
    let btcToBch = cryptos["BCH"] / cryptos["BTC"];

    // display the quotes in HTML
    $("#BTC").html(
      "<div>" +
        coinString +
        "<br />" +
        "BTC to BCH: " +
        btcToBch.toFixed(8) +
        "</div>"
    );
  };

  // request data from a coin exchange
  request.open(
    "GET",
    "https://min-api.cryptocompare.com/data/pricemulti?fsyms=DOGE,XMR,ZEC,BCH,ETH,BTC&e=Bitfinex&tsyms=USD",
    true
  );
  request.send();
}

let sitoshisPerBitcoin = 100000000;
let bytesPerStandardTransaction = 140;

function getBtcTransxPrices() {
  // fetch fees in sitoshis per byte
  fetch("https://mempool.space/api/v1/fees/recommended")
    .then((data) => {
      return data.json();
    })
    .then((res) => {
      let btcToUsd = cryptos["BTC"];
      console.log("BTC fees: " + JSON.stringify(res));
      if (res && res.hourFee) {
        let fastObj = document.getElementById("btc-fastest");
        let standardObj = document.getElementById("btc-halfhour");
        let slowObj = document.getElementById("btc-hour");

        fastObj.innerHTML =
          Math.round(res.fastestFee) +
          " - $" +
          (
            (res.fastestFee / sitoshisPerBitcoin) *
            bytesPerStandardTransaction *
            btcToUsd
          ).toFixed(2);
        standardObj.innerHTML =
          Math.round(res.halfHourFee) +
          " - $" +
          (
            (res.halfHourFee / sitoshisPerBitcoin) *
            bytesPerStandardTransaction *
            btcToUsd
          ).toFixed(2);
        slowObj.innerHTML =
          Math.round(res.hourFee) +
          " - $" +
          (
            (res.hourFee / sitoshisPerBitcoin) *
            bytesPerStandardTransaction *
            btcToUsd
          ).toFixed(2);
      }
    });
}

function getEthGasPrices() {
  wsObj = new WebSocket(wsUrl);
  wsObj.onopen = (evt) => {
    console.log("Connection open ...");
  };

  wsObj.onmessage = (evt) => {
    const dataStr = evt.data;
    const data = JSON.parse(dataStr);

    if (data.type) {
      updatePageGasPriceData(data.data);
    }
  };

  wsObj.onclose = (evt) => {
    console.log("Connection closed.");
  };
}
