var passport = require('passport');
var Account = require('../models/account').new_account;
var nodemailer = require("nodemailer");

exports.register_get = function(req, res) {
    //console.log(req.session.returnTo);
      var pageOptions = { title: "Join WhereWeBreathe", user : req.user, messages: [] };
      res.render('login/register', pageOptions);
};
//add new user to DB
exports.register_post = function(req, res) {
  //server-side validation
  var errorMsgs = [];
  var txtUsername = req.body.username.trim();
  var txtEmail = req.body.email.trim();
  var txtHID = req.body.HID.trim();
  var txtPass = req.body.password.trim();
 
 //check if username is taken
  Account.find({username: txtUsername}, function ( err, username){
    if (username.length > 0){
    //if username exists, return error message
    errorMsgs.push("The username, '"+txtUsername+"', already exists, please try another.");
    console.log("username exists");
    }
    //check if email is taken
    Account.find({email: txtEmail}, function ( err, email){
    if (email.length > 0){
      //if email exists, return error message
      errorMsgs.push("The email, '"+txtEmail+"', is already being used.");
      console.log(" email exists");
      }
      //check form input again serve-side
      //username
    if(! /^[A-Za-z0-9_.-@]{3,30}$/.test(txtUsername)){ errorMsgs.push("Your username must be 3 to 30 characters in length and may contain letters, numbers, or . - @ _ characters.")}; 
    //email
    if(! /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(txtEmail)){ errorMsgs.push("Please make sure the email address you have entered is valid.")};       
    //VIN/HUD
    if(! /(^((?=[^iIoOqQ])\w){17}$)|(^\w{3}[0-9]{6,7}$)/.test(txtHID)){ errorMsgs.push("'"+txtHID+ "' does not look like a VIN or HUD. Please double check your records and try removing spaces.")}; 
    //password
    if(! /^[A-Za-z0-9_-]{3,30}/.test(txtPass)){ errorMsgs.push("Your password must be 3 to 30 characters in length and may contain letters, numbers, hyphens, or underscores.")};      
    if (errorMsgs.length > 0){
          //there are errors
          var pageOptions = { title: "Join WhereWeBreathe", user : req.user, messages: errorMsgs};
          return res.render('login/register', pageOptions);
        }//end if no errors
     else{
      require('crypto').randomBytes(48, function(ex, buf) {
        var token = buf.toString('hex');
        Account.register(new Account({ 
          username : txtUsername,
          email: txtEmail,
          HID: txtHID,
          token: token 
        }), txtPass, function(err, account) {
          if (err) {
            console.log("user registration error: " +err);
            var pageOptions = { title: "Join WhereWeBreathe", user : req.user, messages: [err] };
            return res.render('login/register', pageOptions);
          }
          else{
            //grab returnTo page from cookie
            //res.redirect('/login'); 
            // this emailing solution is temporary for phase 1 development!!!! nodemailer has better options that require existing emails/domains
            var mailText = "Your registration with WhereWeBreathe requires that you verify your email address before registration is complete. \r\n";
            mailText += "Please click the link below to finish your registration. \r\n\r\n";
            mailText += "http://localhost:3000/verify/"+token;
            var transport = nodemailer.createTransport("direct", {debug: true});
            var   mailOptions = {
              from: "noreply@wherewebreathe.org",
              to: "nunes.melissa.m@gmail.com",
              subject: "[TESTING] user verification email",
              text: mailText
            };
            var mail = require("nodemailer").mail;
            mail(mailOptions);
          }//end else       
        });
      });//end rendomBytes  
     }//end else
    });//end email Account.find()
  });//end username Account.find()
};//end exports.register_post
exports.verify_get =  function(req, res) {
  res.render('login/verifyUser', { title: 'New Account Verification', user : req.user, message: ["Your email address has been verified. Please continue to edit your privacy preferences before continuing to the rest of the website."] });
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



