//require('./db');
/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var login = require('./routes/login')
//var user = require('./routes/user');
var http = require('http');
var path = require('path');
var engine = require('ejs-locals');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
// use ejs-locals for all ejs templates:
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use( express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('unicorns'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
// passport config
var Account = require('./models/account').new_account;
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

//login routes
//require('./routes/loginBK')(app);
app.get('/register', login.register_get);
app.post('/register', login.register_post);
app.get('/login', login.login_get);
app.get('/login/:err', login.login_get);
app.post('/login',passport.authenticate('local', { failureRedirect: '/login/err' }), login.login_post);
app.get('/logout', login.logout);
app.get('/verify', login.verify_get);
app.post('/verify', login.verify_post);

app.get('/', routes.index);
app.get('/questionnaire', routes.questionnaire);
app.get('/questionnaire/:qnum', routes.questionnaire);
//app.get('/questionnaire_cat', routes.questionnaire_cat);
//app.get('/users', user.list);

//api
//app.post( '/create', routes.create );
app.post( '/answer', routes.answer );

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
