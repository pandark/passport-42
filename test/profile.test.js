/* global describe, it, before, expect */
/* jshint expr: true */

var Profile = require('../lib/profile');
var fs = require('fs');


describe('Profile.parse', function() {

  describe('profile obtained from Users documentation on 2016-11-08', function() {
    var profile;

    before(function(done) {
      fs.readFile('test/fixtures/codooku.json', 'utf8', function(err, data) {
        if (err) { return done(err); }
        profile = Profile.parse(data);
        done();
      });
    });

    it('should parse profile', function() {
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
  });

  describe('profile fields specified with dots', function() {
    var profile;

    before(function(done) {
      var fields = {
        'grade': 'cursus_users.0.grade',
        'name.familyName': 'last_name',
        'name.givenName': 'first_name',
        'emails.0.value': 'email',
        'phoneNumbers.0.value': 'phone',
        'photos.0.value': 'image_url'
      };
      fs.readFile('test/fixtures/codooku.json', 'utf8', function(err, data) {
        if (err) { return done(err); }
        profile = Profile.parse(data, fields);
        done();
      });
    });

    it('should parse profile', function() {
      expect(Object.getOwnPropertyNames(profile).length).to.equal(5);
      expect(profile.grade).to.equal('Cadet');
      expect(profile.name.givenName).to.equal('Count');
      expect(profile.name.familyName).to.equal('Dooku');
      expect(profile.emails).to.have.length(1);
      expect(profile.emails[0].value).to.equal('codooku@student.42.fr');
      expect(profile.photos).to.have.length(1);
      expect(profile.photos[0].value).to.equal('https://cdn.intra.42.fr/images/empty.png');
      expect(profile.phoneNumbers).to.have.length(1);
      expect(profile.phoneNumbers[0].value).to.equal(null);
    });
  });

  describe('profile field specified with function', function() {
    var profile;

    before(function(done) {
      var fields = {
        'id': function (obj) { return String(obj.id); }
      };
      fs.readFile('test/fixtures/codooku.json', 'utf8', function(err, data) {
        if (err) { return done(err); }
        profile = Profile.parse(data, fields);
        done();
      });
    });

    it('should parse profile', function() {
      expect(Object.getOwnPropertyNames(profile).length).to.equal(1);
      expect(profile.id).to.equal('46');
    });
  });

});
