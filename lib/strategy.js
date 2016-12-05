// Load modules.
var OAuth2Strategy = require('passport-oauth2');
var util = require('util');
var Profile = require('./profile');
var InternalOAuthError = require('passport-oauth2').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The 42 authentication strategy authenticates requests by delegating to 42
 * using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `cb`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your 42 application's UID
 *   - `clientSecret`  your 42 application's SECRET
 *   - `callbackURL`   URL to which 42 will redirect the user after granting
 *                     authorization
 *   — `userAgent`     User Agent string used in all API requests. e.g: domain
 *                     name of your application.
 *   — `profileFields` Object specifying fields to include in the user profile.
 *
 * Examples:
 *
 *     passport.use(new FortyTwoStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/42/callback'
 *       },
 *       function(accessToken, refreshToken, profile, cb) {
 *         User.findOrCreate(..., function (err, user) {
 *           cb(err, user);
 *         });
 *       }
 *     ));
 *
 * @constructor
 * @param {object} options
 * @param {function} verify
 * @access public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL ||
    'https://api.intra.42.fr/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://api.intra.42.fr/oauth/token';
  options.customHeaders = options.customHeaders || {};

  if (!options.customHeaders['User-Agent']) {
    options.customHeaders['User-Agent'] = options.userAgent || 'passport-42';
  }

  OAuth2Strategy.call(this, options, verify);
  this.name = '42';
  this._profileURL = options.profileURL || 'https://api.intra.42.fr/v2/me';
  this._profileFields = options.profileFields || null;
  this._oauth2.useAuthorizationHeaderforGET(true);
}

// Inherit from `OAuth2Strategy`.
util.inherits(Strategy, OAuth2Strategy);

/**
 * Retrieve user profile from 42.
 *
 * This function constructs a normalized profile, with the following properties
 * (or the ones specified in `options.profileFields`):
 *
 *   - `provider`         always set to `42`
 *   - `id`               the user's 42 ID
 *   - `username`         the user's 42 xlogin
 *   - `displayName`      the user's full name
 *   - `name.familyName`  the user's last name
 *   - `name.givenName`   the user's first name
 *   - `profileUrl`       the URL of the profile for the user on 42 intra
 *   - `emails`           the user's email address
 *   - `photos      `     the user's photo
 *   - `phoneNumbers`     the user's phone number
 *
 * @param {string} accessToken
 * @param {function} done
 * @access protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  var fields = this._profileFields;
  this._oauth2.get(this._profileURL, accessToken, function (err, body) {
    var json;

    if (err) {
      if (err.data) {
        try {
          json = JSON.parse(err.data);
        } catch (_) {
        // nothing
        }
      }
      if (json && json.message) {
        return done(new InternalOAuthError(json.message, err));
      }
      return done(new InternalOAuthError('Failed to fetch user profile', err));
    }

    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }

    var profile = Profile.parse(json, fields);
    profile.provider = '42';
    profile._raw = body;
    profile._json = json;

    done(null, profile);
  });
};


// Expose constructor.
module.exports = Strategy;
