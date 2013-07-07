var express = require('express');

module.exports = function(db,s3client) {
  var app = express();

  // /plug/:id
  app.use(require('./plugs/view.js')(db));
  // /plug/:id/upvolt
  app.use(require('./plugs/upvolt.js')(db));

  // /submit
  app.use(require('./plugs/submit.js')(db,s3client));

  return app;
};
