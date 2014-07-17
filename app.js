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
var flash = require('connect-flash');

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
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//set view defaults
app.locals.message = null;

// passport config
var User = require('./models/account').user;
//use next line instead of 'passport.use(new LocalStrategy(Account.authenticate()));' in conjuction with usernameField option (in account.js) to use email input from frontend to use email instead of username. 
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//login routes
//require('./routes/loginBK')(app);
app.get('/register', login.register_get);
app.post('/register', login.register_post);
app.get('/login', login.login_get);
app.get('/login/:msg/:msgType', login.login_get);
app.post('/login',passport.authenticate('local', { failureRedirect: '/login/Invalid username or password./alert-danger' }), login.login_post);
app.post('/logout', login.logout);
app.get('/verify/:token', login.verify_get);
app.get('/forgotpass', login.forgotpass_get);
app.post('/forgotpass', login.forgotpass_post);
app.get('/resetpass', login.resetpass_get);
app.get('/resetpass/:id/:token', login.resetpass_get);
app.post('/resetpass', login.resetpass_post);
app.get('/privacy', login.privacy_get);
app.post('/privacy', login.privacy_post);

app.get('/', routes.index);
app.get('/questionnaire', routes.questionnaire);
app.get('/about', routes.about);
app.get('/questionnaire/:qnum', routes.questionnaire);
app.get('/vinhud', routes.vinhud);
//app.get('/questionnaire_cat', routes.questionnaire_cat);
//app.get('/users', user.list);

app.get('/test', login.test);
app.post('/searching', function(req, res){
  console.log("here");


 res.send("yo")



});

//api
//app.post( '/create', routes.create );
app.post( '/answer', routes.answer );

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
