let crx = document.getElementById('openCrx');
let preview = document.getElementById('openWcmDisabled');
let sites = document.getElementById('openSiteAdmin');
var hosts = new Map();

chrome.storage.sync.get('items', function(data) {
if(data.items && data.items.length > 0){
  var items = data.items.split('|');
  for (let item of items) {
      var mapping = item.split(';');
      var ip = mapping[0];
      var url = mapping[1];
      hosts.set(url, ip);
  }
  }
});

crx.onclick = function(element) {
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
		var href = tabs[0].url;
		var host = new URL(href).hostname;
		var ipForHost = (hosts.get(host) === undefined)?host:hosts.get(host);
		href = href.replace(host, ipForHost).replace("editor.html", "crx/de/index.jsp#").replace('.html','');
		window.open(href);
	});
}

preview.onclick = function(element) {
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    	var href = tabs[0].url;
		href = href.replace('editor.html/','');
		href += "?wcmmode=disabled";
		window.open(href);
	});
}

sites.onclick = function(element) {
	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    	var href = tabs[0].url;
		href = href.replace('editor.html/','{PLACEHOLDER}').replace('.html','').replace("{PLACEHOLDER}","sites.html/");
		window.open(href);
	});
}