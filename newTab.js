// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var displayLabels = true;
var countStartValue = 1;
var count = countStartValue;
var numImages = 32; // 29;
var googlePhotosReel = [
  "https://lh3.googleusercontent.com/okjyywJfSGdcnq-rTpq3dJ1Rq9_QwMY-xqNrG5T-srenDNd5pKpyhik-1qulFSgOHnJASLgcJ3RYfbsXfzmIGwkwh1XEtGtR2OXW0ZveAduEBvuoVO4_2WXu6Xci5BrknB4381kxvCBgJiSdHOenRTct02BqNaAXgSL8-4RlRuYkCLlmEJUdwmiyyTJMUtsQNlDC82Q60wlwxiYvHuS-Dv3Xj5KKhdy5AXoTBz7w9c8s_-1BgYLbfc6NUqh65eeDF-PPtecWy_1B5xK1QdMG6hlT6QSUYLi-0jrk6pfTpxk5HYlXAdGwMt4g-46E1p1_oljMt4Mp5qvVNRcPDXWYQFHnqUjGzFHGeYmwvzmQy7T2jTmmnGRHAg16vbrLOhK9Zb_htEMfa11yE8IXwv08sdsZogzHqxWqGbcZdUhetOprUc79FhIw1f_tOJEI5HGUvz2hZ19UYaK11llyOtS1-oH7APGEDRIWzDZ_6Ze2Gr8sFw9FFK1HxbzEGxlOjK5a__13jGxAPPVQJu-04aigFoRYJrUJjgCEeGhaEkUiyeB_Q_2LhsxFq4qezKYNEk0G3MtPez5VGaxEFz4HA6xknGzqKwBEwvfWGbzE5WbOCLY=w1266-h949-no",
  "https://lh3.googleusercontent.com/4tD_TkWBWp09qROMJatAbqPZLlt7X-qDY3jvM1MWKg-7iJSxYHsoEQRE2hQKAsud8FzXfirXWuMO2k6wQyglN2xYdWYaXpIt9MeJpVQgI8AJUpkOSMfY1FdihbquhAjjOGs13cioHKe3ibKXxa1P-FBfbf1gKuCGixVIx9lg34BYDy9ly4uTQ_UQMGzplL5i8OKNrVmA08bejlgTRHi33b76duzQD0hlm0KU8a3YXCxKClvABD-B6xXBeD-8zlinSsxatlvpSvjpmd24XP2k6XrD-LcLexlcsISTdGRFVxiGDvmM9f2mI2aOLTj_ydtxlu3_7apfXic2Po95Ty9OGO2BfpUokyI8RS4yyWIuI-6AgMgEPciN6_0A8iwLSvf4F2p55OWUZKG8czHKMp5NCMgBCE583nXlQAbck-9SVaTAyOwaDOn0dSA8M3mFXe1avM4tDBsGtbAIPwthSwrV80SBN-B4SMk9eV5zMQCfzN6JhJJiNk7xFMM33NUmrRM0JI_-ufKqNQwfDoXA-64lkMFvGWoUZMJsFa5MnPO5UB8twwB-4m4rF44xOmFD1dGuFVFP7FYcRzbyrPvYX-uKkV2CCiI827JbmLCjqWlyIFk=w1266-h949-no",
];

