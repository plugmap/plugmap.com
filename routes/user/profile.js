var express = require('express');

var md5sum = require('../../lib/md5sum.js');

module.exports = function(db) {
  var app = express();

  var users = db.collection('users');
  var plugs = db.collection('plugs');

  app.get('/user/:username', function(req,res,next){
    return users.findOne(
      {unLower: req.params.username.toLowerCase()}, function(err,user){
        if (err) return next(err);
        //force name case sensitivity
        if (user.username != req.params.username)
          return res.redirect('/user/'+user.username);
        else {
          plugs.find({'properties.owner._id':user._id.toString()})
            .toArray(function(err,userPlugs){

            if (err) return next(err);
            else return res.render('user.jade',{
              user: {
                username: user.username,
                displayname: user.displayname,
                emailMD5: md5sum(user.email.toLowerCase()),
                _id: user._id,
                plugs: userPlugs
              }
            }); // res.render
        }); // plugs.find.toArray
      } // else
    }); // users.findOne
  }); // GET /user/:user
  return app;
};
