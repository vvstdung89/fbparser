chrome.runtime.sendMessage({
    action: "getSource",
    source: parsePost(document.body.innerHTML)
});

function parsePost(html){
	if (typeof Parser == "undefined"){
		return {status:"fail"}
	}
	var fbparser = new Parser()
	
	return {status:"ok", data: fbparser.parse(html)}

}

