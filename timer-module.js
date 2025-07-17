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
    /^\d{1,2}:\d{1,2}:\d{1,2}$/ // HH:MM:SS
  ];
  return patterns.some(pattern => pattern.test(input));
}

// Format time input to HH:MM:SS or MM:SS
function formatTimeInput(input) {
  if (!input) return "00:00:00";
  
  const parts = input.split(':');
  
  if (parts.length === 1) {
    const minutes = parseInt(parts[0]) || 0;
    return `${minutes.toString().padStart(2, '0')}:00`;
  } else if (parts.length === 2) {
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseInt(parts[1]) || 0;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else if (parts.length === 3) {
    const hours = parseInt(parts[0]) || 0;
    const minutes = parseInt(parts[1]) || 0;
    const seconds = parseInt(parts[2]) || 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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

    $("#timerDisplay").text(display).css("color", "#ffc107"); // Yellow for overtime
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

    $("#timerDisplay").text(display);

    // Change color when time is running low
    if (displaySeconds <= 60 && displaySeconds > 10) {
      $("#timerDisplay").css("color", "#ffc107"); // Yellow for last minute
    } else if (displaySeconds <= 10) {
      $("#timerDisplay").css("color", "#dc3545"); // Red for last 10 seconds
    } else {
      $("#timerDisplay").css("color", "#ffffff"); // White for normal
    }
  }
}

// Show timer notification
function showTimerNotification(message, duration = 3000) {
  const notification = $(
    `<div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
      background: rgba(0,0,0,0.8); color: white; padding: 20px 30px; 
      border-radius: 8px; font-size: 16px; z-index: 10000; 
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);">${message}</div>`
  );
  $("body").append(notification);
  setTimeout(() => notification.fadeOut(300, () => notification.remove()), duration);
}

// Start timer
function startTimer() {
  const timeInput = $("#timerDisplay").text().trim();
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
    totalSeconds = Math.max(0, Math.floor(window.initialTotalSeconds - elapsedSinceStart));
  }
  
  $("#startPauseBtn").text("Resume").css("background", "#28a745");
  saveTimerState();
}

// Resume timer
function resumeTimer() {
  isRunning = true;
  isPaused = false;
  $("#startPauseBtn").text("Pause").css("background", "#ffc107");
  
  // Recalculate start time based on current totalSeconds
  timerStartTime = Date.now() - ((window.initialTotalSeconds - totalSeconds) * 1000);

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

  $("#startPauseBtn").text("Start").css("background", "#28a745");
  $("#timerDisplay").text("00:00:00").css("color", "#ffffff");
  
  // Timer display should be editable again after reset
  if (!isRunning && !isPaused) {
    $("#timerDisplay").attr("contenteditable", "false");
  }
  
  // Clear saved timer state
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.local.remove("timerState", function() {
      console.log("Timer state cleared");
    });
  }
}

