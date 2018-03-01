chrome.runtime.onInstalled.addListener(function() {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { urlContains: 'https://medium.com/' },
          })
        ],
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

chrome.pageAction.onClicked.addListener(function(tab) {
  chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  }, function(array_of_tabs) {
    var tab = array_of_tabs[0];
    var url = tab.url;
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
            chrome.tabs.create({"url": webCanonicalUrl});
          } else {
            chrome.windows.create({"url": url, "incognito": true});
          }
        }
      };
      request.send();
    }
  });
});
