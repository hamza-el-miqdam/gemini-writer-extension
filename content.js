chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "replaceText") {
        const activeElement = document.activeElement;

        // 1. Check if it's a standard input or textarea
        if (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA") {
            const start = activeElement.selectionStart;
            const end = activeElement.selectionEnd;

            // Replace only the selected part
            const currentValue = activeElement.value;
            const newValue = currentValue.substring(0, start) + request.replacement + currentValue.substring(end);

            activeElement.value = newValue;
        }
        // 2. Check if it's a contenteditable div (like in some emails or modern editors)
        else if (activeElement.isContentEditable) {
            // This is a simple replacement for basic rich text fields
            document.execCommand("insertText", false, request.replacement);
        }
        else {
            alert("Could not replace text automatically. Here is the corrected version:\n\n" + request.replacement);
        }
    }
});