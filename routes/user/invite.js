var express = require('express');

var randomUrlToken = require('../../lib/randomUrlToken.js');

module.exports = function(db,mailer) {
  var app = express();

  var tokens = db.collection('tokens');

  app.get('/invite', function(req, res){
    if(req.session.currentUser)
      return res.render('invite-send.jade');
    else
      return res.render('invite-request.jade');
  });
  app.post('/invite', function(req, res, next) {
    var email = req.body.email;
    if(email) email = email.toLowerCase().trim();
    if(!email)
      return next(new Error('No email address'));
    else if(!/^[^\s@]+@[^\s@]+$/.test(email))
      return next(new Error('Not an email address: ' + email));

    if(req.session.currentUser) {
      //TODO: check email address hasn't already registered (or made too many
      // requests for this email)
      randomUrlToken(function(err, token){
        if (err) return next(err);
        //TODO: set tokens to expire
        tokens.insert({_id:token, type:'register',
          email: email, invitedBy: req.session.currentUser._id},
        function(err, inserted){
          if (err) return next(err);
          mailer.sendMail({
            to: email,
            from: 'tokens@plugmap.com',
            subject: 'PlugMap user registration link',
            text: 'To register an account on plugmap.com with this email '
             + 'address, go to http://plugmap.com/register/token/' + token
             + ' and fill out the registration form.\n\n'
             + "This token will expire in three days. "
             + "If you did not request this link, you can just "
             + "delete this email."
          }, function(mailError, response){
            if (mailError){
              tokens.remove({_id:token}, function(err,remresult){
                if (err) return next(err);
                //TODO: Nicer mail error handling
                else next(mailError);
              });
            } else {
              //TODO: debit invite from inviter's account
              res.render('invite-inform.jade');
            }
          }); //sendMail
        }); //tokens.insert
      }); //randomEmailToken
    } else {
      res.render('bad-session.jade');
    }
  }); // POST /register
  return app;
};
