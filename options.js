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

  // Daily questions UI
  initDailyQuestionsOptions();
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

// ================= Daily Questions Options =================
function initDailyQuestionsOptions() {
  // Load questions
  chrome.storage.sync.get({ dailyQuestions: [] }, function (cfg) {
    renderQuestions(cfg.dailyQuestions || []);
  });

  const addBtn = document.getElementById("addQuestionBtn");
  if (addBtn)
    addBtn.addEventListener("click", function () {
      const inp = document.getElementById("newQuestionInput");
      const value = (inp.value || "").trim();
      if (!value) return;
      const list = document.getElementById("questionsList");
      list.appendChild(createQuestionRow(value));
      inp.value = "";
    });

  const saveBtn = document.getElementById("saveQuestionsBtn");
  if (saveBtn)
    saveBtn.addEventListener("click", function () {
      const rows = document.querySelectorAll(".question-row input[type=text]");
      const questions = Array.from(rows)
        .map((el) => (el.value || "").trim())
        .filter((s) => s.length > 0);
      chrome.storage.sync.set({ dailyQuestions: questions }, function () {
        showStatus("Daily questions saved");
        // Refresh date list for past answers viewer
        loadPastAnswersDates();
      });
    });

  // Past answers
  loadPastAnswersDates();
  const dateSel = document.getElementById("answersDateSelect");
  if (dateSel)
    dateSel.addEventListener("change", function () {
      renderAnswersForDate(this.value);
    });
}

function createQuestionRow(text) {
  const row = document.createElement("div");
  row.className = "question-row";
  row.style.display = "flex";
  row.style.gap = "6px";
  row.style.marginBottom = "6px";
  const input = document.createElement("input");
  input.type = "text";
  input.value = text || "";
  input.style.flex = "1";
  const del = document.createElement("button");
  del.textContent = "Delete";
  del.className = "secondary";
  del.addEventListener("click", function () {
    row.remove();
  });
  row.appendChild(input);
  row.appendChild(del);
  return row;
}

function renderQuestions(questions) {
  const list = document.getElementById("questionsList");
  if (!list) return;
  list.innerHTML = "";
  (questions || []).forEach((q) => list.appendChild(createQuestionRow(q)));
}

function loadPastAnswersDates() {
  const select = document.getElementById("answersDateSelect");
  if (!select) return;
  chrome.storage.local.get({ dailyAnswersByDate: {} }, function (data) {
    const map = data.dailyAnswersByDate || {};
    const dates = Object.keys(map).sort().reverse();
    select.innerHTML = "";
    dates.forEach((d) => {
      const opt = document.createElement("option");
      opt.value = d;
      opt.textContent = d;
      select.appendChild(opt);
    });
    if (dates.length > 0) {
      select.value = dates[0];
      renderAnswersForDate(dates[0]);
    } else {
      document.getElementById("answersViewer").innerHTML =
        "No answers saved yet.";
    }
  });
}

function renderAnswersForDate(dateKey) {
  const viewer = document.getElementById("answersViewer");
  if (!viewer) return;
  chrome.storage.sync.get({ dailyQuestions: [] }, function (cfg) {
    const questions = cfg.dailyQuestions || [];
    chrome.storage.local.get({ dailyAnswersByDate: {} }, function (data) {
      const answers = (data.dailyAnswersByDate || {})[dateKey] || [];
      const map = new Map(answers.map((a) => [a.index, a.answer]));
      const html = questions
        .map((q, i) => {
          const ans = map.get(i) || "";
          return (
            '<div style="margin-bottom:10px"><div style="font-weight:bold">' +
            q +
            "</div><div style=\"white-space:pre-wrap;border:1px solid #eee;padding:8px;border-radius:4px;background:#fafafa\">" +
            ans +
            "</div></div>"
          );
        })
        .join("");
      viewer.innerHTML = html || "No answers for this date.";
    });
  });
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
