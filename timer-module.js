// Timer Module - Extracted timer functionality
// This module maintains compatibility with the existing code by keeping variables in global scope

// Timer state variables (global for compatibility)
let countdownInterval = null;
let totalSeconds = 0;
let isRunning = false;
let isPaused = false;
let isCountingUp = false;
let countUpSeconds = 0;
let timerStartTime = null;
let pausedDuration = 0;

// Validate time format
function isValidTimeFormat(input) {
  const patterns = [
    /^\d{1,2}$/, // Just minutes
    /^\d{1,2}:\d{1,2}$/, // MM:SS
    /^\d{1,2}:\d{1,2}:\d{1,2}$/, // HH:MM:SS
  ];
  return patterns.some((pattern) => pattern.test(input));
}

// Format time input to HH:MM:SS or MM:SS
function formatTimeInput(input) {
  if (!input) return "00:00:00";

  const parts = input.split(":");

  if (parts.length === 1) {
    const minutes = parseInt(parts[0]) || 0;
    return `${minutes.toString().padStart(2, "0")}:00`;
  } else if (parts.length === 2) {
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseInt(parts[1]) || 0;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  } else if (parts.length === 3) {
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return "00:00:00";
}

// Parse time input
function parseTimeInput(input) {
  input = input.replace(/\s/g, "");
  const parts = input.split(":");

  if (parts.length === 2) {
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseInt(parts[1]) || 0;
    return minutes * 60 + seconds;
  } else if (parts.length === 3) {
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  } else if (parts.length === 1) {
    const minutes = parseInt(parts[0]) || 0;
    return minutes * 60;
  }

  return 0;
}

// Update timer display
function updateTimerDisplay() {
  let displaySeconds, hours, minutes, seconds, display;

  if (isCountingUp) {
    // Count up mode - show positive time with + prefix
    displaySeconds = Math.floor(countUpSeconds);
    hours = Math.floor(displaySeconds / 3600);
    minutes = Math.floor((displaySeconds % 3600) / 60);
    seconds = Math.floor(displaySeconds % 60);

    display =
      hours > 0
        ? `+${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        : `+${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;

    const timerEl = document.getElementById("timerDisplay");
    if (timerEl) {
      timerEl.textContent = display;
      timerEl.style.color = "#ffc107";
    }
  } else {
    // Countdown mode
    displaySeconds = Math.floor(totalSeconds);
    hours = Math.floor(displaySeconds / 3600);
    minutes = Math.floor((displaySeconds % 3600) / 60);
    seconds = Math.floor(displaySeconds % 60);

    display =
      hours > 0
        ? `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        : `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;

    const timerEl2 = document.getElementById("timerDisplay");
    if (timerEl2) timerEl2.textContent = display;

    // Change color when time is running low
    if (displaySeconds <= 60 && displaySeconds > 10) {
      if (timerEl2) timerEl2.style.color = "#ffc107";
    } else if (displaySeconds <= 10) {
      if (timerEl2) timerEl2.style.color = "#dc3545";
    } else {
      if (timerEl2) timerEl2.style.color = "#ffffff";
    }
  }
}

// Show timer notification
function showTimerNotification(message, duration = 3000) {
  const notification = document.createElement("div");
  notification.setAttribute(
    "style",
    "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.8); color: white; padding: 20px 30px; border-radius: 8px; font-size: 16px; z-index: 10000; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"
  );
  notification.textContent = message;
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.transition = "opacity 0.3s";
    notification.style.opacity = "0";
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// Start timer
function startTimer() {
  const timeInput = (
    document.getElementById("timerDisplay")?.textContent || ""
  ).trim();
  if (!timeInput || timeInput === "00:00:00" || timeInput === "00:00") {
    showTimerNotification("Please enter a time (e.g., 25:00 or 1:30:00)");
    return;
  }

  totalSeconds = parseTimeInput(timeInput);
  if (totalSeconds <= 0) {
    showTimerNotification(
      "Please enter a valid time format (MM:SS or HH:MM:SS)"
    );
    return;
  }

  // Store initial total seconds and start time for persistence
  window.initialTotalSeconds = totalSeconds;
  timerStartTime = Date.now();

  // Save the last used time
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.sync.set({ lastTimerInput: timeInput });
  }

  isRunning = true;
  isPaused = false;
  const startPauseBtn = document.getElementById("startPauseBtn");
  if (startPauseBtn) {
    startPauseBtn.textContent = "Pause";
    startPauseBtn.style.background = "#ffc107";
  }
  const timerEl3 = document.getElementById("timerDisplay");
  if (timerEl3) timerEl3.setAttribute("contenteditable", "false");

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

    // Save state periodically while running (only if not in reset state)
    if (isRunning || isPaused || totalSeconds > 0 || isCountingUp) {
      saveTimerState();
    }
  }, 1000);

  updateTimerDisplay();
  saveTimerState();
}

