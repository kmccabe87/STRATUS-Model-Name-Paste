(() => {
  "use strict";

  const CONFIRMATION_PLACEHOLDER = "Type model name to confirm";
  const WARNING_DIALOG_TITLE = "Delete Model";
  const WARNING_TEXT = "This action is permanent and cannot be undone.";
  const AUTO_ADVANCE_SETTING = "autoAdvanceDeleteWarning";

  let autoAdvanceEnabled = false;
  const advancingDialogs = new WeakSet();

  function normalizedText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function isModelDeleteConfirmationField(element) {
    if (!(element instanceof HTMLInputElement) || element.type !== "text") {
      return false;
    }

    if (element.placeholder !== CONFIRMATION_PLACEHOLDER) {
      return false;
    }

    // The placeholder is unique to STRATUS's destructive name-confirmation
    // field. Avoid depending on framework-specific modal wrapper classes.
    return true;
  }

  function setInputValue(element, value, caretPosition, insertedText) {
    const valueSetter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    )?.set;

    if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }

    element.dispatchEvent(new InputEvent("input", {
      bubbles: true,
      composed: true,
      inputType: "insertFromPaste",
      data: insertedText
    }));

    element.dispatchEvent(new Event("change", {
      bubbles: true,
      composed: true
    }));

    try {
      element.setSelectionRange(caretPosition, caretPosition);
    } catch {
      // The value is still applied if the browser cannot restore the caret.
    }
  }

  function allowConfirmationPaste(event) {
    const field = event.target;

    if (!isModelDeleteConfirmationField(field)) {
      return;
    }

    const clipboardText = event.clipboardData?.getData("text/plain");
    if (clipboardText === undefined) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const selectionStart = field.selectionStart ?? field.value.length;
    const selectionEnd = field.selectionEnd ?? selectionStart;
    const nextValue =
      field.value.slice(0, selectionStart) +
      clipboardText +
      field.value.slice(selectionEnd);

    setInputValue(
      field,
      nextValue,
      selectionStart + clipboardText.length,
      clipboardText
    );
  }

  function allowPasteShortcut(event) {
    const isPasteShortcut =
      event.key?.toLowerCase() === "v" &&
      (event.ctrlKey || event.metaKey) &&
      !event.altKey;

    if (!isPasteShortcut || !isModelDeleteConfirmationField(event.target)) {
      return;
    }

    // Keep STRATUS key handlers from suppressing the browser's paste action.
    // Do not preventDefault: the normal paste event should still be produced.
    event.stopImmediatePropagation();
  }

  function findNextButton(dialog) {
    return Array.from(dialog.querySelectorAll("button")).find((button) =>
      normalizedText(button.textContent).startsWith("Next")
    );
  }

  function findDeleteWarningContainer(checkbox) {
    let candidate = checkbox.parentElement;

    while (candidate && candidate !== document.body) {
      const text = normalizedText(candidate.textContent);
      if (
        text.includes(WARNING_DIALOG_TITLE) &&
        text.includes(WARNING_TEXT) &&
        findNextButton(candidate)
      ) {
        return candidate;
      }

      candidate = candidate.parentElement;
    }

    return null;
  }

  function tryAutoAdvance(checkbox) {
    const dialog = findDeleteWarningContainer(checkbox);
    if (
      !autoAdvanceEnabled ||
      !dialog ||
      advancingDialogs.has(dialog) ||
      !(checkbox instanceof HTMLInputElement)
    ) {
      return;
    }

    advancingDialogs.add(dialog);

    if (!checkbox.checked) {
      checkbox.click();
    }

    let attemptsRemaining = 20;
    const clickNextWhenReady = () => {
      const nextButton = findNextButton(dialog);
      const isEnabled =
        nextButton &&
        !nextButton.disabled &&
        nextButton.getAttribute("aria-disabled") !== "true";

      if (isEnabled) {
        nextButton.click();
        return;
      }

      attemptsRemaining -= 1;
      if (attemptsRemaining > 0 && dialog.isConnected) {
        window.setTimeout(clickNextWhenReady, 50);
      } else {
        advancingDialogs.delete(dialog);
      }
    };

    window.setTimeout(clickNextWhenReady, 50);
  }

  function scanForDeleteWarning() {
    if (!autoAdvanceEnabled) {
      return;
    }

    document
      .querySelectorAll('input[type="checkbox"]')
      .forEach(tryAutoAdvance);
  }

  chrome.storage.local.get(
    { [AUTO_ADVANCE_SETTING]: false },
    (settings) => {
      autoAdvanceEnabled = Boolean(settings[AUTO_ADVANCE_SETTING]);
      scanForDeleteWarning();
    }
  );

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local" || !changes[AUTO_ADVANCE_SETTING]) {
      return;
    }

    autoAdvanceEnabled = Boolean(changes[AUTO_ADVANCE_SETTING].newValue);
    scanForDeleteWarning();
  });

  const observer = new MutationObserver(scanForDeleteWarning);

  function startObserver() {
    if (!document.documentElement) {
      return;
    }

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    scanForDeleteWarning();
  }

  if (document.documentElement) {
    startObserver();
  } else {
    document.addEventListener("DOMContentLoaded", startObserver, { once: true });
  }

  // Capture the event before STRATUS can cancel it on the input itself.
  window.addEventListener("keydown", allowPasteShortcut, true);
  window.addEventListener("paste", allowConfirmationPaste, true);
})();
