var express = require('express');
var ObjectID = require("mongodb").ObjectID;

module.exports = function(db){
  var app = express();

  var plugs = db.collection('plugs');

  app.post('/plug/:id/upvolt', function(req,res,next){
    var plugid;
    try {
      plugid = new ObjectID(req.params.id);
    } catch(err) {
      return res.send(404,{message:'Invalid plug ID'});
    }

    if(req.session.currentUser) {
      plugs.findOne({ _id: plugid}, function(err, plug) {
        if(err) return next(err);
        if(plug) {
          var alreadyUpvolted = !!~plug.properties.upvolters.indexOf(
            req.session.currentUser._id);
          var newCount = plug.properties.upvolters.length
            + (alreadyUpvolted?-1:1);
          var op = {'properties.upvolters': req.session.currentUser._id};
          plugs.update({ _id: plugid},
            alreadyUpvolted ? {$pull: op} : {$addToSet: op},
            function(err,doc) {
              if(err) return next(err);
              res.send({message:'OK',
                upvolts: newCount,
                upvolted: !alreadyUpvolted});
          });
        } else {
          res.send(404,{message:'Plug not found'});
        }
      });
    } else {
      res.send(400,{message:'Must be logged in to upvolt plugs'});
    }
  });
  return app;
};