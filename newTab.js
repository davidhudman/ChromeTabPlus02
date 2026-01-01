// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var displayLabels = true;
var countStartValue = 1;
var count = countStartValue;
var numImages = 32; // 29;

// Bundled background images - loaded dynamically from backgrounds/backgrounds.json
var bundledBackgrounds = [];

// Load the backgrounds list from the JSON manifest
function loadBundledBackgroundsList() {
  return new Promise((resolve, reject) => {
    const jsonUrl = chrome.runtime.getURL("backgrounds/backgrounds.json");
    fetch(jsonUrl)
      .then(response => {
        if (!response.ok) throw new Error("Failed to load backgrounds.json");
        return response.json();
      })
      .then(images => {
        // Prepend "backgrounds/" to each filename
        bundledBackgrounds = images.map(img => "backgrounds/" + img);
        resolve(bundledBackgrounds);
      })
      .catch(error => {
        console.error("Error loading backgrounds.json:", error);
        bundledBackgrounds = [];
        reject(error);
      });
  });
}

var googlePhotosReel = [];

document.addEventListener("DOMContentLoaded", function () {
  // $("#helloText").click(function () {
  //   nextImageInChromeStoragePhotoArray();
  // });

  // Remove the simple time click handler
  // $("#time").click(function () {
  //   previousImageInChromeStoragePhotoArray();
  // });

  // Click handler for the time - left half goes to next image, right half goes to previous
  const timeEl = document.getElementById("time");
  if (timeEl)
    timeEl.addEventListener("click", function (e) {
      const rect = timeEl.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const timeWidth = rect.width;

      // Left half = next image, Right half = previous image
      if (clickX < timeWidth * 0.5) {
        nextImageInChromeStoragePhotoArray();
      } else {
        previousImageInChromeStoragePhotoArray();
      }
    });

  // Use delegated event handler for the background tip with dual approach
  document.addEventListener("click", function (e) {
    const target = e.target;
    // If interacting with the project selector area, do nothing
    const selectorContainer = document.getElementById(
      "projectSelectorContainer"
    );
    if (selectorContainer && selectorContainer.contains(target)) return;
    if (target && target.id === "backgroundTip") {
      const t = document.getElementById("time");
      if (t) t.click();
    }
  });

  getStoredGreeting();

  // Add blur event listener to save when user finishes editing
  const helloText = document.getElementById("helloText");
  if (helloText) {
    // Ensure editable on click and focus/select text
    helloText.addEventListener("click", function () {
      this.setAttribute("contenteditable", "true");
      this.style.pointerEvents = "auto";
      this.focus();
      // Select all contents
      const range = document.createRange();
      range.selectNodeContents(this);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    });

    helloText.addEventListener("blur", function () {
      saveGreeting();
    });

    // Update the keypress event handler
    helloText.addEventListener("keypress", function (e) {
      if ((e.key === "Enter" || e.keyCode === 13) && e.shiftKey) {
        e.preventDefault();
        this.blur();
      }
    });

    // Add a new keydown handler for Escape key
    helloText.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.keyCode === 27) {
        e.preventDefault();
        this.blur();
      }
    });
  }

  getStoredNotes();

  // Add event listeners for the notes
  const notes = document.getElementById("notes");
  if (notes) {
    notes.addEventListener("blur", function () {
      saveNotes();
    });
    notes.addEventListener("keypress", function (e) {
      if ((e.key === "Enter" || e.keyCode === 13) && e.shiftKey) {
        e.preventDefault();
        this.blur();
      }
    });
    notes.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.keyCode === 27) {
        e.preventDefault();
        this.blur();
      }
    });
  }

  getStoredBottomNotes();

  // Add event listeners for the bottom notes
  const bottomNotes = document.getElementById("bottomNotes");
  if (bottomNotes) {
    bottomNotes.addEventListener("blur", function () {
      saveBottomNotes();
    });
    bottomNotes.addEventListener("keypress", function (e) {
      if ((e.key === "Enter" || e.keyCode === 13) && e.shiftKey) {
        e.preventDefault();
        this.blur();
      }
    });
    bottomNotes.addEventListener("keydown", function (e) {
      if (e.key === "Escape" || e.keyCode === 27) {
        e.preventDefault();
        this.blur();
      }
    });
  }

  // Add toggle button event listeners
  const toggleTopNotes = document.getElementById("toggleTopNotes");
  if (toggleTopNotes) {
    toggleTopNotes.addEventListener("click", function () {
      toggleNotesVisibility("topNotesVisible", "#notes");
    });
  }

  const toggleBottomNotes = document.getElementById("toggleBottomNotes");
  if (toggleBottomNotes) {
    toggleBottomNotes.addEventListener("click", function () {
      toggleNotesVisibility("bottomNotesVisible", "#bottomNotes");
    });
  }

  // Get stored visibility states
  chrome.storage.sync.get(
    {
      topNotesVisible: true,
      bottomNotesVisible: true,
    },
    function (items) {
      if (!items.topNotesVisible) {
        const el = document.getElementById("notes");
        if (el) el.style.display = "none";
      }
      if (!items.bottomNotesVisible) {
        const el = document.getElementById("bottomNotes");
        if (el) el.style.display = "none";
      }
    }
  );

  // Initialize the TODO feature
  initTodos();

  // Check storage usage on startup
  checkStorageUsage();

  // Add event listener for adding new TODOs
  const addTodoBtn = document.getElementById("addTodoBtn");
  if (addTodoBtn) addTodoBtn.addEventListener("click", createNewTodo);

  // Add event listener for the top-left Add Todo button
  const addTodoBtnTopLeft = document.getElementById("addTodoBtnTopLeft");
  if (addTodoBtnTopLeft) addTodoBtnTopLeft.addEventListener("click", createNewTodo);

  // Add event listener for toggling between active and deleted TODOs
  const toggleTodoViewBtn = document.getElementById("toggleTodoViewBtn");
  if (toggleTodoViewBtn)
    toggleTodoViewBtn.addEventListener("click", toggleTodoView);

  // Add event listener for settings back button
  const settingsBackBtn = document.getElementById("settingsBackBtn");
  if (settingsBackBtn)
    settingsBackBtn.addEventListener("click", toggleTodoView);

  // Add event listener for toggling TODO section visibility
  const toggleTodosVisibilityBtn = document.getElementById(
    "toggleTodosVisibilityBtn"
  );
  if (toggleTodosVisibilityBtn)
    toggleTodosVisibilityBtn.addEventListener("click", toggleTodosVisibility);

  // Add event listener for permanent delete all
  const permanentDeleteAllBtn = document.getElementById(
    "permanentDeleteAllBtn"
  );
  if (permanentDeleteAllBtn)
    permanentDeleteAllBtn.addEventListener("click", confirmPermanentDeleteAll);

  // Add event listener for exporting as JSON
  const exportJsonBtn = document.getElementById("exportJsonBtn");
  if (exportJsonBtn) exportJsonBtn.addEventListener("click", exportAsJson);

  // Add event listener for importing from JSON
  const importJsonBtn = document.getElementById("importJsonBtn");
  if (importJsonBtn) importJsonBtn.addEventListener("click", importFromJson);

  // Add event listener for migrating TODOs from sync to local storage
  const migrateTodosBtn = document.getElementById("migrateTodosBtn");
  if (migrateTodosBtn)
    migrateTodosBtn.addEventListener("click", migrateTodosToLocal);

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

  // Modify the backgroundTip content when DOM is ready
  // Update backgroundTip content
  const backgroundTip = document.getElementById("backgroundTip");
  if (backgroundTip) {
    backgroundTip.innerHTML = `
      <p style="margin: 0">
        <b>Background Controls:</b>
        <br />
        <span style="font-size: 11px">
          Click on time: <b>Left</b> = next image, <b>Middle</b> = toggle default background, <b>Right</b> = previous image
        </span>
        <br />
        <span style="font-size: 11px; margin-top: 5px; display: block">
          Upload images in Chrome Extensions > ChromeTabPlus > Options
        </span>
      </p>
    `;
  }

  // Initialize background image data display
  initBackgroundImagesData();

  // Toggle background images data visibility
  const toggleBgImagesData = document.getElementById("toggleBgImagesData");
  if (toggleBgImagesData) {
    toggleBgImagesData.addEventListener("click", function () {
      toggleBgImagesDataVisibility();
    });
  }

  // Add event listener for showing raw storage data
  const showRawStorageDataBtn = document.getElementById("showRawStorageData");
  if (showRawStorageDataBtn)
    showRawStorageDataBtn.addEventListener("click", showRawStorageData);

  // Add event listener for checking storage usage
  const checkStorageUsageBtn = document.getElementById("checkStorageUsage");
  if (checkStorageUsageBtn)
    checkStorageUsageBtn.addEventListener("click", checkStorageUsage);

  // Add event listeners for text size controls
  const increaseClockSize = document.getElementById("increaseClockSize");
  if (increaseClockSize)
    increaseClockSize.addEventListener("click", function () {
      adjustTextSize("clock", 8);
    });
  const decreaseClockSize = document.getElementById("decreaseClockSize");
  if (decreaseClockSize)
    decreaseClockSize.addEventListener("click", function () {
      adjustTextSize("clock", -8);
    });
  const resetClockSize = document.getElementById("resetClockSize");
  if (resetClockSize)
    resetClockSize.addEventListener("click", function () {
      resetTextSize("clock");
    });
  const increaseGreetingSize = document.getElementById("increaseGreetingSize");
  if (increaseGreetingSize)
    increaseGreetingSize.addEventListener("click", function () {
      adjustTextSize("greeting", 6);
    });
  const decreaseGreetingSize = document.getElementById("decreaseGreetingSize");
  if (decreaseGreetingSize)
    decreaseGreetingSize.addEventListener("click", function () {
      adjustTextSize("greeting", -6);
    });
  const resetGreetingSize = document.getElementById("resetGreetingSize");
  if (resetGreetingSize)
    resetGreetingSize.addEventListener("click", function () {
      resetTextSize("greeting");
    });

  // Initialize text sizes from storage
  initTextSizes();

  // Initialize Zen mode (force off by default to avoid hiding timer)
  applyZenMode(false);
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.sync.set({ zenModeEnabled: false });
  }

  const toggleZenBtn = document.getElementById("toggleZenBtn");
  if (toggleZenBtn)
    toggleZenBtn.addEventListener("click", function () {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.sync.get({ zenModeEnabled: false }, function (items) {
          const next = !items.zenModeEnabled;
          applyZenMode(next);
          chrome.storage.sync.set({ zenModeEnabled: next });
        });
      } else {
        // Fallback if chrome.storage isn't available
        const isZen = document.body.classList.contains("zen-mode");
        applyZenMode(!isZen);
      }
    });

  // Initialize countdown timer
  initCountdownTimer();

  // Migrate todos to include status and create board controls
  migrateTodoStatusesIfNeeded(function () {
    createBoardToggleAndContainer();
    initShortcutsAndHelp();
    initDailyQuestionsUI();
    initGoalsUI();
    initDatesToggle();
  });
});

// Apply Zen mode (hide everything except time and greeting)
function applyZenMode(enabled) {
  const body = document.getElementById("bodyid") || document.body;
  if (enabled) {
    body.classList.add("zen-mode");
    const btn = document.getElementById("toggleZenBtn");
    if (btn) btn.textContent = "Exit Zen";
  } else {
    body.classList.remove("zen-mode");
    const btn = document.getElementById("toggleZenBtn");
    if (btn) btn.textContent = "Zen";
  }
}

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
  loadBackgroundImage();
}

// Load background image from the stored images
function loadBackgroundImage() {
  chrome.storage.local.get(
    {
      backgroundImages: [],
      photoArrayCountCurrent: 0,
    },
    function (items) {
      if (items.backgroundImages && items.backgroundImages.length > 0) {
        // Get current index
        let currentIndex = items.photoArrayCountCurrent;

        // Calculate next index
        currentIndex = (currentIndex + 1) % items.backgroundImages.length;

        // Set the background image
        $("#bodyid").css(
          "background-image",
          `url(${items.backgroundImages[currentIndex].data})`
        );
        $("#bodyid").css("background-color", ""); // Clear any background color

        // Save the new current index
        chrome.storage.local.set(
          {
            photoArrayCountCurrent: currentIndex,
            useDefaultBackground: false, // Explicitly set we're not using default background
            photoSourceType: "encoded", // Mark that we're using encoded images
          },
          function () {
            // Refresh background images data display after changing
            loadBackgroundImagesData();
          }
        );
      } else {
        // Fallback to default background if no images are stored
        $("#bodyid").css("background-image", "none");
        $("#bodyid").css("background-color", "#2c3e50");
      }
    }
  );
}

// Load initial background image on page load
function loadInitialBackgroundImage() {
  chrome.storage.local.get(
    {
      backgroundImages: [],
      photoArrayCountCurrent: 0,
      useDefaultBackground: false,
      photoSourceType: null,
    },
    function (items) {
      console.log("Initial background load:", items);

      if (items.useDefaultBackground) {
        // Set the default dark background
        $("#bodyid").css("background-image", "none");
        $("#bodyid").css("background-color", "#2c3e50");

        // Make sure source type is clear
        if (items.photoSourceType !== null) {
          chrome.storage.local.set({ photoSourceType: null });
        }
      } else if (items.backgroundImages && items.backgroundImages.length > 0) {
        // Set the background image to the current index
        const currentIndex = items.photoArrayCountCurrent;
        console.log(
          "Setting background image:",
          items.backgroundImages[currentIndex]
        );

        $("#bodyid").css(
          "background-image",
          `url(${items.backgroundImages[currentIndex].data})`
        );

        // Ensure photoSourceType is set for encoded images
        if (items.photoSourceType !== "encoded") {
          chrome.storage.local.set({ photoSourceType: "encoded" });
        }
      } else {
        // Fallback to default background if no images are stored
        console.log("No background images found, using default");
        $("#bodyid").css("background-image", "none");
        $("#bodyid").css("background-color", "#2c3e50");

        // Make sure source type is clear
        if (items.photoSourceType !== null) {
          chrome.storage.local.set({ photoSourceType: null });
        }
      }

      // Update background images data
      loadBackgroundImagesData();
    }
  );
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
        photoArrayCountCurrent: count,
      },
      function () {
        //
      }
    );

    // $("#bodyid").attr("background","/wallpaper/" + count + ".jpg");
    $("#bodyid").attr(
      "background",
      "file:///Users/dhudman/Pictures/backgrounds/derick-daily-xw69fz33sKg-unsplash.jpg"
    );
    success = true;

    chrome.storage.sync.get(
      {
        photoPath:
          "file:///Users/dhudman/Pictures/backgrounds/derick-daily-xw69fz33sKg-unsplash.jpg",
      },
      function (items) {
        $("#bodyid").attr("background", items.photoPath); // restore the image that was on last
      }
    );
  }
  // https://source.unsplash.com/random/2000x1000
}

function nextImageInChromeStoragePhotoArray() {
  chrome.storage.local.get(
    {
      photoSourceType: null,
      bundledBgIndex: 0,
      backgroundImages: [],
      useDefaultBackground: false,
    },
    function (preferences) {
      // If user has custom images, use those
      if (preferences.backgroundImages && preferences.backgroundImages.length > 0) {
        loadBackgroundImage();
        return;
      }

      // Use bundled backgrounds - advance from current index
      let currentIndex = parseInt(preferences.bundledBgIndex, 10);
      if (isNaN(currentIndex) || currentIndex < 0) currentIndex = 0;
      const nextIndex = (currentIndex + 1) % bundledBackgrounds.length;
      loadBundledBackground(nextIndex);
    }
  );
}

function previousImageInChromeStoragePhotoArray() {
  chrome.storage.local.get(
    {
      photoSourceType: null,
      bundledBgIndex: 0,
      backgroundImages: [],
      useDefaultBackground: false,
    },
    function (preferences) {
      // If user has custom images, use those
      if (preferences.backgroundImages && preferences.backgroundImages.length > 0) {
        previousEncodedImage();
        return;
      }

      // Use bundled backgrounds - go back from current index
      let currentIndex = parseInt(preferences.bundledBgIndex, 10);
      if (isNaN(currentIndex) || currentIndex < 0) currentIndex = 0;
      const prevIndex = (currentIndex - 1 + bundledBackgrounds.length) % bundledBackgrounds.length;
      loadBundledBackground(prevIndex);
    }
  );
}

