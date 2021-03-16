const OPEN_EDIT_ACTION = 'openInEdit';
const OPEN_CRX_ACTION = 'openInCrx';
const OPEN_PREVIEW_ACTION = 'openInPreview';
const OPEN_SITES_ACTION = 'openInSites';
const HTML_EXTENSION = '.html';
const EDITOR_URL = 'editor.html';
const SITES_URL = 'sites.html';
const CRX_URL = 'crx/de/index.jsp#';
const WCM_MODE_DISABLED = 'wcmmode=disabled';
const PLACEHOLDER = '{PLACEHOLDER}';

if (!String.prototype.splice) {
    /**
     * {JSDoc}
     *
     * The splice() method changes the content of a string by removing a range of
     * characters and/or adding new characters.
     *
     * @this {String}
     * @param {number} start Index at which to start changing the string.
     * @param {number} delCount An integer indicating the number of old chars to remove.
     * @param {string} newSubStr The String that is spliced in.
     * @return {string} A new string with the spliced substring.
     */
    String.prototype.splice = function (start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
}

chrome.runtime.onInstalled.addListener(function () {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    css: ["iframe[id=ContentFrame]"],
                }),
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {queryContains: 'wcmmode=disabled'},
                })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});

const hosts = new Map();

chrome.storage.sync.get('items', function (data) {
    if (data.items && data.items.length > 0) {
        const items = data.items.split('|');
        for (let item of items) {
            const mapping = item.split(';');
            const ip = mapping[0];
            const url = mapping[1];
            hosts.set(url, ip);
        }
    }
});

chrome.commands.onCommand.addListener(function (command) {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        let href = tabs[0].url;
        const url = new URL(href);
        const host = url.hostname;
        const ipForHost = (hosts.get(host) === undefined) ? host : hosts.get(host);
        switch (command) {
            case OPEN_EDIT_ACTION:
                if (href.includes(WCM_MODE_DISABLED)) {
                    const path = url.pathname;
                    const pathIdx = href.indexOf(path);
                    href = href.splice(pathIdx, 0, `/${EDITOR_URL}`).replace(WCM_MODE_DISABLED, '');
                    chrome.tabs.create({url: href});
                }
                break;
            case OPEN_CRX_ACTION:
                if (href.includes(WCM_MODE_DISABLED)) {
                    const path = url.pathname;
                    const pathIdx = href.indexOf(path);
                    href = href.splice(pathIdx, 0, `/${CRX_URL}`);
                } else {
                    href = href.replace(host, ipForHost).replace(EDITOR_URL, CRX_URL);
                }

                if (href.includes(HTML_EXTENSION)) {
                    href = href.substring(0, href.indexOf(HTML_EXTENSION))
                }

                chrome.tabs.create({url: href});
                break;
            case OPEN_PREVIEW_ACTION:
                if (!href.includes(WCM_MODE_DISABLED)) {
                    href = href.replace(`${EDITOR_URL}/`, '');
                    (href.indexOf("?") > -1) ? href += `&${WCM_MODE_DISABLED}` : href += `?${WCM_MODE_DISABLED}`;
                    chrome.tabs.create({url: href});
                }
                break;
            case OPEN_SITES_ACTION:
                if (href.includes(WCM_MODE_DISABLED)) {
                    let path = url.pathname;
                    path = path.substring(0, path.indexOf(HTML_EXTENSION));
                    href = href.substring(0, href.indexOf(HTML_EXTENSION));
                    const pathIdx = href.indexOf(path);
                    href = href.splice(pathIdx, 0, `/${SITES_URL}`);
                } else {
                    href = href.replace(`${EDITOR_URL}/`, PLACEHOLDER);

                    if (href.includes(HTML_EXTENSION)) {
                        href = href.substring(0, href.indexOf(HTML_EXTENSION))
                    }

                    href = href.replace(PLACEHOLDER, `${SITES_URL}/`);
                }
                chrome.tabs.create({url: href});
                break;
        }
    });
});
