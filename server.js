var mongodb = require('mongodb');
var cfg = require('envigor')();

var mongoUri = cfg.mongodb.url || 'mongodb://localhost/default';

mongodb.MongoClient.connect(mongoUri,function(err,db){
  if(err) throw err;
  else {
    var app = require('./app.js')(db);
    var port = cfg.port || 5000;
    app.listen(port, function() {
      console.log("Listening on " + port);
    });
  }
});
