const HTML_EXTENSION = '.html';
const EDITOR_URL = 'editor.html';
const SITES_URL = 'sites.html';
const CRX_URL = 'crx/de/index.jsp#';
const PAGE_PROPS_URL = 'mnt/overlay/wcm/core/content/sites/properties.html?item=';
const WCM_MODE_DISABLED = 'wcmmode=disabled';
const PLACEHOLDER = '{PLACEHOLDER}';

const edit = document.getElementById('openEdit');
const crx = document.getElementById('openCrx');
const preview = document.getElementById('openWcmDisabled');
const sites = document.getElementById('openSiteAdmin');
const properties = document.getElementById('openProperties');
let hosts = new Map();

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

chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    let href = tabs[0].url;
    const url = new URL(href);
    if (url.search.includes(WCM_MODE_DISABLED)) {
        preview.disabled = true;
    } else {
        edit.disabled = true;
    }
});

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

edit.onclick = function (element) {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        let href = tabs[0].url;
        const url = new URL(href);

        if (href.includes(WCM_MODE_DISABLED)) {
            const path = url.pathname;
            const pathIdx = href.indexOf(path);
            href = href.splice(pathIdx, 0, `/${EDITOR_URL}`).replace(WCM_MODE_DISABLED, '');
            chrome.tabs.create({url: href});
        }
    });
}

crx.onclick = function (element) {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        let href = tabs[0].url;
        const url = new URL(href);
        const host = url.hostname;
        const ipForHost = (hosts.get(host) === undefined) ? host : hosts.get(host);
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
    });
}

preview.onclick = function (element) {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        let href = tabs[0].url;
        if (!href.includes(WCM_MODE_DISABLED)) {
            href = href.replace(`${EDITOR_URL}/`, '');
            (href.indexOf("?") > -1) ? href += `&${WCM_MODE_DISABLED}` : href += `?${WCM_MODE_DISABLED}`;
            chrome.tabs.create({url: href});
        }
    });
}

sites.onclick = function (element) {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        let href = tabs[0].url;
        const url = new URL(href);
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
    });
}

properties.onclick = function (element) {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        let href = tabs[0].url;
        const url = new URL(href);

        if (href.includes(WCM_MODE_DISABLED)) {
            let path = url.pathname;
            path = path.substring(0, path.indexOf(HTML_EXTENSION));
            href = href.substring(0, href.indexOf(HTML_EXTENSION));
            const pathIdx = href.indexOf(path);
            href = href.splice(pathIdx, 0, `/${PAGE_PROPS_URL}`);
        } else {
            href = href.replace(EDITOR_URL, PLACEHOLDER);

            if (href.includes(HTML_EXTENSION)) {
                href = href.substring(0, href.indexOf(HTML_EXTENSION))
            }

            href = href.replace(PLACEHOLDER, PAGE_PROPS_URL);
        }
        chrome.tabs.create({url: href});
    });
}