// Don't forget to the env variable FORTYTWO_CLIENT_ID and FORTYTWO_CLIENT_SECRET

var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var passport = require('passport');
var FortyTwoStrategy = require('passport-42').Strategy;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able
//   to serialize users into and deserialize users out of the session.
//   Typically, this will be as simple as storing the user ID when
//   serializing, and finding the user by ID when deserializing.
//   However, since this example does not have a database of user
//   records, the complete 42 profile is serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the FortyTwoStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and 42
//   profile), and invoke a callback with a user object.
passport.use(new FortyTwoStrategy({
    clientID: process.env.FORTYTWO_CLIENT_ID,
    clientSecret: process.env.FORTYTWO_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:3000/auth/42/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // To keep the example simple, the user's 42 profile is returned
      // to represent the logged-in user.  In a typical application, you
      // would want to associate the 42 account with a user record in your
      // database, and return that user instead.
      return done(null, profile);
    });
  }
));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(session({ resave: true, saveUninitialized: true, secret: '!terceS' }))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.
//   If the request is authenticated (typically via a persistent login
//   session), the request will proceed.  Otherwise, the user will be
//   redirected to the login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Routes

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/42
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in 42 authentication will involve
//   redirecting the user to 42.com.  After authorization, 42
//   will redirect the user back to this application at
//   /auth/42/callback
app.get('/auth/42',
  passport.authenticate('42'),
  function(req, res, next){
    // The request will be redirected to 42 for authentication, so this
    // function will not be called.
  });

// GET /auth/42/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back
//   to the login page.  Otherwise, the primary route function function
//   will be called, which, in this example, will redirect the user to
//   the home page.
app.get('/auth/42/callback',
  passport.authenticate('42', { failureRedirect: '/login' }),
  function(req, res, next) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
