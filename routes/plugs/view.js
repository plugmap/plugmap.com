var express = require('express');
var ObjectID = require("mongodb").ObjectID;

module.exports = function(db){
  var app = express();

  var plugs = db.collection('plugs');

  app.get('/plug/:id', function(req,res,next){
    var plugid;
    try {
      plugid = new ObjectID(req.params.id);
    } catch(err) {
      res.render('no-plug.jade', {plug:{}},function(err,html){
        if (err) return next(err);
        res.send(404,html);
      });
    }

    plugs.findOne({ _id: plugid}, function(err, plug){
      if(err) return next(err);
      if(plug) {
        res.render('plug.jade', {plug:plug.properties});
      } else {
        res.render('no-plug.jade', {plug:plug},function(err,html){
          if (err) return next(err);
          res.send(404,html);
        });
      }
    });
  });
  return app;
};