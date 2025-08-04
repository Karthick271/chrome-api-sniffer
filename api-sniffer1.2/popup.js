document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('toggle');
  const clearBtn = document.getElementById('clearOld');
  const downloadBtn = document.getElementById('download');

  // 1) Initialize checkbox state and apply it immediately
  chrome.storage.sync.get({ buttonsEnabled: false }, ({ buttonsEnabled }) => {
    toggle.checked = buttonsEnabled;
    applyToggle(buttonsEnabled);
  });

  // 2) When user toggles, inject or remove buttons
  toggle.addEventListener('change', async () => {
    const enabled = toggle.checked;
    await chrome.storage.sync.set({ buttonsEnabled: enabled });
    applyToggle(enabled);
  });

  // 3) Clear logs on page
  clearBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        window.__apiSnifferLogs = [];
        localStorage.removeItem('api_logs');
        alert('Logs cleared!');
      }
    });
  });

  // 4) Download JSON logs from page
  downloadBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const logs = JSON.parse(localStorage.getItem('api_logs') || '[]');
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'api_logs.json';
        a.click();
      }
    });
  });

  // Helper to show or hide sticky buttons
  async function applyToggle(enabled) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (enabled) {
      // re-inject content.js so it adds buttons
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } else {
      // remove any existing buttons by ID
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          ['api-json-btn', 'api-txt-btn', 'api-clear-btn'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
          });
        }
      });
    }
  }
});
