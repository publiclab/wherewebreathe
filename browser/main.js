var catcher = require('catch-links');

catcher(window, function (href) {
  var m;
  if (m = /^\/resend\/(.+)/.exec(href)) {
    post('/resend', { email: m[1] });
  }
  else location.href = href;
});

function post (action, params) {
  var form = document.createElement('form');
  form.method = 'POST';
  form.action = action;
  Object.keys(params).forEach(function (key) {
    var input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('name', key);
    input.setAttribute('value', params[key]);
    form.appendChild(input);
  });
  form.submit();
}
