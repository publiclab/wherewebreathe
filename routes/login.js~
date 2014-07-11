var passport = require('passport');
var User = require('../models/account').user;
var NewUser = require('../models/account').newuser;
var nodemailer = require("nodemailer");

function returnTo(res, req){
  //if session variable has redirect info
  if(req.session.returnTo){
    res.redirect(req.session.returnTo);
    //clear redirect info
    delete req.session.returnTo
  }
  else{
    res.render('/');
  }
}

exports.register_get = function(req, res) {
      var pageOptions = { title: "Join WhereWeBreathe", user : req.user, regErr: []};
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
  User.find({username: txtUsername}, function ( err, username){
  var usernameErr = "The username, '"+txtUsername+"', already exists, please try another.";
  var emailErr ="The email, '"+txtEmail+"', is already being used.";
  //check if username is taken
    if (username.length > 0){
      errorMsgs.push(usernameErr);
    }
    //check if email is taken
    User.find({email: txtEmail}, function ( err, email){
    if (email.length > 0){
      errorMsgs.push(emailErr);
      }
      //check if username is taken in unverified accounts table
      NewUser.find({username: txtUsername}, function ( err, newusername){
        if (newusername.length > 0){
          errorMsgs.push(usernameErr);
        }
        //check if email is taken in unverified accounts table
        NewUser.find({email: txtEmail}, function ( err, newemail){
          if (newemail.length > 0){
            //if email exists, return error message
            errorMsgs.push(emailErr);
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
          var pageOptions = { title: "Join WhereWeBreathe", user : req.user, regErr: errorMsgs};
          return res.render('login/register', pageOptions);
        }//end if no errors
     else{
      require('crypto').randomBytes(48, function(ex, buf) {
        var token = buf.toString('hex');
        NewUser.register(new NewUser({ 
          username : txtUsername,
          email: txtEmail,
          HID: txtHID,
          token: token 
        }), txtPass, function(err, user) {
          if (err) {
            console.log("user registration error: " +err);
            var pageOptions = { title: "Join WhereWeBreathe", user : req.user, regErr: [err] };
            return res.render('login/register', pageOptions);
          }
          else{
            //grab returnTo page from cookie

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
            res.send("your account needs to be verified");
          }//end else       
        });
      });//end rendomBytes  
     }//end else
             });//end newusers find email
      });//end newusers find username
    });//end email User.find()
  });//end username User.find()
};//end exports.register_post

//verify new users' emails
exports.verify_get =  function(req, res) {
  //remove user from newusers (unverified) table
  NewUser.findOneAndRemove({token: req.params.token}, function ( err, user){
    if (err) {throw err};
    if (user){
      //put user in users (verified) table
      var verified = new User({ 
        username: user.username,
        salt: user.salt, 
        hash: user.hash,
        email: user.email,
        HID: user.HID 
      });
      verified.save(function(err) {
        if (err) {throw err}
        else{res.send("ok");}
      });      
    }
    else{
      res.render('login/message', { title: 'Oops!', user : req.user, message: {text:"That verification code has expired. If you registered more than a day ago, try registering again, and clicking the verify link that is emailed to you right away.", msgType: "alert-danger"} });
    }
  });

}

exports.login_post = function(req, res) {
  //if user doesnt have privacy settings yet, redirect to privacy setting page, first save dafaults
  if(!req.user.visInternet){
  console.log(req.user._id);
      User.findByIdAndUpdate(req.user._id, {visInternet : true, visResearch : true}, function(error, results){
      if(error){throw err}
      else{ 
      console.log(results);
        res.render('login/privacy', { 
          title: 'Privacy Settings', 
          user : req.user, 
          message: 
              {text: "Please review your privacy settings. You can always change these later by [...].", 
              msgType: "alert-warning" }});
       }
      }); //end user.findbyid...    
  }
  else{
    returnTo(res, req);
  }
};
exports.login_get = function(req, res) {
  var message;
  //used url paramater for error, next phase could use flash message
  if (req.params.err){
    message = { text: 'Invalid username or password.', msgType: "alert-danger"};
  }
  res.render('login/login', { title: 'Login', user : req.user, message: message });
}; 
exports.logout =  function(req, res) {
      req.logout();
      res.send("logged out")
};



