var app = {};
// Looks like the specific Referrer header value: https://t.co/JV5396gd2O is blocked
// In order to bypass this, generate "random" header values
// Pick a random number between 1 and 2
// Convert to Base 36 (so it should be alphanumeric)
// Get first 10 characters after decimal
app.generateReferrer = function() {
  var linkId = (1 + Math.random()).toString(36).substring(2, 12);
  return `https://t.co/${linkId}`;
}
// Modify the referer to twitter.
app.modifyHeaders = function(details) {
  var newRef = app.generateReferrer();
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
  chrome.webRequest.onBeforeSendHeaders.removeListener(app.modifyHeadersAndRemoveListener);
  return ret;
}
// Background listener for certain domain tabs. (You can modify this)
// chrome.webRequest.onBeforeSendHeaders.addListener(app.modifyHeaders, {
//   urls: ["*://*/*"]
// }, [
//   "requestHeaders",
//   "blocking",
//   "extraHeaders"
// ]);
chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
  chrome.declarativeContent.onPageChanged.addRules([{
    conditions: [new chrome.declarativeContent.PageStateMatcher({})],
        actions: [new chrome.declarativeContent.ShowPageAction()]
  }]);
});
// Extension button click for non-listened domain tabs.
chrome.pageAction.onClicked.addListener(function (tab) {
  console.log('clicked');
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
    }, function (tabs) {
      var activeTab = tabs[0];
      var url = tab.url;
      // Register our one-use listener for our next request.
      chrome.webRequest.onBeforeSendHeaders.addListener(app.modifyHeadersAndRemoveListener, {
        urls: [url]
      }, [
        "requestHeaders",
        "blocking",
        "extraHeaders"
      ]);
      // Open a new tab with same url, our one-use listener should help us modify the headers.
      // Must use the one-use listener to modify headers, since `chrome.tabs.create` doesn't allow custom headers.
      chrome.tabs.create({ "url": url });
    });
});
