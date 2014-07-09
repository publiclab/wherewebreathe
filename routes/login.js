var passport = require('passport');
var Account = require('../models/account').new_account;

exports.register_get = function(req, res) {
    //console.log(req.session.returnTo);
      var pageOptions = { title: "Join WhereWeBreathe", user : req.user, messages: [] };
      res.render('login/register', pageOptions);
};
//add new user to DB
exports.register_post = function(req, res) {
  //server-side validation
  var errorMsgs = ["foo"];
  var txtUsername = req.body.username;
  
  Account.find({username: txtUsername}, function ( err, username){
    if (username.length > 0){
    //if username exists, return error message
    errorMsgs.push("The username, '"+txtUsername+"', already exists, please try another");
      console.log("exists");

    }
    //if no errors
   if (errorMsgs.length >0){
        //username doesnt already exist
          require('crypto').randomBytes(48, function(ex, buf) {
            var token = buf.toString('hex');
            Account.register(new Account({ 
              username : txtUsername,
              email: req.body.email,
              HID: req.body.HID,
              token: token 
            }), req.body.password, function(err, account) {
            if (err) {
                console.log("user registration error: " +err);
                var pageOptions = { title: "Join WhereWeBreathe", user : req.user, messages: [err] };
                return res.render('login/register', pageOptions);
            }
          //grab returnTo page from cookie
          res.redirect('/login');        
        });
      });//end rendomBytes  
    }//end if no errors
    else{
      //there are errors
      var pageOptions = { title: "Join WhereWeBreathe", user : req.user, messages: errorMsgs};
      return res.render('login/register', pageOptions);
    }
  });//end Account.find()
    
};
exports.verify_get =  function(req, res) {
  res.render('login/verifyUser', { title: 'New Account Verification', user : req.user, messages: [] });
}
exports.verify_post =  function(req, res) {
  console.log("verify post");
}
exports.login_post = function(req, res) {
//if session variable has redirect info
    if(req.session.returnTo){
      res.redirect(req.session.returnTo);
      //clear redirect info
      delete req.session.returnTo
    }
    else{
      res.redirect('/');
    }
  };
exports.login_get = function(req, res) {
  var message;
  //used url paramater for error, next phase could use flash message
  if (req.params.err){
    message = 'Invalid username or password.';
  }
  res.render('login/login', { title: 'Login', user : req.user, message: message });
}; 
exports.logout =  function(req, res) {
      req.logout();
      res.send("logged out")
  };


