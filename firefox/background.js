function changeButtonState(tabInfo) {
  // We don't check the domain since there are now custom domains and subdomains.
  if (tabInfo.status==='complete'/* && tabInfo.url.startsWith("https://medium.com/")*/) {
    browser.browserAction.enable();
  } else {
    browser.browserAction.disable();
  }
}
browser.tabs.onUpdated.addListener(function(tabId, changeInfo, tabInfo) {
  changeButtonState(tabInfo);
});
browser.tabs.onActivated.addListener(function(activeInfo) {
  browser.tabs.get(activeInfo.tabId).then(function(tabInfo) {
    changeButtonState(tabInfo);});
});
browser.runtime.onInstalled.addListener(function(details) {
  browser.tabs.query({
    active: true,
    lastFocusedWindow: true
  }).then(function(array_of_tabs) {
    changeButtonState(array_of_tabs[0]);});
});
browser.windows.onFocusChanged.addListener(function(windowId) {
  browser.tabs.query({
    active: true,
    lastFocusedWindow: true
  }).then(function(array_of_tabs) {
    changeButtonState(array_of_tabs[0]);});
});
browser.browserAction.onClicked.addListener(function(tab) {
  browser.tabs.query({
    active: true,
    lastFocusedWindow: true
  }).then(function(array_of_tabs) {
    var tab = array_of_tabs[0];
    var url = tab.url;
    if (!url.startsWith("https://medium.com/")) {
      browser.windows.create({"url": url, "incognito": true});
    } else {
      var id = url.split("-").pop();
      if (undefined !== id) {
        var request = new XMLHttpRequest();
        request.open("GET", "https://medium.com/p/" + id + "/notes", true);
        request.onload = function() {
          if (200 === request.status) {
            var resp = request.responseText;
            var match = resp.match(/\"webCanonicalUrl\":\"([^"]+)\"/);
            if (null !== match && null !== match[1]) {
              var webCanonicalUrl = match[1];
              browser.tabs.create({"url": webCanonicalUrl});
            } else {
              browser.windows.create({"url": url, "incognito": true});
            }
          }
        };
        request.send();
      }
    }
  });
});