$(document).ready(function () {
  // $("#helloText").click(function () {
  //   nextImageInChromeStoragePhotoArray();
  // });

  $("#time").click(function () {
    previousImageInChromeStoragePhotoArray();
  });

  getStoredGreeting();

  // Add blur event listener to save when user finishes editing
  $("#helloText").on("blur", function () {
    saveGreeting();
  });

  // Update the keypress event handler
  $("#helloText").on("keypress", function (e) {
    if (e.which === 13 && e.shiftKey) {
      // If Shift+Enter is pressed, save the changes
      e.preventDefault();
      this.blur();
    }
    // Regular Enter key will now create a line break
  });

  // Add a new keydown handler for Escape key
  $("#helloText").on("keydown", function (e) {
    if (e.which === 27) {
      // Escape key
      e.preventDefault();
      this.blur();
    }
  });

  getStoredNotes();

  // Add event listeners for the notes
  $("#notes").on("blur", function () {
    saveNotes();
  });

  $("#notes").on("keypress", function (e) {
    if (e.which === 13 && e.shiftKey) {
      // If Shift+Enter is pressed, save the changes
      e.preventDefault();
      this.blur();
    }
    // Regular Enter key will create a line break
  });

  $("#notes").on("keydown", function (e) {
    if (e.which === 27) {
      // Escape key
      e.preventDefault();
      this.blur();
    }
  });

  getStoredBottomNotes();

  // Add event listeners for the bottom notes
  $("#bottomNotes").on("blur", function () {
    saveBottomNotes();
  });

  $("#bottomNotes").on("keypress", function (e) {
    if (e.which === 13 && e.shiftKey) {
      // If Shift+Enter is pressed, save the changes
      e.preventDefault();
      this.blur();
    }
    // Regular Enter key will create a line break
  });

  $("#bottomNotes").on("keydown", function (e) {
    if (e.which === 27) {
      // Escape key
      e.preventDefault();
      this.blur();
    }
  });

  // Add toggle button event listeners
  $("#toggleTopNotes").click(function () {
    toggleNotesVisibility("topNotesVisible", "#notes");
  });

  $("#toggleBottomNotes").click(function () {
    toggleNotesVisibility("bottomNotesVisible", "#bottomNotes");
  });

  // Get stored visibility states
  chrome.storage.sync.get(
    {
      topNotesVisible: true,
      bottomNotesVisible: true,
    },
    function (items) {
      if (!items.topNotesVisible) {
        $("#notes").hide();
      }
      if (!items.bottomNotesVisible) {
        $("#bottomNotes").hide();
      }
    }
  );

  // Initialize the TODO feature
  initTodos();

  // Add event listener for adding new TODOs
  $("#addTodoBtn").click(function () {
    createNewTodo();
  });

  // Add event listener for toggling between active and deleted TODOs
  $("#toggleTodoViewBtn").click(function () {
    toggleTodoView();
  });

  // Add event listener for toggling TODO section visibility
  $("#toggleTodosVisibilityBtn").click(function () {
    toggleTodosVisibility();
  });

  // Add event listener for permanent delete all
  $("#permanentDeleteAllBtn").click(function () {
    confirmPermanentDeleteAll();
  });

  // Check if TODOs visibility state is stored
  chrome.storage.sync.get(
    {
      todosVisible: true,
    },
    function (items) {
      if (!items.todosVisible) {
        // Hide TODOs if they were hidden before
        toggleTodosVisibility(false);
      }
    }
  );
});

function doesFileExist() {
  try {
    var file = window.open("/wallpaper/25.jpg");
    // alert("found the file");
    setTimeout("file.close()", 100);
    setTimeout("alert('Audio file found. Have a nice day!');", 101);
  } catch (err) {
    alert("Warning:\n Unable to locate file\n " + err.message);
  }
}

function displayTime() {
  var current_date = new Date();
  var timeString;

  if (current_date.getHours() <= 12)
    timeString =
      current_date.getHours() +
      ":" +
      ("0" + current_date.getMinutes()).slice(-2);
  // AM
  else
    timeString =
      (current_date.getHours() % 12) +
      ":" +
      ("0" + current_date.getMinutes()).slice(-2); // PM

  document.getElementById("time").innerHTML = timeString;
}

function nextImage() {
  directoryPhotosIterate();
}

