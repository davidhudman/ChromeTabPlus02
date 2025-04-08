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

  // Remove the simple time click handler
  // $("#time").click(function () {
  //   previousImageInChromeStoragePhotoArray();
  // });

  // Add a more sophisticated click handler for the time
  $("#time").click(function (e) {
    // Get click position relative to the time element
    const timeEl = document.getElementById("time");
    const rect = timeEl.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const timeWidth = rect.width;

    // If click is on the right half (minutes), go backward
    if (clickX > timeWidth * 0.67) {
      previousImageInChromeStoragePhotoArray();
    }
    // If click is on the left third (hours), go forward
    else if (clickX < timeWidth * 0.33) {
      nextImageInChromeStoragePhotoArray();
    }
    // If click is in the middle (colon), toggle default background
    else {
      // Check current background state and toggle
      chrome.storage.local.get(
        {
          backgroundImages: [],
          useDefaultBackground: false,
        },
        function (items) {
          console.log("Toggle background - Current state:", items);

          if (items.useDefaultBackground) {
            // Currently using default background, try to switch to custom
            if (items.backgroundImages && items.backgroundImages.length > 0) {
              console.log(
                "Switching to custom background:",
                items.backgroundImages[0]
              );

              // Switch to first custom background
              $("#bodyid").css(
                "background-image",
                `url(${items.backgroundImages[0].data})`
              );
              $("#bodyid").css("background-color", "");

              // Save the state
              chrome.storage.local.set({
                photoArrayCountCurrent: 0,
                useDefaultBackground: false,
              });
            } else {
              // No custom backgrounds available
              showNotification(
                "No custom backgrounds available. Add images in extension options."
              );
            }
          } else {
            // Currently using custom background, switch to default
            setDefaultBackground();
          }
        }
      );
    }
  });

  // Use delegated event handler for the background tip with dual approach
  $(document).on("click", "#backgroundTip", function () {
    // Just trigger the time click for consistency
    $("#time").trigger("click");
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

  // Add event listener for exporting as JSON
  $("#exportJsonBtn").click(function () {
    exportAsJson();
  });

  // Add event listener for importing from JSON
  $("#importJsonBtn").click(function () {
    importFromJson();
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

  // Modify the backgroundTip content when DOM is ready
  $(document).ready(function () {
    // Update backgroundTip content
    $("#backgroundTip").html(`
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
    `);
  });

  // Initialize background image data display
  initBackgroundImagesData();

  // Toggle background images data visibility
  $("#toggleBgImagesData").click(function () {
    toggleBgImagesDataVisibility();
  });

  // Add event listener for showing raw storage data
  $("#showRawStorageData").click(function () {
    showRawStorageData();
  });
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
  // First check what type of photo source we're using
  chrome.storage.local.get(
    {
      photoSourceType: null,
    },
    function (preferences) {
      if (preferences.photoSourceType === "filesystem") {
        // Using filesystem photos, get from sync storage
        nextFilesystemImage();
      } else {
        // Using encoded images, use standard method
        loadBackgroundImage();
      }
    }
  );
}

function previousImageInChromeStoragePhotoArray() {
  // First check what type of photo source we're using
  chrome.storage.local.get(
    {
      photoSourceType: null,
    },
    function (preferences) {
      if (preferences.photoSourceType === "filesystem") {
        // Using filesystem photos, get from sync storage
        previousFilesystemImage();
      } else {
        // Using encoded images, use standard method
        previousEncodedImage();
      }
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
  // getStoredData(); // Replace with our new function
  checkAndLoadBackgroundImage(); // Replace loadInitialBackgroundImage with our new function
  displayWeatherData();
  var myVar = setInterval(displayTime, 1000);
  // Refresh weather every 30 minutes
  // setInterval(displayWeatherData, 1800000);
  // nextImage();

  // Removing the automatic background rotation
  // setInterval(loadBackgroundImage, 300000);
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

      if (newVisibility) {
        $(elementSelector).show();
        const toggleBtn =
          elementSelector === "#notes"
            ? $("#toggleTopNotes")
            : $("#toggleBottomNotes");
        toggleBtn.text("Hide Notes");
      } else {
        // Simply hide the notes without asking to clear them
        $(elementSelector).hide();
        const toggleBtn =
          elementSelector === "#notes"
            ? $("#toggleTopNotes")
            : $("#toggleBottomNotes");
        toggleBtn.text("Show Notes");
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

// TODO Feature functions
function initTodos() {
  // Initialize projects first
  initProjects();

  // Load saved TODOs from storage
  chrome.storage.sync.get(
    {
      todos: [], // Default empty array
      deletedTodos: [], // Default empty array for deleted todos
    },
    function (items) {
      // Only render the deleted TODOs here since active ones are rendered by refreshTodoList()
      // that gets called at the end of initProjects()
      items.deletedTodos.forEach((todo) => {
        renderTodo(todo, true);
      });

      // Make sure project controls are visible when in active view mode
      if (viewMode === 0) {
        $("#projectControls").show();
      }
    }
  );
}

// Initialize projects functionality
function initProjects() {
  // Load saved projects from storage
  chrome.storage.sync.get(
    {
      projects: [], // Default empty array
      currentProjectId: "all", // Default to "all" projects
    },
    function (items) {
      // Set the current project ID from storage
      currentProjectId = items.currentProjectId;

      // Create project selector dropdown
      createProjectSelector(items.projects);

      // Set the selector to the saved project
      const projectSelector = document.getElementById("projectSelector");
      if (projectSelector) {
        projectSelector.value = currentProjectId;
      }

      // Add button for creating new projects
      createNewProjectButton();

      // Add a tooltip about right-clicking TODOs to assign projects
      addProjectTooltip();

      // Show the project controls in active view
      if (viewMode === 0) {
        $("#projectControls").show();
      }

      // Refresh the todo list to show the correct project's todos
      refreshTodoList();
    }
  );
}

// Create the project selector dropdown
function createProjectSelector(projects) {
  // Create the container for the project selector
  const selectorContainer = document.createElement("div");
  selectorContainer.id = "projectSelectorContainer";
  selectorContainer.style.marginBottom = "10px";

  // Create label for the dropdown
  const label = document.createElement("label");
  label.htmlFor = "projectSelector";
  label.textContent = "Project: ";
  label.style.marginRight = "5px";
  label.style.color = "white";

  // Create the dropdown
  const select = document.createElement("select");
  select.id = "projectSelector";
  select.style.padding = "5px";
  select.style.borderRadius = "4px";
  select.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  select.style.color = "white";
  select.style.border = "none";

  // Add "All Projects" option
  const allOption = document.createElement("option");
  allOption.value = "all";
  allOption.textContent = "All Projects";
  select.appendChild(allOption);

  // Add "No Project" option for TODOs without a project
  const noProjectOption = document.createElement("option");
  noProjectOption.value = "none";
  noProjectOption.textContent = "No Project";
  select.appendChild(noProjectOption);

  // Add options for each project
  projects.forEach((project) => {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.name;
    select.appendChild(option);
  });

  // Add change event listener
  select.addEventListener("change", function () {
    currentProjectId = this.value;
    refreshTodoList();

    // Save the current project selection to Chrome storage
    chrome.storage.sync.set({
      currentProjectId: currentProjectId,
    });
  });

  // Add elements to container
  selectorContainer.appendChild(label);
  selectorContainer.appendChild(select);

  // Add to the project controls container
  const projectControls = document.getElementById("projectControls");
  projectControls.innerHTML = ""; // Clear existing content
  projectControls.appendChild(selectorContainer);
  projectControls.style.display = "block"; // Make it visible
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
    document.getElementById("projectSelector").value = projectId;
    currentProjectId = projectId;

    // Save the current project selection to Chrome storage
    chrome.storage.sync.set({
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
  chrome.storage.sync.get(
    {
      projects: [],
    },
    function (items) {
      // Add the new project to the array
      const projects = items.projects;
      projects.push(project);

      // Save the updated array
      chrome.storage.sync.set({
        projects: projects,
      });
    }
  );
}

// Update the createNewTodo function to include project association
function createNewTodo() {
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
  };

  // Render the new TODO in the UI
  renderTodo(todo, false);

  // Save the new TODO to storage
  saveTodo(todo);
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
      chrome.storage.sync.get(
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
      // Ensure we're preserving line breaks in the description
      if (todo.description) {
        // Make sure we're not losing any line breaks
        todo.description = todo.description;
      }

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
        // Ensure we're preserving line breaks in the description
        if (updatedTodo.description) {
          // Make sure we're not losing any line breaks
          updatedTodo.description = updatedTodo.description;
        }

        todos[index] = updatedTodo;

        // Save the updated array
        chrome.storage.sync.set(
          {
            todos: todos,
          },
          function () {
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
  chrome.storage.sync.get(
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
      chrome.storage.sync.set(
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
  chrome.storage.sync.get(
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
      chrome.storage.sync.set(
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

// Function to refresh the todo list UI
function refreshTodoList() {
  // Only refresh active todos if we're in active view
  if (viewMode === 0) {
    // Clear the todo list container
    const todoList = document.getElementById("todoList");
    todoList.innerHTML = "";

    // Re-render all todos based on current project filter
    chrome.storage.sync.get(
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
    // Switch to deleted view
    viewMode = 1;
    $("#toggleTodoViewBtn").text("Back");
    $("#activeTodosContainer").hide();
    $("#deletedTodosContainer").show();
    $("#projectControls").hide();
    $("#addTodoBtn").hide();
  } else {
    // Switch to active view
    viewMode = 0;
    $("#toggleTodoViewBtn").text("Settings");
    $("#activeTodosContainer").show();
    $("#deletedTodosContainer").hide();
    $("#projectControls").show();
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
    $("#toggleTodosVisibilityBtn").text("Show");
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

// Add a function to change a todo's project
function changeTodoProject(todoId, projectId) {
  chrome.storage.sync.get(
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
        chrome.storage.sync.set(
          {
            todos: todos,
          },
          function () {
            // Refresh the todo list
            refreshTodoList();
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
    document.getElementById("projectSelector").value = "none";

    // Save the current project selection to Chrome storage
    chrome.storage.sync.set({
      currentProjectId: currentProjectId,
    });

    removeContextMenu();
  });

  contextMenu.appendChild(noProjectOption);

  // Get all projects and add them to the menu
  chrome.storage.sync.get(
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
            document.getElementById("projectSelector").value = project.id;

            // Save the current project selection to Chrome storage
            chrome.storage.sync.set({
              currentProjectId: currentProjectId,
            });

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
  // Initially check from storage if the container should be visible
  chrome.storage.local.get(
    {
      bgImagesDataVisible: false,
    },
    function (items) {
      if (items.bgImagesDataVisible) {
        $("#bgImagesDataContainer").show();
        $("#toggleBgImagesData").text("Hide BG Images");
      } else {
        $("#bgImagesDataContainer").hide();
        $("#toggleBgImagesData").text("Show BG Images");
      }

      // Load the background images data
      loadBackgroundImagesData();
    }
  );
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
  console.log("Checking for background images in both storage types...");

  // Check if the user has explicitly set useDefaultBackground
  chrome.storage.local.get(
    {
      useDefaultBackground: null, // null means not set yet
      photoSourceType: null, // null means not determined yet
      currentPhotoPath: null, // path to the current photo if using filesystem
    },
    function (preferences) {
      console.log("Stored preferences:", preferences);

      // If user has explicitly chosen to use default background, respect that
      if (preferences.useDefaultBackground === true) {
        console.log("User preference: default background");
        setDefaultBackground();
        return;
      }

      // If user was previously using filesystem source, try that first
      if (
        preferences.photoSourceType === "filesystem" &&
        preferences.currentPhotoPath
      ) {
        console.log(
          "Previously using filesystem source:",
          preferences.currentPhotoPath
        );
        tryLoadFromFilesystem();
        return;
      }

      // Try loading from all sources, starting with the most likely to succeed
      tryLoadFromAllSources();
    }
  );
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
    $("#bodyid").css("background-image", `url(${fullPath})`);
    $("#bodyid").css("background-color", "");

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
    $("#bodyid").css("background-image", `url(${fullPath})`);
    $("#bodyid").css("background-color", "");

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
