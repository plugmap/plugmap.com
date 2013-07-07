var crypto = require('crypto');
module.exports = function randomUrlToken(cb) {
  return crypto.randomBytes(48, function(err, buf) {
    if(err) return cb(err);
    else return cb(null, buf.toString('base64')
      .replace(/\//g,'_').replace(/\+/g,'-'));
  });
};
