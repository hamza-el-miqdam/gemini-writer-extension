const { performance } = require('perf_hooks');

// Simulated chrome.storage.local.get (always async)
const storage = {
    geminiApiKey: "test-api-key-12345"
};

function chromeStorageGet(key, callback) {
    // Even a zero-delay setTimeout forces the callback to the next tick,
    // simulating the minimum asynchronous overhead.
    setImmediate(() => {
        const result = {};
        result[key] = storage[key];
        callback(result);
    });
}

const cachedValue = storage.geminiApiKey;

async function benchmark() {
    const iterations = 1000;

    // Baseline: Asynchronous Storage Retrieval
    console.log(`Running benchmark with ${iterations} iterations...`);

    const startAsync = performance.now();
    for (let i = 0; i < iterations; i++) {
        await new Promise(resolve => {
            chromeStorageGet("geminiApiKey", (data) => {
                const val = data.geminiApiKey;
                resolve(val);
            });
        });
    }
    const endAsync = performance.now();
    const asyncTime = endAsync - startAsync;
    console.log(`Async Storage Retrieval: ${asyncTime.toFixed(4)} ms (total), ${(asyncTime / iterations).toFixed(4)} ms (avg)`);

    // Optimization: Synchronous Variable Access
    const startSync = performance.now();
    for (let i = 0; i < iterations; i++) {
        const val = cachedValue;
    }
    const endSync = performance.now();
    const syncTime = endSync - startSync;
    console.log(`Sync Variable Access: ${syncTime.toFixed(4)} ms (total), ${(syncTime / iterations).toFixed(4)} ms (avg)`);

    const improvement = ((asyncTime - syncTime) / asyncTime) * 100;
    console.log(`Improvement: ${improvement.toFixed(2)}%`);
}

benchmark();
