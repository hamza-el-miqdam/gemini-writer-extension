document.getElementById("saveBtn").addEventListener("click", () => {
    const key = document.getElementById("apiKey").value;
    if (key) {
        chrome.storage.local.set({ geminiApiKey: key }, () => {
            document.getElementById("status").innerText = "Key saved! You can close this.";
        });
    }
});