 function validateMatch(input, compareField, message) {
  //console.log(input.value +" : "+document.getElementById(compareField).value);
    if (input.value.trim() != document.getElementById(compareField).value.trim()) { 
        input.setCustomValidity(message);
    } else {
        // input is valid -- reset the error message
        input.setCustomValidity('');
    }
  }
