// Looks like medium is blocking requests the with specific Referrer header value: https://t.co/JV5396gd2O
// In order to bypass this, generate "random" header values
// Pick a random number between 1 and 2
// Convert to Base 36 (so it should be alphanumeric)
// Get first 10 characters after decimal
function generateReferrer() {
  var linkId = (1 + Math.random()).toString(36).substring(2, 12);
  return `https://t.co/${linkId}`;
}

chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
  var newRef = generateReferrer();
  var gotRef = false;
  for(var n in details.requestHeaders){
    gotRef = details.requestHeaders[n].name.toLowerCase()=="referer";
    if(gotRef){
      details.requestHeaders[n].value = newRef;
      break;
    }
  }
  if(!gotRef){
    details.requestHeaders.push({name:"Referer",value:newRef});
  }
  return {requestHeaders:details.requestHeaders};
},{
  urls:["*://*.medium.com/*"]
},[
  "requestHeaders",
  "blocking",
  "extraHeaders"
]);