function directoryPhotosIterate() {
  var success = false;

  while (!success) {
    count = count + 1;
    if (count > numImages) {
      count = countStartValue;
    }

    chrome.storage.sync.set(
      {
        cnt: count,
      },
      function () {
        //
      }
    );

    $("#bodyid").attr("background", "/wallpaper/" + count + ".jpg");
    // $("#bodyid").attr("background","https://lh3.googleusercontent.com/okjyywJfSGdcnq-rTpq3dJ1Rq9_QwMY-xqNrG5T-srenDNd5pKpyhik-1qulFSgOHnJASLgcJ3RYfbsXfzmIGwkwh1XEtGtR2OXW0ZveAduEBvuoVO4_2WXu6Xci5BrknB4381kxvCBgJiSdHOenRTct02BqNaAXgSL8-4RlRuYkCLlmEJUdwmiyyTJMUtsQNlDC82Q60wlwxiYvHuS-Dv3Xj5KKhdy5AXoTBz7w9c8s_-1BgYLbfc6NUqh65eeDF-PPtecWy_1B5xK1QdMG6hlT6QSUYLi-0jrk6pfTpxk5HYlXAdGwMt4g-46E1p1_oljMt4Mp5qvVNRcPDXWYQFHnqUjGzFHGeYmwvzmQy7T2jTmmnGRHAg16vbrLOhK9Zb_htEMfa11yE8IXwv08sdsZogzHqxWqGbcZdUhetOprUc79FhIw1f_tOJEI5HGUvz2hZ19UYaK11llyOtS1-oH7APGEDRIWzDZ_6Ze2Gr8sFw9FFK1HxbzEGxlOjK5a__13jGxAPPVQJu-04aigFoRYJrUJjgCEeGhaEkUiyeB_Q_2LhsxFq4qezKYNEk0G3MtPez5VGaxEFz4HA6xknGzqKwBEwvfWGbzE5WbOCLY=w1266-h949-no");

    success = true;
  }
  // https://source.unsplash.com/random/2000x1000
}

function googlePhotosIterate() {}

function prevImage() {
  var success = false;

  while (!success) {
    count = count - 1;
    if (count < 0) {
      count = numImages;
    }

    chrome.storage.sync.set(
      {
        cnt: count,
      },
      function () {
        //
      }
    );

    // $("#bodyid").attr("background","/wallpaper/" + count + ".jpg");
    $("#bodyid").attr(
      "background",
      "file:///C:/Users/dhudman/Pictures/Personal/Friends/IMG_1869.JPG"
    );
    success = true;

    chrome.storage.sync.get(
      {
        photoPath:
          "file:///C:/Users/dhudman/Pictures/Personal/Friends/IMG_1869.JPG",
      },
      function (items) {
        $("#bodyid").attr("background", items.photoPath); // restore the image that was on last
      }
    );
  }
  // https://source.unsplash.com/random/2000x1000
}

function nextImageInChromeStoragePhotoArray() {
  nextOrPreviousImageInChromeStorageArray(1);
}

function previousImageInChromeStoragePhotoArray() {
  nextOrPreviousImageInChromeStorageArray(-1);
}

function nextOrPreviousImageInChromeStorageArray(incrementor) {
  chrome.storage.sync.get(
    {
      photoPath: "file:///C:/Users/dhudman/Pictures/Personal/Friends",
      photoArrayCountTotal: 0,
      photoArrayCountCurrent: 0,
      photoArray: "IMG_1869.JPG",
    },
    function (items) {
      var tempPhotoArrayCountCurrent = items.photoArrayCountCurrent;
      var tempPhotoArrayCountTotal = items.photoArrayCountTotal;
      if (
        (items.photoArrayCountCurrent < items.photoArrayCountTotal &&
          incrementor == 1) ||
        (incrementor == -1 && items.photoArrayCountCurrent > 0)
      ) {
        tempPhotoArrayCountCurrent += incrementor;
        chrome.storage.sync.set(
          {
            photoArrayCountCurrent: tempPhotoArrayCountCurrent,
          },
          function () {
            //
          }
        );
      } else {
        if (incrementor == 1) tempPhotoArrayCountCurrent = 0;
        else tempPhotoArrayCountCurrent = tempPhotoArrayCountTotal;

        chrome.storage.sync.set(
          {
            photoArrayCountCurrent: tempPhotoArrayCountCurrent,
          },
          function () {
            //
          }
        );
      }

      var tempPhotoArray = items.photoArray;

      $("#bodyid").attr(
        "background",
        items.photoPath + "\\" + tempPhotoArray[tempPhotoArrayCountCurrent]
      ); // go to the next image or the 0 index image
    }
  );
}

