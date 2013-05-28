var express = require("express");


function api(db){
  var apiapp = express();
  apiapp.use(express.compress());
  var plugs = db.collection('plugs');

  apiapp.get('/plugs/near',function(req,res,next){
    plugs.find({geometry: {
      $near: {
        $geometry: { type : "Point" ,
          coordinates: [ req.param('lng'), req.param('lat') ] }},
        $maxDistance: req.param('radius')
      }}, function(err, cursor) {
        
      if(err) return next(err);
      cursor.toArray(function(err,arr){
        if(err) return next(err);
        res.send(arr);
      });
    });
  });
  
  //NOTE: This path should be deprecated when there are a sizable number of plugs
  apiapp.get('/plugs',function(req,res,next){
    plugs.find({},{limit:200},function(err,cursor){
      if(err) return next(err);
      cursor.toArray(function(err,arr){
        if(err) return next(err);
        res.send(arr);
      });
    });
  });
  return apiapp;
}


return function(db){
  var plugs = db.collection('plugs');
  var app = express();
  app.use(express.static('www'));
  app.use(express.bodyParser());
  app.use('/api/v0',api(db));
  app.get('/plug/:id', function(req,res){
    res.render('plug.jade',plugs.findOne( { id: req.params.id } ));
  });
};
