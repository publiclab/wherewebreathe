var passport = require('passport');
var Account = require('../models/account').account;

exports.register_get = function(req, res) {
      var pageOptions = { title: "Join WhereWeBreathe", user : req.user, message: [] };
      res.render('register', pageOptions);
};
//add new user to DB
exports.register_post = function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            console.log("user registration error: " +err);
            var pageOptions = { title: "Join WhereWeBreathe", user : req.user, message: [err] };
            return res.render('register', pageOptions);
        }
          //grab returnTo pabe grom cookie
          res.redirect('/login');        
    });      
}; 
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