// Navigate to next image when using filesystem paths
function nextFilesystemImage() {
  chrome.storage.sync.get(
    {
      photoPath: null,
      photoArray: null,
      photoArrayCountCurrent: 0,
      photoArrayCountTotal: 0,
    },
    function (syncItems) {
      if (syncItems.photoPath && syncItems.photoArray) {
        // Using old format, go to next image
        let currentIndex = syncItems.photoArrayCountCurrent || 0;
        const photos = Array.isArray(syncItems.photoArray)
          ? syncItems.photoArray
          : [syncItems.photoArray];

        // Calculate next index
        currentIndex = (currentIndex + 1) % photos.length;

        // Save the new index
        chrome.storage.sync.set(
          {
            photoArrayCountCurrent: currentIndex,
          },
          function () {
            // Update the background with the new image
            useExplicitFilePaths({
              ...syncItems,
              photoArrayCountCurrent: currentIndex,
            });
          }
        );
      }
    }
  );
}

// Navigate to previous image when using filesystem paths
function previousFilesystemImage() {
  chrome.storage.sync.get(
    {
      photoPath: null,
      photoArray: null,
      photoArrayCountCurrent: 0,
    },
    function (syncItems) {
      if (syncItems.photoPath && syncItems.photoArray) {
        // Using old format, go to previous image
        let currentIndex = syncItems.photoArrayCountCurrent || 0;
        const photos = Array.isArray(syncItems.photoArray)
          ? syncItems.photoArray
          : [syncItems.photoArray];

        // Calculate previous index
        currentIndex = (currentIndex - 1 + photos.length) % photos.length;

        // Save the new index
        chrome.storage.sync.set(
          {
            photoArrayCountCurrent: currentIndex,
          },
          function () {
            // Update the background with the new image
            useExplicitFilePaths({
              ...syncItems,
              photoArrayCountCurrent: currentIndex,
            });
          }
        );
      }
    }
  );
}

// Navigate to previous encoded image
function previousEncodedImage() {
  chrome.storage.local.get(
    {
      backgroundImages: [],
      photoArrayCountCurrent: 0,
      useDefaultBackground: false,
    },
    function (items) {
      // If using default background or no images, don't do anything
      if (
        items.useDefaultBackground ||
        !items.backgroundImages ||
        items.backgroundImages.length === 0
      ) {
        return;
      }

      // Get current index
      let currentIndex = items.photoArrayCountCurrent;

      // Calculate previous index
      currentIndex =
        (currentIndex - 1 + items.backgroundImages.length) %
        items.backgroundImages.length;

      // Set the background image
      $("#bodyid").css(
        "background-image",
        `url(${items.backgroundImages[currentIndex].data})`
      );
      $("#bodyid").css("background-color", ""); // Clear any background color

      // Save the new current index
      chrome.storage.local.set(
        {
          photoArrayCountCurrent: currentIndex,
          useDefaultBackground: false, // Explicitly set we're not using default background
          photoSourceType: "encoded", // Mark that we're using encoded images
        },
        function () {
          // Refresh background images data display after changing
          loadBackgroundImagesData();
        }
      );
    }
  );
}

function getStoredData() {
  chrome.storage.sync.get(
    {
      //   "derick-daily-xw69fz33sKg-unsplash.jpg",
      // "derick-daily-q4FECjMUJcQ-unsplash.jpg",
      // "derick-daily-XZ9MYpc6m1c-unsplash.jpg",
      // "derick-daily-jjels-xl_Cs-unsplash.jpg",
      // "derick-daily-F2KiEijf6-8-unsplash.jpg"
      photoPath: "file:////Users/dhudman/Pictures/backgrounds",
      photoArrayCountTotal: 0,
      photoArrayCountCurrent: 0,
      photoArray: "derick-daily-xw69fz33sKg-unsplash.jpg",
    },
    function (items) {
      const bodyEl = document.getElementById("bodyid");
      if (bodyEl) {
        bodyEl.setAttribute(
          "background",
          items.photoPath +
            "\\" +
            items.photoArray[items.photoArrayCountCurrent]
        );
      }
    }
  );
}

function countImagesInFolder() {
  console.warn(
    "countImagesInFolder is not supported without jQuery and local file listing. Skipping."
  );
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
    if (request.readyState !== 4) return;
    if (request.status !== 200) {
      console.error(`getWeatherData: HTTP ${request.status}`);
      return;
    }
    try {
      var obj = JSON.parse(request.responseText);
      const place = obj && obj.places && obj.places[0];
      if (!place) throw new Error("no places found for zip");
      var latitude = parseFloat(place.latitude);
      var longitude = parseFloat(place.longitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude))
        throw new Error("invalid lat/lon");
      fetchOpenMeteoWeather(latitude, longitude);
    } catch (e) {
      console.error("getWeatherData: failed to parse geocode response", e);
    }
  };

  request.open(
    "GET",
    "https://api.zippopotam.us/us/" + encodeURIComponent(zip),
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
  // Weather JSON widget disabled - data shown in popup instead
  // To re-enable, uncomment the code below
  return;

  /*
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
  */
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
  // getStoredData(); // Replace with our new function
  // Load backgrounds list first, then load the background image
  loadBundledBackgroundsList()
    .then(() => checkAndLoadBackgroundImage())
    .catch(() => {
      console.error("Failed to load backgrounds list, trying to load background anyway");
      checkAndLoadBackgroundImage();
    });
  displayWeatherData();
  var myVar = setInterval(displayTime, 1000);
  // Refresh weather every 30 minutes
  // setInterval(displayWeatherData, 1800000);
  // nextImage();

  // Removing the automatic background rotation
  // setInterval(loadBackgroundImage, 300000);

  // Background navigation buttons
  const prevBtn = document.getElementById("prevBgBtn");
  const nextBtn = document.getElementById("nextBgBtn");

  if (prevBtn) {
    prevBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      previousImageInChromeStoragePhotoArray();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      nextImageInChromeStoragePhotoArray();
    });
  }

  // Hamburger menu toggle
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const hamburgerMenu = document.getElementById("hamburgerMenu");
  if (hamburgerBtn && hamburgerMenu) {
    hamburgerBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      const isVisible = hamburgerMenu.style.display === "flex";
      hamburgerMenu.style.display = isVisible ? "none" : "flex";
    });

    // Close hamburger menu when clicking outside
    document.addEventListener("click", function (e) {
      if (!hamburgerBtn.contains(e.target) && !hamburgerMenu.contains(e.target)) {
        hamburgerMenu.style.display = "none";
      }
    });
  }

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

      const el = document.querySelector(elementSelector);
      const toggleBtn = document.getElementById(
        elementSelector === "#notes" ? "toggleTopNotes" : "toggleBottomNotes"
      );
      if (newVisibility) {
        if (el) el.style.display = "block";
        if (toggleBtn) toggleBtn.textContent = "Hide Notes";
      } else {
        if (el) el.style.display = "none";
        if (toggleBtn) toggleBtn.textContent = "Show Notes";
      }

      chrome.storage.sync.set({
        [storageKey]: newVisibility,
      });
    }
  );
}

// Global state for todo view mode
// 0 = active, 1 = deleted
let viewMode = 0;
let todosVisible = true;
let currentProjectId = "all"; // Default to showing all projects
// Track the last created todo to control focus behavior after render
let lastCreatedTodoId = null;

// Board statuses
const BOARD_STATUSES = ["backlog", "on_deck", "in_progress", "done"];
const isBoardView = true; // Always use board view
let boardRenderVersion = 0; // prevent overlapping renders from duplicating UI
let showDates = true;
const TSHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

// Migrate existing todos to include new fields if missing (status, dueDate, lastEdited, lastStatusChange)
function migrateTodoStatusesIfNeeded(callback) {
  chrome.storage.local.get(
    {
      todos: [],
    },
    function (items) {
      const todos = items.todos || [];
      let updated = false;
      const migrated = todos.map((t) => {
        let next = { ...t };
        if (!next.status) {
          updated = true;
          next.status = "backlog";
        }
        if (!next.dueDate) {
          updated = true;
          next.dueDate = Date.now() + 7 * 24 * 60 * 60 * 1000;
        }
        if (!next.lastEdited) {
          updated = true;
          next.lastEdited = Date.now();
        }
        if (!next.lastStatusChange) {
          updated = true;
          next.lastStatusChange = Date.parse("2025-11-05") || Date.now();
        }
        if (!next.size) {
          updated = true;
          next.size = "M";
        }
        return next;
      });
      if (updated) {
        chrome.storage.local.set({ todos: migrated }, function () {
          if (callback) callback();
        });
      } else {
        if (callback) callback();
      }
    }
  );
}

// Create board container and initialize
function createBoardToggleAndContainer() {
  // Create board container
  createBoardWrapperIfNeeded();

  // Set board position based on timer visibility
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.sync.get({ timerVisible: true }, function (items) {
      const boardWrapper = document.getElementById("boardWrapper");
      if (boardWrapper) {
        boardWrapper.style.top = items.timerVisible ? "190px" : "110px";
      }
    });
  }

  // Initialize board view (always board, no list view)
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.local.get({ isBoardMinimized: false }, function (it) {
      isBoardMinimized = !!it.isBoardMinimized;
      applyTodoViewMode();
      // Apply minimized state after board is rendered
      if (isBoardMinimized) {
        setTimeout(function() {
          toggleBoardMinimize(true);
        }, 100);
      }
    });
  } else {
    applyTodoViewMode();
  }

  // Add Help button
  const helpBtn = document.createElement("button");
  helpBtn.id = "showHelpBtn";
  helpBtn.textContent = "Help";
  helpBtn.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  helpBtn.style.color = "white";
  helpBtn.style.border = "none";
  helpBtn.style.padding = "8px 10px";
  helpBtn.style.borderRadius = "5px";
  helpBtn.style.cursor = "pointer";
  helpBtn.style.fontSize = "14px";
  helpBtn.style.marginRight = "5px";
  helpBtn.addEventListener("click", function () {
    toggleHelpOverlay(true);
  });
  const controls2 = document.getElementById("todoControlsTop");
  if (controls2)
    controls2.insertBefore(
      helpBtn,
      document.getElementById("toggleTodosVisibilityBtn")
    );
}

function initShortcutsAndHelp() {
  document.addEventListener("keydown", function (e) {
    const t = e.target;
    const isTyping =
      t &&
      (t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.isContentEditable);
    if (isTyping) return;
    const key = e.key.toLowerCase();
    if (key === "d") {
      createNewTodo();
    } else if (key === "h" || key === "?") {
      toggleHelpOverlay(true);
    }
  });
}

function toggleHelpOverlay(show) {
  let overlay = document.getElementById("helpOverlay");
  if (show) {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.id = "helpOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.right = "0";
    overlay.style.bottom = "0";
    overlay.style.background = "rgba(0,0,0,0.7)";
    overlay.style.zIndex = "2200";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    const panel = document.createElement("div");
    panel.style.background = "#fff";
    panel.style.color = "#333";
    panel.style.borderRadius = "8px";
    panel.style.boxShadow = "0 10px 24px rgba(0,0,0,0.3)";
    panel.style.width = "min(680px, 90vw)";
    panel.style.padding = "16px";

    const title = document.createElement("div");
    title.textContent = "Keyboard Shortcuts";
    title.style.fontWeight = "bold";
    title.style.fontSize = "16px";
    title.style.marginBottom = "8px";
    panel.appendChild(title);

    const list = document.createElement("div");
    list.style.fontSize = "14px";
    list.innerHTML =
      "<div><b>D</b> = New todo</div>" +
      "<div><b>H</b>/<b>?</b> = Toggle this help</div>" +
      "<div><b>Esc</b> = Close dialogs</div>";
    panel.appendChild(list);

    const closeRow = document.createElement("div");
    closeRow.style.display = "flex";
    closeRow.style.justifyContent = "flex-end";
    closeRow.style.marginTop = "12px";
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.padding = "8px 12px";
    closeBtn.style.border = "none";
    closeBtn.style.borderRadius = "4px";
    closeBtn.style.cursor = "pointer";
    closeBtn.addEventListener("click", function () {
      toggleHelpOverlay(false);
    });
    closeRow.appendChild(closeBtn);
    panel.appendChild(closeRow);

    overlay.appendChild(panel);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) toggleHelpOverlay(false);
    });
    document.addEventListener(
      "keydown",
      function onEsc(e) {
        if (e.key === "Escape") {
          toggleHelpOverlay(false);
          document.removeEventListener("keydown", onEsc);
        }
      },
      { once: true }
    );
    document.body.appendChild(overlay);
  } else {
    if (overlay) overlay.remove();
  }
}

// Create board wrapper if it doesn't exist yet (for early access before migration completes)
function createBoardWrapperIfNeeded() {
  if (document.getElementById("boardWrapper")) return;

  // Create outer wrapper for the board with window controls
  const boardWrapper = document.createElement("div");
  boardWrapper.id = "boardWrapper";
  boardWrapper.style.display = "none";
  boardWrapper.style.position = "absolute";
  boardWrapper.style.top = "110px";
  boardWrapper.style.left = "0";
  boardWrapper.style.right = "0";
  boardWrapper.style.bottom = "80px";
  boardWrapper.style.zIndex = "70";
  boardWrapper.style.overflow = "hidden";
  boardWrapper.style.pointerEvents = "auto";

  // Create header bar with window controls
  const boardHeader = document.createElement("div");
  boardHeader.style.display = "flex";
  boardHeader.style.alignItems = "center";
  boardHeader.style.justifyContent = "center";
  boardHeader.style.padding = "8px 10px";
  boardHeader.style.background = "rgba(0,0,0,0.4)";
  boardHeader.style.borderRadius = "6px";
  boardHeader.style.gap = "6px";
  boardHeader.style.maxWidth = "200px";
  boardHeader.style.margin = "0 auto";

  // Minimize button (yellow with -)
  const minimizeBtn = document.createElement("button");
  minimizeBtn.id = "boardMinimizeBtn";
  minimizeBtn.textContent = "-";
  minimizeBtn.style.width = "18px";
  minimizeBtn.style.height = "18px";
  minimizeBtn.style.borderRadius = "50%";
  minimizeBtn.style.background = "#f5c542";
  minimizeBtn.style.border = "none";
  minimizeBtn.style.cursor = "pointer";
  minimizeBtn.style.padding = "0";
  minimizeBtn.style.fontSize = "14px";
  minimizeBtn.style.fontWeight = "bold";
  minimizeBtn.style.lineHeight = "1";
  minimizeBtn.style.color = "#000";
  minimizeBtn.title = "Minimize";
  minimizeBtn.addEventListener("click", function () {
    toggleBoardMinimize(true);
  });
  boardHeader.appendChild(minimizeBtn);

  // Title
  const boardTitle = document.createElement("span");
  boardTitle.textContent = "Kanban Board";
  boardTitle.style.color = "#fff";
  boardTitle.style.fontSize = "12px";
  boardHeader.appendChild(boardTitle);

  // Maximize button (green with +)
  const maximizeBtn = document.createElement("button");
  maximizeBtn.id = "boardMaximizeBtn";
  maximizeBtn.textContent = "+";
  maximizeBtn.style.width = "18px";
  maximizeBtn.style.height = "18px";
  maximizeBtn.style.borderRadius = "50%";
  maximizeBtn.style.background = "#34c759";
  maximizeBtn.style.border = "none";
  maximizeBtn.style.cursor = "pointer";
  maximizeBtn.style.padding = "0";
  maximizeBtn.style.fontSize = "14px";
  maximizeBtn.style.fontWeight = "bold";
  maximizeBtn.style.lineHeight = "1";
  maximizeBtn.style.color = "#000";
  maximizeBtn.title = "Maximize";
  maximizeBtn.addEventListener("click", function () {
    toggleBoardMinimize(false);
  });
  boardHeader.appendChild(maximizeBtn);

  boardWrapper.appendChild(boardHeader);

  // Create the actual board content container
  const board = document.createElement("div");
  board.id = "boardContainer";
  board.style.padding = "6px";
  board.style.overflow = "auto";
  board.style.height = "calc(100% - 40px)";
  boardWrapper.appendChild(board);

  // Add click-through functionality for empty board space
  boardWrapper.addEventListener("click", function(e) {
    if (e.target === boardWrapper || e.target === board) {
      boardWrapper.style.pointerEvents = "none";
      const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
      boardWrapper.style.pointerEvents = "auto";
      if (elemBelow) {
        const clickableIds = ["time", "helloText", "notes", "bottomNotes", "toggleBottomNotes", "toggleTopNotes", "bodyid"];
        const isClickable = clickableIds.includes(elemBelow.id) ||
                            elemBelow.closest("#greetingText") ||
                            elemBelow.closest("#bottomNotesText") ||
                            elemBelow.closest("#notesText");
        if (isClickable) {
          elemBelow.click();
          if (elemBelow.getAttribute("contenteditable") === "true") {
            elemBelow.focus();
          }
        }
      }
    }
  });

  const host = document.getElementById("bodyid") || document.body;
  host.appendChild(boardWrapper);
}

