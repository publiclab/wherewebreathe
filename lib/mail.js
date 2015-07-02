var mailer = require('nodemailer');

exports.verifyRegister = function (params, cb) {
  send({
    to: params.to,
    subject: "[where we breathe] user verification email",
    text: 'You have one more step before your account with'
      + ' WhereWeBreathe.org is registered. \r\n\r\n'
      + 'Please click the link below to verify your email. \r\n\r\n'
      + 'http://' + params.host + '/verify/' + params.token
  }, cb);
};

exports.resendVerifyRegister = function (params, cb) {
  send({
    to: params.to,
    subject: "[where we breathe] user verification email (resent)",
    text: "Maybe you didn't get our last confirmation email message?\r\n\r\n"
      + 'You have one more step before your account with'
      + ' WhereWeBreathe.org is registered. \r\n\r\n'
      + 'Please click the link below to verify your email. \r\n\r\n'
      + 'http://' + params.host + '/verify/' + params.token
  }, cb);
};

function send (params, cb) {
  var transport = mailer.createTransport("direct", {debug: true});
  transport.sendMail({
    from: "noreply@wherewebreathe.org",
    to: String(params.to).trim(),
    subject: params.subject,
    text: params.text
  }, done);

  function done (err, res) {
    if (err) console.error('email delivery error:', err);
    cb(err, res);
    transport.close();
  }
}
