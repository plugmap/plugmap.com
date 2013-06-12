var bcrypt = require('bcrypt');
var impossibleHash =
  '$2a$10$00000000000000000000000000000000000000000000000000000';
var express = require('express');

//Functions for setting and unsetting the currentUser for the session.
var sessionUser = require('./sessionUser.js');

module.exports = function(db) {
  var app = express();

  var tokens = db.collection('tokens');
  var users = db.collection('users');

  app.get('/register', function(req, res){
    if(req.session.currentUser)
      return res.render('invite-send.jade');
    else
      return res.render('invite-request.jade');
  });
  app.get('/register/token/:token', function(req,res,next){
    tokens.findOne({_id: req.params.token, type:'register'},
      function(err,tokenDoc){
        if (err) return next(err);
        if (tokenDoc) {
          res.render('register-finalize.jade');
        } else {
          res.render('bad-token.jade',function(err,html){
            if (err) return next(err);
            res.send(404,html);
          });
        }
      }); //tokens.findOne
  });
  app.post('/register/token/:token', function(req,res,next){
    tokens.findOne({_id: req.params.token, type:'register'},
      function(err,tokenDoc){

      if (err) return next(err);
      if (tokenDoc) {
        //if this registration used a valid passphrase
        if (process.env.REGISTRATION_SECRET_PHRASE &&
          req.body.passphrase != process.env.REGISTRATION_SECRET_PHRASE) {

          //NOTE: All failure renders should be implemented as redirects
          //back to req.originalUrl with a querystring parameter
          //indicative of the failure type
          res.render('register-finalize.jade',
            {failure: 'Incorrect secret phrase'});
        } else if (req.body.username.length > 15) {
          res.render('register-finalize.jade',
            {failure: 'Username too long'});
        } else if (!/^[a-zA-Z0-9_]+$/.test(req.body.username)) {
          res.render('register-finalize.jade',
            {failure: 'Alphanumerics and underscores only'});
        } else {
          users.findOne({unLower: req.body.username.toLowerCase()},
            function(err,userExists){

            if (userExists) {
              res.render('register-finalize.jade',
                {failure: 'Username is taken'});
            } else {
              tokens.remove({_id:req.params.token}, function(err,remresult){
                if (err) return next(err);
                bcrypt.genSalt(10, function(err, salt) {
                  if (err) return next(err);
                  bcrypt.hash(req.body.password, salt, function(err, hash) {
                    if (err) return next(err);
                    var newUserDoc = {
                      username: req.body.username,
                      displayname: req.body.displayname,
                      unLower: req.body.username.toLowerCase(),
                      email: tokenDoc.email,
                      passhash: req.body.password ? hash : impossibleHash
                    };
                    if (tokenDoc.invitedBy)
                      newUserDoc.invitedBy = tokenDoc.invitedBy;
                    users.insert(newUserDoc, function (err,inserted) {
                      if (err) return next(err);
                      if (req.body.authenticate) {
                        sessionUser.authenticate(inserted[0],req,res);
                      }
                      return res.redirect('/');
                    }); //users.insert
                  }); //bcrypt.hash
                }); //bcrypt.genSalt
              }); //tokens.remove
            } // if (userExists) else
          }); //users.findOne
        }
      } else {
        // NOTE: Bad POSTs should probably get a different error
        // (something that doesn't suggest that the URL might have been
        // entered wrong)
        res.render('bad-token.jade',function(err,html){
          if (err) return next(err);
          res.send(404,html);
        });
      }
    }); //tokens.findOne
  });

  return app;
};
