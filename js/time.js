document.addEventListener("DOMContentLoaded", () => {
  // --- DOM Elements ---
  const themeToggleInput = document.getElementById("themeToggle");
  const textDisplay = document.getElementById("text-display");
  const textInput = document.getElementById("text-input");
  const typingArea = document.getElementById("text-display-area");
  const restartBtn = document.getElementById("restart-btn");
  const timerDisplay = document.getElementById("header-timer");
  const progressBar = document.getElementById("progress-bar");
  const wpmResult = document.getElementById("wpm-result");
  const accuracyResult = document.getElementById("accuracy-result");
  const keyPressSound = document.getElementById("key-press-sound");
  const muteBtn = document.getElementById("mute-btn");
  const buttonClickSound = document.getElementById("button-click-sound");

  // --- State Management ---
  let timer;
  let isTestActive = false;
  let timeElapsed = 0;
  let charIndex = 0;
  let isMuted = false;

  const urlParams = new URLSearchParams(window.location.search);
  const testValue = parseInt(urlParams.get("value")) || 30;

  // --- THEME & SOUND LOGIC ---
  function applySavedPreferences() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }

    const savedMuteState = localStorage.getItem("soundMuted");
    isMuted = savedMuteState === "true";
    updateMuteButtonIcon();
  }

  function updateMuteButtonIcon() {
    muteBtn.innerHTML = isMuted
      ? '<i class="fa-solid fa-volume-xmark"></i>'
      : '<i class="fa-solid fa-volume-high"></i>';
  }

  muteBtn.addEventListener("click", () => {
    isMuted = !isMuted;
    localStorage.setItem("soundMuted", isMuted);
    updateMuteButtonIcon();

    // --- NEW: Play the single click sound ---
    if (buttonClickSound) {
      buttonClickSound.currentTime = 0;
      buttonClickSound.play();
    }
  });

  // --- EVENT LISTENERS ---
  restartBtn.addEventListener("click", () => location.reload());
  textInput.addEventListener("input", handleTyping);
  typingArea.addEventListener("click", () => textInput.focus());

  // --- CORE LOGIC ---
  function loadNewText() {
    const textArray = textSamples.split(" ");
    const shuffledText = textArray
      .sort(() => Math.random() - 0.5)
      .slice(0, 500)
      .join(" ");
    textDisplay.innerHTML = "";
    shuffledText.split("").forEach((char) => {
      const charSpan = document.createElement("span");
      charSpan.innerText = char;
      textDisplay.appendChild(charSpan);
    });
    if (textDisplay.children.length > 0) {
      textDisplay.children[0].classList.add("current");
    }
  }

  function handleTyping() {
    if (!isTestActive) startTimer();
    if (keyPressSound && !isMuted) {
      keyPressSound.currentTime = 0;
      keyPressSound.play();
    }

    const charSpans = textDisplay.querySelectorAll("span");
    const typedText = textInput.value;
    const previousSpan = charSpans[charIndex - 1];

    if (typedText.length < charIndex) {
      charIndex--;
      if (charSpans[charIndex]) {
        charSpans[charIndex].classList.remove("correct", "incorrect");
      }
    } else {
      const expectedChar = charSpans[charIndex].innerText;
      if (typedText[charIndex] === expectedChar) {
        charSpans[charIndex].classList.add("correct");
      } else {
        charSpans[charIndex].classList.add("incorrect");
      }
      charIndex++;
    }

    updateMetrics(timeElapsed / 1000);
    document
      .querySelectorAll("#text-display span.current")
      .forEach((span) => span.classList.remove("current"));
    const currentSpan = charSpans[charIndex];
    if (currentSpan) {
      currentSpan.classList.add("current");
      if (previousSpan && currentSpan.offsetTop > previousSpan.offsetTop) {
        currentSpan.scrollIntoView({ block: "start", behavior: "smooth" });
      }
    }
    if (charIndex === charSpans.length) endTest();
  }

  function startTimer() {
    isTestActive = true;
    const startTime = Date.now();
    timer = setInterval(() => {
      timeElapsed = Date.now() - startTime;
      updateProgress();
      const secondsElapsed = Math.floor(timeElapsed / 1000);
      if (testValue - secondsElapsed <= 0) endTest();
    }, 100);
  }

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  }

  function updateProgress() {
    const secondsElapsed = timeElapsed / 1000;
    const secondsLeft = testValue - secondsElapsed;
    timerDisplay.textContent = formatTime(
      secondsLeft > 0 ? Math.ceil(secondsLeft) : 0
    );
    progressBar.style.width = `${(secondsElapsed / testValue) * 100}%`;
  }

  function updateMetrics(secondsElapsed) {
    const minutes = secondsElapsed / 60;
    const wpm = minutes > 0 ? Math.round(charIndex / 5 / minutes) : 0;
    const correctChars = document.querySelectorAll(
      "#text-display span.correct"
    ).length;
    const accuracy =
      charIndex > 0 ? Math.round((correctChars / charIndex) * 100) : 100;
    wpmResult.textContent = wpm;
    accuracyResult.textContent = `${accuracy}%`;
  }

  function endTest() {
    if (!isTestActive) return;
    clearInterval(timer);
    isTestActive = false;
    textInput.disabled = true;
    progressBar.style.width = "100%";
    timerDisplay.textContent = formatTime(0);
    updateMetrics(testValue);
  }

  function startNewTest() {
    clearInterval(timer);
    isTestActive = false;
    charIndex = 0;
    timeElapsed = 0;
    textInput.value = "";
    textInput.disabled = false;
    wpmResult.textContent = "0";
    accuracyResult.textContent = "100%";
    progressBar.style.width = "0%";
    timerDisplay.textContent = formatTime(testValue);
    loadNewText();
    textInput.focus();
  }

  // --- INITIALIZATION ---
  applySavedPreferences();
  startNewTest();
});
