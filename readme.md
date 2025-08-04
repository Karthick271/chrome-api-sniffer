# API Sniffer Chrome Extension and Bookmarklet

A lightweight tool to intercept browser `fetch()` and `XMLHttpRequest` calls on any web page, persist logs in `localStorage`, and export them as JSON or plain-text. You can install it as a Chrome extension or inject it on-demand via a bookmarklet.

## Features

- **Automatic capture** of all `fetch` and XHR calls.
- **Persistent storage** in `localStorage` under `api_logs` key.
- **Export buttons**: Download logs as `.json` or `.txt` via floating page buttons.
- **Popup controls**: Toggle sticky buttons, clear logs, download from the extension popup.
- **Bookmarklet** support: One-click injection without installing an extension.

---

## Repository Structure

```
chrome-api-sniffer/
├── api_sniffer_v2.js      # Core sniffer script for bookmarklet or manual paste
├── content.js             # Content script for Chrome extension
├── manifest.json          # Chrome extension manifest
├── popup.html             # Extension popup UI
├── popup.js               # Popup logic for toggling and exporting
├── icon16.png             # Extension icons (16×16)
├── icon48.png             # Extension icons (48×48)
├── icon128.png            # Extension icons (128×128)
└── README.md              # This readme
```

---

## 1. Using the Bookmarklet (No Extension Required)

### 1.1 Host the Sniffer Script

1. Push `api_sniffer_v2.js` to your GitHub repo (e.g., in the `main` branch).
2. Obtain the jsDelivr CDN URL:
   ```text
   https://cdn.jsdelivr.net/gh/<YOUR_USERNAME>/chrome-api-sniffer@main/api_sniffer_v2.js
   ```

### 1.2 Create the Bookmarklet

1. Enable your browser’s bookmarks bar:
   - **Chrome:** `Ctrl+Shift+B` (Windows/Linux) or `⌘+Shift+B` (Mac)
2. Right-click the bookmarks bar → **Add page...**
3. Fill in:
   - **Name:** Sniff APIs
   - **URL:**
     ```javascript
     javascript:(()=>{
       fetch('https://cdn.jsdelivr.net/gh/<YOUR_USERNAME>/chrome-api-sniffer@main/api_sniffer_v2.js')
         .then(r => r.text())
         .then(eval)
         .catch(console.error);
     })();
     ```
4. Click **Save**.

### 1.3 Use the Bookmarklet

1. Navigate to any page you want to debug.
2. Click the **Sniff APIs** bookmark.
3. In the Console, confirm:
   ```text
   API logs initialized: []
   ```
4. Trigger network activity (click buttons, navigate).
5. Floating buttons “⬇ JSON Logs” and “📄 TXT Logs” appear at bottom-right.
6. Export logs or clear them as needed.

---

## 2. Installing as a Chrome Extension

### 2.1 Load Unpacked Extension

1. Clone this repo locally.
2. In Chrome, go to `chrome://extensions`.
3. Enable **Developer mode** (top-right).
4. Click **Load unpacked** and select the repo folder.

### 2.2 Popup Controls

- **Show Sticky Buttons** checkbox:
  - Toggles floating export/clear buttons on the current page.
- **Clear Logs** button:
  - Wipes `localStorage.api_logs` and in-memory logs.
- **Download JSON Logs** button:
  - Downloads `api_logs.json` from the active tab.

### 2.3 Usage Workflow

1. Open any page after loading the extension.
2. Click the extension icon → **Show Sticky Buttons**.
3. The floating buttons appear; use them to export or clear logs.
4. Or use the popup **Clear Logs** / **Download JSON Logs** at any time.

---

## 3. Customization

- **Icons:** Replace `icon16.png`, `icon48.png`, `icon128.png` with your own artwork.
- **Styling:** Modify `content.js` button CSS (`style.cssText`).
- **Storage:** Switch to `chrome.storage.local` if you need cross-tab persistence in an extension.

---

## 4. Troubleshooting

- **Buttons not hiding**: Ensure you toggle off and the popup’s toggle handler removes buttons via injected script.
- **Empty logs**: Confirm network calls happen *after* injection/popup toggle.
- **CORS errors**: Use jsDelivr CDN URL for reliable hosting.

---

## 5. License

MIT ©&#x20;

