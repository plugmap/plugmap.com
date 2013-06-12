var crypto = require('crypto');
module.exports = function md5sum(str){
  return crypto.createHash('md5').update(str).digest('hex');
};