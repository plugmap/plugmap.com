var express = require('express');

module.exports = function(db,mailer) {
  var app = express();

  // /invite
  app.use(require('./user/invite.js')(db,mailer));

  // /login
  // /login/token
  // /login/token/:token
  // /logout
  app.use(require('./user/login.js')(db,mailer));

  // /register
  // /register/token/:token
  app.use(require('./user/register.js')(db));

  // /user/:username
  app.use(require('./user/profile.js')(db));

  return app;
};
