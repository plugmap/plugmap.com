var express = require('express');
var https = require('https');

var md5sum = require('../../lib/md5sum.js');

module.exports = function(db,s3client) {
  var app = express();

  var plugs = db.collection('plugs');

  var s3host = '//' + s3client.bucket + '.' + s3client.endpoint;

  app.get('/submit', function(req,res){
    if (req.session.currentUser) {
      return res.render('submit.jade');
    } else {
      //NOTE: this should have a query flag denoting it should say
      //"you must be signed in to submit plugs"
      return res.redirect('/login');
    }
  });

  //The widths to get images for.
  var generateTargetWidths = [360,720,1080];

  app.post('/submit', function(req,res,next) {
    if(req.session.currentUser) {

      var plugDoc = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [req.body.longitude, req.body.latitude]
        },
        properties: {
          venue: req.body.venue,
          name: req.body.name,
          images: {
            full: req.body.plugimage
          },
          sockets: parseInt(req.body.sockets,10),
          owner: {
            username: req.session.currentUser.username,
            emailMD5: md5sum(req.session.currentUser.email.toLowerCase()),
            _id: req.session.currentUser._id
          },
          from: req.body.from,
          upvolters: []
        }
      };

      generateTargetWidths.forEach(function(width) {
        plugDoc.properties.images[width] =
          req.body.plugimage + '/convert?w='+width;
      });

      plugs.insert(plugDoc,function(err,inserted){
        if (err) return next(err);

        // Save the filepicker results into plugmap's S3 bucket
        // (filepicker could do this itself, if we didn't need our
        // own non-AWS endpoints)
        function crossloadImage (field,targetName) {
          var updated = {};
          updated['properties.images.' + field] = s3host + targetName;
          https.get(inserted[0].properties.images[field], function(res){
            var headers = {
              'Content-Length': res.headers['content-length'],
              'Content-Type': res.headers['content-type'],
              'x-amz-acl': 'public-read'
            };
            s3client.putStream(res, targetName, headers, function(err, res){
              if(err) return console.error(err);

              plugs.update({_id: inserted[0]._id},
                {'$set':updated}, function(err,upDoc){

                if(err) return console.error(err);
              }); //plugs.update
            }); //s3client.putStream
          }); //http.get
        } //crossloadImage

        var basename = req.body.plugimage.match(/\/[^\/]*$/)[0];

        generateTargetWidths.forEach(function(width){
          crossloadImage(width,basename + '-' + width + 'px');
        });

        crossloadImage('full',basename);

        // We could wait for all the relevant images to get loaded onto
        // our own S3 buckets before replying, but why wait when you can
        // respond immediately and have the clients download the same sources?
        res.redirect('/plug/'+inserted[0]._id);
        });
    } else {
      res.render('bad-session.jade');
    }
  });
  return app;
};