function applyTodoViewMode() {
  const active = document.getElementById("activeTodosContainer");
  const deleted = document.getElementById("deletedTodosContainer");
  const projectControls = document.getElementById("projectControls");
  const addBtn = document.getElementById("addTodoBtn");
  let boardWrapper = document.getElementById("boardWrapper");

  // Create board wrapper if it doesn't exist
  if (!boardWrapper) {
    createBoardWrapperIfNeeded();
    boardWrapper = document.getElementById("boardWrapper");
  }

  // Always show board view
  if (active) active.style.display = "none";
  if (deleted) deleted.style.display = "none";
  if (addBtn) addBtn.style.display = "inline-block";
  if (projectControls)
    projectControls.style.display = viewMode === 0 ? "block" : "none";
  if (boardWrapper) {
    boardWrapper.style.display = "block";
    renderBoard();
  }
}

// Toggle kanban board minimize/maximize state
var isBoardMinimized = false;

function toggleBoardMinimize(minimize) {
  const boardWrapper = document.getElementById("boardWrapper");
  const boardContainer = document.getElementById("boardContainer");
  if (!boardWrapper) return;

  isBoardMinimized = minimize;

  if (minimize) {
    // Minimize: collapse to just the header bar
    boardWrapper.style.bottom = "auto";
    boardWrapper.style.height = "40px";
    boardWrapper.style.overflow = "hidden";
    if (boardContainer) boardContainer.style.display = "none";
  } else {
    // Maximize: restore full size
    boardWrapper.style.bottom = "80px";
    boardWrapper.style.height = "auto";
    boardWrapper.style.overflow = "hidden";
    if (boardContainer) boardContainer.style.display = "block";
  }

  // Save preference
  chrome.storage.local.set({ isBoardMinimized: minimize });
}

function renderBoard() {
  const board = document.getElementById("boardContainer");
  if (!board) return;
  board.innerHTML = "";
  const renderToken = ++boardRenderVersion;

  // Load hidden status preferences and then build columns + cards
  chrome.storage.local.get(
    {
      boardHiddenStatuses: {},
      todos: [],
    },
    function (items) {
      // Abort outdated renders
      if (renderToken !== boardRenderVersion) return;
      const hidden = items.boardHiddenStatuses || {};

      const columnsWrap = document.createElement("div");
      columnsWrap.style.display = "flex";
      columnsWrap.style.gap = "8px";
      columnsWrap.style.width = "100%";

      BOARD_STATUSES.forEach((status) => {
        const col = document.createElement("div");
        col.className = "board-column";
        col.style.flex = "1 1 0";
        col.style.background = "rgba(0,0,0,0.25)";
        col.style.border = "1px solid rgba(255,255,255,0.15)";
        col.style.borderRadius = "6px";
        col.style.padding = "6px";
        col.style.minWidth = "260px";

        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.alignItems = "center";
        header.style.justifyContent = "space-between";
        header.style.marginBottom = "6px";

        // Left side: title + add button
        const leftSide = document.createElement("div");
        leftSide.style.display = "flex";
        leftSide.style.alignItems = "center";
        leftSide.style.gap = "6px";

        const title = document.createElement("div");
        title.textContent = status.replace(/_/g, " ");
        title.style.fontWeight = "bold";
        title.style.color = "#fff";
        leftSide.appendChild(title);

        // Add "+" button for this column
        const addBtn = document.createElement("button");
        addBtn.textContent = "+";
        addBtn.style.background = "rgba(0,0,0,0.6)";
        addBtn.style.color = "#fff";
        addBtn.style.border = "none";
        addBtn.style.padding = "2px 8px";
        addBtn.style.borderRadius = "4px";
        addBtn.style.fontSize = "14px";
        addBtn.style.cursor = "pointer";
        addBtn.style.fontWeight = "bold";
        addBtn.title = `Add todo to ${status.replace(/_/g, " ")}`;
        addBtn.addEventListener("click", function () {
          createNewTodoWithStatus(status);
        });
        leftSide.appendChild(addBtn);

        header.appendChild(leftSide);

        const toggleBtn = document.createElement("button");
        toggleBtn.textContent = hidden[status] ? "Show" : "Hide";
        toggleBtn.style.background = "rgba(0,0,0,0.6)";
        toggleBtn.style.color = "#fff";
        toggleBtn.style.border = "none";
        toggleBtn.style.padding = "4px 8px";
        toggleBtn.style.borderRadius = "4px";
        toggleBtn.style.fontSize = "12px";
        toggleBtn.style.cursor = "pointer";
        header.appendChild(toggleBtn);

        col.appendChild(header);

        const body = document.createElement("div");
        body.className = "board-col-body";
        body.style.display = hidden[status] ? "none" : "flex";
        body.style.flexDirection = "column";
        body.style.gap = "6px";
        body.style.minHeight = "60px";
        body.style.paddingBottom = "6px";
        body.style.borderTop = "1px dashed rgba(255,255,255,0.15)";
        body.dataset.status = status;

        // Allow dropping on both the body and the whole column area
        function handleDragOver(e) {
          e.preventDefault();
          try {
            e.dataTransfer.dropEffect = "move";
          } catch (_) {}
        }
        function handleDrop(e) {
          e.preventDefault();
          e.stopPropagation();
          const todoId =
            (e.dataTransfer && e.dataTransfer.getData("text/plain")) || "";
          const targetStatus = this.dataset.status || status;
          if (todoId && targetStatus) changeTodoStatus(todoId, targetStatus);
        }
        body.addEventListener("dragover", handleDragOver);
        body.addEventListener("drop", handleDrop);
        col.dataset.status = status;
        col.addEventListener("dragover", handleDragOver);
        col.addEventListener("drop", handleDrop);

        // Toggle visibility
        toggleBtn.addEventListener("click", function () {
          const nextHidden = { ...hidden, [status]: !hidden[status] };
          chrome.storage.local.set(
            { boardHiddenStatuses: nextHidden },
            function () {
              renderBoard();
            }
          );
        });

        col.appendChild(body);
        columnsWrap.appendChild(col);
      });

      // Ensure this render is still the latest before appending
      if (renderToken !== boardRenderVersion) return;
      board.appendChild(columnsWrap);

      // Populate cards
      const todos = items.todos || [];
      const filtered = todos.filter((t) => {
        if (currentProjectId === "all") return true;
        if (currentProjectId === "none") return !t.projectId;
        return t.projectId === currentProjectId;
      });
      // Only populate if still latest render
      if (renderToken !== boardRenderVersion) return;
      filtered.forEach((t) => addCardToBoard(t));
    }
  );
}

function addCardToBoard(todo) {
  const colBody = document.querySelector(
    `.board-col-body[data-status="${todo.status || "backlog"}"]`
  );
  if (!colBody) return;
  const card = document.createElement("div");
  card.className = "board-card";
  card.style.background = "#fef9b0";
  card.style.color = "#333";
  card.style.padding = "8px";
  card.style.borderRadius = "5px";
  card.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  card.style.cursor = "grab";
  card.draggable = true;

  const headerRow = document.createElement("div");
  headerRow.style.display = "flex";
  headerRow.style.alignItems = "center";
  headerRow.style.justifyContent = "space-between";

  const title = document.createElement("div");
  title.textContent = todo.title || "Untitled";
  title.style.fontWeight = "bold";
  title.style.flex = "1";
  headerRow.appendChild(title);

  const sizeBadge = document.createElement("span");
  sizeBadge.textContent = (todo.size || "M").toUpperCase();
  sizeBadge.style.background = "rgba(0,0,0,0.15)";
  sizeBadge.style.color = "#333";
  sizeBadge.style.border = "1px solid rgba(0,0,0,0.2)";
  sizeBadge.style.borderRadius = "10px";
  sizeBadge.style.padding = "2px 6px";
  sizeBadge.style.fontSize = "11px";
  sizeBadge.style.marginLeft = "8px";
  headerRow.appendChild(sizeBadge);

  card.appendChild(headerRow);

  if (showDates) {
    // Due indicator
    const due = document.createElement("div");
    due.style.fontSize = "11px";
    due.style.marginTop = "2px";
    due.style.color = "#555";
    const days = daysUntil(todo.dueDate);
    if (days === 0) due.textContent = "due today";
    else if (days > 0)
      due.textContent = `due in ${days} day${days === 1 ? "" : "s"}`;
    else
      due.textContent = `${Math.abs(days)} day${
        Math.abs(days) === 1 ? "" : "s"
      } overdue`;
    card.appendChild(due);

    // Days in current status dots (Jira-like):
    // days 1-4 => show that many outlined dots; days 5-8 => 1-4 filled dots; never more than 4
    const daysInStatus = Math.max(
      0,
      Math.round(
        (Date.now() - (todo.lastStatusChange || Date.now())) /
          (24 * 60 * 60 * 1000)
      )
    );
    const dotsWrap = document.createElement("div");
    dotsWrap.style.display = "flex";
    dotsWrap.style.gap = "3px";
    dotsWrap.style.marginTop = "4px";
    dotsWrap.title = `${daysInStatus} day(s) in status`;
    const filledPhase = daysInStatus > 4;
    const dotCount = Math.min(4, filledPhase ? daysInStatus - 4 : daysInStatus);
    for (let i = 0; i < dotCount; i++) {
      const circle = document.createElement("span");
      circle.style.display = "inline-block";
      circle.style.width = "8px";
      circle.style.height = "8px";
      circle.style.borderRadius = "50%";
      circle.style.border = "1px solid #dc3545";
      circle.style.background = filledPhase ? "#dc3545" : "transparent";
      dotsWrap.appendChild(circle);
    }
    if (dotCount > 0) card.appendChild(dotsWrap);
  }

  // Note: Hide descriptions on board cards; they are visible in the editor modal

  card.addEventListener("dragstart", function (e) {
    try {
      e.dataTransfer.setData("text/plain", todo.id);
      e.dataTransfer.effectAllowed = "move";
    } catch (_) {}
    card.dataset.dragging = "1";
  });
  card.addEventListener("dragend", function () {
    delete card.dataset.dragging;
  });

  // Click to open editor (ignore if just dragged)
  card.addEventListener("click", function (e) {
    e.stopPropagation();
    if (card.dataset.dragging === "1") return;
    openBoardCardEditor(todo.id);
  });

  colBody.appendChild(card);
}

function changeTodoStatus(todoId, newStatus) {
  if (!BOARD_STATUSES.includes(newStatus)) return;
  chrome.storage.local.get(
    {
      todos: [],
    },
    function (items) {
      const todos = items.todos || [];
      const idx = todos.findIndex((t) => t.id === todoId);
      if (idx === -1) return;
      todos[idx] = {
        ...todos[idx],
        status: newStatus,
        lastStatusChange: Date.now(),
      };
      chrome.storage.local.set({ todos }, function () {
        if (isBoardView) renderBoard();
      });
    }
  );
}

// Modal editor for board cards
function openBoardCardEditor(todoId) {
  // Remove any existing modal
  const existing = document.getElementById("boardCardModal");
  if (existing) existing.remove();

  // Fetch todo
  chrome.storage.local.get({ todos: [] }, function (items) {
    const todos = items.todos || [];
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;

    const overlay = document.createElement("div");
    overlay.id = "boardCardModal";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.right = "0";
    overlay.style.bottom = "0";
    overlay.style.background = "rgba(0,0,0,0.6)";
    overlay.style.zIndex = "2000";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    const panel = document.createElement("div");
    panel.style.background = "#fff";
    panel.style.color = "#333";
    panel.style.borderRadius = "8px";
    panel.style.boxShadow = "0 10px 24px rgba(0,0,0,0.3)";
    panel.style.width = "min(760px, 90vw)";
    panel.style.maxHeight = "80vh";
    panel.style.overflow = "auto";
    panel.style.padding = "16px";

    const heading = document.createElement("div");
    heading.textContent = "Edit Card";
    heading.style.fontWeight = "bold";
    heading.style.fontSize = "16px";
    heading.style.marginBottom = "10px";
    panel.appendChild(heading);

    const titleLabel = document.createElement("div");
    titleLabel.textContent = "Title";
    titleLabel.style.fontSize = "12px";
    titleLabel.style.margin = "6px 0 4px";
    panel.appendChild(titleLabel);

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.value = todo.title || "";
    titleInput.style.width = "100%";
    titleInput.style.padding = "8px";
    titleInput.style.border = "1px solid #ccc";
    titleInput.style.borderRadius = "4px";
    panel.appendChild(titleInput);

    const descLabel = document.createElement("div");
    descLabel.textContent = "Description";
    descLabel.style.fontSize = "12px";
    descLabel.style.margin = "10px 0 4px";
    panel.appendChild(descLabel);

    const descInput = document.createElement("textarea");
    descInput.value = todo.description || "";
    descInput.style.width = "100%";
    descInput.style.minHeight = "160px";
    descInput.style.padding = "8px";
    descInput.style.border = "1px solid #ccc";
    descInput.style.borderRadius = "4px";
    descInput.style.resize = "vertical";
    panel.appendChild(descInput);

    // Dates and project
    const datesRow = document.createElement("div");
    datesRow.style.display = "flex";
    datesRow.style.gap = "10px";
    datesRow.style.marginTop = "10px";

    const dueWrap = document.createElement("div");
    const dueLbl = document.createElement("div");
    dueLbl.textContent = "Due date";
    dueLbl.style.fontSize = "12px";
    const dueInput = document.createElement("input");
    dueInput.type = "date";
    dueInput.value = toInputDate(
      todo.dueDate || Date.now() + 7 * 24 * 60 * 60 * 1000
    );
    dueWrap.appendChild(dueLbl);
    dueWrap.appendChild(dueInput);

    const editedWrap = document.createElement("div");
    const editedLbl = document.createElement("div");
    editedLbl.textContent = "Last edited";
    editedLbl.style.fontSize = "12px";
    const editedInput = document.createElement("input");
    editedInput.type = "date";
    editedInput.value = toInputDate(todo.lastEdited || Date.now());
    editedWrap.appendChild(editedLbl);
    editedWrap.appendChild(editedInput);

    const projectWrap = document.createElement("div");
    const projectLbl = document.createElement("div");
    projectLbl.textContent = "Project";
    projectLbl.style.fontSize = "12px";
    const projectSelect = document.createElement("select");
    projectSelect.style.minWidth = "180px";
    const optAll = document.createElement("option");
    optAll.value = "none";
    optAll.textContent = "No Project";
    projectSelect.appendChild(optAll);
    chrome.storage.local.get({ projects: [] }, function (res) {
      (res.projects || []).forEach((p) => {
        const o = document.createElement("option");
        o.value = p.id;
        o.textContent = p.name;
        projectSelect.appendChild(o);
      });
      projectSelect.value = todo.projectId ? todo.projectId : "none";
    });
    projectWrap.appendChild(projectLbl);
    projectWrap.appendChild(projectSelect);

    // Last status change (manual override)
    const lscWrap = document.createElement("div");
    const lscLbl = document.createElement("div");
    lscLbl.textContent = "Status changed";
    lscLbl.style.fontSize = "12px";
    const lscInput = document.createElement("input");
    lscInput.type = "date";
    lscInput.value = toInputDate(todo.lastStatusChange || Date.now());
    lscWrap.appendChild(lscLbl);
    lscWrap.appendChild(lscInput);

    datesRow.appendChild(dueWrap);
    datesRow.appendChild(editedWrap);
    datesRow.appendChild(projectWrap);
    datesRow.appendChild(lscWrap);
    // Status select
    const statusWrap = document.createElement("div");
    const statusLbl = document.createElement("div");
    statusLbl.textContent = "Status";
    statusLbl.style.fontSize = "12px";
    const statusSelect = document.createElement("select");
    BOARD_STATUSES.forEach((s) => {
      const opt = document.createElement("option");
      opt.value = s;
      opt.textContent = s.replace(/_/g, " ");
      statusSelect.appendChild(opt);
    });
    statusSelect.value = todo.status || "backlog";
    statusWrap.appendChild(statusLbl);
    statusWrap.appendChild(statusSelect);
    datesRow.appendChild(statusWrap);

    // T-shirt size
    const sizeWrap = document.createElement("div");
    const sizeLbl = document.createElement("div");
    sizeLbl.textContent = "Size";
    sizeLbl.style.fontSize = "12px";
    const sizeSelect = document.createElement("select");
    TSHIRT_SIZES.forEach((sz) => {
      const o = document.createElement("option");
      o.value = sz;
      o.textContent = sz;
      sizeSelect.appendChild(o);
    });
    sizeSelect.value = (todo.size || "M").toUpperCase();
    sizeWrap.appendChild(sizeLbl);
    sizeWrap.appendChild(sizeSelect);
    datesRow.appendChild(sizeWrap);
    panel.appendChild(datesRow);

    // Respect global dates visibility setting
    if (!showDates) {
      dueWrap.style.display = "none";
      lscWrap.style.display = "none";
    }

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.justifyContent = "flex-end";
    actions.style.gap = "8px";
    actions.style.marginTop = "12px";

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.style.padding = "8px 12px";
    cancelBtn.style.border = "none";
    cancelBtn.style.borderRadius = "4px";
    cancelBtn.style.cursor = "pointer";
    cancelBtn.addEventListener("click", function () {
      overlay.remove();
    });

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.style.background = "#28a745";
    saveBtn.style.color = "#fff";
    saveBtn.style.padding = "8px 12px";
    saveBtn.style.border = "none";
    saveBtn.style.borderRadius = "4px";
    saveBtn.style.cursor = "pointer";
    saveBtn.addEventListener("click", function () {
      const newTitle = titleInput.value || "";
      const newDesc = descInput.value || "";
      const newDue =
        fromInputDate(dueInput.value) || todo.dueDate || Date.now();
      const newEdited = fromInputDate(editedInput.value) || Date.now();
      const newLastStatusChange =
        fromInputDate(lscInput.value) || todo.lastStatusChange || Date.now();
      const newProjectId =
        projectSelect.value === "none" ? null : projectSelect.value;
      const newStatus = statusSelect.value || todo.status || "backlog";
      const newSize = (sizeSelect.value || "M").toUpperCase();
      chrome.storage.local.get({ todos: [] }, function (it) {
        const arr = it.todos || [];
        const idx = arr.findIndex((t) => t.id === todoId);
        if (idx === -1) return;
        arr[idx] = {
          ...arr[idx],
          title: newTitle,
          description: newDesc,
          dueDate: newDue,
          lastEdited: newEdited,
          lastStatusChange: newLastStatusChange,
          projectId: newProjectId,
          status: newStatus,
          size: newSize,
        };
        chrome.storage.local.set({ todos: arr }, function () {
          overlay.remove();
          if (isBoardView) renderBoard();
          else refreshTodoList();
        });
      });
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.style.background = "#dc3545";
    deleteBtn.style.color = "#fff";
    deleteBtn.style.padding = "8px 12px";
    deleteBtn.style.border = "none";
    deleteBtn.style.borderRadius = "4px";
    deleteBtn.style.cursor = "pointer";
    deleteBtn.addEventListener("click", function () {
      if (confirm("Delete this card?")) {
        moveTodoToDeleted(todoId);
        overlay.remove();
        if (isBoardView) renderBoard();
        else refreshTodoList();
      }
    });

    actions.appendChild(cancelBtn);
    actions.appendChild(deleteBtn);
    actions.appendChild(saveBtn);
    panel.appendChild(actions);

    overlay.appendChild(panel);

    // Close on overlay click or Escape
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.remove();
    });
    document.addEventListener(
      "keydown",
      function escHandler(e) {
        if (e.key === "Escape") {
          overlay.remove();
          document.removeEventListener("keydown", escHandler);
        }
      },
      { once: true }
    );

    document.body.appendChild(overlay);
    titleInput.focus();
  });
}

