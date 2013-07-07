var express = require('express');
var ObjectID = require("mongodb").ObjectID;

module.exports = function(db){
  var app = express();

  var plugs = db.collection('plugs');

  app.post('/plug/:id/upvolt', function(req,res,next){
    if(req.session.currentUser) {
      plugs.findOne({ _id: new ObjectID(req.params.id)}, function(err, plug) {
        if(err) return next(err);
        if(plug) {
          var alreadyUpvolted = !!~plug.properties.upvolters.indexOf(
            req.session.currentUser._id);
          var op = {'properties.upvolters': req.session.currentUser._id};
          plugs.update({ _id: new ObjectID(req.params.id)},
            alreadyUpvolted ? {$pull: op} : {$addToSet: op},
            function(err,doc) {
              if(err) return next(err);
              res.send({message:'OK',
                upvolts: doc.properties.upvolters.length,
                upvolted: !!~doc.properties.upvolters.indexOf(
                  req.session.currentUser._id)});
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