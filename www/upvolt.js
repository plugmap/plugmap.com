function upvoltPlug(cb) {
  /*global csrfToken*/
  var req = new XMLHttpRequest();

  var target = location.origin
    + location.pathname.replace(/\/?$/, '/')
    + 'upvolt';

  req.open('POST', target, true);
  req.onreadystatechange = function (aEvt) {
    if (req.readyState == 4) {
      if(req.status == 200)
        cb(null,JSON.parse(req.responseText));
      else
        cb(JSON.parse(req.responseText));
    }
  };
  req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  req.send('_csrf='+csrfToken);
}

document.getElementById('upvolt-button').addEventListener('click',
  function(evt) {

  upvoltPlug(function(err,result) {
    if (err) return console.log(err);

    evt.target.textContent = result.upvolts + ' Upvolts';

    if (result.upvolted) {
      evt.target.className = 'upvolted';
    } else {
      evt.target.className = '';
    }
  });
});