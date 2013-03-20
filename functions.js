function log(append, msg) {
  var buffer = document.querySelector('#buffer');
  buffer.innerHTML = (append) ? buffer.innerHTML + msg : msg;
}

function httpGet(theUrl, key, getsize){
  var http = new XMLHttpRequest();
  http.open("GET", theUrl, true);
  http.setRequestHeader('api_token', key);

  http.onreadystatechange = function() {

    if (http.readyState == 4)
      if (http.status == 200){

        var nideas = http.getResponseHeader("pager_total_count");

        if (getsize) { // ignore data
          log(false, 'Gathering <b>'+ nideas +'</b> ideas, please wait.<br><img src="ajax-loader.gif">');
          var theUrl = "http://ideas.ideascale.com/a/rest/v1/ideas/top/0/"+ nideas;
          httpGet(theUrl, key, false);
        }
        else // parse data
        {
          var result = JSON.parse(http.responseText);

          var alldata = JSON.stringify(result, null, 4);
          document.querySelector('#get').disabled = false;
          var filename = "IdeaScale-"+ new Date().getTime() +".json";
          log(false, 'Found <b>'+ nideas +'</b> ideas<br><a href="data:application/json;charset=utf8,' + encodeURIComponent(alldata) + '" id="jsonfile" download="'+ filename +'" title="Download data!" target="_blank">Save as JSON file</a><br>');

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
  theUrl = "http://ideas.ideascale.com/a/rest/v1/ideas/top/0/1";
  log(false, '<img src="ajax-loader.gif">');
  httpGet(theUrl, key, true);
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
