const assert = require('assert');
const fs = require('fs');
const path = require('path');

// Mock chrome API
const storageStore = {
    geminiApiKey: "initial-key"
};

const chrome = {
    storage: {
        local: {
            get: (key, callback) => {
                // Simulate asynchronous behavior
                setImmediate(() => {
                    const result = {};
                    if (key === "geminiApiKey") {
                        result.geminiApiKey = storageStore.geminiApiKey;
                    }
                    callback(result);
                });
            }
        },
        onChanged: {
            addListener: (callback) => {
                chrome.storage.onChanged.callback = callback;
            }
        }
    },
    runtime: {
        onInstalled: {
            addListener: () => {}
        }
    },
    contextMenus: {
        create: () => {},
        onClicked: {
            addListener: () => {}
        }
    },
    tabs: {
        sendMessage: () => {}
    }
};

global.chrome = chrome;

// Read and execute background.js
const backgroundJs = fs.readFileSync(path.join(__dirname, 'background.js'), 'utf8');
const testableBackgroundJs = backgroundJs + "\nglobal.getCachedApiKey = () => cachedApiKey;\nglobal.getApiKeyExport = getApiKey;";
eval(testableBackgroundJs);

async function runTests() {
    console.log("Starting tests...");

    // 1. Verify initialization (should be empty initially)
    console.log("Verifying initial cache state...");
    assert.strictEqual(global.getCachedApiKey(), "", "Cache should be empty at start");
    console.log("Initial state OK.");

    // 2. Verify getApiKey on cold start (should fetch and populate cache)
    console.log("Verifying getApiKey on cold start...");
    const key = await global.getApiKeyExport();
    assert.strictEqual(key, "initial-key", "Should fetch 'initial-key' from storage");
    assert.strictEqual(global.getCachedApiKey(), "initial-key", "Cache should be populated after getApiKey");
    console.log("Cold start OK.");

    // 3. Verify getApiKey uses cache for second call
    console.log("Verifying getApiKey use cache...");
    // Update storage but cache remains (if not for onChanged)
    storageStore.geminiApiKey = "changed-in-storage";
    const key2 = await global.getApiKeyExport();
    assert.strictEqual(key2, "initial-key", "Should return cached 'initial-key', not storage value");
    console.log("Cache usage OK.");

    // 4. Verify onChanged updates cache
    console.log("Verifying onChanged update...");
    chrome.storage.onChanged.callback({
        geminiApiKey: { newValue: "updated-key" }
    }, "local");
    assert.strictEqual(global.getCachedApiKey(), "updated-key", "Cache should be updated by onChanged");
    const key3 = await global.getApiKeyExport();
    assert.strictEqual(key3, "updated-key", "getApiKey should return new updated key");
    console.log("onChanged update OK.");

    console.log("All tests passed successfully!");
}

runTests().catch(err => {
    console.error("Test failed!");
    console.error(err);
    process.exit(1);
});