// Pause timer
function pauseTimer() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  isRunning = false;
  isPaused = true;

  // Calculate and store the elapsed time when pausing
  if (timerStartTime && !isCountingUp) {
    const elapsedSinceStart = (Date.now() - timerStartTime) / 1000;
    totalSeconds = Math.max(
      0,
      Math.floor(window.initialTotalSeconds - elapsedSinceStart)
    );
  }

  if (startPauseBtn) {
    startPauseBtn.textContent = "Resume";
    startPauseBtn.style.background = "#28a745";
  }
  saveTimerState();
}

// Resume timer
function resumeTimer() {
  isRunning = true;
  isPaused = false;
  if (startPauseBtn) {
    startPauseBtn.textContent = "Pause";
    startPauseBtn.style.background = "#ffc107";
  }

  // Recalculate start time based on current totalSeconds
  timerStartTime =
    Date.now() - (window.initialTotalSeconds - totalSeconds) * 1000;

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

    // Save state periodically while running (only if not in reset state)
    if (isRunning || isPaused || totalSeconds > 0 || isCountingUp) {
      saveTimerState();
    }
  }, 1000);

  saveTimerState();
}

// Reset timer
function resetTimer() {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  isRunning = false;
  isPaused = false;
  isCountingUp = false;
  totalSeconds = 0;
  countUpSeconds = 0;
  timerStartTime = null;
  pausedDuration = 0;
  window.initialTotalSeconds = 0;

  if (startPauseBtn) {
    startPauseBtn.textContent = "Start";
    startPauseBtn.style.background = "#28a745";
  }
  const timerEl4 = document.getElementById("timerDisplay");
  if (timerEl4) {
    timerEl4.textContent = "00:00:00";
    timerEl4.style.color = "#ffffff";
  }

  // Timer display should be editable again after reset
  if (!isRunning && !isPaused) {
    if (timerEl4) timerEl4.setAttribute("contenteditable", "false");
  }

  // Clear saved timer state
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.local.remove("timerState", function () {
      console.log("Timer state cleared");
    });
  }
}

// Resume count up mode (used when loading saved state)
function resumeCountUp() {
  isRunning = true;
  isPaused = false;
  isCountingUp = true;
  if (startPauseBtn) {
    startPauseBtn.textContent = "Pause";
    startPauseBtn.style.background = "#ffc107";
  }
  const timerEl5 = document.getElementById("timerDisplay");
  if (timerEl5) timerEl5.setAttribute("contenteditable", "false");

  countdownInterval = setInterval(function () {
    countUpSeconds++;
    updateTimerDisplay();

    // Save state periodically while running (only if not in reset state)
    if (isRunning || isPaused || totalSeconds > 0 || isCountingUp) {
      saveTimerState();
    }
  }, 1000);

  updateTimerDisplay();
  saveTimerState();
}

// Timer complete
function timerComplete() {
  // Don't clear the interval - switch to count-up mode
  isCountingUp = true;
  countUpSeconds = 0;
  totalSeconds = 0;

  // Show completion notification
  const labelEl = document.getElementById("timerLabel");
  const label = (labelEl ? labelEl.textContent : "Timer").trim();
  showTimerNotification(`Timer completed: ${label} - Now counting up!`, 5000);

  // Save state when timer completes
  saveTimerState();

  // Flash the timer display briefly
  let flashCount = 0;
  const timerDisplayEl = document.getElementById("timerDisplay");
  const flashInterval = setInterval(function () {
    if (timerDisplayEl) {
      timerDisplayEl.style.color = flashCount % 2 === 0 ? "#28a745" : "#ffc107";
    }
    flashCount++;
    if (flashCount >= 6) {
      clearInterval(flashInterval);
    }
  }, 500);
}

// Make functions globally available for compatibility
window.isValidTimeFormat = isValidTimeFormat;
window.formatTimeInput = formatTimeInput;
window.parseTimeInput = parseTimeInput;
window.updateTimerDisplay = updateTimerDisplay;
window.showTimerNotification = showTimerNotification;
window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resumeTimer = resumeTimer;
window.resetTimer = resetTimer;
window.resumeCountUp = resumeCountUp;
window.timerComplete = timerComplete;

// Toggle timer visibility
function toggleTimerVisibility(setVisible) {
  const container = document.getElementById("countdownContainer");
  const showBtn = document.getElementById("showTimerBtn");
  const toggleContainer = document.getElementById("timerToggleButton");

  if (setVisible === undefined) {
    // Toggle current state
    setVisible = !container || container.style.display === "none";
  }

  if (setVisible) {
    if (container) container.style.display = "block";
    if (showBtn) {
      showBtn.textContent = "Show Timer";
      showBtn.style.display = "none";
    }
    if (toggleContainer) toggleContainer.style.display = "none";
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({ timerVisible: true });
    }
  } else {
    if (container) container.style.display = "none";
    if (showBtn) {
      showBtn.textContent = "Show Timer";
      showBtn.style.display = "block";
    }
    if (toggleContainer) toggleContainer.style.display = "block";
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({ timerVisible: false });
    }
  }
}

