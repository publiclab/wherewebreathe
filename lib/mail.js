var mailer = require('nodemailer');

exports.register = function () {
  var mailText = 'You have one more step before your account with'
    + ' WhereWeBreathe.org is registered. \r\n\r\n'
    + 'Please click the link below to verify your email. \r\n\r\n'
    'http://' + req.headers.host + '/verify/' + token
  ;
  var transport = nodemailer.createTransport("direct", {debug: true});
  var   mailOptions = {
    from: "noreply@wherewebreathe.org",
    to: txtEmail,
    subject: "[TESTING] user verification email",
    text: mailText
  };
  var mail = require("nodemailer").mail;
  mail(mailOptions);
};

exports.resend = function () {
  var mailText = "You have one more step before your account with WhereWeBreathe.org is registered. \r\n\r\n";
  mailText += "Please click the link below to verify your email. \r\n\r\n";
  mailText += "http://"+req.headers.host+"/verify/"+token;
  var transport = nodemailer.createTransport("direct", {debug: true});
  var   mailOptions = {
    from: "noreply@wherewebreathe.org",
    to: txtEmail,
    subject: "[TESTING] user verification email",
    text: mailText
  };
  var mail = require("nodemailer").mail;
  mail(mailOptions);
};
