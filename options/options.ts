function saveOptions(): void {
  const apiKeyElement = document.getElementById("apiKey") as HTMLInputElement;
  const apiKey = apiKeyElement.value;

  chrome.storage.sync.set({ apiKey }, () => {
    const statusElement = document.getElementById("status");
    if (statusElement) {
      statusElement.textContent = "Saved.";
    }
  });
}

function restoreOptions(): void {
  chrome.storage.sync.get({ apiKey: "" }, (items) => {
    const apiKeyElement = document.getElementById("apiKey") as HTMLInputElement;
    apiKeyElement.value = items.apiKey;
  });
}

document.addEventListener("DOMContentLoaded", restoreOptions);

const saveButton = document.getElementById("save");
if (saveButton) {
  saveButton.addEventListener("click", saveOptions);
}
