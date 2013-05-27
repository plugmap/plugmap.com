var express = require("express");

var db;

var app = express();
var api = express();

api.get('/plugs/near',function(req,res){
  res.send(db.plugs.find( { loc : { $near :
   { $geometry :
       { type : "Point" ,
         coordinates: [ req.param('lng'), req.param('lat') ] } },
     $maxDistance : req.param('radius')
    } } ).toArray());
});

//NOTE: This path should be deprecated when there are a sizable number of plugs
api.get('/plugs',function(req,res){
  res.send(db.plugs.find({},{limit:200}).toArray());
});

app.use(express.static('www'));
app.use('/api/v0',api);
app.get('/plug/:id', function(req,res){
  res.render('plug.jade',db.plugs.findOne( { id: req.params.id } ));
});

return function(dbIn){
  db = dbIn;
  return app;
};