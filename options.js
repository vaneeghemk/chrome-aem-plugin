let entry = "<tr id='{ID}'><td><input data-input='ip' type='text' value='{IP}' /></td><td><input data-input='url' type='text' value='{URL}' /></td><td><button class='remove' data-id='{ID}'>-</button></td></tr>";
let save = document.getElementById('save');
let add = document.getElementById('add');

save.onclick = function(element) { 
  var table = document.getElementById('mappingsTable');
  var itemsString = "";
  var count = 0;
  for(let row of table.children){
    if(row.querySelector('[data-input="ip"]') != null && row.querySelector('[data-input="url"]') != null){
    var ipInput = row.querySelector('[data-input="ip"]').value;
    var urlInput = row.querySelector('[data-input="url"]').value;
    if(ipInput !== "" && urlInput !== ""){
        itemsString += (ipInput+";"+urlInput+"|");
    }
    }
  }

    itemsString = (itemsString.length>0)?itemsString.substring(0,itemsString.length-1):"";

    chrome.storage.sync.set({items: itemsString}, function() {
      document.getElementById('success').style = "display:inline-block;";
    });
}

add.onclick = function (element) {
    var html = entry;
    var count = document.getElementById('mappingsTable').dataset.count;
    html = html.replace('{IP}', '').replace('{URL}', '').replace(new RegExp('{ID}', 'g'), ++count);
    document.getElementById('mappingsTable').dataset.count = count;
    document.getElementById('mappingsTable').insertAdjacentHTML('beforeend', html);
    resetRemoveListeners();
}

chrome.storage.sync.get('items', function(data) {
    var nrOfMappings = 0;
    if(data.items && data.items.length > 0){
      var items = data.items.split('|');
      for (let item of items) {
          var mapping = item.split(';');
          var ip = mapping[0];
          var url = mapping[1];
          var html = entry;
          html = html.replace('{IP}', ip).replace('{URL}', url).replace(new RegExp('{ID}', 'g'), nrOfMappings);
          document.getElementById('mappingsTable').insertAdjacentHTML('beforeend', html);
          nrOfMappings++;
      }
    var html = entry;
    html = html.replace('{IP}', '').replace('{URL}', '').replace(new RegExp('{ID}', 'g'), nrOfMappings);
    document.getElementById('mappingsTable').insertAdjacentHTML('beforeend', html);
      document.getElementById('mappingsTable').dataset.count = nrOfMappings;
    }

    resetRemoveListeners();
});

function resetRemoveListeners(){
  var classname = document.getElementsByClassName("remove");
    Array.from(classname).forEach(function(element) {
      element.addEventListener('click', function(event){
        var id = event.target.dataset.id;
        document.getElementById(id).remove();
      });
    });
}