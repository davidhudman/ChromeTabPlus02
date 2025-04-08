// Global variable to store selected images
let selectedImages = [];

// Initialize the options page
document.addEventListener("DOMContentLoaded", function () {
  // Restore saved options
  restoreOptions();

  // Set up event listeners
  document.getElementById("save").addEventListener("click", saveOptions);
  document.getElementById("default").addEventListener("click", restoreDefaults);
  document
    .getElementById("backgroundImages")
    .addEventListener("change", handleImageSelection);
});

// Handle the selection of background images
function handleImageSelection(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  // Clear previous selections
  selectedImages = [];

  // Process each selected file
  Array.from(files).forEach((file) => {
    // Only process image files
    if (!file.type.match("image.*")) return;

    // Create file reader to process the image
    const reader = new FileReader();

    reader.onload = function (event) {
      const imageData = event.target.result;

      // Store the image data
      selectedImages.push({
        name: file.name,
        data: imageData,
      });

      // Show preview of the image
      addImagePreview(imageData);
    };

    // Read the image as a data URL
    reader.readAsDataURL(file);
  });

  // Show status message
  showStatus(`${files.length} image(s) selected`);
}

// Add image preview to the container
function addImagePreview(imageData) {
  const container = document.getElementById("imagePreviewContainer");

  // Create image element
  const img = document.createElement("img");
  img.src = imageData;
  img.className = "image-thumbnail";
  img.alt = "Background preview";

  // Add to container
  container.appendChild(img);
}

// Save options to chrome.storage
function saveOptions() {
  // Get values from form fields
  const zipcode = document.getElementById("zipcode").value;
  const stocks = document.getElementById("stocks").value;

  // Save basic settings to sync storage
  chrome.storage.sync.set(
    {
      zip: zipcode,
      stocks: stocks,
    },
    function () {
      console.log("Basic settings saved to sync storage");
    }
  );

  // Save background images to local storage (they can be large)
  if (selectedImages.length > 0) {
    chrome.storage.local.set(
      {
        backgroundImages: selectedImages,
        photoArrayCountCurrent: 0,
        useDefaultBackground: false,
      },
      function () {
        console.log(
          `${selectedImages.length} background images saved to local storage`
        );
        showStatus("Settings and background images saved successfully!");
      }
    );
  } else {
    showStatus("Settings saved successfully!");
  }
}

// Restore options from chrome.storage
function restoreOptions() {
  // Get basic options from sync storage
  chrome.storage.sync.get(
    {
      // Default values
      zip: "",
      stocks: "",
    },
    function (syncItems) {
      // Populate form fields
      document.getElementById("zipcode").value = syncItems.zip;
      document.getElementById("stocks").value = syncItems.stocks;

      // Get background images from local storage
      chrome.storage.local.get(
        {
          backgroundImages: [],
        },
        function (localItems) {
          // If no images in local storage, check sync storage (for backward compatibility)
          if (
            !localItems.backgroundImages ||
            localItems.backgroundImages.length === 0
          ) {
            chrome.storage.sync.get(
              {
                backgroundImages: [],
              },
              function (oldSyncItems) {
                if (
                  oldSyncItems.backgroundImages &&
                  oldSyncItems.backgroundImages.length > 0
                ) {
                  // Migrate images from sync to local
                  selectedImages = oldSyncItems.backgroundImages;

                  // Save to local storage
                  chrome.storage.local.set(
                    {
                      backgroundImages: selectedImages,
                      photoArrayCountCurrent: 0,
                      useDefaultBackground: false,
                    },
                    function () {
                      console.log(
                        `Migrated ${selectedImages.length} images from sync to local storage`
                      );

                      // Display previews
                      displayImagePreviews(selectedImages);
                    }
                  );
                }
              }
            );
          } else {
            // Use images from local storage
            selectedImages = localItems.backgroundImages;

            // Display previews
            displayImagePreviews(selectedImages);
          }
        }
      );
    }
  );
}

// Helper function to display image previews
function displayImagePreviews(images) {
  if (images && images.length > 0) {
    // Show previews for stored images
    const container = document.getElementById("imagePreviewContainer");
    container.innerHTML = ""; // Clear container

    images.forEach((image) => {
      addImagePreview(image.data);
    });

    showStatus(`${images.length} saved background images loaded`);
  }
}

// Restore default settings
function restoreDefaults() {
  // Set default values in sync storage
  chrome.storage.sync.set(
    {
      zip: "",
      stocks: "",
    },
    function () {
      console.log("Default basic settings restored");
    }
  );

  // Clear background images in local storage
  chrome.storage.local.set(
    {
      backgroundImages: [],
      photoArrayCountCurrent: 0,
      useDefaultBackground: true,
    },
    function () {
      console.log("Background images cleared from local storage");

      // Clear image previews
      document.getElementById("imagePreviewContainer").innerHTML = "";
      selectedImages = [];

      // Reset form fields
      document.getElementById("zipcode").value = "";
      document.getElementById("stocks").value = "";

      showStatus("Default settings restored");
    }
  );
}

// Show status message
function showStatus(message) {
  const status = document.getElementById("status");
  status.textContent = message;
  status.style.display = "block";

  // Hide after delay
  setTimeout(function () {
    status.style.display = "none";
  }, 3000);
}
