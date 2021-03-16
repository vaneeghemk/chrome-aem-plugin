const IP_PLACEHOLDER = '{IP}';
const ID_PLACEHOLDER = '{ID}';
const URL_PLACEHOLDER = '{URL}';
const ENTRY = `<tr id='${ID_PLACEHOLDER}'><td><input data-input='ip' type='text' value='${IP_PLACEHOLDER}' /></td><td><input data-input='url' type='text' value='${URL_PLACEHOLDER}' /></td><td><button class='remove' data-id='${ID_PLACEHOLDER}'>-</button></td></tr>`;
const MAPPING_TABLE_ID = 'mappingsTable';
const REMOVE_ID = 'remove';
const SUCCESS_ID = 'success';
const SHOW_STYLE = 'display:inline-block;';
const HIDE_STYLE = 'display:none;'
const INSERT_BEFORE_END = 'beforeend';

const SAVE = document.getElementById('save');
const ADD = document.getElementById('add');

SAVE.onclick = function (element) {
    const table = document.getElementById(MAPPING_TABLE_ID);
    let itemsString = "";
    for (let row of table.children) {
        if (row.querySelector('[data-input="ip"]') != null && row.querySelector('[data-input="url"]') != null) {
            const ipInput = row.querySelector('[data-input="ip"]').value;
            const urlInput = row.querySelector('[data-input="url"]').value;
            if (ipInput !== '' && urlInput !== '') {
                itemsString += (ipInput + ';' + urlInput + '|');
            }
        }
    }

    itemsString = (itemsString.length > 0) ? itemsString.substring(0, itemsString.length - 1) : "";

    chrome.storage.sync.set({items: itemsString}, function () {
        document.getElementById(SUCCESS_ID).style = SHOW_STYLE;
    });
}

ADD.onclick = function (element) {
    document.getElementById(SUCCESS_ID).style = HIDE_STYLE;
    let html = ENTRY;
    let count = document.getElementById(MAPPING_TABLE_ID).dataset.count;
    html = html.replace(IP_PLACEHOLDER, '').replace(URL_PLACEHOLDER, '').replace(new RegExp(ID_PLACEHOLDER, 'g'), ++count);
    document.getElementById(MAPPING_TABLE_ID).dataset.count = count;
    document.getElementById(MAPPING_TABLE_ID).insertAdjacentHTML(INSERT_BEFORE_END, html);
    resetRemoveListeners();
}

chrome.storage.sync.get('items', function (data) {
    let nrOfMappings = 0;
    if (data.items && data.items.length > 0) {
        const items = data.items.split('|');
        for (let item of items) {
            const mapping = item.split(';');
            const ip = mapping[0];
            const url = mapping[1];
            let html = ENTRY;
            html = html.replace(IP_PLACEHOLDER, ip).replace(URL_PLACEHOLDER, url).replace(new RegExp(ID_PLACEHOLDER, 'g'), nrOfMappings);
            document.getElementById(MAPPING_TABLE_ID).insertAdjacentHTML(INSERT_BEFORE_END, html);
            nrOfMappings++;
        }

        document.getElementById(MAPPING_TABLE_ID).dataset.count = nrOfMappings;
    }

    resetRemoveListeners();
});

function resetRemoveListeners() {
    const classname = document.getElementsByClassName(REMOVE_ID);
    Array.from(classname).forEach(function (element) {
        element.addEventListener('click', function (event) {
            document.getElementById(SUCCESS_ID).style = HIDE_STYLE;
            const id = event.target.dataset.id;
            document.getElementById(id).remove();
        });
    });
}