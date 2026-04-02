chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "replaceText") {
    const activeElement = document.activeElement;

    // 1. Check if it's a standard input or textarea
    if (
      activeElement.tagName === "INPUT" ||
      activeElement.tagName === "TEXTAREA"
    ) {
      // Replace only the selected part
      activeElement.setRangeText(request.replacement);
    }
    // 2. Check if it's a contenteditable div (like in some emails or modern editors)
    else if (activeElement.isContentEditable) {
      // This is a simple replacement for basic rich text fields
      document.execCommand("insertText", false, request.replacement);
    } else {
      showToast(
        "Could not replace text automatically. Here is the corrected version:\n\n" +
          request.replacement,
        10000,
      );
    }
  } else if (request.action === "showToast") {
    showToast(request.message);
  }
});

let toastContainer = null;

function showToast(message, duration = 4000) {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.getElementById("gemini-toast-container");
    if (!toastContainer) {
      toastContainer = document.createElement("div");
      toastContainer.id = "gemini-toast-container";
      document.body.appendChild(toastContainer);
    }
  }

  // Ensure newlines are respected
  toastContainer.style.whiteSpace = "pre-line";
  toastContainer.innerText = message;
  toastContainer.classList.add("show");

  if (toastContainer.hideTimeout) clearTimeout(toastContainer.hideTimeout);

  if (duration > 0) {
    toastContainer.hideTimeout = setTimeout(() => {
      toastContainer.classList.remove("show");
    }, duration);
  }
}
