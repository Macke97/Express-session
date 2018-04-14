//Middleware to avoid logged in users to access certain pages
function loggedOut(req, res, next) {
  if (req.session && req.session.userId) {
    return res.redirect('/profile');
  } else return next();
}

function requiresLogin(req, res, next){
  if(req.session && req.session.userId){
    return next();
  } else {
    let err = new Error('You must be logged in to see this page!');
    err.status = 402;
    return next(err);
  }

}

module.exports.loggedOut = loggedOut;
module.exports.requiresLogin = requiresLogin;
