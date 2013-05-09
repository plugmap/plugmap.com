var mongodb = require('mongodb');

var mongoUri = process.env.MONGODB_URL ||
  process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/default';

mongodb.MongoClient.connect(mongoUri,function(err,db){
  if(err) throw err;
  else {
    var app = require('./app.js')(db);
    var port = process.env.PORT || 5000;
    app.listen(port, function() {
      console.log("Listening on " + port);
    });
  }
});
