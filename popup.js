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
    $('#sheetsAPI').click(function () {
        sheetsWriteRequest();

    });
}

function displaySunriseSunset() {
    chrome.storage.sync.get({
        favoriteColor: 'red',
        sheetKey: "type your key",
        sheetGid: 'type your gid',
        importKey: 'type your key',
        importLink: 'type your link',
        likesColor: true,
        zip: 35244
    }, function (items) {
        // globalZipcode = items.zip;
        getLatitudeAndLongitudeThenSunset(items.zip);
    });
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

    request.open("GET", "http://maps.googleapis.com/maps/api/geocode/json?address=" + zip, true);
    request.send();
}

function getSunriseSunset(lat, lng) {
    var request = new XMLHttpRequest();

    // handle the request
    request.onreadystatechange = function () {
        // put the JSON text into a new object
        obj = JSON.parse(request.responseText);

        // put it inside a new div, and append it to the body - for some reason, this gets appended twice.
        $('#sunset').html("<div>" + "sunrise: " + convertUTCtoTimeZone(obj.results.sunrise) + " AM" + "<br />" + "sunset: " + convertUTCtoTimeZone(obj.results.sunset) + " PM" + "</div>");

        chrome.storage.sync.set({
            sunrise: convertUTCtoTimeZone(obj.results.sunrise),
            sunset: convertUTCtoTimeZone(obj.results.sunset)

        }, function () {

        });

    };

    request.open("GET", "http://api.sunrise-sunset.org/json?lat=" + lat + "&lng=" + lng + "&date=today", true);
    request.send();
}

function convertUTCtoTimeZone(time) {
    var d = new Date()

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
    chrome.storage.sync.set({
        // likesColor: likesColor
        badgeTextCS: stockArray[26][5]

    }, function () {

    });
}

function getCurrentWeatherData() {
    var request = new XMLHttpRequest();

    // handle the request
    request.onreadystatechange = function () {
        // put the JSON text into a new object
        obj = JSON.parse(request.responseText);

        // parse the data from the JSON object
        currentTemp = (JSON.stringify(obj.main.temp) * 1.8) - 459.67;
        // lowTemp = (JSON.stringify(obj.main.temp_min) * 1.8) - 459.67;
        // highTemp = (JSON.stringify(obj.main.temp_max) * 1.8) - 459.67;

        // display the data in HTML
        $('#currentTemp').html("<div>Current Temp: " + currentTemp.toFixed(1) + "</div>");

        // Set that value in Chrome Storage
        chrome.storage.sync.set({
            currentTemperature: currentTemp
        }, function () {

        });

    };

    request.open("GET", "http://api.openweathermap.org/data/2.5/weather?zip=35226,us&appid=ecf2399bb46bd55b5ca7f129182dbef6", true);
    request.send();
}

function getForecastWeatherData() {
    var request = new XMLHttpRequest();

    // handle the request
    request.onreadystatechange = function () {
        // put the JSON text into a new object
        obj = JSON.parse(request.responseText);

        // parse the data from the JSON object
        lowTemp = (JSON.stringify(obj.list[0].eve) * 1.8) - 459.67;
        highTemp = (JSON.stringify(obj.list[0].max) * 1.8) - 459.67;

        // display the data in HTML
        $('#highLowTemp').html("<div>Hi/eve Temp: " + JSON.stringify(obj.list[0].eve) + "</div>");

    };

    request.open("GET", "http://api.openweathermap.org/data/2.5/forecast/daily?zip=35226&appid=ecf2399bb46bd55b5ca7f129182dbef6", true);
    request.send();

    // http://api.openweathermap.org/data/2.5/forecast?zip=35226&appid=ecf2399bb46bd55b5ca7f129182dbef6
}

function getCryptoPrices() {
    var request = new XMLHttpRequest();		// create a new request variable so we can make an HTTP GET request on our API

    // handle the request
    request.onreadystatechange = function () {
        // put the JSON text into a new object
        obj = JSON.parse(request.responseText);

        // define a string to hold all currency quotes
        coinString = "";

        // create a function to parse currency price once we have our list of currencies
        function parseCoinPrice(coinName) {
            try {
                coinString += coinName + ": " + JSON.stringify(obj[coinName].USD) + "<br>";
            } catch (e) {
                coinString += "Failed to load " + coinName + "<br>";
            }
        }

        // define our list of currencies
        coinList = ["BTC", "ETH", "BCH"];

        // iterate through the list of currencies to obtain the quotes
        for (var i = 0; i < coinList.length; i++) {
            parseCoinPrice(coinList[i]);
        }

        // display the quotes in HTML
        $('#BTC').html("<div>" + coinString + "</div>");
    };

    // request data from a coin exchange
    request.open("GET", "https://min-api.cryptocompare.com/data/pricemulti?fsyms=BCH,ETH,BTC&e=Bitfinex&tsyms=USD", true);
    request.send();
}

function getFxPrices() {
    var request = new XMLHttpRequest();		// create a new request variable so we can make an HTTP GET request on our API

    // handle the request
    request.onreadystatechange = function () {
        // put the JSON text into a new object
        obj = JSON.parse(request.responseText);

        // define a string to hold all currency quotes
        fxString = "";

        // create a function to parse currency price once we have our list of currencies
        function parseCurrencyPrice(currencyName) {
            try {
                fxString += currencyName + ": " + Math.round(10000 * JSON.stringify(obj.quotes[currencyName])) / 10000 + " : " + Math.round(10000 * (1 / (JSON.stringify(obj.quotes[currencyName])))) / 10000 + "<br>";
            } catch (e) {
                fxString += "Failed to load " + currencyName + "<br>";
            }
        }

        // define our list of currencies
        currencyList = ["USDEUR", "USDCAD", "USDCNY", "USDJPY", "USDCHF", "USDHKD", "USDRUB", "USDAUD"];

        // iterate through the list of currencies to obtain the quotes
        for (var i = 0; i < currencyList.length; i++) {
            parseCurrencyPrice(currencyList[i]);
        }

        // display the quotes in HTML
        $('#FX').html("<div>" + fxString + "</div>");

    };

    // request data from a FX provider
    request.open("GET", "http://apilayer.net/api/live?access_key=8d3ccddf951ea87e5c412a7a439e814c&format=1", true);
    request.send();
}



// When the document loads, ask for the data
document.addEventListener('DOMContentLoaded', function () {
    // getDataForBadge();
    displaySunriseSunset();
    getCurrentWeatherData();
    getForecastWeatherData();
    getCryptoPrices();
    getFxPrices();
});