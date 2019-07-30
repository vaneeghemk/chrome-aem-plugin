 chrome.runtime.onInstalled.addListener(function() {
 	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
      chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          css: ["iframe[id=ContentFrame]"],
        })
        ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
      }]);
    });
 });

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

 chrome.commands.onCommand.addListener(function(command) {
        switch(command){
        	case 'openInCrx':
        		chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
					var href = tabs[0].url;
					var host = new URL(href).hostname;
					var ipForHost = (hosts.get(host) === undefined)?host:hosts.get(host);
					href = href.replace(host, ipForHost).replace("editor.html", "crx/de/index.jsp#");
					(href.indexOf('.html')>0)?href = href.substring(0, href.indexOf('.html')):href=href;
					window.open(href);
				});
        		break;
        	case 'openInPreview':
        		chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    				var href = tabs[0].url;
					href = href.replace('editor.html/','');
					(href.indexOf("?") > -1)?href += "&wcmmode=disabled":href+="?wcmmode=disabled";
					window.open(href);
				});
        		break;
        	case 'openInSites':
        		chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    				var href = tabs[0].url;
					href = href.replace('editor.html/','{PLACEHOLDER}');
					(href.indexOf('.html')>0)?href = href.substring(0, href.indexOf('.html')):href=href;
					href = href.replace("{PLACEHOLDER}","sites.html/");
					window.open(href);
				});
        		break;
        }
});
