var bcrypt = require('bcryptjs');
var impossibleHash =
  '$2a$10$00000000000000000000000000000000000000000000000000000';
var express = require('express');

//Functions for setting and unsetting the currentUser for the session.
var sessionUser = require('./sessionUser.js');

var randomUrlToken = require('../../lib/randomUrlToken.js');

module.exports = function(db,mailer) {
  var app = express();

  var tokens = db.collection('tokens');
  var users = db.collection('users');

  app.get('/login', function(req,res){
    res.render('login.jade');
  });
  app.post('/login', function(req,res,next) {
    //NOTE: this should be brute-force-proofed
    users.findOne({$or:[{unLower: req.body.username.toLowerCase()},
      {email: req.body.username.toLowerCase()}]},
      function(err, user) {

      if (err) return next(err);
      // Compare against an impossible hash if no user for timing reasons.
      bcrypt.compare(req.body.password,
        user ? user.passhash : impossibleHash, function(err, hashMatch) {
          if (err) return next(err);
          if (hashMatch) {
            sessionUser.authenticate(user,req,res);
            return res.redirect('/');
          } else {
            //NOTE: Responding to the post with a non-redirect isn't too cool
            return res.render('login.jade',{
              failure:'Invalid username or password.'});
          }
      });
    });
  }); // POST /login
  app.post('/login/token', function(req,res,next) {
    //NOTE: this should be token-request-limited
    users.findOne({$or:[{unLower: req.body.username.toLowerCase()},
      {email: req.body.username.toLowerCase()}]},
      function(err, user) {

      if (err) return next(err);
      // Submit token
      if(user) {
        randomUrlToken(function(err, token){
          if (err) return next(err);
          //TODO: set tokens to expire
          tokens.insert({_id:token, type:'login',
            user: {
              _id: user._id,
              username: user.username,
              email: user.email
            }
          },
          function(err, inserted){
            if (err) return next(err);
            mailer.sendMail({
              to: user.email,
              from: 'tokens@plugmap.com',
              subject: 'PlugMap login token',
              text: 'To log in to your account, go to http://plugmap.com/login/token/' + token
               + ' and press the button.\n\n'
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
                res.render('login-tokeninform.jade');
              }
            }); //sendMail
          }); //tokens.insert
        }); //randomEmailToken
      } else { //if not user
        //TODO: fake lag for timing symmetry
        res.render('login-tokeninform.jade');
      }
    }); //users.findOne
  }); // POST /login/token
  app.get('/login/token/:token', function(req,res,next){
    tokens.findOne({_id: req.params.token, type:'login'},
      function(err,tokenDoc){
        if (err) return next(err);
        if (tokenDoc) {
          res.render('login-tokenfinalize.jade',{user:tokenDoc.user});
        } else {
          res.render('bad-token.jade',function(err,html){
            if (err) return next(err);
            res.send(404,html);
          });
        }
      }); //tokens.findOne
  });
  app.post('/login/token/:token', function(req,res,next){
    tokens.findOne({_id: req.params.token, type:'login'},
      function(err,tokenDoc){
        if (err) return next(err);
        if (tokenDoc) {
          //TODO: make sure usernames don't collide
          tokens.remove({_id:req.params.token}, function(err,remresult){
            if (err) return next(err);
            sessionUser.authenticate(tokenDoc.user,req,res);
            res.redirect('/');
          }); //tokens.remove
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
  }); //login/token/:token
  app.get('/logout', function(req,res){
    return res.render('logout.jade');
  });
  app.post('/logout', function(req,res,next) {
    sessionUser.unauthenticate(req,res);
    return res.redirect('/');
  }); // POST /login
  return app;
};