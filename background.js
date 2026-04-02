const requestCache = new Map();
let cachedApiKey = "";

// Initialize API Key from storage
chrome.storage.local.get("geminiApiKey", (data) => {
  if (data.geminiApiKey) {
    cachedApiKey = data.geminiApiKey;
  }
});

// Listen for API Key changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local" && changes.geminiApiKey) {
    cachedApiKey = changes.geminiApiKey.newValue;
  }
});

// 1. Create the Context Menus on installation
chrome.runtime.onInstalled.addListener(() => {
  // Parent Menu
  chrome.contextMenus.create({
    id: "parent-gemini",
    title: "Gemini Writer",
    contexts: ["selection"],
  });

  // Child Menu: Professional
  chrome.contextMenus.create({
    id: "tone-professional",
    parentId: "parent-gemini",
    title: "Make it Professional 👔",
    contexts: ["selection"],
  });

  // Child Menu: Casual
  chrome.contextMenus.create({
    id: "tone-casual",
    parentId: "parent-gemini",
    title: "Make it Casual/Fun 😎",
    contexts: ["selection"],
  });

  // Child Menu: Concise
  chrome.contextMenus.create({
    id: "tone-concise",
    parentId: "parent-gemini",
    title: "Make it Concise ✂️",
    contexts: ["selection"],
  });
});

// 2. Listen for clicks on the sub-menus
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const selectedText = info.selectionText;
  let toneInstruction = "";

  // Determine which button was clicked
  switch (info.menuItemId) {
    case "tone-professional":
      toneInstruction =
        "Fix grammar and rewrite in a strictly professional, formal, and polite business tone.";
      break;
    case "tone-casual":
      toneInstruction =
        "Fix grammar and rewrite in a casual, friendly, and engaging tone. Feel free to use simple words.";
      break;
    case "tone-concise":
      toneInstruction =
        "Fix grammar and shorten the text. Be direct, remove fluff, and keep only the essential meaning.";
      break;
    default:
      return; // If it's not one of our buttons, ignore
  }

  // Retrieve API Key
  chrome.storage.local.get("geminiApiKey", async (data) => {
    const apiKey = data.geminiApiKey;
    if (!apiKey) {
      alertUser(
        tab.id,
        "Please set your API Key in the extension popup first!",
      );
      return;
    }

    // Retrieve API Key from cache
    if (!cachedApiKey) {
      alertUser(
        tab.id,
        "Please set your API Key in the extension popup first!",
      );
      return;
    }

    try {
      // We pass the specific tone instruction here
      const correctedText = await callGemini(
        selectedText,
        toneInstruction,
        cachedApiKey,
      );

      chrome.tabs
        .sendMessage(tab.id, {
          action: "replaceText",
          original: selectedText,
          replacement: correctedText,
        })
        .catch((err) =>
          console.warn(
            "Could not send message. Try refreshing the web page.",
            err,
          ),
        );
    } catch (error) {
      console.error(error);
      alertUser(tab.id, "Error: " + error.message);
    }
  });
});

// Helper: Call Google Gemini API
async function callGemini(text, styleInstruction, key) {
  const cacheKey = JSON.stringify({ text, styleInstruction });
  const cacheData = await chrome.storage.session.get(cacheKey);
  if (cacheData[cacheKey]) {
    return cacheData[cacheKey];
  }

  // Use gemini-1.5-flash as it is faster and better suited for quick text rewriting
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent`;

  const prompt = `
    Input Text: "${text}"
    
    Task: ${styleInstruction}
    
    IMPORTANT: Output ONLY the rewritten text. Do not add quotes, explanations, or "Here is the rewritten text".
  `;

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  const data = await response.json();

  if (data.error) throw new Error(data.error.message);

  const candidate = data.candidates[0];
  if (!candidate.content) {
    throw new Error(
      "Generation blocked (possibly due to safety settings): " +
        candidate.finishReason,
    );
  }

  const result = candidate.content.parts[0].text.trim();

  await chrome.storage.session.set({ [cacheKey]: result });
  return result;
}

function alertUser(tabId, message) {
  chrome.tabs
    .sendMessage(tabId, {
      action: "showToast",
      message: message,
    })
    .catch((err) =>
      console.warn(
        "Could not send toast message. Try refreshing the web page.",
        err,
      ),
    );
}
