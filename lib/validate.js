// scheduled for demolition, replace with modules and inline

exports.email = function(text){
    if(! /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(text)){ 
    return "'"+text+"' doesnt look like a valid email address to our server. Please make sure the email address you have entered is valid."
    }
    else{return false}; 
}
exports.password = function(text){
  if(! /^[A-Za-z0-9_-]{3,30}/.test(text)){ 
    return "Your password must be 3 to 30 characters in length and may contain letters, numbers, hyphens, or underscores.";
  } 
  else{return false}; 
}
