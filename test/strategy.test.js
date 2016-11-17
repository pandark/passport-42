/* global describe, it, before, expect */
/* jshint expr: true */

var $require = require('proxyquire');
var chai = require('chai');
var util = require('util');
var path = require('path');
var fs = require('fs');
var existsSync = fs.existsSync || path.existsSync; // node <=0.6
var FortyTwoStrategy = require('../lib/strategy');


describe('Strategy', function() {

  describe('constructed', function() {
    var strategy = new FortyTwoStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret'
    }, function() {});

    it('should be named 42', function() {
      expect(strategy.name).to.equal('42');
    });

    it('should have default user agent', function() {
      expect(strategy._oauth2._customHeaders['User-Agent']).to.equal('passport-42');
    });
  });

  describe('constructed with undefined options', function() {
    it('should throw', function() {
      expect(function() {
        var strategy = new FortyTwoStrategy(undefined, function(){});
        strategy;
      }).to.throw(Error);
    });
  });

  describe('failure caused by user denying request', function() {
    var strategy = new FortyTwoStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret'
    }, function() {});

    var info;

    before(function(done) {
      chai.passport.use(strategy)
        .fail(function(i) {
          info = i;
          done();
        })
        .req(function(req) {
          req.query = JSON.parse('{"error": "access_denied", "error_code": ' +
            '"200", "error_description": "Permissions error", ' +
            '"error_reason": "user_denied"}');
        })
        .authenticate();
    });

    it('should fail with info', function() {
      expect(info).to.not.be.undefined;
      expect(info.message).to.equal('Permissions error');
    });
  });

  describe('constructed with customHeaders option, including User-Agent field', function() {
    var strategy = new FortyTwoStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret',
      customHeaders: { 'User-Agent': 'example.test' }
    }, function() {});

    it('should set user agent as custom header in underlying OAuth 2.0 implementation', function() {
      expect(strategy._oauth2._customHeaders['User-Agent']).to.equal('example.test');
    });
  });

  describe('constructed with userAgent option', function() {
    var strategy = new FortyTwoStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret',
      userAgent: 'example.test'
    }, function() {});

    it('should set user agent as custom header in underlying OAuth 2.0 implementation', function() {
      expect(strategy._oauth2._customHeaders['User-Agent']).to.equal('example.test');
    });
  });

  describe('constructed with both customHeaders option, including User-Agent ' +
    'field, and userAgent option',
    function() {
      var strategy = new FortyTwoStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret',
        customHeaders: { 'User-Agent': 'example.org' },
        userAgent: 'example.net'
      }, function() {});

      it('should set user agent as custom header in underlying OAuth 2.0 ' +
        'implementation', function() {
        expect(strategy._oauth2._customHeaders['User-Agent']).to.equal('example.org');
      });
    });

  describe('handling a response with an authorization code', function() {
    var OAuth2Strategy = require('passport-oauth2').Strategy;
    var OAuth2;
    if (existsSync('node_modules/oauth')) { // npm 3.x
      OAuth2 = require('oauth').OAuth2;
    } else {
      OAuth2 = require('passport-oauth2/node_modules/oauth').OAuth2;
    }

    var MockOAuth2Strategy = function(options, verify) {
      OAuth2Strategy.call(this, options, verify);

      this._oauth2 = new OAuth2(options.clientID,  options.clientSecret,
        '', options.authorizationURL, options.tokenURL, options.customHeaders);
      this._oauth2.getOAuthAccessToken = function(code, options2, callback) {
        if (code !== 'SplxlOBeZQQYbYS6WxSbIA+ALT1') {
          return callback(new Error('wrong code argument'));
        }

        return callback(null, 's3cr1t-t0k3n', undefined, {});
      };
      this._oauth2.get = function(url, accessToken, callback) {
        if (url !== 'https://api.intra.42.fr/v2/me') {
          return callback(new Error('wrong url argument'));
        }
        if (accessToken !== 's3cr1t-t0k3n') {
          return callback(new Error('wrong token argument'));
        }

        var body = '{ "id": 46, "email": "codooku@student.42.fr", "login": ' +
          '"codooku", "first_name": "Count", "last_name": "Dooku", "url": ' +
          '"https://api.intra.42.fr/v2/users/codooku", "phone": null, ' +
          '"displayname": "Count Dooku", "image_url": ' +
          '"https://cdn.intra.42.fr/images/empty.png" }';
        callback(null, body, undefined);
      };
    };
    util.inherits(MockOAuth2Strategy, OAuth2Strategy);

    var MockFortyTwoStrategy = $require('../lib/strategy', {
      'passport-oauth2': MockOAuth2Strategy
    });

    var strategy = new MockFortyTwoStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret'
    }, function verify(accessToken, refreshToken, profile, done) {
      process.nextTick(function() {
        return done(null, profile);
      });
    });


    var user;

    before(function(done) {
      chai.passport.use(strategy)
        .success(function(u) {
          user = u;
          done();
        })
        .req(function(req) {
          req.query = {};
          req.query.code = 'SplxlOBeZQQYbYS6WxSbIA+ALT1';
        })
        .authenticate();
    });

    it('should authenticate user', function() {
      expect(user.id).to.equal('46');
      expect(user.username).to.equal('codooku');
    });
  });

  describe('error caused by invalid code sent to token endpoint, with ' +
    'response correctly indicating success', function() {
    var OAuth2Strategy = require('passport-oauth2').Strategy;
    var OAuth2;
    if (existsSync('node_modules/oauth')) { // npm 3.x
      OAuth2 = require('oauth').OAuth2;
    } else {
      OAuth2 = require('passport-oauth2/node_modules/oauth').OAuth2;
    }

    var MockOAuth2Strategy = function(options, verify) {
      OAuth2Strategy.call(this, options, verify);

      this._oauth2 = new OAuth2(options.clientID,  options.clientSecret,
        '', options.authorizationURL, options.tokenURL, options.customHeaders);
      this._oauth2.getOAuthAccessToken = function(code, options2, callback) {
        return callback({
          statusCode: 401,
          data: '{"error":"bad_verification_code","error_description":"The ' +
          'provided authorization grant is invalid, expired, revoked, does ' +
          'not match the redirection URI used in the authorization request, ' +
          'or was issued to another client."}' });
      };
    };
    util.inherits(MockOAuth2Strategy, OAuth2Strategy);

    var MockFortyTwoStrategy = $require('../lib/strategy', {
      'passport-oauth2': MockOAuth2Strategy
    });

    var strategy = new MockFortyTwoStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret'
    }, function() {});


    var err;

    before(function(done) {
      chai.passport.use(strategy)
        .error(function(e) {
          err = e;
          done();
        })
        .req(function(req) {
          req.query = {};
          req.query.code = 'SplxlOBeZQQYbYS6WxSbIA+ALT1';
        })
        .authenticate();
    });

    it('should error', function() {
      expect(err.constructor.name).to.equal('TokenError');
      expect(err.message).to.equal('The provided authorization grant is ' +
        'invalid, expired, revoked, does not match the redirection URI used ' +
        'in the authorization request, or was issued to another client.');
      expect(err.code).to.equal('bad_verification_code');
    });
  }); // error caused by invalid code sent to token endpoint, with response
  //correctly indicating success

});
