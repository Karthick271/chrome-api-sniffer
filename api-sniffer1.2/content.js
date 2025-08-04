
(() => {
  if (!window.__apiSnifferLogs) {
    window.__apiSnifferLogs = JSON.parse(localStorage.getItem('api_logs') || '[]');
  }
  function saveLog(entry) {
    window.__apiSnifferLogs.push(entry);
    localStorage.setItem('api_logs', JSON.stringify(window.__apiSnifferLogs));
  }
  // Hook fetch
  const origFetch = window.fetch;
  window.fetch = async (...args) => {
    const [url, init] = args;
    const response = await origFetch.apply(this, args);
    response.clone().text().then(body => {
      saveLog({type:'fetch',method:init?.method||'GET',url,requestBody:init?.body||null,responseBody:body,timestamp:new Date().toISOString()});
    });
    return response;
  };
  // Hook XHR
  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function(m, u) {
    this._method = m; this._url = u;
    return origOpen.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function(body) {
    this.addEventListener('load', () => {
      saveLog({type:'xhr',method:this._method,url:this._url,requestBody:body||null,responseBody:this.responseText,timestamp:new Date().toISOString()});
    });
    return origSend.apply(this, arguments);
  };
  // Sticky buttons
  chrome.storage.sync.get({buttonsEnabled:false}, ({buttonsEnabled}) => {
    if (!buttonsEnabled) return;
    function addButton(id, text, style, handler) {
      if (document.getElementById(id)) return;
      const btn = document.createElement('button');
      btn.id = id; btn.innerText = text; btn.style.cssText = style;
      btn.onclick = handler; document.body.appendChild(btn);
    }
    const baseStyle = 'position:fixed;right:20px;padding:8px 12px;border:none;border-radius:4px;cursor:pointer;z-index:99999;color:#fff;font-size:12px;';
    addButton('api-json-btn','⬇ JSON Logs', baseStyle+'bottom:20px;background:#000;', ()=> {
      const logs = JSON.parse(localStorage.getItem('api_logs')||'[]');
      const blob = new Blob([JSON.stringify(logs,null,2)],{type:'application/json'});
      const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='api_logs.json'; a.click(); URL.revokeObjectURL(a.href);
    });
    addButton('api-txt-btn','📄 TXT Logs', baseStyle+'bottom:60px;background:#007bff;', ()=> {
      const logs = JSON.parse(localStorage.getItem('api_logs')||'[]');
      const text = logs.map(e=>`[${e.timestamp}] ${e.method} ${e.url}\nReq: ${e.requestBody||'<none>'}\nRes: ${e.responseBody}\n---`).join('\n\n');
      const blob = new Blob([text],{type:'text/plain'}); const a=document.createElement('a');
      a.href=URL.createObjectURL(blob); a.download='api_logs.txt'; a.click(); URL.revokeObjectURL(a.href);
    });
    addButton('api-clear-btn','🧹 Clear Logs', baseStyle+'bottom:100px;background:#dc3545;', ()=> {
      window.__apiSnifferLogs=[]; localStorage.removeItem('api_logs'); alert('Logs cleared');
    });
  });
})();
