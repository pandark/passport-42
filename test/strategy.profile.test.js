/* global describe, it, before, expect */
/* jshint expr: true */

var FortyTwoStrategy = require('../lib/strategy');


describe('Strategy#userProfile', function() {

  describe('fetched from default endpoint', function() {
    var strategy =  new FortyTwoStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret'
    }, function() {});

    strategy._oauth2.get = function(url, accessToken, callback) {
      if (url != 'https://api.intra.42.fr/v2/me') { return callback(new Error('wrong url argument')); }
      if (accessToken != 'token') { return callback(new Error('wrong token argument')); }

      var body = '{ "id": 46, "email": "codooku@student.42.fr", "login": "codooku", "first_name": "Count", "last_name": "Dooku", "url": "https://api.intra.42.fr/v2/users/codooku", "phone": null, "displayname": "Count Dooku", "image_url": "https://cdn.intra.42.fr/images/empty.png" }';
      callback(null, body, undefined);
    };


    var profile;

    before(function(done) {
      strategy.userProfile('token', function(err, p) {
        if (err) { return done(err); }
        profile = p;
        done();
      });
    });

    it('should parse profile', function() {
      expect(profile.provider).to.equal('42');

      expect(profile.id).to.equal('46');
      expect(profile.username).to.equal('codooku');
      expect(profile.displayName).to.equal('Count Dooku');
      expect(profile.profileUrl).to.equal('https://api.intra.42.fr/v2/users/codooku');
      expect(profile.emails).to.have.length(1);
      expect(profile.emails[0].value).to.equal('codooku@student.42.fr');
      expect(profile.photos).to.have.length(1);
      expect(profile.photos[0].value).to.equal('https://cdn.intra.42.fr/images/empty.png');
      expect(profile.phoneNumbers).to.have.length(1);
      expect(profile.phoneNumbers[0].value).to.equal(null);
    });

    it('should set raw property', function() {
      expect(profile._raw).to.be.a('string');
    });

    it('should set json property', function() {
      expect(profile._json).to.be.an('object');
    });
  }); // fetched from default endpoint

  describe('fetched from custom endpoint', function() {
    var strategy =  new FortyTwoStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret',
      profileURL: 'https://api.intra.42.fr/alpha/me'
    }, function() {});

    strategy._oauth2.get = function(url, accessToken, callback) {
      if (url != 'https://api.intra.42.fr/alpha/me') { return callback(new Error('wrong url argument')); }
      if (accessToken != 'token') { return callback(new Error('wrong token argument')); }

      var body = '{ "id": 46, "email": "codooku@student.42.fr", "login": "codooku", "first_name": "Count", "last_name": "Dooku", "url": "https://api.intra.42.fr/v2/users/codooku", "phone": null, "displayname": "Count Dooku", "image_url": "https://cdn.intra.42.fr/images/empty.png" }';
      callback(null, body, undefined);
    };


    var profile;

    before(function(done) {
      strategy.userProfile('token', function(err, p) {
        if (err) { return done(err); }
        profile = p;
        done();
      });
    });

    it('should parse profile', function() {
      expect(profile.provider).to.equal('42');

      expect(profile.id).to.equal('46');
      expect(profile.username).to.equal('codooku');
      expect(profile.displayName).to.equal('Count Dooku');
      expect(profile.profileUrl).to.equal('https://api.intra.42.fr/v2/users/codooku');
      expect(profile.emails).to.have.length(1);
      expect(profile.emails[0].value).to.equal('codooku@student.42.fr');
      expect(profile.photos).to.have.length(1);
      expect(profile.photos[0].value).to.equal('https://cdn.intra.42.fr/images/empty.png');
      expect(profile.phoneNumbers).to.have.length(1);
      expect(profile.phoneNumbers[0].value).to.equal(null);
    });

    it('should set raw property', function() {
      expect(profile._raw).to.be.a('string');
    });

    it('should set json property', function() {
      expect(profile._json).to.be.an('object');
    });
  });

  describe('error caused by invalid token', function() {
    var strategy =  new FortyTwoStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});

    strategy._oauth2.get = function(url, accessToken, callback) {
      var body = '{"message":"Bad credentials"}'; //TODO check if the real message is the same
      callback({ statusCode: 400, data: body });
    };

    var err, profile;
    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('Bad credentials');
    });
  }); // error caused by invalid token

  describe('error caused by malformed response', function() {
    var strategy =  new FortyTwoStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      }, function() {});

    strategy._oauth2.get = function(url, accessToken, callback) {
      var body = 'Hello, world.';
      callback(null, body, undefined);
    };

    var err, profile;
    before(function(done) {
      strategy.userProfile('token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.message).to.equal('Failed to parse user profile');
    });
  }); // error caused by malformed response

  describe('internal error', function() {
    var strategy =  new FortyTwoStrategy({
      clientID: 'ABC123',
      clientSecret: 'secret'
    }, function() {});

    strategy._oauth2.get = function(url, accessToken, callback) {
      return callback(new Error('something went wrong'));
    }


    var err, profile;

    before(function(done) {
      strategy.userProfile('wrong-token', function(e, p) {
        err = e;
        profile = p;
        done();
      });
    });

    it('should error', function() {
      expect(err).to.be.an.instanceOf(Error);
      expect(err.constructor.name).to.equal('InternalOAuthError');
      expect(err.message).to.equal('Failed to fetch user profile');
      expect(err.oauthError).to.be.an.instanceOf(Error);
      expect(err.oauthError.message).to.equal('something went wrong');
    });

    it('should not load profile', function() {
      expect(profile).to.be.undefined;
    });
  }); // internal error

});
