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

});
