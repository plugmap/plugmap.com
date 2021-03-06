var express = require("express");
var mongodb = require("mongodb");
var MongoStore = require('connect-mongo')(express);
var nodemailer = require('nodemailer');
var knox = require('knox');

var md5sum = require('./lib/md5sum.js');

function populateSessionLocals(req,res,next){
  res.locals({
    csrfToken: req.session._csrf
  });

  res.locals.currentUser = req.session.currentUser ? {
    _id: req.session.currentUser._id,
    username: req.session.currentUser.username,
    emailMD5: md5sum(req.session.currentUser.email.toLowerCase())
  } : null;

  return next();
}

module.exports = function(cfg) {
  var db;

  var mongoUrl = cfg.mongodb.url || 'mongodb://localhost/default';

  var mailer = nodemailer.createTransport("SMTP", cfg.smtp);
  var s3client = knox.createClient(cfg.s3);

  mongodb.MongoClient.connect(mongoUrl,function(err,connectedDb){
    if (err) throw err;
    else db = connectedDb;

    // Sub-app routes
    app.use('/api/v0',require('./routes/api.js')(db));
    app.use(require('./routes/userRoutes.js')(db,mailer));
    app.use(require('./routes/plugRoutes.js')(db,s3client));
  });

  var app = express();

  app.set('views',__dirname+'/views');

  app.use(express.static('www'));

  app.use(express.cookieParser());
  app.use(express.session({
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({url:mongoUrl})}));

  app.use(express.urlencoded());
  app.use(express.multipart({hash:'sha1'}));
  app.use(express.csrf());

  app.use(populateSessionLocals);

  app.get('/', function(req,res) {
    res.render('index.jade');
  });

  app.get('/about', function(req,res){
      res.render('about.jade');
  });

  return app;
};
