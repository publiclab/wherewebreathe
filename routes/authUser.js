//check if user, set page for user to be returned to upon login/registration completion
module.exports = function(req, res, success){
  if (!req.user){
    req.session.returnTo = req.path;
    req.flash('info', ['You need to log in to do that', 'alert-warning'])
    res.redirect('Register');
  }
  else{
    success();
  }
}