// Helpers to convert ms timestamps <-> input[type=date] strings
function toInputDate(ms) {
  try {
    const d = new Date(typeof ms === "number" ? ms : Date.parse(ms));
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  } catch (_) {
    return "";
  }
}
function fromInputDate(s) {
  if (!s) return null;
  // Parse YYYY-MM-DD as a LOCAL date at midnight to avoid UTC shift
  const parts = s.split("-");
  if (parts.length !== 3) return null;
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0); // local midnight
  return dt.getTime();
}

// Compute days until a timestamp (negative when overdue)
function daysUntil(ms) {
  if (!ms) return 0;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(ms);
  end.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
  );
  return diff;
}

// Daily Questions
function todayKey() {
  return toInputDate(Date.now());
}

function initDailyQuestionsUI() {
  const btn = document.getElementById("dailyQuestionsBtn");
  if (btn) btn.addEventListener("click", openDailyQuestionsModal);
  refreshDailyStatusUI();
}

function refreshDailyStatusUI() {
  const statusEl = document.getElementById("dailyCheck");
  if (!statusEl) return;
  chrome.storage.sync.get({ dailyQuestions: [] }, function (cfg) {
    const questions = cfg.dailyQuestions || [];
    chrome.storage.local.get({ dailyAnswersByDate: {} }, function (data) {
      const key = todayKey();
      const answers = (data.dailyAnswersByDate || {})[key] || [];
      const complete =
        questions.length > 0 &&
        answers.length >= questions.length &&
        answers.every((a) => a && a.answer !== undefined);
      statusEl.style.display = complete ? "inline" : "none";
    });
  });
}

function openDailyQuestionsModal() {
  // Remove any existing modal
  const existing = document.getElementById("dailyQuestionsModal");
  if (existing) existing.remove();

  chrome.storage.sync.get({ dailyQuestions: [] }, function (cfg) {
    const questions = cfg.dailyQuestions || [];
    if (questions.length === 0) {
      if (confirm("No daily questions set. Open options to add questions?")) {
        if (chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
          chrome.runtime.openOptionsPage();
        }
      }
      return;
    }

    chrome.storage.local.get({ dailyAnswersByDate: {} }, function (data) {
      const key = todayKey();
      const prev = (data.dailyAnswersByDate || {})[key] || [];

      const overlay = document.createElement("div");
      overlay.id = "dailyQuestionsModal";
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.right = "0";
      overlay.style.bottom = "0";
      overlay.style.background = "rgba(0,0,0,0.6)";
      overlay.style.zIndex = "2300";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";

      const panel = document.createElement("div");
      panel.style.background = "#fff";
      panel.style.color = "#333";
      panel.style.borderRadius = "8px";
      panel.style.boxShadow = "0 10px 24px rgba(0,0,0,0.3)";
      panel.style.width = "min(760px, 90vw)";
      panel.style.maxHeight = "80vh";
      panel.style.overflow = "auto";
      panel.style.padding = "16px";

      const heading = document.createElement("div");
      heading.textContent = "Daily Questions";
      heading.style.fontWeight = "bold";
      heading.style.fontSize = "16px";
      heading.style.marginBottom = "10px";
      panel.appendChild(heading);

      const form = document.createElement("div");
      questions.forEach((q, idx) => {
        const wrap = document.createElement("div");
        wrap.style.marginBottom = "10px";
        const label = document.createElement("div");
        label.textContent = q;
        label.style.fontSize = "13px";
        label.style.marginBottom = "4px";
        const input = document.createElement("textarea");
        input.style.width = "100%";
        input.style.minHeight = "80px";
        input.style.border = "1px solid #ccc";
        input.style.borderRadius = "4px";
        input.style.padding = "8px";
        const prevAns = prev.find((a) => a && a.index === idx);
        if (prevAns) input.value = prevAns.answer;
        input.dataset.index = idx;
        wrap.appendChild(label);
        wrap.appendChild(input);
        form.appendChild(wrap);
      });
      panel.appendChild(form);

      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.justifyContent = "flex-end";
      actions.style.gap = "8px";
      actions.style.marginTop = "12px";

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.style.padding = "8px 12px";
      cancelBtn.style.border = "none";
      cancelBtn.style.borderRadius = "4px";
      cancelBtn.style.cursor = "pointer";
      cancelBtn.addEventListener("click", function () {
        overlay.remove();
      });

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";
      saveBtn.style.background = "#28a745";
      saveBtn.style.color = "#fff";
      saveBtn.style.padding = "8px 12px";
      saveBtn.style.border = "none";
      saveBtn.style.borderRadius = "4px";
      saveBtn.style.cursor = "pointer";
      saveBtn.addEventListener("click", function () {
        const inputs = Array.from(panel.querySelectorAll("textarea"));
        const answers = inputs.map((el) => ({
          index: Number(el.dataset.index),
          answer: el.value || "",
        }));
        chrome.storage.local.get({ dailyAnswersByDate: {} }, function (st) {
          const map = st.dailyAnswersByDate || {};
          map[key] = answers;
          chrome.storage.local.set({ dailyAnswersByDate: map }, function () {
            overlay.remove();
            refreshDailyStatusUI();
          });
        });
      });

      actions.appendChild(cancelBtn);
      actions.appendChild(saveBtn);
      panel.appendChild(actions);

      overlay.appendChild(panel);
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) overlay.remove();
      });
      document.addEventListener(
        "keydown",
        function onEsc(e) {
          if (e.key === "Escape") {
            overlay.remove();
            document.removeEventListener("keydown", onEsc);
          }
        },
        { once: true }
      );
      document.body.appendChild(overlay);
    });
  });
}

// Goals viewer modal
function initGoalsUI() {
  const btn = document.getElementById("goalsBtn");
  if (btn) btn.addEventListener("click", openGoalsModal);
}

function openGoalsModal() {
  const existing = document.getElementById("goalsModal");
  if (existing) existing.remove();
  chrome.storage.sync.get({ goals: [] }, function (cfg) {
    const goals = cfg.goals || [];
    const overlay = document.createElement("div");
    overlay.id = "goalsModal";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.right = "0";
    overlay.style.bottom = "0";
    overlay.style.background = "rgba(0,0,0,0.6)";
    overlay.style.zIndex = "2300";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    const panel = document.createElement("div");
    panel.style.background = "#fff";
    panel.style.color = "#333";
    panel.style.borderRadius = "10px";
    panel.style.boxShadow = "0 12px 32px rgba(0,0,0,0.35)";
    panel.style.width = "min(720px, 90vw)";
    panel.style.maxHeight = "80vh";
    panel.style.overflow = "auto";
    panel.style.padding = "16px";

    const title = document.createElement("div");
    title.textContent = "Goals / Objectives";
    title.style.fontWeight = "bold";
    title.style.fontSize = "18px";
    title.style.marginBottom = "10px";
    panel.appendChild(title);

    if (goals.length === 0) {
      const empty = document.createElement("div");
      empty.textContent = "No goals set. Use Options to add some.";
      empty.style.color = "#666";
      panel.appendChild(empty);
    } else {
      const ul = document.createElement("ul");
      ul.style.listStyle = "none";
      ul.style.padding = "0";
      ul.style.margin = "0";
      ul.style.display = "flex";
      ul.style.flexDirection = "column";
      ul.style.gap = "8px";
      goals.forEach((g) => {
        const li = document.createElement("li");
        li.style.background = "#f8f9fa";
        li.style.border = "1px solid #eee";
        li.style.borderRadius = "8px";
        li.style.padding = "10px";
        li.textContent = g;
        ul.appendChild(li);
      });
      panel.appendChild(ul);
    }

    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.justifyContent = "flex-end";
    row.style.marginTop = "12px";
    const close = document.createElement("button");
    close.textContent = "Close";
    close.style.padding = "8px 12px";
    close.style.border = "none";
    close.style.borderRadius = "4px";
    close.style.cursor = "pointer";
    close.addEventListener("click", function () {
      overlay.remove();
    });
    row.appendChild(close);
    panel.appendChild(row);

    overlay.appendChild(panel);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) overlay.remove();
    });
    document.addEventListener(
      "keydown",
      function onEsc(e) {
        if (e.key === "Escape") {
          overlay.remove();
          document.removeEventListener("keydown", onEsc);
        }
      },
      { once: true }
    );

    document.body.appendChild(overlay);
  });
}

// Dates visibility toggle
function initDatesToggle() {
  const btn = document.getElementById("toggleDatesBtn");
  if (!btn) return;
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.sync.get({ showDates: true }, function (cfg) {
      showDates = cfg.showDates !== false;
      btn.textContent = showDates ? "Dates: On" : "Dates: Off";
    });
  }
  btn.addEventListener("click", function () {
    showDates = !showDates;
    btn.textContent = showDates ? "Dates: On" : "Dates: Off";
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({ showDates: showDates });
    }
    if (isBoardView) renderBoard();
  });
}

// TODO Feature functions
function initTodos() {
  // Initialize projects first
  initProjects();

  // Load saved TODOs from storage
  chrome.storage.local.get(
    {
      todos: [], // Default empty array
      deletedTodos: [], // Default empty array for deleted todos
    },
    function (items) {
      // Render the deleted TODOs
      items.deletedTodos.forEach((todo) => {
        renderTodo(todo, true);
      });

      // Make sure project controls are visible when in active view mode
      if (viewMode === 0) {
        $("#projectControls").show();
      }

      // Now refresh the todo list to show active todos with the correct project filter
      refreshTodoList();
    }
  );
}

// Initialize projects functionality
function initProjects() {
  // Load saved projects from storage
  chrome.storage.local.get(
    {
      projects: [], // Default empty array
      currentProjectId: "all", // Default to "all" projects
    },
    function (items) {
      // Respect saved selection; do not auto-switch away from "all"
      let targetProjectId = items.currentProjectId;

      // Set the current project ID
      currentProjectId = targetProjectId;

      // Create project selector dropdown
      createProjectSelector(items.projects);

      // Set the selector to the target project
      setProjectSelectorValue(currentProjectId);

      // If we changed from the stored value, save the new selection
      if (targetProjectId !== items.currentProjectId) {
        chrome.storage.local.set({
          currentProjectId: targetProjectId,
        });
      }

      // Add button for creating new projects
      createNewProjectButton();

      // Update delete project button visibility
      updateDeleteProjectButtonVisibility();

      // Show the project controls in active view
      if (viewMode === 0) {
        $("#projectControls").show();
      }
    }
  );
}

// Create the project selector dropdown
function createProjectSelector(projects) {
  // Create the container for the project selector
  const selectorContainer = document.createElement("div");
  selectorContainer.id = "projectSelectorContainer";
  selectorContainer.style.marginBottom = "10px";
  selectorContainer.style.display = "flex";
  selectorContainer.style.flexDirection = "column";
  selectorContainer.style.gap = "5px";

  // Create row for the selector
  const selectorRow = document.createElement("div");
  selectorRow.style.display = "flex";
  selectorRow.style.alignItems = "center";

  // Create label for the dropdown
  const label = document.createElement("label");
  label.htmlFor = "projectSelector";
  label.textContent = "Project: ";
  label.style.marginRight = "5px";
  label.style.color = "white";

  // Create a custom dropdown (display + menu)
  const display = document.createElement("div");
  display.id = "projectSelectorDisplay";
  display.style.padding = "5px";
  display.style.borderRadius = "4px";
  display.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  display.style.color = "white";
  display.style.border = "none";
  display.style.flex = "1";
  display.style.cursor = "pointer";
  display.style.userSelect = "none";
  display.textContent = "All Projects";

  // Floating portal menu attached to body (not clipped by right panel)
  const menu = document.createElement("div");
  menu.id = "projectSelectorMenu";
  menu.style.position = "fixed";
  menu.style.background = "rgba(0,0,0,0.95)";
  menu.style.color = "white";
  menu.style.border = "1px solid rgba(255,255,255,0.2)";
  menu.style.borderRadius = "6px";
  menu.style.minWidth = "200px";
  menu.style.zIndex = "3000";
  menu.style.display = "none";
  menu.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)";
  menu.style.overflowY = "auto";

  function addOption(value, text) {
    const item = document.createElement("div");
    item.textContent = text;
    item.dataset.value = value;
    item.style.padding = "6px 10px";
    item.style.cursor = "pointer";
    item.addEventListener("mouseenter", function () {
      this.style.backgroundColor = "rgba(255,255,255,0.1)";
    });
    item.addEventListener("mouseleave", function () {
      this.style.backgroundColor = "transparent";
    });
    item.addEventListener("click", function (e) {
      e.stopPropagation();
      setProjectSelectorValue(this.dataset.value, this.textContent);
      // Save selection
      chrome.storage.local.set({ currentProjectId: currentProjectId });
      // Update UI (debounced)
      queueRefreshTodos();
      if (isBoardView) renderBoard();
      updateDeleteProjectButtonVisibility();
      // Close menu
      menu.style.display = "none";
    });
    menu.appendChild(item);
  }

  // Build menu options
  addOption("all", "All Projects");
  addOption("none", "No Project");
  projects.forEach((project) => addOption(project.id, project.name));

  // Portal helpers
  function positionMenu() {
    const rect = display.getBoundingClientRect();
    const margin = 6;
    menu.style.left = rect.left + "px";
    menu.style.top = rect.bottom + margin + "px";
    menu.style.minWidth = rect.width + "px";
    const maxH = Math.max(
      120,
      window.innerHeight - (rect.bottom + margin) - 10
    );
    menu.style.maxHeight = maxH + "px";
  }
  function openMenu() {
    if (menu.parentNode !== document.body) document.body.appendChild(menu);
    positionMenu();
    menu.style.display = "block";
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    document.addEventListener("click", outsideClose, { once: true });
  }
  function closeMenu() {
    menu.style.display = "none";
    window.removeEventListener("resize", positionMenu);
    window.removeEventListener("scroll", positionMenu, true);
  }
  function outsideClose(ev) {
    if (!menu.contains(ev.target) && ev.target !== display) {
      closeMenu();
    }
  }

  // Toggle menu
  display.addEventListener("click", function (e) {
    e.stopPropagation();
    if (menu.style.display === "block") closeMenu();
    else openMenu();
  });

  // Add elements to selector row
  selectorRow.appendChild(label);
  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.flex = "1";
  wrapper.appendChild(display);
  selectorRow.appendChild(wrapper);

  // Add selector row to container
  selectorContainer.appendChild(selectorRow);

  // Create row for delete button
  const deleteRow = document.createElement("div");
  deleteRow.style.display = "flex";
  deleteRow.style.justifyContent = "flex-end";

  // Create delete project button
  const deleteProjectBtn = document.createElement("button");
  deleteProjectBtn.id = "deleteProjectBtn";
  deleteProjectBtn.textContent = "Delete Current Project";
  deleteProjectBtn.style.display = "none"; // Hidden by default
  deleteProjectBtn.style.backgroundColor = "rgba(220, 53, 69, 0.8)";
  deleteProjectBtn.style.color = "white";
  deleteProjectBtn.style.border = "none";
  deleteProjectBtn.style.padding = "5px 8px";
  deleteProjectBtn.style.borderRadius = "4px";
  deleteProjectBtn.style.fontSize = "12px";
  deleteProjectBtn.style.cursor = "pointer";

  // Add click event listener for delete button
  deleteProjectBtn.addEventListener("click", function () {
    deleteCurrentProject();
  });

  // Add delete button to delete row
  deleteRow.appendChild(deleteProjectBtn);

  // Add delete row to container
  selectorContainer.appendChild(deleteRow);

  // Add to the project controls container
  const projectControls = document.getElementById("projectControls");
  projectControls.innerHTML = ""; // Clear existing content
  projectControls.appendChild(selectorContainer);
  projectControls.style.display = "block"; // Make it visible

  // Set initial visibility of delete button
  updateDeleteProjectButtonVisibility();
}

