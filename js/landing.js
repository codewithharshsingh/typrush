document.addEventListener("DOMContentLoaded", () => {
  // --- ELEMENT SELECTORS ---
  const themeToggleInput = document.getElementById("themeToggle");
  const allModeCards = document.querySelectorAll(".mode-card");
  const optionButtons = document.querySelectorAll(".option-button");
  const customValueInput = document.getElementById("custom-value-input");
  const customStartBtn = document.getElementById("custom-start-btn");
  const customTypeRadios = document.querySelectorAll(
    'input[name="custom-type"]'
  );
  const errorPopup = document.getElementById("error-popup");
  const errorPopupMessage = document.getElementById("error-popup-message");
  const errorPopupClose = document.getElementById("error-popup-close");

  // --- THEME LOGIC ---
  function applySavedTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.body.classList.add("dark-theme");
      themeToggleInput.checked = true;
    } else {
      document.body.classList.remove("dark-theme");
      themeToggleInput.checked = false;
    }
  }

  themeToggleInput.addEventListener("change", () => {
    document.body.classList.toggle("dark-theme");
    const currentTheme = document.body.classList.contains("dark-theme")
      ? "dark"
      : "light";
    localStorage.setItem("theme", currentTheme);
  });

  // --- EVENT LISTENERS ---
  errorPopupClose.addEventListener("click", () => {
    errorPopup.classList.remove("show");
  });
  errorPopup.addEventListener("click", (event) => {
    if (event.target === errorPopup) {
      errorPopup.classList.remove("show");
    }
  });

  optionButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const clickedButton = event.target;
      const clickedCard = clickedButton.closest(".mode-card");

      allModeCards.forEach((card) => {
        if (card !== clickedCard && card.querySelector(".option-button")) {
          card
            .querySelectorAll(".option-button")
            .forEach((btn) => btn.classList.remove("active"));
          const startButton = card.querySelector(".start-button");
          if (startButton) startButton.disabled = true;
        }
      });

      customValueInput.value = "";
      customStartBtn.disabled = true;

      clickedCard
        .querySelectorAll(".option-button")
        .forEach((btn) => btn.classList.remove("active"));
      clickedButton.classList.add("active");
      const startButtonInCard = clickedCard.querySelector(".start-button");
      if (startButtonInCard) startButtonInCard.disabled = false;
    });
  });

  document
    .querySelectorAll(".start-button[data-mode]")
    .forEach((startButton) => {
      startButton.addEventListener("click", () => {
        const parentCard = startButton.closest(".mode-card");
        const selectedOption = parentCard.querySelector(
          ".option-button.active"
        );
        if (selectedOption) {
          const mode = startButton.dataset.mode;
          const value = selectedOption.dataset.value;
          navigateToTest(mode, value);
        }
      });
    });

  customValueInput.addEventListener("input", () => {
    allModeCards.forEach((card) => {
      if (card.querySelector(".option-button")) {
        card
          .querySelectorAll(".option-button")
          .forEach((btn) => btn.classList.remove("active"));
        const startButton = card.querySelector(".start-button");
        if (startButton) startButton.disabled = true;
      }
    });
    const hasValue = parseInt(customValueInput.value) > 0;
    customStartBtn.disabled = !hasValue;
  });

  customStartBtn.addEventListener("click", () => {
    const mode = document.querySelector(
      'input[name="custom-type"]:checked'
    ).value;
    const value = customValueInput.value;
    navigateToTest(mode, value, true);
  });

  customTypeRadios.forEach((radio) => {
    radio.addEventListener("change", (event) => {
      if (event.target.value === "time") {
        customValueInput.placeholder = "Enter time (in seconds)";
      } else {
        customValueInput.placeholder = "Enter number of words";
      }
    });
  });

  // --- HELPER FUNCTIONS ---
  function showErrorPopup(message) {
    errorPopupMessage.textContent = message;
    errorPopup.classList.add("show");
  }

  function navigateToTest(mode, value, isCustom = false) {
    if (!value || value <= 0) {
      showErrorPopup(
        "Please enter or select a valid number greater than zero."
      );
      return;
    }

    if (mode === "words" && value > 500) {
      showErrorPopup("The maximum number of words allowed is 500.");
      return;
    }

    const page = isCustom ? `custom-${mode}.html` : `${mode}.html`;
    const params = { value };

    const queryString = new URLSearchParams(params).toString();
    window.location.href = `${page}?${queryString}`;
  }

  // --- INITIALIZATION ---
  applySavedTheme();
  customValueInput.placeholder = "Enter time (in seconds)";
  const footerYear = document.getElementById("footer-year");
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }
});
