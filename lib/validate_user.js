var User = require('../models/db').user;
var NewUser = require('../models/db').newuser;
var isValidEmail = require('is-valid-email');
var str = JSON.stringify;

module.exports = function (params, cb) {
  params.username = String(params.username).trim();
  params.email = String(params.email).trim();
  params.HID = String(params.HID).trim();
  params.password = String(params.password).trim();
  params.eighteen = Number(params.eighteen);
 
  var errors = [];

  if (params.eighteen !== 18) {
    errors.push('You must be over 18 to register');
  }
  if (!/^[A-Za-z0-9_.-@]{3,30}$/.test(params.username)) {
    errors.push('Your username must be 3 to 30 characters in length and'
      + ' may contain letters, numbers, or . - @ _ characters.');
  }

  if (!isValidEmail(params.email)) {
    errors.push(str(params.email) + " doesn't look like a valid email address"
      + 'to our server. Please make sure the email address you have entered'
      + ' is valid');
  }

  //VIN/HUD
  if (!/(^((?=[^iIoOqQ])\w){17}$)|(^\w{3}[0-9]{6,7}$)/.test(params.HID)) {
    errors.push(str(params.HID) + ' does not look like a VIN or HUD.'
      + ' Please double check your records and try removing spaces.');
  }

  if (!/^[A-Za-z0-9_-]{3,30}$/.test(params.password)) {
    errors.push('Your password must be 3 to 30 characters in length and may'
      + ' contain letters, numbers, hyphens, or underscores.');
  }
 
  var pending = 4;
  User.findOne({ username: params.username }, onUser);
  User.findOne({ email: params.email }, onEmail);
  NewUser.findOne({ username: params.username }, onNewUser);
  NewUser.findOne({ email: params.email }, onNewEmail);

  function done (err) {
    if (err) errors.push(err && err.message || err);
    if (--pending === 0) cb(errors, params);
  }

  function onUser (err, user) {
    if (err) return done(err);
    if (user) {
      errors.push('The username, "' + params.username
        + '" already exists, please try another.');
    }
    done();
  }

  function onEmail (err, email) {
    if (err) return done(err);
    if (email) {
      errors.push('The email, "' + params.email + '", is already being used.');
    }
    done();
  }
 
  function onNewUser (err, newuser) {
    if (err) return done(err);
    if (newuser) {
      errors.push('The username, "' + params.username
        + '" already exists, please try another.');
    }
    done();
  }

  function onNewEmail (err, newemail) {
    if (err) return done(err);
    if (newemail) {
      errors.push('The email, "' + params.email + '", is already being used.');
    }
    done();
  }
}