// Helper to set selector UI and currentProjectId
function setProjectSelectorValue(value, textOverride) {
  currentProjectId = value;
  const display = document.getElementById("projectSelectorDisplay");
  if (display) {
    if (textOverride) {
      display.textContent = textOverride;
    } else {
      if (value === "all") display.textContent = "All Projects";
      else if (value === "none") display.textContent = "No Project";
      else {
        // look up project name
        chrome.storage.local.get({ projects: [] }, function (items) {
          const p = items.projects.find((pr) => pr.id === value);
          display.textContent = p ? p.name : "All Projects";
        });
      }
    }
  }
}

// Function to update delete project button visibility
function updateDeleteProjectButtonVisibility() {
  const deleteBtn = document.getElementById("deleteProjectBtn");
  if (!deleteBtn) return;

  // Only show delete button if a specific project is selected (not "all" or "none")
  if (currentProjectId !== "all" && currentProjectId !== "none") {
    deleteBtn.style.display = "block";
  } else {
    deleteBtn.style.display = "none";
  }
}

// Function to delete the currently selected project
function deleteCurrentProject() {
  // Safety check
  if (currentProjectId === "all" || currentProjectId === "none") {
    showNotification("Cannot delete this selection");
    return;
  }

  // Get the project name for confirmation
  chrome.storage.local.get(
    {
      projects: [],
    },
    function (items) {
      const project = items.projects.find((p) => p.id === currentProjectId);
      if (!project) {
        showNotification("Project not found");
        return;
      }

      if (
        confirm(
          `Are you sure you want to delete the project "${project.name}"? All todos will remain but will be unassigned from this project.`
        )
      ) {
        // Delete the project
        deleteProject(currentProjectId);
      }
    }
  );
}

// Function to delete a project by ID
function deleteProject(projectId) {
  chrome.storage.local.get(
    {
      projects: [],
      todos: [],
      currentProjectId: "all",
    },
    function (items) {
      // Remove the project from the projects array
      const updatedProjects = items.projects.filter(
        (project) => project.id !== projectId
      );

      // Update todos to remove this project association
      const updatedTodos = items.todos.map((todo) => {
        if (todo.projectId === projectId) {
          return { ...todo, projectId: null };
        }
        return todo;
      });

      // Prepare update data
      const updateData = {
        projects: updatedProjects,
        todos: updatedTodos,
      };

      // If the current project selection is the one being deleted, change it to "all"
      if (items.currentProjectId === projectId) {
        updateData.currentProjectId = "all";
        currentProjectId = "all";
      }

      // Save the updated data
      chrome.storage.local.set(updateData, function () {
        // Refresh the UI
        initProjects();

        // Show confirmation
        showNotification("Project deleted successfully");
      });
    }
  );
}

// Create button for adding new projects
function createNewProjectButton() {
  // Create the new project button
  const newProjectBtn = document.createElement("button");
  newProjectBtn.id = "addProjectBtn";
  newProjectBtn.textContent = "+Project";
  newProjectBtn.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  newProjectBtn.style.color = "white";
  newProjectBtn.style.border = "none";
  newProjectBtn.style.padding = "8px 10px";
  newProjectBtn.style.borderRadius = "5px";
  newProjectBtn.style.cursor = "pointer";
  newProjectBtn.style.fontSize = "14px";
  newProjectBtn.style.marginRight = "5px";

  // Add click event listener
  newProjectBtn.addEventListener("click", function () {
    createNewProject();
  });

  // Add to the control buttons container
  const todoControlsTop = document.getElementById("todoControlsTop");
  if (todoControlsTop) {
    // Insert before the toggle visibility button
    todoControlsTop.insertBefore(
      newProjectBtn,
      document.getElementById("toggleTodosVisibilityBtn")
    );
  } else {
    console.error("todoControlsTop container not found");
  }
}

// Function to create a new project
function createNewProject() {
  // Prompt for project name
  const projectName = prompt("Enter a name for the new project:");

  if (projectName && projectName.trim() !== "") {
    // Generate a unique ID for the project
    const projectId = "project_" + Date.now();

    // Create the project object
    const project = {
      id: projectId,
      name: projectName.trim(),
      createdAt: Date.now(),
    };

    // Save the project
    saveProject(project);

    // Update the project selector
    addProjectToSelector(project);

    // Select the new project
    setProjectSelectorValue(projectId);

    // Save the current project selection to Chrome storage (local)
    chrome.storage.local.set({
      currentProjectId: currentProjectId,
    });

    refreshTodoList();
  }
}

// Add a new project to the selector dropdown
function addProjectToSelector(project) {
  const selector = document.getElementById("projectSelector");

  // Create new option
  const option = document.createElement("option");
  option.value = project.id;
  option.textContent = project.name;

  // Add after the "No Project" option
  selector.appendChild(option);
}

// Save a project to storage
function saveProject(project) {
  chrome.storage.local.get(
    {
      projects: [],
    },
    function (items) {
      // Add the new project to the array
      const projects = items.projects;
      projects.push(project);

      // Save the updated array
      chrome.storage.local.set({
        projects: projects,
      });
    }
  );
}

// Update the createNewTodo function to include project association
function createNewTodo() {
  createNewTodoWithStatus("backlog");
}

// Create a new todo with a specific status (used by kanban column "+" buttons)
function createNewTodoWithStatus(status) {
  // Generate a unique ID for the new TODO
  const id = "todo_" + Date.now();

  // Get the current project (if not 'all' or 'none')
  const projectId =
    currentProjectId !== "all" && currentProjectId !== "none"
      ? currentProjectId
      : null;

  // Create a new TODO object
  const todo = {
    id: id,
    title: "",
    description: "",
    expanded: false,
    projectId: projectId, // Associate with current project if applicable
    createdAt: Date.now(),
    status: status || "backlog",
    dueDate: Date.now() + 7 * 24 * 60 * 60 * 1000,
    lastEdited: Date.now(),
    lastStatusChange: Date.now(),
    size: "M",
  };

  // Render the new TODO in the UI (list mode)
  lastCreatedTodoId = id;
  if (!isBoardView) renderTodo(todo, false);

  // Save the new TODO to storage; open modal in board mode after save
  saveTodo(todo, function () {
    if (isBoardView) {
      renderBoard();
      openBoardCardEditor(id);
    }
  });
}

