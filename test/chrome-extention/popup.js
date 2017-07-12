console.log("Popup script start ... ")

chrome.runtime.onMessage.addListener(function(request, sender) {
	console.log("popup " , request.source)
})