// Looks like medium is blocking requests the with specific Referrer header value: https://t.co/JV5396gd2O
// In order to bypass this, generate "random" header values
// Pick a random number between 1 and 2
// Convert to Base 36 (so it should be alphanumeric)
// Get first 10 characters after decimal
function generateReferrer() {
  var linkId = (1 + Math.random()).toString(36).substring(2, 12);
  return `https://t.co/${linkId}`;
}}

var app = {};

// Modify the referer to bypass Medium's paywall.
app.modifyHeaders = function(details) {
  // The link is pointed to `medium.com` redirected through a twitter url.
  var newRef = generateReferrer();
  var gotRef = false;
  for (var n in details.requestHeaders) {
    gotRef = details.requestHeaders[n].name.toLowerCase() == "referer";
    if (gotRef) {
      details.requestHeaders[n].value = newRef;
      break;
    }
  }
  if (!gotRef) {
    details.requestHeaders.push({ name: "Referer", value: newRef });
  }
  return { requestHeaders: details.requestHeaders };
}
// Modify referer and unregister our one-use listener.
app.modifyHeadersAndRemoveListener = function(details) {
  let ret = app.modifyHeaders(details);
  // Unregister our one-use listener.
  browser.webRequest.onBeforeSendHeaders.removeListener(app.modifyHeadersAndRemoveListener);
  return ret;
}
// Background listener for all medium domain tabs.
browser.webRequest.onBeforeSendHeaders.addListener(app.modifyHeaders, {
  urls: ["*://*.medium.com/*"]
}, [
  "requestHeaders",
  "blocking"
]);
// Extension button click for non-medium domain tabs.
browser.browserAction.onClicked.addListener(function (tab) {
  browser.tabs.query({
    active: true,
    lastFocusedWindow: true
  }).then(function (tabs) {
    var activeTab = tabs[0];
    var url = tab.url;
    // Register our one-use listener for our next request.
    browser.webRequest.onBeforeSendHeaders.addListener(app.modifyHeadersAndRemoveListener, {
      urls: [url]
    }, [
      "requestHeaders",
      "blocking"
    ]);
    // Open a new tab with same url, our one-use listener should help us modify the headers.
    // Must use the one-use listener to modify headers, since `browser.tabs.create` doesn't allow custom headers.
    browser.tabs.create({ "url": url });
  });
});
