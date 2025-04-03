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

  // Prepare data for storage
  const data = {
    zip: zipcode,
    stocks: stocks,
    backgroundImages: selectedImages,
    numberPhotos: selectedImages.length,
  };

  // Save to chrome.storage
  chrome.storage.sync.set(data, function () {
    showStatus("Settings saved successfully!");
  });
}

// Restore options from chrome.storage
function restoreOptions() {
  chrome.storage.sync.get(
    {
      // Default values
      zip: "",
      stocks: "",
      backgroundImages: [],
      numberPhotos: 0,
    },
    function (items) {
      // Populate form fields
      document.getElementById("zipcode").value = items.zip;
      document.getElementById("stocks").value = items.stocks;

      // Restore image previews if available
      if (items.backgroundImages && items.backgroundImages.length > 0) {
        selectedImages = items.backgroundImages;

        // Show previews for stored images
        const container = document.getElementById("imagePreviewContainer");
        container.innerHTML = ""; // Clear container

        selectedImages.forEach((image) => {
          addImagePreview(image.data);
        });

        showStatus(`${selectedImages.length} saved background images loaded`);
      }
    }
  );
}

// Restore default settings
function restoreDefaults() {
  // Set default values
  chrome.storage.sync.set(
    {
      zip: "",
      stocks: "",
      backgroundImages: [],
      numberPhotos: 0,
    },
    function () {
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
