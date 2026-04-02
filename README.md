# Gemini Writer Assistant

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

**Gemini Writer Assistant** is a Chrome extension that leverages Google's Gemini API to help you fix grammar, spelling, and improve the writing style of your text directly within your browser.

## Features

- **Context Menu Integration**: Easily accessible via right-click on any selected text.
- **Smart Replacement**: Automatically replaces selected text in inputs, textareas, and content-editable elements (like email editors).
- **Grammar & Style Optimization**: Uses the `gemini-3-flash-preview` model to correct and polish your writing while maintaining a professional yet natural tone.
- **Secure API Key Storage**: Your API key is stored locally in your browser.

## Installation

This extension is currently installed via "Developer Mode".

1.  **Clone or Download** this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions/`.
3.  Enable **Developer mode** by toggling the switch in the top-right corner.
4.  Click the **Load unpacked** button that appears.
5.  Select the folder containing this extension's files (the directory containing `manifest.json`).

## Configuration

Before using the extension, you need to provide your own Google Gemini API Key.

1.  Get an API key from [Google AI Studio](https://aistudio.google.com/).
2.  Click the **Gemini Writer Assistant** icon in your Chrome toolbar.
3.  Paste your API Key into the input field.
4.  Click **Save Key**.

## Usage

1.  Highlight any text inside a text box, input field, or editor on a webpage.
2.  Right-click the selection to open the context menu.
3.  Select **Fix Grammar & Optimize (Gemini)**.
4.  Wait a moment for the AI to process the text. The selected text will be automatically replaced with the improved version.

> **Note:** If the extension cannot automatically replace the text (e.g., on some complex websites), it will alert you with the corrected text so you can copy-paste it manually.

## License

Distributed under the MIT License. See `LICENSE` for more information.
