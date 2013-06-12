exports.authenticate = function authenticate(userDoc,req,res,next) {
  //NOTE: this could maybe be smarter (eg. tying user doc in DB to session
  //instead of copying it on login)
  req.session.currentUser = {
    username: userDoc.username,
    email: userDoc.email,
    _id: userDoc._id
  };
  if (next) next();
};

exports.unauthenticate = function unauthenticate(req,res,next) {
  delete req.session.currentUser;
  if (next) next();
};
