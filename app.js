var express = require("express");
var crypto = require('crypto');
var bcrypt = require('bcrypt');
var MongoStore = require('connect-mongo')(express);
var nodemailer = require('nodemailer');
var knox = require('knox');
var cfg = require("envigor")();
var smtpTransport = nodemailer.createTransport(
  "SMTP", cfg.smtp);
var s3client = knox.createClient(cfg.s3);

function randomEmailToken(cb) {
  return crypto.randomBytes(48, function(err, buf) {
    if(err) return cb(err);
    else return cb(null, buf.toString('base64')
      .replace(/\//g,'_').replace(/\+/g,'-'));
  });
}

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

function populateSessionLocals(req,res,next){
  res.locals({
    username: req.session.currentUser && req.session.currentUser.username,
    emailMD5: req.session.currentUser && crypto.createHash('md5')
      .update(req.session.currentUser.email.toLowerCase()).digest('hex'),
    csrfToken: req.session._csrf
  });
  return next();
}

function authenticateUser(userDoc,req,res,redirTo) {
  //NOTE: this could maybe be smarter (eg. tying user doc in DB to session
  //instead of copying it on login)
  req.session.currentUser = {
    username: userDoc.username,
    email: userDoc.email
  };
  res.redirect(redirTo || '/');
}

function unAuthenticateUser(userDoc,req,res,redirTo) {
  delete req.session.currentUser;
  
  //for a couple old sessions - unnecessary after mid-June 2013
  delete req.session.username;
  
  res.redirect(redirTo || '/');
}

module.exports = function(db) {
  var plugs = db.collection('plugs');
  var tokens = db.collection('tokens');
  var users = db.collection('users');

  var app = express();

  app.set('views',__dirname+'/views');

  app.use(express.static('www'));

  app.use(express.cookieParser());
  app.use(express.session({
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({db:db})}));

  app.use(express.urlencoded());
  app.use(express.multipart());
  app.use(express.csrf());
  app.use(populateSessionLocals);

  app.get('/', function(req,res) {
    res.render('index.jade');
  });

  app.use('/api/v0',api(db));

  var impossibleHash =
    '$2a$10$00000000000000000000000000000000000000000000000000000';

  app.get('/login', function(req,res){
    res.render('login.jade');
  });
  app.post('/login', function(req,res,next) {
    //NOTE: this should be brute-force-proofed
    users.findOne({$or:[{unLower: req.body.username.toLowerCase()},
      {email: req.body.username.toLowerCase()}]},
      function(err, user) {

      if (err) return next(err);
      // Compare against an impossible hash if no user for timing reasons.
      bcrypt.compare(req.body.password,
        user ? user.passhash : impossibleHash, function(err, hashMatch) {
          if (err) return next(err);
          if (hashMatch) {

          } else {
            //NOTE: Responding to the post with a non-redirect isn't too cool
            res.render('login.jade',{
              failure:'Invalid username or password.'});
          }
      });
    });
  }); // POST /login
  app.get('/logout', function(req,res){
    res.render('login.jade');
  });
  app.post('/logout', function(req,res,next) {
    //NOTE: this should be brute-force-proofed
    users.findOne({$or:[{unLower: req.body.username.toLowerCase()},
      {email: req.body.username.toLowerCase()}]},
      function(err, user) {

      if (err) return next(err);
      // Compare against an impossible hash if no user for timing reasons.
      bcrypt.compare(req.body.password,
        user ? user.passhash : impossibleHash, function(err, hashMatch) {
          if (err) return next(err);
          if (hashMatch) {

          } else {
            //NOTE: Responding to the post with a non-redirect isn't too cool
            res.render('login.jade',{
              failure:'Invalid username or password.'});
          }
      });
    });
  }); // POST /login
  app.get('/register', function(req, res){
    res.render('register-request.jade');
  });
  app.post('/register', function(req, res, next) {
    //TODO: validate email address
    var email = req.body.email.toLowerCase();
    //TODO: check email address hasn't already registered (or made too many
    // requests for this email)
    randomEmailToken(function(err, token){
      if (err) return next(err);
      //TODO: set tokens to expire
      tokens.insert({_id:token, type:'register',
        email: email},
      function(err, written){
        if (err) return next(err);
        smtpTransport.sendMail({
          to: email,
          from: 'tokens@plugmap.com',
          subject: 'PlugMap user registration link',
          text: 'To register an account on plugmap.com with this email '
           + 'address, go to http://plugmap.com/register/token/' + token
           + ' and fill out the registration form.\n\n'
           + "This token will expire in three days. "
           + "If you did not request this link, you can just "
           + "delete this email."
        }, function(mailError, response){
          if (mailError){
            tokens.remove({_id:token}, function(err,remresult){
              if (err) return next(err);
              //TODO: Nicer mail error handling
              else next(mailError);
            });
          } else {
            res.render('register-inform.jade');
          }
        }); //sendMail
      }); //tokens.insert
    }); //randomEmailToken
  }); // POST /register
  app.get('/register/token/:token', function(req,res,next){
    tokens.findOne({_id: req.params.token, type:'register'},
      function(err,tokenDoc){
        if (err) return next(err);
        if (tokenDoc) {
          res.render('register-finalize.jade');
        } else {
          res.render('bad-token.jade',function(err,html){
            if (err) return next(err);
            res.send(404,html);
          });
        }
      }); //tokens.findOne
  });
  app.post('/register/token/:token', function(req,res,next){
    tokens.findOne({_id: req.params.token, type:'register'},
      function(err,tokenDoc){
        if (err) return next(err);
        if (tokenDoc) {
          //TODO: make sure usernames don't collide
          tokens.remove({_id:req.params.token}, function(err,remresult){
            if (err) return next(err);
            bcrypt.genSalt(10, function(err, salt) {
              if (err) return next(err);
              bcrypt.hash(req.body.password, salt, function(err, hash) {
                if (err) return next(err);
                users.insert({
                  username: req.body.username,
                  unLower: req.body.username.toLowerCase(),
                  email: tokenDoc.email,
                  passhash: req.body.password ? hash : impossibleHash
                }, function (err,result) {
                  if (err) return next(err);
                  if (req.body.authenticate) {
                    //NOTE: This might be better using the user document ID
                    req.session.username = req.body.username;
                  }
                  res.redirect('/');
                }); //users.insert
              }); //bcrypt.hash
            }); //bcrypt.genSalt
          }); //tokens.remove
        } else {
          // NOTE: Bad POSTs should probably get a different error
          // (something that doesn't suggest that the URL might have been
          // entered wrong)
          res.render('bad-token.jade',function(err,html){
            if (err) return next(err);
            res.send(404,html);
          });
        }
      }); //tokens.findOne
  });
  app.get('/plug/:id', function(req,res,next){
    plugs.findOne({ id: req.params.id }, function(err, plug){
      if(err) return next(err);
      if(plug) {
        res.render('plug.jade', {plug:plug});
      } else {
        res.render('no-plug.jade', {plug:plug},function(err,html){
          if (err) return next(err);
          res.send(404,html);
        });
      }
    });
  });
  app.get('/submit', function(req,res){
    if (req.session.username) {
    res.render('submit.jade');
    } else {
      //NOTE: this should have a query flag denoting it should say
      //"you must be signed in to submit plugs"
      res.redirect('/login');
    }
  });
  app.post('/submit', function(req,res,next){
    if(req.session.username) {
      //TODO: insert plug (heyo!)
      //TODO: redirect to plug
    } else {
      //TODO: render "Your session appears to have timed out or something"
    }
    res.render('stub.jade');
  });
  app.get('/user/:user', function(req,res,next){
    return users.findOne(
      {unLower: req.params.user.toLowerCase()}, function(err,user){
        if (err) return next(err);
        //force name case sensitivity
        if (user.username != req.params.user)
          return res.redirect('/user/'+user.username);
        else return res.render('user.jade',{
          //NOTE: I know this is kinda confusing with the identically-named
          //variables in the locals root
          user: {
            username: user.username,
            emailMD5: crypto.createHash('md5').update(user.email.toLowerCase())
              .digest('hex')
          }
        });
    });
  });
};
