function log(append, msg) {
  var buffer = document.querySelector('#buffer');
  buffer.innerHTML = (append) ? buffer.innerHTML + msg : msg;
}

var alldata = "";
var page = 0;
var nideas = 0;
var size = 100;

function httpGet(theUrl, key){
  var http = new XMLHttpRequest();
  http.open("GET", theUrl, true);
  http.setRequestHeader('api_token', key);

  http.onreadystatechange = function() {

    if (http.readyState == 4)
      if (http.status == 200){
        result = JSON.parse(http.responseText);

        if (result.length > 0){
          nideas += result.length;
          alldata += JSON.stringify(result, null, 4);
          page += 1;
          theUrl = "http://ideas.ideascale.com/a/rest/v1/ideas/top/"+ page +"/"+ size;
          httpGet(theUrl, key);
        }
        else
        {
          document.querySelector('#get').disabled = false;
          log(false, "Found <b>"+ nideas +"</b> ideas<br>");
          var filename = "IdeaScale-"+ new Date().getTime() +".json";
          log(true, '<a href="data:application/json;charset=utf8,' + encodeURIComponent(alldata) + '" id="jsonfile" download="'+ filename +'" title="Download data!" target="_blank">Save as JSON file</a><br>');

          document.querySelector('#jsonfile').addEventListener('click', function() { log(true, filename + " saved!") });
        }
      }
      else
      {
        document.querySelector('#get').disabled = false;
        result = JSON.parse(http.responseText);
        log(false, '<b>Error</b>: '+result.message);
        if (result.key == "LICENSE_NOT_ALLOWED")
          log(true, '<br>This means that the IdeaScale instance you are trying to access<br>doesn\'t provide API support (eg. Lite, Monthly or Annual plan)');
      }
    }
  http.send();
}

function getIdeas(key){
  theUrl = "http://ideas.ideascale.com/a/rest/v1/ideas/top/"+ page +"/"+ size;
  log(false, 'Gathering ideas, please wait.<br><img src="ajax-loader.gif">');
  httpGet(theUrl, key);
}

document.querySelector('#help').addEventListener('click', function() {
  log(false, 'You can obtain an API token clicking <a href="http://ideascale.com/a/profile/api-tokens" target="_blank">here</a>.');
});

document.querySelector('#get').addEventListener('click', function() {
  var key = document.querySelector('#key').value;
  if (key.length > 0){
    if (document.querySelector('#remember').checked)
      chrome.storage.local.set({'key': key});
    else
      chrome.storage.local.remove('key');
    document.querySelector('#get').disabled = true;
    getIdeas(document.querySelector('#key').value);
  } else
    log(false, '<b>Insert your API Token first.</b><br>You can obtain an API token clicking <a href="http://ideascale.com/a/profile/api-tokens" target="_blank\
">here</a>.');
});

chrome.storage.local.get('key', function(item){
  if (item.key){
    document.querySelector('#key').value = item.key;
    document.querySelector('#remember').checked = true;
  }
});
