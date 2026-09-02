(() => {
  "use strict";

  const SETTING = "autoAdvanceDeleteWarning";
  const checkbox = document.getElementById("auto-advance");
  const status = document.getElementById("status");
  let statusTimer;

  chrome.storage.local.get({ [SETTING]: false }, (settings) => {
    checkbox.checked = Boolean(settings[SETTING]);
  });

  checkbox.addEventListener("change", () => {
    chrome.storage.local.set({ [SETTING]: checkbox.checked }, () => {
      status.textContent = "Saved";
      window.clearTimeout(statusTimer);
      statusTimer = window.setTimeout(() => {
        status.textContent = "";
      }, 1200);
    });
  });
})();