// Resume count up mode (used when loading saved state)
function resumeCountUp() {
  isRunning = true;
  isPaused = false;
  isCountingUp = true;
  $("#startPauseBtn").text("Pause").css("background", "#ffc107");
  $("#timerDisplay").attr("contenteditable", "false");

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
  const label = $("#timerLabel").text().trim();
  showTimerNotification(`Timer completed: ${label} - Now counting up!`, 5000);
  
  // Save state when timer completes
  saveTimerState();

  // Flash the timer display briefly
  let flashCount = 0;
  const flashInterval = setInterval(function () {
    $("#timerDisplay").css(
      "color",
      flashCount % 2 === 0 ? "#28a745" : "#ffc107"
    );
    flashCount++;
    if (flashCount >= 6) {
      clearInterval(flashInterval);
      // Timer will continue running in count-up mode
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
  const container = $("#countdownContainer");
  const showBtn = $("#showTimerBtn");
  
  if (setVisible === undefined) {
    // Toggle current state
    setVisible = container.is(":hidden");
  }

  if (setVisible) {
    container.fadeIn(300);
    showBtn.text("Show Timer").fadeOut(300);
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({ timerVisible: true });
    }
  } else {
    container.fadeOut(300);
    showBtn.text("Show Timer").fadeIn(300);
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({ timerVisible: false });
    }
  }
}

// Initialize countdown timer
function initCountdownTimer() {
  // Make timer display editable when not running
  $("#timerDisplay").on("click", function() {
    if (!isRunning && !isPaused) {
      $(this).attr("contenteditable", "true").focus();
      // Select all text
      const range = document.createRange();
      range.selectNodeContents(this);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
  
  // Handle timer display input
  $("#timerDisplay").on("blur", function() {
    $(this).attr("contenteditable", "false");
    const input = $(this).text().trim();
    if (!input || !isValidTimeFormat(input)) {
      $(this).text("00:00:00");
    } else {
      // Format the input properly
      const formattedTime = formatTimeInput(input);
      $(this).text(formattedTime);
    }
  });
  
  // Handle Enter key on timer display
  $("#timerDisplay").on("keypress", function(e) {
    if (e.which === 13) {
      e.preventDefault();
      $(this).blur();
      if (!isRunning && !isPaused) {
        startTimer();
      }
    }
  });
  
  // Prevent non-numeric input
  $("#timerDisplay").on("input", function() {
    let text = $(this).text();
    // Allow only numbers and colons
    text = text.replace(/[^0-9:]/g, '');
    if (text !== $(this).text()) {
      $(this).text(text);
      // Move cursor to end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(this);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  });

  // Make sure timer is visible initially and show timer button has text
  $("#countdownContainer").show();
  $("#showTimerBtn").text("Show Timer").hide();
  
  // Load saved timer state with fallback for non-extension environment
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.sync.get(
      {
        timerLabel: "Timer",
        timerVisible: true,
        lastTimerInput: "25:00",
      },
      function (items) {
        $("#timerLabel").text(items.timerLabel);
        
        // Set default timer display if not running
        if (!isRunning && !isPaused) {
          $("#timerDisplay").text(formatTimeInput(items.lastTimerInput));
        }

        // TEMPORARY: Force timer to be visible for debugging
        console.log("Timer visibility setting:", items.timerVisible);
        $("#countdownContainer").show();
        $("#showTimerBtn").text("Show Timer").hide();
        
        /* Commented out for debugging
        if (items.timerVisible === false) {
          console.log("Timer was previously hidden, hiding it");
          toggleTimerVisibility(false);
        } else {
          console.log("Timer should be visible");
          // Make sure it's visible
          $("#countdownContainer").show();
          $("#showTimerBtn").hide();
        }
        */
        
        // Load timer state after setting up the UI
        if (window.loadTimerState) {
          window.loadTimerState();
        }
      }
    );
  } else {
    // Fallback for testing outside Chrome extension
    $("#timerLabel").text("Timer");
    $("#timerDisplay").text("00:25:00");
  }

  // Event listeners
  $("#startPauseBtn").click(function () {
    if (!isRunning && !isPaused) {
      startTimer();
    } else if (isRunning) {
      pauseTimer();
    } else if (isPaused) {
      resumeTimer();
    }
  });

  $("#resetBtn").click(function () {
    resetTimer();
  });

  $("#toggleTimerBtn").click(function () {
    toggleTimerVisibility();
  });

  $("#showTimerBtn").click(function () {
    toggleTimerVisibility(true);
  });

  // Save timer label when edited
  $("#timerLabel").on("blur", function () {
    const label = $(this).text().trim() || "Timer";
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({ timerLabel: label });
    }
  });

  // Handle Enter key on timer label
  $("#timerLabel").on("keypress", function (e) {
    if (e.which === 13) {
      e.preventDefault();
      $(this).blur();
    }
  });
}

// Export all timer functions
window.toggleTimerVisibility = toggleTimerVisibility;
window.initCountdownTimer = initCountdownTimer;

// Note: saveTimerState and loadTimerState will need to be available from main file
window.saveTimerState = null; // Will be set from main file
window.loadTimerState = null; // Will be set from main file