
function ensureLoggedIn(req, res, next) {
   if (req.signedCookies.userName) {
      next();
   } else {
      res.redirect('/auth/login/');
   }
}

function allowAccess(req, res, next) {
   if (req.signedCookies.userName === req.params.username) {
      next();
   } else {
      res.redirect('/auth/login/');
   }
}

module.exports = {
   ensureLoggedIn: ensureLoggedIn,
   allowAccess: allowAccess,
  
};