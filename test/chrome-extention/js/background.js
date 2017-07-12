console.log("Background script start ...")

var curTabId 
function checkForValidUrl(tabId, changeInfo, tab) {
  if (tab.url.indexOf('facebook.com') > -1) {
  	curTabId = tabId
    chrome.pageAction.show(tabId);
  }
};

chrome.tabs.onUpdated.addListener(checkForValidUrl);

chrome.pageAction.onClicked.addListener(function() {
	chrome.tabs.executeScript(curTabId, {
	    file: "js/jquery-2.1.4.min.js"
	});

	chrome.tabs.executeScript(curTabId, {
        file: 'js/fbparser.js'
	}, function() {
    	  chrome.tabs.executeScript(curTabId, {
		    file: "js/parser.js"
		});
	});
})


chrome.runtime.onMessage.addListener(function(request, sender) {
	console.log(request.source)	
})