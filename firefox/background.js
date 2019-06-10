browser.webRequest.onBeforeSendHeaders.addListener(function (details) {
  var newRef = "https://t.co/JV5396gd2O";
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
}, {
  urls: ["*://*.medium.com/*"]
}, [
  "requestHeaders",
  "blocking"
]);
