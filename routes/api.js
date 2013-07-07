var express = require('express');

function filterPlugs(plugs) {
  // Currently, there's no filtering.
  // However, down the line, it may make sense to, say,
  // reduce the list of users who have upvolted a plug to a number,
  // or remove various sensitive fields of a plug.
  // This may also require more parameters to the API call,
  // such as a user ID to check if a plug has been upvolted for.
  return plugs;
}

module.exports = function api(db){
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
        res.send(filterPlugs(arr));
      });
    });
  });

  //NOTE: This path should be deprecated when there are a sizable number of plugs
  apiapp.get('/plugs',function(req,res,next){
    plugs.find({},{limit:200},function(err,cursor){
      if(err) return next(err);
      cursor.toArray(function(err,arr){
        if(err) return next(err);
        res.send(filterPlugs(arr));
      });
    });
  });
  return apiapp;
};