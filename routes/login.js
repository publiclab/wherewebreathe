var passport = require('passport');
var Account = require('../models/account').new_account;

exports.register_get = function(req, res) {
      var pageOptions = { title: "Join WhereWeBreathe", user : req.user, message: [] };
      res.render('register', pageOptions);
};
//add new user to DB
exports.register_post = function(req, res) {
var token;
  require('crypto').randomBytes(48, function(ex, buf) {
  token = buf.toString('hex');
  });
  console.log("TOKEN: "+token);
  Account.register(new Account({ 
    username : req.body.username,
    email: req.body.email,
    HID: req.body.HID,
    token: 123 
  }), req.body.password, function(err, account) {
      if (err) {
          console.log("user registration error: " +err);
          var pageOptions = { title: "Join WhereWeBreathe", user : req.user, message: [err] };
          return res.render('register', pageOptions);
      }
        //grab returnTo pabe grom cookie
        res.redirect('/login');        
  });      
};
exports.verify_get =  function(req, res) {
  res.render('verifyUser', { title: 'New Account Verification', user : req.user, message: [] });
}
exports.verify_post =  function(req, res) {
  console.log("verify post");
}
exports.login_post = function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.redirect('/');
        }
        passport.authenticate('local')(req, res, function () {
          res.redirect('/');
        });
    });
  }
exports.login_get = function(req, res) {
      res.render('login', { title: 'Login', user : req.user });
}; 


exports.logout =  function(req, res) {
      req.logout();
      res.redirect('/');
  };





//  app.post('/login', passport.authenticate('local'), function(req, res) {
//      res.redirect('/');
//  });


