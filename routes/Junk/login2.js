var passport = require('passport');
var Account = require('../models/account');

exports.register_get = function(req, res) {
      res.render('register', { title: "Join WhereWeBreathe", user : req.user });
};
exports.register_post = function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
          res.redirect('/');
        });
    });      
}; 
exports.login_post = function(req, res) {
      res.redirect('/');
  } 
exports.login_get = function(req, res) {
      res.render('login', { title: 'Login', user : req.user });
}; 
exports.authenticate = function(){
 passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login' });
                                   //req.path
}

//  app.get('/logout', function(req, res) {
//      req.logout();
//      res.redirect('/');
//  });





//  app.post('/login', passport.authenticate('local'), function(req, res) {
//      res.redirect('/');
//  });