// Update the renderTodo function to properly handle line breaks in descriptions
function renderTodo(todo, isDeleted) {
  // If filtering by project and this todo doesn't match, don't render
  if (!isDeleted && currentProjectId !== "all") {
    if (
      (currentProjectId === "none" && todo.projectId) ||
      (currentProjectId !== "none" && todo.projectId !== currentProjectId)
    ) {
      return;
    }
  }

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

  // Create project label and add context menu for project assignment
  if (!isDeleted) {
    // Right-click context menu for project assignment
    todoEl.addEventListener("contextmenu", function (e) {
      e.preventDefault();
      showProjectContextMenu(e, todo);
    });

    // Add project label if it has a project
    if (todo.projectId) {
      chrome.storage.local.get(
        {
          projects: [],
        },
        function (items) {
          const project = items.projects.find((p) => p.id === todo.projectId);
          if (project) {
            // Create project label
            const projectLabel = document.createElement("div");
            projectLabel.className = "todo-project-label";
            projectLabel.textContent = project.name;
            projectLabel.style.position = "absolute";
            projectLabel.style.top = "5px";
            projectLabel.style.right = "30px"; // Position to the left of delete button
            projectLabel.style.fontSize = "11px";
            projectLabel.style.color = "#555";
            projectLabel.style.backgroundColor = "rgba(255,255,255,0.7)";
            projectLabel.style.padding = "2px 6px";
            projectLabel.style.borderRadius = "3px";

            // Add the label to the todo
            todoEl.appendChild(projectLabel);
          }
        }
      );
    }
  }

  // Create a container for the title row
  const titleRow = document.createElement("div");
  titleRow.style.display = "flex";
  titleRow.style.justifyContent = "space-between";
  titleRow.style.alignItems = "center";

  // Container for left side controls (reorder buttons and toggle)
  const leftControls = document.createElement("div");
  leftControls.style.display = "flex";
  leftControls.style.alignItems = "center";

  // Only add reordering buttons for active todos
  if (!isDeleted) {
    // Create the reordering controls
    const reorderControls = document.createElement("div");
    reorderControls.style.display = "flex";
    reorderControls.style.flexDirection = "column";
    reorderControls.style.marginRight = "5px";

    // Add up button
    const upButton = document.createElement("button");
    upButton.textContent = "^";
    upButton.style.background = "transparent";
    upButton.style.border = "none";
    upButton.style.color = "#555";
    upButton.style.fontSize = "14px";
    upButton.style.padding = "0 5px";
    upButton.style.cursor = "pointer";
    upButton.style.lineHeight = "1";
    upButton.title = "Move up";

    // Add down button
    const downButton = document.createElement("button");
    downButton.textContent = "v";
    downButton.style.background = "transparent";
    downButton.style.border = "none";
    downButton.style.color = "#555";
    downButton.style.fontSize = "14px";
    downButton.style.padding = "0 5px";
    downButton.style.cursor = "pointer";
    downButton.style.lineHeight = "1";
    downButton.title = "Move down";

    // Add event listeners for reordering
    upButton.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent bubbling
      moveTodoUp(todo.id);
    });

    downButton.addEventListener("click", function (e) {
      e.stopPropagation(); // Prevent bubbling
      moveTodoDown(todo.id);
    });

    // Add buttons to reorder controls
    reorderControls.appendChild(upButton);
    reorderControls.appendChild(downButton);

    // Add reorder controls to left controls
    leftControls.appendChild(reorderControls);
  }

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

  // Add toggle button to left controls
  leftControls.appendChild(toggleBtn);

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

  // Add left controls and title to title row
  titleRow.appendChild(leftControls);
  titleRow.appendChild(titleEl);

  // Create description element (only visible when expanded)
  const descEl = document.createElement("textarea");
  descEl.className = "todo-description";
  descEl.style.display = !isDeleted && todo.expanded ? "block" : "none";
  descEl.style.marginTop = "5px";
  descEl.style.outline = "none";
  descEl.style.whiteSpace = "pre-wrap"; // Preserve line breaks
  descEl.style.wordBreak = "break-word"; // Ensure long words wrap properly
  descEl.style.width = "100%";
  descEl.style.minHeight = "60px";
  descEl.style.resize = "vertical";
  descEl.style.border = "none";
  descEl.style.backgroundColor = "transparent";
  descEl.style.fontFamily = "inherit";
  descEl.style.fontSize = "inherit";
  descEl.style.padding = "5px";
  descEl.style.boxSizing = "border-box";

  // Set the description content
  if (todo.description) {
    descEl.value = todo.description; // Use value for textarea
  } else {
    descEl.value = "";
  }

  if (todo.description === "" && !isDeleted) {
    descEl.placeholder = "Click to edit description";
    descEl.style.color = "#999";
  }

  // Handle description edit (save on blur) - only for active todos
  if (!isDeleted) {
    descEl.addEventListener("focus", function () {
      if (this.value === "" && this.style.color === "rgb(153, 153, 153)") {
        this.style.color = "";
      }
    });

    descEl.addEventListener("blur", function () {
      // Get the content and preserve line breaks
      const content = this.value; // Use value for textarea
      todo.description = content;
      if (content === "") {
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

  // Set focus only if this todo was just created now
  if (!isDeleted && lastCreatedTodoId === todo.id) {
    titleEl.focus();
    lastCreatedTodoId = null;
  }
}

function saveTodo(todo, callback) {
  chrome.storage.local.get(
    {
      todos: [],
    },
    function (items) {
      // Ensure we're preserving line breaks in the description
      if (todo.description) {
        // Make sure we're not losing any line breaks
        todo.description = todo.description;
      }

      // Add the new TODO to the array
      const todos = items.todos;
      todos.push(todo);

      // Save the updated array with error handling
      chrome.storage.local.set(
        {
          todos: todos,
        },
        function () {
          // Check for Chrome runtime errors
          if (chrome.runtime.lastError) {
            console.error("Storage error:", chrome.runtime.lastError);
            showNotification(
              "Storage error: " + chrome.runtime.lastError.message
            );
            if (callback) callback(false);
            return;
          }
          if (viewMode === 0) refreshTodoList();
          if (callback) callback(true);
        }
      );
    }
  );
}

function updateTodo(updatedTodo) {
  chrome.storage.local.get(
    {
      todos: [],
    },
    function (items) {
      // Find and update the TODO in the array
      const todos = items.todos;
      const index = todos.findIndex((todo) => todo.id === updatedTodo.id);

      if (index !== -1) {
        // Ensure we're preserving line breaks in the description
        if (updatedTodo.description) {
          // Make sure we're not losing any line breaks
          updatedTodo.description = updatedTodo.description;
        }

        todos[index] = updatedTodo;

        // Save the updated array with error handling
        chrome.storage.local.set(
          {
            todos: todos,
          },
          function () {
            // Check for Chrome runtime errors
            if (chrome.runtime.lastError) {
              console.error("Storage error:", chrome.runtime.lastError);
              showNotification(
                "Storage error: " + chrome.runtime.lastError.message
              );
              return;
            }

            // Refresh the todo list to reflect changes (if in active mode)
            if (viewMode === 0) {
              refreshTodoList();
            }
          }
        );
      }
    }
  );
}

function moveTodoToDeleted(todoId) {
  chrome.storage.local.get(
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

        // Save both arrays with error handling
        chrome.storage.local.set(
          {
            todos: todos,
            deletedTodos: deletedTodos,
          },
          function () {
            // Check for Chrome runtime errors
            if (chrome.runtime.lastError) {
              console.error("Storage error:", chrome.runtime.lastError);
              showNotification(
                "Storage error: " + chrome.runtime.lastError.message
              );
              return;
            }
          }
        );
      }
    }
  );
}

function recoverTodo(todoId) {
  chrome.storage.local.get(
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

        // Save both arrays with error handling
        chrome.storage.local.set(
          {
            todos: todos,
            deletedTodos: deletedTodos,
          },
          function () {
            // Check for Chrome runtime errors
            if (chrome.runtime.lastError) {
              console.error("Storage error:", chrome.runtime.lastError);
              showNotification(
                "Storage error: " + chrome.runtime.lastError.message
              );
              return;
            }

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
  chrome.storage.local.get(
    {
      deletedTodos: [],
    },
    function (items) {
      // Filter out the deleted TODO
      const deletedTodos = items.deletedTodos.filter(
        (todo) => todo.id !== todoId
      );

      // Save the updated array
      chrome.storage.local.set({
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
    chrome.storage.local.set(
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

// Function to export all notes and TODOs as JSON
function exportAsJson() {
  chrome.storage.sync.get(
    {
      greeting: "Sup, Rockstar",
      notes: "Click to add notes",
      bottomNotes: "Click to add bottom notes",
      todos: [],
      deletedTodos: [],
      projects: [], // Add projects to export
    },
    function (items) {
      // Create a deep copy of the data to avoid modifying the original
      const exportData = {
        greeting: items.greeting,
        notes: items.notes,
        bottomNotes: items.bottomNotes,
        todos: JSON.parse(JSON.stringify(items.todos)), // Deep copy to ensure proper serialization
        deletedTodos: JSON.parse(JSON.stringify(items.deletedTodos)), // Deep copy to ensure proper serialization
        projects: items.projects, // Include projects in export
      };

      // Convert to JSON with pretty formatting
      const jsonString = JSON.stringify(exportData, null, 2);

      // Copy to clipboard
      copyToClipboard(jsonString);

      // Show temporary notification
      showNotification("JSON data copied to clipboard!");
    }
  );
}

// Helper function to copy text to clipboard
function copyToClipboard(text) {
  // Create a temporary textarea element
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);

  // Select and copy the text
  textarea.select();
  document.execCommand("copy");

  // Clean up
  document.body.removeChild(textarea);
}

// Helper function to show a temporary notification
function showNotification(message) {
  // Create notification element if it doesn't exist
  let notification = document.getElementById("notification");
  if (!notification) {
    notification = document.createElement("div");
    notification.id = "notification";
    notification.style.position = "fixed";
    notification.style.bottom = "20px";
    notification.style.left = "50%";
    notification.style.transform = "translateX(-50%)";
    notification.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    notification.style.color = "white";
    notification.style.padding = "10px 20px";
    notification.style.borderRadius = "5px";
    notification.style.zIndex = "1000";
    notification.style.transition = "opacity 0.5s ease";
    document.body.appendChild(notification);
  }

  // Set the message
  notification.textContent = message;
  notification.style.opacity = "1";

  // Hide after 3 seconds
  setTimeout(function () {
    notification.style.opacity = "0";
  }, 3000);
}

// Function to import data from JSON
function importFromJson() {
  // Create a modal/dialog for pasting JSON
  const modalContainer = document.createElement("div");
  modalContainer.id = "jsonImportModal";
  modalContainer.style.position = "fixed";
  modalContainer.style.top = "0";
  modalContainer.style.left = "0";
  modalContainer.style.width = "100%";
  modalContainer.style.height = "100%";
  modalContainer.style.backgroundColor = "rgba(0,0,0,0.7)";
  modalContainer.style.display = "flex";
  modalContainer.style.justifyContent = "center";
  modalContainer.style.alignItems = "center";
  modalContainer.style.zIndex = "1001";

  const modalContent = document.createElement("div");
  modalContent.style.backgroundColor = "#fef9b0";
  modalContent.style.padding = "20px";
  modalContent.style.borderRadius = "5px";
  modalContent.style.maxWidth = "500px";
  modalContent.style.width = "90%";

  const modalHeader = document.createElement("h3");
  modalHeader.textContent = "Import JSON Data";
  modalHeader.style.marginTop = "0";

  const modalInstructions = document.createElement("p");
  modalInstructions.textContent =
    "Paste your previously exported JSON data below:";

  const textArea = document.createElement("textarea");
  textArea.style.width = "100%";
  textArea.style.height = "200px";
  textArea.style.marginBottom = "15px";
  textArea.style.padding = "8px";
  textArea.style.borderRadius = "4px";
  textArea.style.border = "1px solid #ccc";

  const buttonContainer = document.createElement("div");
  buttonContainer.style.display = "flex";
  buttonContainer.style.justifyContent = "space-between";

  const importButton = document.createElement("button");
  importButton.textContent = "Import";
  importButton.style.backgroundColor = "#28a745";
  importButton.style.color = "white";
  importButton.style.border = "none";
  importButton.style.padding = "8px 15px";
  importButton.style.borderRadius = "4px";
  importButton.style.cursor = "pointer";

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "Cancel";
  cancelButton.style.backgroundColor = "#6c757d";
  cancelButton.style.color = "white";
  cancelButton.style.border = "none";
  cancelButton.style.padding = "8px 15px";
  cancelButton.style.borderRadius = "4px";
  cancelButton.style.cursor = "pointer";

  // Add event listeners for buttons
  importButton.addEventListener("click", function () {
    try {
      const jsonData = JSON.parse(textArea.value);

      // Perform validation to ensure required fields exist
      if (!validateJsonData(jsonData)) {
        throw new Error(
          "Invalid JSON format. Please ensure you're using data previously exported from this app."
        );
      }

      // Import the data
      updateStorageFromJson(jsonData);

      // Close the modal
      document.body.removeChild(modalContainer);

      // Show success notification
      showNotification("Data imported successfully! Refreshing...");

      // Refresh the page after a short delay to show the imported data
      setTimeout(function () {
        location.reload();
      }, 1500);
    } catch (e) {
      alert("Error parsing JSON: " + e.message);
    }
  });

  cancelButton.addEventListener("click", function () {
    document.body.removeChild(modalContainer);
  });

  // Assemble the modal
  buttonContainer.appendChild(cancelButton);
  buttonContainer.appendChild(importButton);

  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalInstructions);
  modalContent.appendChild(textArea);
  modalContent.appendChild(buttonContainer);

  modalContainer.appendChild(modalContent);

  // Add to document
  document.body.appendChild(modalContainer);
}

// Helper function to validate imported JSON data
function validateJsonData(data) {
  // Check if the data has the required structure
  return (
    data &&
    typeof data === "object" &&
    (data.hasOwnProperty("greeting") ||
      data.hasOwnProperty("notes") ||
      data.hasOwnProperty("bottomNotes") ||
      data.hasOwnProperty("todos") ||
      data.hasOwnProperty("deletedTodos") ||
      data.hasOwnProperty("projects"))
  );
}

// Helper function to update storage with imported JSON data
function updateStorageFromJson(data) {
  // Prepare data to update with defaults for missing properties
  const updateData = {};

  // Only update properties that exist in the imported data
  if (data.hasOwnProperty("greeting")) updateData.greeting = data.greeting;
  if (data.hasOwnProperty("notes")) updateData.notes = data.notes;
  if (data.hasOwnProperty("bottomNotes"))
    updateData.bottomNotes = data.bottomNotes;

  // Handle todos with proper line break preservation
  if (data.hasOwnProperty("todos")) {
    // Ensure we're working with a deep copy to avoid reference issues
    updateData.todos = JSON.parse(JSON.stringify(data.todos));

    // Ensure line breaks are preserved in todo descriptions
    updateData.todos.forEach((todo) => {
      if (todo.description) {
        // Make sure line breaks are preserved
        todo.description = todo.description;
      }
    });
  }

  // Handle deleted todos with proper line break preservation
  if (data.hasOwnProperty("deletedTodos")) {
    // Ensure we're working with a deep copy to avoid reference issues
    updateData.deletedTodos = JSON.parse(JSON.stringify(data.deletedTodos));

    // Ensure line breaks are preserved in todo descriptions
    updateData.deletedTodos.forEach((todo) => {
      if (todo.description) {
        // Make sure line breaks are preserved
        todo.description = todo.description;
      }
    });
  }

  if (data.hasOwnProperty("projects")) updateData.projects = data.projects;

  // Update storage
  chrome.storage.sync.set(updateData);
}

// Function to move a todo up in the list
function moveTodoUp(todoId) {
  chrome.storage.local.get(
    {
      todos: [],
    },
    function (items) {
      const todos = items.todos;
      const index = todos.findIndex((todo) => todo.id === todoId);

      // If not found or already at top, do nothing
      if (index <= 0) return;

      // Swap with the todo above it
      const temp = todos[index];
      todos[index] = todos[index - 1];
      todos[index - 1] = temp;

      // Save the updated order
      chrome.storage.local.set(
        {
          todos: todos,
        },
        function () {
          // Refresh the todo list UI
          refreshTodoList();
        }
      );
    }
  );
}

// Function to move a todo down in the list
function moveTodoDown(todoId) {
  chrome.storage.local.get(
    {
      todos: [],
    },
    function (items) {
      const todos = items.todos;
      const index = todos.findIndex((todo) => todo.id === todoId);

      // If not found or already at bottom, do nothing
      if (index === -1 || index >= todos.length - 1) return;

      // Swap with the todo below it
      const temp = todos[index];
      todos[index] = todos[index + 1];
      todos[index + 1] = temp;

      // Save the updated order
      chrome.storage.local.set(
        {
          todos: todos,
        },
        function () {
          // Refresh the todo list UI
          refreshTodoList();
        }
      );
    }
  );
}

// Debounced refresh to avoid rapid re-renders causing flicker
let refreshTodosScheduled = false;
function queueRefreshTodos() {
  if (refreshTodosScheduled) return;
  refreshTodosScheduled = true;
  requestAnimationFrame(function () {
    refreshTodosScheduled = false;
    refreshTodoList();
  });
}

// Function to refresh the todo list UI
function refreshTodoList() {
  // Only refresh active todos if we're in active view
  if (viewMode === 0) {
    // Clear the todo list container
    const todoList = document.getElementById("todoList");
    todoList.innerHTML = "";

    // Re-render all todos based on current project filter
    chrome.storage.local.get(
      {
        todos: [],
      },
      function (items) {
        items.todos.forEach((todo) => {
          // Only render todos that match the current project filter
          if (
            currentProjectId === "all" ||
            (currentProjectId === "none" && !todo.projectId) ||
            todo.projectId === currentProjectId
          ) {
            renderTodo(todo, false);
          }
        });
      }
    );
  }
}

function toggleTodoView() {
  if (viewMode === 0) {
    // Switch to deleted/settings view
    viewMode = 1;
    const toggleBtn = document.getElementById("toggleTodoViewBtn");
    if (toggleBtn) toggleBtn.textContent = "Back";
    const deleted = document.getElementById("deletedTodosContainer");
    if (deleted) deleted.style.display = "block";
    const projectControls = document.getElementById("projectControls");
    if (projectControls) projectControls.style.display = "none";
    const addBtn = document.getElementById("addTodoBtn");
    if (addBtn) addBtn.style.display = "none";
  } else {
    // Switch back to board view
    viewMode = 0;
    const toggleBtn = document.getElementById("toggleTodoViewBtn");
    if (toggleBtn) toggleBtn.textContent = "Settings";
    const deleted = document.getElementById("deletedTodosContainer");
    if (deleted) deleted.style.display = "none";
    const projectControls = document.getElementById("projectControls");
    if (projectControls) projectControls.style.display = "block";
    const addBtn = document.getElementById("addTodoBtn");
    if (addBtn) addBtn.style.display = "inline-block";
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
    const todoContainer = document.getElementById("todoContainer");
    if (todoContainer) {
      todoContainer.style.width = "250px";
      todoContainer.style.maxHeight = "80vh";
      todoContainer.style.overflowY = "auto";
    }
    const toggleBtn = document.getElementById("toggleTodosVisibilityBtn");
    if (toggleBtn) toggleBtn.textContent = "Hide TODOs";
    const active = document.getElementById("activeTodosContainer");
    if (active) active.style.display = "block";
    if (viewMode === 1) {
      const deleted = document.getElementById("deletedTodosContainer");
      if (deleted) deleted.style.display = "block";
    }
    const addBtn = document.getElementById("addTodoBtn");
    if (addBtn) addBtn.style.display = "inline-block";
  } else {
    // Hide TODOs
    const todoContainer = document.getElementById("todoContainer");
    if (todoContainer) {
      todoContainer.style.width = "auto";
      todoContainer.style.maxHeight = "none";
      todoContainer.style.overflowY = "visible";
    }
    const toggleBtn = document.getElementById("toggleTodosVisibilityBtn");
    if (toggleBtn) toggleBtn.textContent = "Show";
    const active = document.getElementById("activeTodosContainer");
    if (active) active.style.display = "none";
    const deleted = document.getElementById("deletedTodosContainer");
    if (deleted) deleted.style.display = "none";
    const allTodos = document.getElementById("allTodosContainer");
    if (allTodos) allTodos.style.display = "none";
    const addBtn = document.getElementById("addTodoBtn");
    if (addBtn) addBtn.style.display = "none";
  }

  // Save visibility state
  chrome.storage.sync.set({
    todosVisible: todosVisible,
  });
}

// Add a function to change a todo's project
function changeTodoProject(todoId, projectId) {
  chrome.storage.local.get(
    {
      todos: [],
    },
    function (items) {
      // Find the todo
      const todos = items.todos;
      const index = todos.findIndex((todo) => todo.id === todoId);

      if (index !== -1) {
        // Update the project ID
        todos[index].projectId = projectId === "none" ? null : projectId;

        // Save the updated array
        chrome.storage.local.set(
          {
            todos: todos,
          },
          function () {
            // Refresh the todo list (debounced)
            queueRefreshTodos();
          }
        );
      }
    }
  );
}

// Function to show the project context menu
function showProjectContextMenu(e, todo) {
  // Remove any existing context menus
  removeContextMenu();

  // Create context menu
  const contextMenu = document.createElement("div");
  contextMenu.id = "projectContextMenu";
  contextMenu.style.position = "absolute";
  contextMenu.style.left = e.pageX + "px";
  contextMenu.style.top = e.pageY + "px";
  contextMenu.style.backgroundColor = "white";
  contextMenu.style.border = "1px solid #ccc";
  contextMenu.style.borderRadius = "5px";
  contextMenu.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)";
  contextMenu.style.padding = "5px 0";
  contextMenu.style.zIndex = "1000";

  // Add header
  const header = document.createElement("div");
  header.textContent = "Assign to Project:";
  header.style.padding = "5px 10px";
  header.style.fontSize = "14px";
  header.style.fontWeight = "bold";
  header.style.borderBottom = "1px solid #eee";
  contextMenu.appendChild(header);

  // Add "No Project" option
  const noProjectOption = document.createElement("div");
  noProjectOption.className = "context-menu-item";
  noProjectOption.textContent = "No Project";
  noProjectOption.style.padding = "5px 10px";
  noProjectOption.style.cursor = "pointer";
  noProjectOption.style.fontSize = "13px";

  noProjectOption.addEventListener("mouseenter", function () {
    this.style.backgroundColor = "#f5f5f5";
  });

  noProjectOption.addEventListener("mouseleave", function () {
    this.style.backgroundColor = "white";
  });

  noProjectOption.addEventListener("click", function () {
    changeTodoProject(todo.id, "none");

    // When changing to "No Project" through the context menu, also update current project filter
    currentProjectId = "none";
    setProjectSelectorValue("none");

    // Save the current project selection to Chrome storage
    chrome.storage.sync.set({
      currentProjectId: currentProjectId,
    });

    removeContextMenu();
  });

  contextMenu.appendChild(noProjectOption);

  // Get all projects and add them to the menu
  chrome.storage.local.get(
    {
      projects: [],
    },
    function (items) {
      if (items.projects.length > 0) {
        // Add a separator
        const separator = document.createElement("div");
        separator.style.height = "1px";
        separator.style.backgroundColor = "#eee";
        separator.style.margin = "5px 0";
        contextMenu.appendChild(separator);

        // Add each project
        items.projects.forEach((project) => {
          const projectOption = document.createElement("div");
          projectOption.className = "context-menu-item";
          projectOption.textContent = project.name;
          projectOption.style.padding = "5px 10px";
          projectOption.style.cursor = "pointer";
          projectOption.style.fontSize = "13px";

          // Highlight current project
          if (todo.projectId === project.id) {
            projectOption.style.backgroundColor = "#e6f7ff";
            projectOption.style.fontWeight = "bold";
          }

          projectOption.addEventListener("mouseenter", function () {
            this.style.backgroundColor =
              todo.projectId === project.id ? "#d1efff" : "#f5f5f5";
          });

          projectOption.addEventListener("mouseleave", function () {
            this.style.backgroundColor =
              todo.projectId === project.id ? "#e6f7ff" : "white";
          });

          projectOption.addEventListener("click", function () {
            changeTodoProject(todo.id, project.id);

            // When changing a todo's project through the context menu, also update current project filter
            currentProjectId = project.id;
            setProjectSelectorValue(project.id);

            // Save the current project selection to Chrome storage
            chrome.storage.sync.set({
              currentProjectId: currentProjectId,
            });

            if (isBoardView) renderBoard();

            removeContextMenu();
          });

          contextMenu.appendChild(projectOption);
        });

        // Add option to create a new project
        const separator2 = document.createElement("div");
        separator2.style.height = "1px";
        separator2.style.backgroundColor = "#eee";
        separator2.style.margin = "5px 0";
        contextMenu.appendChild(separator2);
      }

      // Add "New Project" option
      const newProjectOption = document.createElement("div");
      newProjectOption.className = "context-menu-item";
      newProjectOption.textContent = "+ Create New Project";
      newProjectOption.style.padding = "5px 10px";
      newProjectOption.style.cursor = "pointer";
      newProjectOption.style.fontSize = "13px";
      newProjectOption.style.color = "#28a745";

      newProjectOption.addEventListener("mouseenter", function () {
        this.style.backgroundColor = "#f5f5f5";
      });

      newProjectOption.addEventListener("mouseleave", function () {
        this.style.backgroundColor = "white";
      });

      newProjectOption.addEventListener("click", function () {
        const projectName = prompt("Enter a name for the new project:");
        if (projectName && projectName.trim() !== "") {
          // Create and save the new project
          const projectId = "project_" + Date.now();
          const project = {
            id: projectId,
            name: projectName.trim(),
            createdAt: Date.now(),
          };

          // Save the project to storage
          saveProject(project);

          // Update the selector UI
          addProjectToSelector(project);

          // Assign the todo to this project
          changeTodoProject(todo.id, projectId);

          // Show confirmation notification
          showNotification(
            "Todo assigned to new project: " + projectName.trim()
          );
        }
        removeContextMenu();
      });

      contextMenu.appendChild(newProjectOption);

      // Add the context menu to the document
      document.body.appendChild(contextMenu);

      // Add a click event listener to the document to remove the context menu when clicked outside
      setTimeout(() => {
        document.addEventListener("click", documentClickHandler);
      }, 0);
    }
  );
}

// Function to remove the context menu
function removeContextMenu() {
  const existingMenu = document.getElementById("projectContextMenu");
  if (existingMenu) {
    existingMenu.remove();
    document.removeEventListener("click", documentClickHandler);
  }
}

// Click handler for document to remove context menu
function documentClickHandler(e) {
  const contextMenu = document.getElementById("projectContextMenu");
  if (contextMenu && !contextMenu.contains(e.target)) {
    removeContextMenu();
  }
}

// Add a tooltip about right-clicking TODOs
function addProjectTooltip() {
  const tooltip = document.createElement("div");
  tooltip.id = "projectTooltip";
  tooltip.textContent = "Tip: Right-click on a TODO to assign it to a project";
  tooltip.style.fontSize = "11px";
  tooltip.style.color = "rgba(255,255,255,0.7)";
  tooltip.style.textAlign = "center";
  tooltip.style.padding = "5px";
  tooltip.style.margin = "0 0 5px 0";

  // Add to the project controls container
  const projectControls = document.getElementById("projectControls");
  projectControls.appendChild(tooltip);
}

// Function to set the default dark background
function setDefaultBackground() {
  $("#bodyid").css("background-image", "none");
  $("#bodyid").css("background-color", "#2c3e50");

  // Save the preference
  chrome.storage.local.set(
    {
      useDefaultBackground: true,
    },
    function () {
      // Refresh background images data display after changing
      loadBackgroundImagesData();
    }
  );
}

// Function to initialize background images data display
function initBackgroundImagesData() {
  // Always start with the container hidden for a cleaner UI
  $("#bgImagesDataContainer").hide();
  $("#toggleBgImagesData").text("Show BG Images");

  // Reset the storage value to hidden
  chrome.storage.local.set({ bgImagesDataVisible: false });

  // Load the background images data (but keep it hidden)
  loadBackgroundImagesData();
}

// Function to load and display background images data
function loadBackgroundImagesData() {
  // Get data from both storage types
  chrome.storage.local.get(
    {
      backgroundImages: [],
      photoArrayCountCurrent: 0,
      useDefaultBackground: false,
    },
    function (localItems) {
      // Now get data from sync storage for old-style format
      chrome.storage.sync.get(
        {
          photoPath: null,
          photoArray: null,
          photoArrayCountCurrent: 0,
        },
        function (syncItems) {
          const container = $("#bgImagesData");
          container.empty();

          // Add header
          container.append(
            "<h3 style='margin-top: 0; color: white;'>Background Images</h3>"
          );

          // Display current background status
          const statusDiv = $("<div style='margin-bottom: 20px;'></div>");
          if (localItems.useDefaultBackground) {
            statusDiv.html("<b>Status:</b> Using default background");
          } else {
            statusDiv.html("<b>Status:</b> Using custom background");
          }
          container.append(statusDiv);

          // Display info about both storage types
          const localStorageDiv = $("<div style='margin-bottom: 10px;'></div>");
          localStorageDiv.html("<b>Local Storage:</b>");

          if (
            localItems.backgroundImages &&
            localItems.backgroundImages.length > 0
          ) {
            localStorageDiv.append(
              $(`<div style='margin-left: 10px;'>
                ${localItems.backgroundImages.length} images found<br>
                Current index: ${localItems.photoArrayCountCurrent}
              </div>`)
            );
          } else {
            localStorageDiv.append(
              $("<div style='margin-left: 10px;'>No images found</div>")
            );
          }
          container.append(localStorageDiv);

          // Old-style format info
          const syncStorageDiv = $("<div style='margin-bottom: 20px;'></div>");
          syncStorageDiv.html("<b>Sync Storage (Old Format):</b>");

          if (syncItems.photoPath && syncItems.photoArray) {
            const photos = Array.isArray(syncItems.photoArray)
              ? syncItems.photoArray
              : [syncItems.photoArray];

            syncStorageDiv.append(
              $(`<div style='margin-left: 10px;'>
                Path: ${syncItems.photoPath}<br>
                ${photos.length} images found<br>
                Current index: ${syncItems.photoArrayCountCurrent}<br>
                <span style='font-size: 11px; color: #aaa;'>${photos.join(
                  ", "
                )}</span>
              </div>`)
            );
          } else {
            syncStorageDiv.append(
              $(
                "<div style='margin-left: 10px;'>No old-format data found</div>"
              )
            );
          }
          container.append(syncStorageDiv);

          // Add direct file access option
          const directAccessDiv = $("<div></div>");
          const useDirectButton = $("<button>")
            .text("Use File Path Directly")
            .css({
              background: "#4CAF50",
              color: "white",
              border: "none",
              padding: "8px 10px",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "10px",
            })
            .click(function () {
              if (syncItems.photoPath && syncItems.photoArray) {
                useExplicitFilePaths(syncItems);
              } else {
                useDirectFilePathAsFallback();
              }
            });

          directAccessDiv.append(useDirectButton);
          container.append(directAccessDiv);
        }
      );
    }
  );
}

// Function to toggle background images data visibility
function toggleBgImagesDataVisibility() {
  const container = $("#bgImagesDataContainer");
  const isVisible = container.is(":visible");

  if (isVisible) {
    container.hide();
    $("#toggleBgImagesData").text("Show BG Images");
    chrome.storage.local.set({ bgImagesDataVisible: false });
  } else {
    container.show();
    $("#toggleBgImagesData").text("Hide BG Images");
    chrome.storage.local.set({ bgImagesDataVisible: true });

    // Refresh the data when showing
    loadBackgroundImagesData();
  }
}

// Function to check storage usage and warn if approaching limits
function checkStorageUsage() {
  chrome.storage.sync.getBytesInUse(null, function (bytesInUse) {
    const maxBytes = 102400; // 100KB limit for sync storage
    const usagePercent = (bytesInUse / maxBytes) * 100;
    const remainingBytes = maxBytes - bytesInUse;

    console.log(
      `Storage usage: ${bytesInUse} bytes (${usagePercent.toFixed(1)}%)`
    );

    let message = `Storage: ${(bytesInUse / 1024).toFixed(
      1
    )}KB used (${usagePercent.toFixed(1)}%), ${(remainingBytes / 1024).toFixed(
      1
    )}KB remaining`;

    if (usagePercent > 95) {
      message = `CRITICAL: ${message}. Export data immediately!`;
      showNotification(message);
    } else if (usagePercent > 90) {
      message = `WARNING: ${message}. Consider exporting and cleaning up data.`;
      showNotification(message);
    } else if (usagePercent > 75) {
      message = `CAUTION: ${message}. Monitor usage closely.`;
      showNotification(message);
    } else {
      message = `OK: ${message}`;
      showNotification(message);
    }
  });
}

// Function to show raw Chrome storage data
function showRawStorageData() {
  // Create or get the storage data display container
  let storageDataContainer = $("#storageDataContainer");

  if (storageDataContainer.length === 0) {
    // Create the container if it doesn't exist
    storageDataContainer = $("<div>")
      .attr("id", "storageDataContainer")
      .css({
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        color: "white",
        padding: "20px",
        borderRadius: "10px",
        maxWidth: "80%",
        maxHeight: "80%",
        overflow: "auto",
        zIndex: "1000",
        fontFamily: "monospace",
        fontSize: "12px",
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      })
      .appendTo("body");

    // Add close button
    $("<button>")
      .text("Close")
      .css({
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "rgba(255, 255, 255, 0.3)",
        color: "white",
        border: "none",
        padding: "5px 10px",
        borderRadius: "5px",
        cursor: "pointer",
      })
      .click(function () {
        storageDataContainer.remove();
      })
      .appendTo(storageDataContainer);

    // Add header
    $("<h3>")
      .text("Chrome Storage Data")
      .css({
        marginTop: "0",
        marginBottom: "15px",
        borderBottom: "1px solid #555",
        paddingBottom: "5px",
      })
      .appendTo(storageDataContainer);

    // Create container for sync storage data
    $("<div>")
      .attr("id", "syncStorageData")
      .css({
        marginBottom: "20px",
      })
      .appendTo(storageDataContainer);

    // Create container for local storage data
    $("<div>").attr("id", "localStorageData").appendTo(storageDataContainer);

    // Add container for action buttons
    const actionButtons = $("<div>")
      .css({
        marginTop: "15px",
        display: "flex",
        gap: "10px",
        justifyContent: "center",
      })
      .appendTo(storageDataContainer);

    // Add migrate button
    $("<button>")
      .text("Migrate Images (Sync → Local)")
      .css({
        background: "#4CAF50",
        color: "white",
        border: "none",
        padding: "8px 15px",
        borderRadius: "5px",
        cursor: "pointer",
      })
      .click(function () {
        migrateBackgroundImages();
      })
      .appendTo(actionButtons);

    // Add refresh button
    $("<button>")
      .text("Refresh Data")
      .css({
        background: "#2196F3",
        color: "white",
        border: "none",
        padding: "8px 15px",
        borderRadius: "5px",
        cursor: "pointer",
      })
      .click(function () {
        showRawStorageData();
      })
      .appendTo(actionButtons);
  }

  // Load and display sync storage data
  chrome.storage.sync.get(null, function (syncItems) {
    $("#syncStorageData").html(
      "<h4 style='margin-bottom: 5px;'>chrome.storage.sync:</h4>" +
        "<pre style='background-color: rgba(30, 30, 30, 0.7); padding: 10px; border-radius: 5px;'>" +
        JSON.stringify(syncItems, null, 2) +
        "</pre>"
    );
  });

  // Load and display local storage data (which contains background images)
  chrome.storage.local.get(null, function (localItems) {
    // Create a copy of the data to prevent circular reference issues
    const localItemsCopy = JSON.parse(JSON.stringify(localItems));

    // Calculate total size of background images data
    let totalSize = 0;
    let imagesCount = 0;

    if (
      localItemsCopy.backgroundImages &&
      Array.isArray(localItemsCopy.backgroundImages)
    ) {
      imagesCount = localItemsCopy.backgroundImages.length;

      // For each image, calculate rough size based on data URL length
      localItemsCopy.backgroundImages.forEach((img) => {
        if (img.data) {
          const imgSize = img.data.length * 0.75; // Rough estimate: base64 is ~4/3 the size of binary
          totalSize += imgSize;
          // Truncate data URL for display
          img.data =
            img.data.substring(0, 50) +
            "... [truncated, full length: " +
            img.data.length +
            "]";
        }
      });
    }

    // Format size in KB or MB
    let formattedSize = "0 KB";
    if (totalSize > 0) {
      if (totalSize > 1024 * 1024) {
        formattedSize = (totalSize / (1024 * 1024)).toFixed(2) + " MB";
      } else {
        formattedSize = (totalSize / 1024).toFixed(2) + " KB";
      }
    }

    // Create summary info
    const summaryInfo = `<div style="margin-bottom: 10px;">
      <b>Background Images: ${imagesCount}</b> (Total size: ~${formattedSize})
      <br>Current Index: ${localItemsCopy.photoArrayCountCurrent || 0}
      <br>Using Default Background: ${
        localItemsCopy.useDefaultBackground ? "Yes" : "No"
      }
    </div>`;

    $("#localStorageData").html(
      "<h4 style='margin-bottom: 5px;'>chrome.storage.local:</h4>" +
        summaryInfo +
        "<pre style='background-color: rgba(30, 30, 30, 0.7); padding: 10px; border-radius: 5px;'>" +
        JSON.stringify(localItemsCopy, null, 2) +
        "</pre>"
    );
  });
}

// Function to migrate TODOs and projects from sync to local storage
function migrateTodosToLocal() {
  if (
    !confirm(
      "This will migrate your TODOs and projects from sync storage to local storage for higher capacity. Continue?"
    )
  ) {
    return;
  }

  chrome.storage.sync.get(
    {
      todos: [],
      deletedTodos: [],
      projects: [],
      currentProjectId: "all",
    },
    function (syncItems) {
      // Check if there's data to migrate
      const hasData =
        syncItems.todos.length > 0 ||
        syncItems.deletedTodos.length > 0 ||
        syncItems.projects.length > 0;

      if (!hasData) {
        showNotification("No TODO data found in sync storage to migrate.");
        return;
      }

      // Get current local storage data
      chrome.storage.local.get(
        {
          todos: [],
          deletedTodos: [],
          projects: [],
          currentProjectId: "all",
        },
        function (localItems) {
          // Merge data (local takes precedence for duplicates)
          const mergedData = {
            todos: [
              ...localItems.todos,
              ...syncItems.todos.filter(
                (syncTodo) =>
                  !localItems.todos.some(
                    (localTodo) => localTodo.id === syncTodo.id
                  )
              ),
            ],
            deletedTodos: [
              ...localItems.deletedTodos,
              ...syncItems.deletedTodos.filter(
                (syncTodo) =>
                  !localItems.deletedTodos.some(
                    (localTodo) => localTodo.id === syncTodo.id
                  )
              ),
            ],
            projects: [
              ...localItems.projects,
              ...syncItems.projects.filter(
                (syncProject) =>
                  !localItems.projects.some(
                    (localProject) => localProject.id === syncProject.id
                  )
              ),
            ],
            currentProjectId:
              localItems.currentProjectId || syncItems.currentProjectId,
          };

          // Save merged data to local storage
          chrome.storage.local.set(mergedData, function () {
            if (chrome.runtime.lastError) {
              console.error("Migration error:", chrome.runtime.lastError);
              showNotification(
                "Migration failed: " + chrome.runtime.lastError.message
              );
              return;
            }

            showNotification(
              `Migration successful! Migrated ${syncItems.todos.length} TODOs, ${syncItems.deletedTodos.length} deleted TODOs, and ${syncItems.projects.length} projects.`
            );

            // Refresh the page to load from local storage
            setTimeout(function () {
              location.reload();
            }, 2000);
          });
        }
      );
    }
  );
}

// Function to migrate background images from sync to local storage
function migrateBackgroundImages() {
  // First, get data from sync storage
  chrome.storage.sync.get(null, function (syncItems) {
    // Check if we have background images in sync storage
    if (
      syncItems.backgroundImages &&
      Array.isArray(syncItems.backgroundImages) &&
      syncItems.backgroundImages.length > 0
    ) {
      // Get current local storage data
      chrome.storage.local.get(null, function (localItems) {
        // Prepare to update local storage with images from sync
        const updatedLocalItems = {
          ...localItems,
          backgroundImages: syncItems.backgroundImages,
          photoArrayCountCurrent: 0,
          useDefaultBackground: false,
        };

        // Save to local storage
        chrome.storage.local.set(updatedLocalItems, function () {
          // Show success notification
          showNotification(
            `Migrated ${syncItems.backgroundImages.length} images from sync to local storage`
          );

          // Refresh the page to apply changes
          setTimeout(function () {
            location.reload();
          }, 1500);
        });
      });
    } else {
      showNotification(
        "No background images found in sync storage to migrate."
      );
    }
  });
}

// New function to check both storage types for background images
function checkAndLoadBackgroundImage() {
  // First, run migration to clear old user-uploaded images and use bundled backgrounds
  chrome.storage.local.get({ clearedOldBackgroundImages: false }, function(migrationCheck) {
    if (!migrationCheck.clearedOldBackgroundImages) {
      chrome.storage.local.set({
        backgroundImages: [],
        clearedOldBackgroundImages: true,
        photoSourceType: "bundled",
        bundledBgIndex: 0,
        currentBgFilename: bundledBackgrounds.length > 0 ? bundledBackgrounds[0] : null
      }, function() {
        loadBundledBackground(0);
      });
      return;
    }

    chrome.storage.local.get(
      {
        useDefaultBackground: null,
        photoSourceType: null,
        bundledBgIndex: 0,
        currentBgFilename: null,
        backgroundImages: [],
        photoArrayCountCurrent: 0,
      },
      function (preferences) {
        // If user has explicitly chosen to use default background, respect that
        if (preferences.useDefaultBackground === true) {
          setDefaultBackground();
          return;
        }

        // If user has uploaded custom images, use those
        if (preferences.backgroundImages && preferences.backgroundImages.length > 0) {
          loadInitialBackgroundImage();
          return;
        }

        // Otherwise, use bundled backgrounds from the backgrounds/ folder
        if (bundledBackgrounds && bundledBackgrounds.length > 0) {
          // Try to find the image by filename first (persists across list changes)
          let indexToLoad = 0;
          if (preferences.currentBgFilename) {
            const foundIndex = bundledBackgrounds.indexOf(preferences.currentBgFilename);
            if (foundIndex !== -1) {
              indexToLoad = foundIndex;
            } else {
              // Filename not found (image was removed), fall back to saved index or 0
              indexToLoad = Math.min(preferences.bundledBgIndex || 0, bundledBackgrounds.length - 1);
            }
          } else {
            indexToLoad = preferences.bundledBgIndex || 0;
          }

          loadBundledBackground(indexToLoad);
          return;
        }

        // Fallback to default solid color
        setDefaultBackground();
      }
    );
  });
}

// Load a bundled background image from the backgrounds/ folder
function loadBundledBackground(index) {
  if (!bundledBackgrounds || bundledBackgrounds.length === 0) {
    console.error("No bundled backgrounds available!");
    setDefaultBackground();
    return;
  }

  // Ensure index is within bounds
  if (index < 0) index = bundledBackgrounds.length - 1;
  index = index % bundledBackgrounds.length;

  // Use chrome.runtime.getURL for cross-platform compatibility
  const bgPath = chrome.runtime.getURL(bundledBackgrounds[index]);

  const bodyEl = document.getElementById("bodyid");
  if (!bodyEl) {
    console.error("Body element not found!");
    return;
  }

  // Preload the image to check if it loads successfully
  const img = new Image();
  img.onload = function() {
    bodyEl.style.backgroundImage = `url("${bgPath}")`;
    bodyEl.style.backgroundColor = "";

    // Save the current index and filename only after successful load
    chrome.storage.local.set({
      bundledBgIndex: index,
      currentBgFilename: bundledBackgrounds[index],
      useDefaultBackground: false,
      photoSourceType: "bundled",
    }, function() {
      const filename = bundledBackgrounds[index].split('/').pop();
      showNotification(`${index + 1}/${bundledBackgrounds.length}: ${filename}`);
    });
  };
  img.onerror = function() {
    console.error("Failed to load image:", bgPath);
    // Try the next image if this one fails
    const nextIndex = (index + 1) % bundledBackgrounds.length;
    if (nextIndex !== index) {
      loadBundledBackground(nextIndex);
    } else {
      console.error("All images failed to load!");
      setDefaultBackground();
    }
  };
  img.src = bgPath;
}

// This is the main function that tries multiple sources in order
function tryLoadFromAllSources() {
  console.log("Trying to load background from all sources...");

  // First, try to use backgroundImages array in local storage (from options page uploads)
  chrome.storage.local.get(
    {
      backgroundImages: [],
      photoArrayCountCurrent: 0,
    },
    function (localItems) {
      console.log("Checking local storage backgroundImages:", localItems);

      if (
        localItems.backgroundImages &&
        localItems.backgroundImages.length > 0
      ) {
        console.log(
          `Found ${localItems.backgroundImages.length} images in local storage`
        );
        loadInitialBackgroundImage();
        return;
      }

      // Second, try to load from photoPath and photoArray in sync storage (filesystem paths)
      tryLoadFromFilesystem();
    }
  );
}

// Try to load from filesystem paths stored in sync storage
function tryLoadFromFilesystem() {
  chrome.storage.sync.get(
    {
      photoPath: null,
      photoArray: null,
      photoArrayCountCurrent: 0,
    },
    function (syncItems) {
      console.log("Checking sync storage for file paths:", syncItems);

      if (syncItems.photoPath && syncItems.photoArray) {
        console.log("Found file paths in sync storage:", syncItems);

        // Try to use explicit file paths
        if (useExplicitFilePaths(syncItems)) {
          console.log("Successfully loaded background from file paths");
          return;
        }
      }

      // Third, try to use backgroundImages in sync storage (legacy location)
      tryLoadFromSyncBackgroundImages();
    }
  );
}

// Try to load from backgroundImages array in sync storage (legacy location)
function tryLoadFromSyncBackgroundImages() {
  chrome.storage.sync.get(
    {
      backgroundImages: [],
    },
    function (syncItems) {
      console.log("Checking sync storage for backgroundImages:", syncItems);

      if (syncItems.backgroundImages && syncItems.backgroundImages.length > 0) {
        console.log(
          `Found ${syncItems.backgroundImages.length} images in sync storage backgroundImages`
        );

        // Migrate images from sync to local
        chrome.storage.local.set(
          {
            backgroundImages: syncItems.backgroundImages,
            photoArrayCountCurrent: 0,
            useDefaultBackground: false,
            photoSourceType: "encoded", // Mark that we're using encoded images
          },
          function () {
            console.log("Images migrated from sync to local storage");
            showNotification(
              "Background images migrated from sync to local storage"
            );

            // Now load the background image from local storage
            loadInitialBackgroundImage();
          }
        );
        return;
      }

      // Finally, fall back to hardcoded path or default
      console.log("No background images found in any storage, using fallback");
      if (!useDirectFilePathAsFallback()) {
        setDefaultBackground();
      }
    }
  );
}

// Function to use explicit file paths from storage
function useExplicitFilePaths(items) {
  try {
    let path = items.photoPath;
    let photos = Array.isArray(items.photoArray)
      ? items.photoArray
      : [items.photoArray];
    let index = items.photoArrayCountCurrent || 0;

    if (index >= photos.length) index = 0;

    // Handle both forward and backslash path separators
    const separator = path.includes("/") ? "/" : "\\";
    const endsWithSeparator = path.endsWith("/") || path.endsWith("\\");

    // Construct the full path with proper separator
    const photoPath = endsWithSeparator ? path : path + separator;
    const photoFile = photos[index];
    const fullPath = photoPath + photoFile;

    console.log(`Setting background to: ${fullPath}`);

    // Set the background image directly
    const bodyEl = document.getElementById("bodyid");
    if (bodyEl) {
      bodyEl.style.backgroundImage = `url(${fullPath})`;
      bodyEl.style.backgroundColor = "";
    }

    // Save that we're not using default background
    chrome.storage.local.set(
      {
        useDefaultBackground: false,
        currentPhotoPath: fullPath, // Store the current path for troubleshooting
        photoSourceType: "filesystem", // Mark that we're using filesystem
      },
      function () {
        // Show notification
        showNotification(`Loaded background: ${photoFile}`);

        // Update background images data
        loadBackgroundImagesData();
      }
    );

    return true; // Success
  } catch (error) {
    console.error("Error setting background from explicit path:", error);
    return false; // Failed
  }
}

// Function to use a direct file path as a last resort
function useDirectFilePathAsFallback() {
  try {
    // Hardcoded path from your data
    const fullPath =
      "file:///Users/davidhudman/Pictures/backgrounds/derick-daily-xw69fz33sKg-unsplash.jpg";

    console.log(`Setting background to fallback: ${fullPath}`);

    // Set the background image directly
    const bodyEl = document.getElementById("bodyid");
    if (bodyEl) {
      bodyEl.style.backgroundImage = `url(${fullPath})`;
      bodyEl.style.backgroundColor = "";
    }

    // Save that we're not using default background
    chrome.storage.local.set(
      {
        useDefaultBackground: false,
        currentPhotoPath: fullPath,
        photoSourceType: "filesystem",
      },
      function () {
        // Show notification
        showNotification("Loaded fallback background image");

        // Update background images data
        loadBackgroundImagesData();
      }
    );

    return true; // Success
  } catch (error) {
    console.error("Error setting fallback background:", error);
    return false; // Failed
  }
}

// Text size control functions
function initTextSizes() {
  chrome.storage.sync.get(
    {
      clockFontSize: 128,
      greetingFontSize: 96,
    },
    function (items) {
      // Apply stored font sizes
      const timeEl = document.getElementById("time");
      if (timeEl) timeEl.style.fontSize = items.clockFontSize + "px";
      const helloEl = document.getElementById("helloText");
      if (helloEl) helloEl.style.fontSize = items.greetingFontSize + "px";

      // Update display values
      const clockDisp = document.getElementById("clockSizeDisplay");
      if (clockDisp) clockDisp.textContent = items.clockFontSize + "px";
      const greetDisp = document.getElementById("greetingSizeDisplay");
      if (greetDisp) greetDisp.textContent = items.greetingFontSize + "px";
    }
  );
}

function adjustTextSize(type, change) {
  const storageKey = type === "clock" ? "clockFontSize" : "greetingFontSize";
  const elementId = type === "clock" ? "time" : "helloText";
  const displayId =
    type === "clock" ? "clockSizeDisplay" : "greetingSizeDisplay";
  const defaultSize = type === "clock" ? 128 : 96;
  const minSize = type === "clock" ? 32 : 24;
  const maxSize = type === "clock" ? 256 : 192;

  chrome.storage.sync.get(
    {
      [storageKey]: defaultSize,
    },
    function (items) {
      let newSize = items[storageKey] + change;

      // Enforce min/max limits
      if (newSize < minSize) newSize = minSize;
      if (newSize > maxSize) newSize = maxSize;

      // Apply the new size
      const el = document.getElementById(elementId);
      if (el) el.style.fontSize = newSize + "px";
      const disp = document.getElementById(displayId);
      if (disp) disp.textContent = newSize + "px";

      // Save to storage
      chrome.storage.sync.set({
        [storageKey]: newSize,
      });
    }
  );
}

function resetTextSize(type) {
  const storageKey = type === "clock" ? "clockFontSize" : "greetingFontSize";
  const elementId = type === "clock" ? "time" : "helloText";
  const displayId =
    type === "clock" ? "clockSizeDisplay" : "greetingSizeDisplay";
  const defaultSize = type === "clock" ? 128 : 96;

  // Apply default size
  const el = document.getElementById(elementId);
  if (el) el.style.fontSize = defaultSize + "px";
  const disp = document.getElementById(displayId);
  if (disp) disp.textContent = defaultSize + "px";

  // Save to storage
  chrome.storage.sync.set({
    [storageKey]: defaultSize,
  });
}

// Countdown Timer Variables - moved to timer-module.js

// Timer helper functions moved to timer-module.js

// Save timer state to Chrome local storage
function saveTimerState() {
  if (typeof chrome !== "undefined" && chrome.storage) {
    const timerState = {
      isRunning: isRunning,
      isPaused: isPaused,
      isCountingUp: isCountingUp,
      totalSeconds: totalSeconds,
      countUpSeconds: countUpSeconds,
      timerStartTime: timerStartTime,
      pausedDuration: pausedDuration,
      initialTotalSeconds: window.initialTotalSeconds || totalSeconds,
      timeInput: $("#timerDisplay").text(),
      timerLabel: $("#timerLabel").text().trim(),
      savedAt: Date.now(),
    };

    chrome.storage.local.set({ timerState: timerState }, function () {
      console.log("Timer state saved:", timerState);
    });
  }
}

// Load timer state from Chrome local storage
function loadTimerState(callback) {
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.local.get("timerState", function (result) {
      if (result.timerState) {
        const state = result.timerState;
        const now = Date.now();
        const timeSinceSave = (now - state.savedAt) / 1000; // Convert to seconds

        // Don't restore if the timer was reset (totalSeconds is 0 and not running/paused)
        if (
          state.totalSeconds === 0 &&
          !state.isRunning &&
          !state.isPaused &&
          !state.isCountingUp
        ) {
          console.log("Timer was reset, not restoring state");
          if (callback) callback();
          return;
        }

        // Restore timer label
        if (state.timerLabel) {
          $("#timerLabel").text(state.timerLabel);
        }

        // Calculate current timer values based on saved state
        if (state.isRunning && !state.isPaused) {
          // Timer was running - calculate elapsed time since it started
          if (!state.isCountingUp) {
            // Countdown mode - calculate remaining time
            const elapsedSinceStart = (now - state.timerStartTime) / 1000;
            totalSeconds = Math.max(
              0,
              Math.floor(state.initialTotalSeconds - elapsedSinceStart)
            );

            if (totalSeconds === 0 && state.initialTotalSeconds > 0) {
              // Timer completed while tab was closed
              isCountingUp = true;
              countUpSeconds = Math.floor(
                elapsedSinceStart - state.initialTotalSeconds
              );
            }
          } else {
            // Count up mode - add elapsed time
            isCountingUp = true;
            countUpSeconds = Math.floor(state.countUpSeconds + timeSinceSave);
          }

          // Set initial total seconds for proper tracking
          window.initialTotalSeconds = state.initialTotalSeconds;

          // Resume the timer
          isRunning = false; // Set to false so we can properly start it
          isPaused = false;
          timerStartTime = state.timerStartTime; // Keep original start time
          pausedDuration = 0;

          // Start the timer after a brief delay to ensure UI is ready
          setTimeout(function () {
            if (!isCountingUp || totalSeconds > 0) {
              // Don't call startTimer as it resets the start time
              // Instead, directly set up the interval
              isRunning = true;
              $("#startPauseBtn").text("Pause").css("background", "#ffc107");
              $("#timerDisplay").attr("contenteditable", "false");

              countdownInterval = setInterval(function () {
                if (!isCountingUp) {
                  totalSeconds--;
                  updateTimerDisplay();

                  if (totalSeconds <= 0) {
                    timerComplete();
                  }
                } else {
                  countUpSeconds++;
                  updateTimerDisplay();
                }

                // Save state periodically while running
                saveTimerState();
              }, 1000);

              updateTimerDisplay();
              saveTimerState();
            } else {
              // For count-up mode after timer completion
              resumeCountUp();
            }
          }, 100);
        } else if (state.isPaused) {
          // Timer was paused - restore paused state
          totalSeconds = state.totalSeconds;
          countUpSeconds = state.countUpSeconds;
          isCountingUp = state.isCountingUp;
          isPaused = true;
          isRunning = false;
          pausedDuration = state.pausedDuration;
          timerStartTime = state.timerStartTime;
          window.initialTotalSeconds = state.initialTotalSeconds;

          $("#startPauseBtn").text("Resume").css("background", "#28a745");
          $("#timeInput").prop("disabled", true);
          updateTimerDisplay();
        }

        if (callback) callback();
      } else {
        if (callback) callback();
      }
    });
  } else {
    if (callback) callback();
  }
}

// initCountdownTimer moved to timer-module.js

// startTimer moved to timer-module.js

// pauseTimer moved to timer-module.js

// resumeTimer moved to timer-module.js

// resetTimer moved to timer-module.js

// resumeCountUp moved to timer-module.js

// Timer display functions moved to timer-module.js

// timerComplete moved to timer-module.js

// parseTimeInput moved to timer-module.js

// toggleTimerVisibility moved to timer-module.js

// showTimerNotification moved to timer-module.js

// Make timer persistence functions available to timer module
window.saveTimerState = saveTimerState;
window.loadTimerState = loadTimerState;