function getStoredData() {
  chrome.storage.sync.get(
    {
      photoPath: "file:///C:/Users/dhudman/Pictures/Personal/Friends",
      photoArrayCountTotal: 0,
      photoArrayCountCurrent: 0,
      photoArray: "IMG_1869.JPG",
    },
    function (items) {
      $("#bodyid").attr(
        "background",
        items.photoPath + "\\" + items.photoArray[items.photoArrayCountCurrent]
      ); // restore the image that was on last
    }
  );
}

function countImagesInFolder() {
  $.ajax({
    url: "C:UsersdhudmanDocumentsPersonalProjectsWeather chrome extension with crypto 2017 09 08aWeatherwallpaper",
    success: function (data) {
      numImages = 0;
      $(data)
        .find("a:contains(.jpg)")
        .each(function () {
          numImages++;
        });
      alert("numImages: " + numImages);
    },
  });
}

function getFileSystemAccess() {
  chrome.extension.isAllowedFileSchemeAccess(function (isAllowedAccess) {
    if (isAllowedAccess) {
      return; // Great, we've got access
    }
    // alert for a quick demonstration, please create your own user-friendly UI
    alert(
      'Please check the box "Allow access to file URLs" for our extension on the following screen.'
    );

    chrome.tabs.create({
      url: "chrome://extensions/?id=" + chrome.runtime.id,
    });
  });
}

// ... existing code ...

function getWeatherData(zip) {
  // First get lat/long from zipcode
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
      var obj = JSON.parse(request.responseText);
      var latitude = obj.results[0].geometry.location.lat;
      var longitude = obj.results[0].geometry.location.lng;

      // Now get weather data using lat/long
      fetchOpenMeteoWeather(latitude, longitude);
    }
  };

  request.open(
    "GET",
    "http://maps.googleapis.com/maps/api/geocode/json?address=" + zip,
    true
  );
  request.send();
}

