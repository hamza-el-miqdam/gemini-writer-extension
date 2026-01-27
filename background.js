// 1. Create the Context Menu when extension installs
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "fix-grammar",
        title: "Fix Grammar & Optimize (Gemini)",
        contexts: ["selection"] // Only show when text is selected
    });
});

// 2. Listen for clicks on the menu
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "fix-grammar") {
        const selectedText = info.selectionText;

        // Retrieve API Key
        chrome.storage.local.get("geminiApiKey", async (data) => {
            const apiKey = data.geminiApiKey;
            if (!apiKey) {
                alertUser(tab.id, "Please set your API Key in the extension popup first!");
                return;
            }

            // Call Gemini API
            try {
                const correctedText = await callGemini(selectedText, apiKey);
                // Send corrected text back to the web page
                chrome.tabs.sendMessage(tab.id, {
                    action: "replaceText",
                    original: selectedText,
                    replacement: correctedText
                });
            } catch (error) {
                console.error(error);
                alertUser(tab.id, "Error contacting Gemini: " + error.message);
            }
        });
    }
});

// Helper: Call Google Gemini API
async function callGemini(text, key) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent`;

    const prompt = `
    Fix the grammar, spelling, and improve the style of the following text. 
    Keep the tone professional but natural. 
    Output ONLY the corrected text, no explanations or quotes.
    
    Text: "${text}"
  `;

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "x-goog-api-key": key
        },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        })
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error.message);
    return data.candidates[0].content.parts[0].text.trim();
}

// Helper: Send an alert to the user page
function alertUser(tabId, message) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: (msg) => alert(msg),
        args: [message]
    });
}