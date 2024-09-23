// src/options/options.ts
function saveOptions() {
  const apiKeyElement = document.getElementById("apiKey");
  const apiKey = apiKeyElement.value;
  chrome.storage.sync.set({ apiKey }, () => {
    const statusElement = document.getElementById("status");
    if (statusElement) {
      statusElement.textContent = "Saved.";
    }
  });
}
function restoreOptions() {
  chrome.storage.sync.get({ apiKey: "" }, (items) => {
    const apiKeyElement = document.getElementById("apiKey");
    apiKeyElement.value = items.apiKey;
  });
}
document.addEventListener("DOMContentLoaded", restoreOptions);
var saveButton = document.getElementById("save");
if (saveButton) {
  saveButton.addEventListener("click", saveOptions);
}