// Initialize countdown timer
function initCountdownTimer() {
  const timerDisplay = document.getElementById("timerDisplay");
  const timerLabel = document.getElementById("timerLabel");
  const startPauseBtnEl = document.getElementById("startPauseBtn");
  const resetBtnEl = document.getElementById("resetBtn");
  const toggleTimerBtnEl = document.getElementById("toggleTimerBtn");
  const showTimerBtnEl = document.getElementById("showTimerBtn");
  const toggleContainerEl = document.getElementById("timerToggleButton");

  if (timerDisplay) {
    timerDisplay.addEventListener("click", function () {
      if (!isRunning && !isPaused) {
        this.setAttribute("contenteditable", "true");
        this.focus();
        const range = document.createRange();
        range.selectNodeContents(this);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    });

    timerDisplay.addEventListener("blur", function () {
      this.setAttribute("contenteditable", "false");
      const input = (this.textContent || "").trim();
      if (!input || !isValidTimeFormat(input)) {
        this.textContent = "00:00:00";
      } else {
        const formattedTime = formatTimeInput(input);
        this.textContent = formattedTime;
      }
    });

    timerDisplay.addEventListener("keypress", function (e) {
      if (e.which === 13 || e.key === "Enter") {
        e.preventDefault();
        this.blur();
        if (!isRunning && !isPaused) {
          startTimer();
        }
      }
    });

    timerDisplay.addEventListener("input", function () {
      let text = this.textContent || "";
      text = text.replace(/[^0-9:]/g, "");
      if (text !== this.textContent) {
        this.textContent = text;
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(this);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
  }

  // Initialize visibility from storage
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.sync.get(
      {
        timerLabel: "Timer",
        timerVisible: true,
        lastTimerInput: "25:00",
      },
      function (items) {
        if (timerLabel) timerLabel.textContent = items.timerLabel;

        // Set default timer display if not running
        if (!isRunning && !isPaused) {
          if (timerDisplay)
            timerDisplay.textContent = formatTimeInput(items.lastTimerInput);
        }

        // Apply saved visibility (but ensure a fallback button is visible)
        if (items.timerVisible === false) {
          const countdownContainer =
            document.getElementById("countdownContainer");
          if (countdownContainer) countdownContainer.style.display = "none";
          if (showTimerBtnEl) {
            showTimerBtnEl.textContent = "Show Timer";
            showTimerBtnEl.style.display = "block";
          }
          if (toggleContainerEl) toggleContainerEl.style.display = "block";
        } else {
          const countdownContainer =
            document.getElementById("countdownContainer");
          if (countdownContainer) countdownContainer.style.display = "block";
          if (showTimerBtnEl) {
            showTimerBtnEl.textContent = "Show Timer";
            showTimerBtnEl.style.display = "none";
          }
          if (toggleContainerEl) toggleContainerEl.style.display = "none";
        }

        // Safety: if both timer and its toggle are hidden (e.g., due to CSS), show the toggle
        const countdownContainer =
          document.getElementById("countdownContainer");
        if (
          countdownContainer &&
          getComputedStyle(countdownContainer).display === "none" &&
          showTimerBtnEl &&
          getComputedStyle(showTimerBtnEl).display === "none"
        ) {
          showTimerBtnEl.style.display = "block";
          if (toggleContainerEl) toggleContainerEl.style.display = "block";
        }

        // Load timer state after setting up the UI
        if (window.loadTimerState) {
          window.loadTimerState();
        }
      }
    );
  } else {
    // Fallback for testing outside Chrome extension
    if (timerLabel) timerLabel.textContent = "Timer";
    if (timerDisplay) timerDisplay.textContent = "00:25:00";
  }

  // Event listeners
  if (startPauseBtnEl)
    startPauseBtnEl.addEventListener("click", function () {
      if (!isRunning && !isPaused) {
        startTimer();
      } else if (isRunning) {
        pauseTimer();
      } else if (isPaused) {
        resumeTimer();
      }
    });

  if (resetBtnEl) resetBtnEl.addEventListener("click", resetTimer);

  if (toggleTimerBtnEl)
    toggleTimerBtnEl.addEventListener("click", function () {
      toggleTimerVisibility();
    });

  if (showTimerBtnEl)
    showTimerBtnEl.addEventListener("click", function () {
      toggleTimerVisibility(true);
    });

  // Save timer label when edited
  if (timerLabel)
    timerLabel.addEventListener("blur", function () {
      const label = (this.textContent || "").trim() || "Timer";
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.sync.set({ timerLabel: label });
      }
    });

  // Handle Enter key on timer label
  if (timerLabel)
    timerLabel.addEventListener("keypress", function (e) {
      if (e.which === 13 || e.key === "Enter") {
        e.preventDefault();
        this.blur();
      }
    });
}

// Export all timer functions
window.toggleTimerVisibility = toggleTimerVisibility;
window.initCountdownTimer = initCountdownTimer;

// Note: saveTimerState and loadTimerState will need to be available from main file
window.saveTimerState = null; // Will be set from main file
window.loadTimerState = null; // Will be set from main file
