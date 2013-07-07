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
(function(button, count){
  button.addEventListener('click',
    function(evt) {

    upvoltPlug(function(err,result) {
      if (err) return console.log(err);

      count.textContent = result.upvolts;

      if (result.upvolted) {
        button.className = 'upvolted';
      } else {
        button.className = '';
      }
    });
  });
})(document.getElementById('upvolt-button'),
  document.getElementById('upvolt-count'));