function fetchOpenMeteoWeather(lat, lng) {
  var request = new XMLHttpRequest();

  request.onreadystatechange = function () {
    if (request.readyState === 4 && request.status === 200) {
      // Store the raw JSON response
      const rawJsonResponse = request.responseText;

      // Parse the JSON
      var obj = JSON.parse(rawJsonResponse);

      // Instead of calling updateWeatherDisplay, create raw JSON display
      createWeatherJsonWidget(obj, rawJsonResponse);

      // Save to storage
      chrome.storage.sync.set({
        currentTemperature: obj.current_weather.temperature,
        minTemperature: obj.daily.temperature_2m_min[0],
        maxTemperature: obj.daily.temperature_2m_max[0],
        precipitationProbability: obj.daily.precipitation_probability_max[0],
        weatherRawJson: rawJsonResponse,
      });
    }
  };

  request.open(
    "GET",
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&timezone=auto`,
    true
  );
  request.send();
}

function createWeatherJsonWidget(data, rawJson) {
  // Create weather element if it doesn't exist
  if (!document.getElementById("weatherWidget")) {
    var weatherDiv = document.createElement("div");
    weatherDiv.id = "weatherWidget";
    weatherDiv.style.position = "absolute";
    weatherDiv.style.top = "10px";
    weatherDiv.style.right = "10px";
    weatherDiv.style.padding = "15px";
    weatherDiv.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    weatherDiv.style.color = "white";
    weatherDiv.style.borderRadius = "10px";
    weatherDiv.style.fontFamily = "monospace";
    weatherDiv.style.maxWidth = "400px";
    weatherDiv.style.maxHeight = "70vh";
    weatherDiv.style.overflow = "auto";
    weatherDiv.style.cursor = "pointer";
    weatherDiv.title = "Click to refresh weather data";
    document.body.appendChild(weatherDiv);
  }

  // Update the content with raw JSON
  var weatherWidget = document.getElementById("weatherWidget");
  weatherWidget.innerHTML = `
    <div style="font-size: 14px; margin-bottom: 10px; text-align: center; font-weight: bold;">Click to refresh weather data</div>
    <pre style="white-space: pre-wrap; font-size: 11px; color: #ddd;">${JSON.stringify(
      data,
      null,
      2
    )}</pre>
  `;

  // Add click handler to refresh weather data
  weatherWidget.onclick = function () {
    weatherWidget.innerHTML =
      '<div style="text-align: center; padding: 20px;">Refreshing weather data...</div>';

    // Get zip code from storage and fetch new weather data
    chrome.storage.sync.get({ zip: 35244 }, function (items) {
      getWeatherData(items.zip);
    });
  };
}

// For the existing displayWeatherData function, modify it to handle raw JSON display:
function displayWeatherData() {
  chrome.storage.sync.get(
    {
      currentTemperature: 0,
      minTemperature: 0,
      maxTemperature: 0,
      precipitationProbability: 0,
      weatherRawJson: "",
      zip: 35244,
    },
    function (items) {
      if (!items.weatherRawJson) {
        // If no weather data in storage, fetch it now
        getWeatherData(items.zip);
      } else {
        // Display stored raw JSON data
        try {
          const obj = JSON.parse(items.weatherRawJson);
          createWeatherJsonWidget(obj, items.weatherRawJson);
        } catch (e) {
          // If JSON parsing fails, fetch new data
          getWeatherData(items.zip);
        }
      }
    }
  );
}

// Update the existing DOM ready event handler to include weather display
document.addEventListener("DOMContentLoaded", function () {
  getFileSystemAccess();
  // countImagesInFolder();
  displayTime();
  getStoredData();
  displayWeatherData();
  var myVar = setInterval(displayTime, 1000);
  // Refresh weather every 30 minutes
  // setInterval(displayWeatherData, 1800000);
  // nextImage();
});

// ... existing code ...

// Add this near the top of the file with other initialization code
function getStoredGreeting() {
  chrome.storage.sync.get(
    {
      greeting: "Sup, Rockstar", // default value
    },
    function (items) {
      document.getElementById("helloText").innerHTML = items.greeting;
    }
  );
}

// Add this to handle saving the greeting
function saveGreeting() {
  const greeting = document.getElementById("helloText").innerHTML;
  chrome.storage.sync.set(
    {
      greeting: greeting,
    },
    function () {
      // Optional: Add visual feedback that the greeting was saved
      const element = document.getElementById("helloText");
      element.style.opacity = "0.5";
      setTimeout(() => (element.style.opacity = "1"), 200);
    }
  );
}

// Add these functions near your other storage functions
function getStoredNotes() {
  chrome.storage.sync.get(
    {
      notes: "Click to add notes", // default value
    },
    function (items) {
      document.getElementById("notes").innerHTML = items.notes;
    }
  );
}

function saveNotes() {
  const notes = document.getElementById("notes").innerHTML;
  chrome.storage.sync.set(
    {
      notes: notes,
    },
    function () {
      // Optional: Add visual feedback that the notes were saved
      const element = document.getElementById("notes");
      element.style.opacity = "0.5";
      setTimeout(() => (element.style.opacity = "1"), 200);
    }
  );
}

// Add these functions near your other storage functions
function getStoredBottomNotes() {
  chrome.storage.sync.get(
    {
      bottomNotes: "Click to add bottom notes", // default value
    },
    function (items) {
      document.getElementById("bottomNotes").innerHTML = items.bottomNotes;
    }
  );
}

function saveBottomNotes() {
  const bottomNotes = document.getElementById("bottomNotes").innerHTML;
  chrome.storage.sync.set(
    {
      bottomNotes: bottomNotes,
    },
    function () {
      // Optional: Add visual feedback that the notes were saved
      const element = document.getElementById("bottomNotes");
      element.style.opacity = "0.5";
      setTimeout(() => (element.style.opacity = "1"), 200);
    }
  );
}

// Add this new function to handle toggling notes visibility
function toggleNotesVisibility(storageKey, elementSelector) {
  chrome.storage.sync.get(
    {
      [storageKey]: true,
    },
    function (items) {
      const newVisibility = !items[storageKey];
      chrome.storage.sync.set(
        {
          [storageKey]: newVisibility,
        },
        function () {
          if (newVisibility) {
            $(elementSelector).show();
          } else {
            $(elementSelector).hide();
          }
        }
      );
    }
  );
}

// Global state for todo view mode
// 0 = active, 1 = deleted
let viewMode = 0;
let todosVisible = true;

// TODO Feature functions
function initTodos() {
  // Load saved TODOs from storage
  chrome.storage.sync.get(
    {
      todos: [], // Default empty array
      deletedTodos: [], // Default empty array for deleted todos
    },
    function (items) {
      // Render each saved active TODO
      items.todos.forEach((todo) => {
        renderTodo(todo, false);
      });

      // Render each saved deleted TODO
      items.deletedTodos.forEach((todo) => {
        renderTodo(todo, true);
      });
    }
  );
}

function toggleTodoView() {
  if (viewMode === 0) {
    // Switch to deleted view
    viewMode = 1;
    $("#toggleTodoViewBtn").text("View Active");
    $("#activeTodosContainer").hide();
    $("#deletedTodosContainer").show();
    $("#allTodosContainer").hide();
    $("#addTodoBtn").hide();
  } else {
    // Switch to active view
    viewMode = 0;
    $("#toggleTodoViewBtn").text("View Deleted");
    $("#activeTodosContainer").show();
    $("#deletedTodosContainer").hide();
    $("#allTodosContainer").hide();
    $("#addTodoBtn").show();
  }
}

function toggleTodosVisibility(setVisible) {
  // If setVisible is provided, use it, otherwise toggle current state
  if (setVisible !== undefined) {
    todosVisible = setVisible;
  } else {
    todosVisible = !todosVisible;
  }

  if (todosVisible) {
    // Show TODOs
    $("#todoContainer").css({
      width: "250px",
      "max-height": "80vh",
      "overflow-y": "auto",
    });
    $("#toggleTodosVisibilityBtn").text("Hide TODOs");
    $("#activeTodosContainer").show();
    if (viewMode === 1) {
      $("#deletedTodosContainer").show();
    }
    $("#addTodoBtn").show();
  } else {
    // Hide TODOs
    $("#todoContainer").css({
      width: "auto",
      "max-height": "none",
      "overflow-y": "visible",
    });
    $("#toggleTodosVisibilityBtn").text("Show TODOs");
    $("#activeTodosContainer").hide();
    $("#deletedTodosContainer").hide();
    $("#allTodosContainer").hide();
    $("#addTodoBtn").hide();
  }

  // Save visibility state
  chrome.storage.sync.set({
    todosVisible: todosVisible,
  });
}

function createNewTodo() {
  // Generate a unique ID for the new TODO
  const id = "todo_" + Date.now();

  // Create a new TODO object
  const todo = {
    id: id,
    title: "",
    description: "",
    expanded: false, // Changed to false - collapsed by default
    createdAt: Date.now(),
  };

  // Render the new TODO in the UI
  renderTodo(todo, false);

  // Save the new TODO to storage
  saveTodo(todo);
}

function renderTodo(todo, isDeleted) {
  // Create the TODO element
  const todoEl = document.createElement("div");
  todoEl.id = todo.id;
  todoEl.className = "todo-item";
  todoEl.style.backgroundColor = "#fef9b0"; // Yellow sticky note color
  todoEl.style.padding = "10px";
  todoEl.style.borderRadius = "5px";
  todoEl.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  todoEl.style.position = "relative";
  todoEl.style.transition = "all 0.3s ease";
  todoEl.style.marginBottom = "5px"; // Add 5px vertical spacing between TODOs

  // Create a container for the title row
  const titleRow = document.createElement("div");
  titleRow.style.display = "flex";
  titleRow.style.justifyContent = "space-between";
  titleRow.style.alignItems = "center";

  // Create a toggle button to expand/collapse or recover
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "todo-toggle";
  if (isDeleted) {
    toggleBtn.textContent = "+"; // Simple plus sign for recovery
    toggleBtn.title = "Recover todo";
  } else {
    toggleBtn.textContent = todo.expanded ? "-" : "+";
    toggleBtn.title = todo.expanded ? "Collapse" : "Expand";
  }
  toggleBtn.style.background = "transparent";
  toggleBtn.style.border = "none";
  toggleBtn.style.fontSize = "16px";
  toggleBtn.style.cursor = "pointer";
  toggleBtn.style.color = isDeleted ? "#28a745" : "#555"; // Green for recover
  toggleBtn.style.marginRight = "5px";
  toggleBtn.style.width = "24px";
  toggleBtn.style.height = "24px";
  toggleBtn.style.lineHeight = "1";
  toggleBtn.style.padding = "0";

  // Create the title element
  const titleEl = document.createElement("div");
  titleEl.className = "todo-title";
  titleEl.contentEditable = !isDeleted; // Only editable if not deleted
  titleEl.style.fontWeight = "bold";
  titleEl.style.outline = "none";
  titleEl.style.flex = "1";
  titleEl.textContent = todo.title;
  if (todo.title === "" && !isDeleted) {
    titleEl.dataset.placeholder = "New TODO";
    titleEl.style.color = "#999";
  }

  // Handle title edit (save on blur) - only for active todos
  if (!isDeleted) {
    titleEl.addEventListener("focus", function () {
      if (
        this.textContent === "" &&
        this.style.color === "rgb(153, 153, 153)"
      ) {
        this.style.color = "";
      }
    });

    titleEl.addEventListener("blur", function () {
      todo.title = this.textContent;
      if (this.textContent === "") {
        this.style.color = "#999";
      }
      updateTodo(todo);
    });
  }

  // Add title and toggle button to title row
  titleRow.appendChild(toggleBtn);
  titleRow.appendChild(titleEl);

  // Create description element (only visible when expanded)
  const descEl = document.createElement("div");
  descEl.className = "todo-description";
  descEl.contentEditable = !isDeleted; // Only editable if not deleted
  descEl.style.display = !isDeleted && todo.expanded ? "block" : "none";
  descEl.style.marginTop = "5px";
  descEl.style.outline = "none";
  descEl.textContent = todo.description;
  if (todo.description === "" && !isDeleted) {
    descEl.dataset.placeholder = "Click to edit description";
    descEl.style.color = "#999";
  }

  // Handle description edit (save on blur) - only for active todos
  if (!isDeleted) {
    descEl.addEventListener("focus", function () {
      if (
        this.textContent === "" &&
        this.style.color === "rgb(153, 153, 153)"
      ) {
        this.style.color = "";
      }
    });

    descEl.addEventListener("blur", function () {
      todo.description = this.textContent;
      if (this.textContent === "") {
        this.style.color = "#999";
      }
      updateTodo(todo);
    });
  }

  // Create delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.className = "todo-delete";
  deleteBtn.textContent = "X";
  deleteBtn.style.position = "absolute";
  deleteBtn.style.top = "5px";
  deleteBtn.style.right = "5px";
  deleteBtn.style.background = "transparent";
  deleteBtn.style.border = "none";
  deleteBtn.style.fontSize = "16px";
  deleteBtn.style.cursor = "pointer";
  deleteBtn.style.color = "#d9534f";
  deleteBtn.style.fontWeight = "bold";

  // Handle delete or permanent delete
  deleteBtn.addEventListener("click", function () {
    if (isDeleted) {
      if (confirm("Are you sure you want to permanently delete this todo?")) {
        permanentDeleteTodo(todo.id);
        todoEl.remove();
      }
    } else {
      moveTodoToDeleted(todo.id);
      todoEl.remove();
    }
  });

  // Handle toggle or recover
  toggleBtn.addEventListener("click", function () {
    if (isDeleted) {
      recoverTodo(todo.id);
      todoEl.remove();
    } else {
      todo.expanded = !todo.expanded;
      descEl.style.display = todo.expanded ? "block" : "none";
      toggleBtn.textContent = todo.expanded ? "-" : "+";
      toggleBtn.title = todo.expanded ? "Collapse" : "Expand";
      updateTodo(todo);
    }
  });

  // Add all elements to the TODO
  todoEl.appendChild(titleRow);
  todoEl.appendChild(descEl);
  todoEl.appendChild(deleteBtn);

  // Add the TODO to the appropriate list
  if (isDeleted) {
    document.getElementById("deletedTodoList").appendChild(todoEl);
  } else {
    document.getElementById("todoList").appendChild(todoEl);
  }

  // Set focus on the title if it's a new empty todo
  if (todo.title === "" && !isDeleted) {
    titleEl.focus();
  }
}

function saveTodo(todo) {
  chrome.storage.sync.get(
    {
      todos: [],
    },
    function (items) {
      // Add the new TODO to the array
      const todos = items.todos;
      todos.push(todo);

      // Save the updated array
      chrome.storage.sync.set({
        todos: todos,
      });
    }
  );
}

function updateTodo(updatedTodo) {
  chrome.storage.sync.get(
    {
      todos: [],
    },
    function (items) {
      // Find and update the TODO in the array
      const todos = items.todos;
      const index = todos.findIndex((todo) => todo.id === updatedTodo.id);

      if (index !== -1) {
        todos[index] = updatedTodo;

        // Save the updated array
        chrome.storage.sync.set({
          todos: todos,
        });
      }
    }
  );
}

function moveTodoToDeleted(todoId) {
  chrome.storage.sync.get(
    {
      todos: [],
      deletedTodos: [],
    },
    function (items) {
      // Find the todo to move
      const todos = items.todos;
      const index = todos.findIndex((todo) => todo.id === todoId);

      if (index !== -1) {
        // Get the todo and remove from active list
        const todoToDelete = todos[index];
        todos.splice(index, 1);

        // Add to deleted list
        const deletedTodos = items.deletedTodos;
        deletedTodos.push(todoToDelete);

        // Save both arrays
        chrome.storage.sync.set({
          todos: todos,
          deletedTodos: deletedTodos,
        });
      }
    }
  );
}

function recoverTodo(todoId) {
  chrome.storage.sync.get(
    {
      todos: [],
      deletedTodos: [],
    },
    function (items) {
      // Find the todo to recover
      const deletedTodos = items.deletedTodos;
      const index = deletedTodos.findIndex((todo) => todo.id === todoId);

      if (index !== -1) {
        // Get the todo and remove from deleted list
        const todoToRecover = deletedTodos[index];
        deletedTodos.splice(index, 1);

        // Add to active list
        const todos = items.todos;
        todos.push(todoToRecover);

        // Save both arrays
        chrome.storage.sync.set(
          {
            todos: todos,
            deletedTodos: deletedTodos,
          },
          function () {
            // Re-render the recovered todo in the active list
            if (viewMode === 0) {
              renderTodo(todoToRecover, false);
            }
          }
        );
      }
    }
  );
}

function permanentDeleteTodo(todoId) {
  chrome.storage.sync.get(
    {
      deletedTodos: [],
    },
    function (items) {
      // Filter out the deleted TODO
      const deletedTodos = items.deletedTodos.filter(
        (todo) => todo.id !== todoId
      );

      // Save the updated array
      chrome.storage.sync.set({
        deletedTodos: deletedTodos,
      });
    }
  );
}

function confirmPermanentDeleteAll() {
  if (
    confirm(
      "Are you sure you want to permanently delete ALL items in the trash? This cannot be undone."
    )
  ) {
    chrome.storage.sync.set(
      {
        deletedTodos: [],
      },
      function () {
        // Clear the deleted todos list in the UI
        document.getElementById("deletedTodoList").innerHTML = "";
      }
    );
  }
}
