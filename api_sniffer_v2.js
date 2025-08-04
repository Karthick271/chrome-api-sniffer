
(function () {
  const apiLogs = JSON.parse(localStorage.getItem("api_logs") || "[]");

  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [input, init] = args;
    const method = (init && init.method) || 'GET';

    const response = await originalFetch(...args);
    const cloned = response.clone();

    cloned.text().then(body => {
      const log = {
        type: 'fetch',
        method,
        url: input,
        requestBody: init?.body || null,
        responseBody: body,
        timestamp: Date.now(),
      };
      console.log('[FETCH]', log);
      apiLogs.push(log);
      localStorage.setItem("api_logs", JSON.stringify(apiLogs));
    });

    return response;
  };

  // Intercept XMLHttpRequest
  const open = XMLHttpRequest.prototype.open;
  const send = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._requestMethod = method;
    this._requestURL = url;
    return open.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function (body) {
    this.addEventListener('load', function () {
      const log = {
        type: 'xhr',
        method: this._requestMethod,
        url: this._requestURL,
        requestBody: body || null,
        responseBody: this.responseText,
        timestamp: Date.now(),
      };
      console.log('[XHR]', log);
      apiLogs.push(log);
      localStorage.setItem("api_logs", JSON.stringify(apiLogs));
    });
    return send.apply(this, arguments);
  };
 
 

})();
