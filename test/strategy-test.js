var vows = require('vows');
var assert = require('assert');
var util = require('util');
var FortyTwoStrategy = require('passport-42/strategy');


vows.describe('FortyTwoStrategy').addBatch({

  'strategy': {
    topic: function() {
      return new FortyTwoStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
    },

    'should be named 42': function (strategy) {
      assert.equal(strategy.name, '42');
    },
  },

  'strategy when loading user profile': {
    topic: function() {
      var strategy = new FortyTwoStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});

      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        var body = '{ \
          "id": 46, \
          "email": "codooku@student.42.fr", \
          "login": "codooku", \
          "first_name": "Count", \
          "last_name": "Dooku", \
          "url": "https://api.intra.42.fr/v2/users/codooku", \
          "phone": null, \
          "displayname": "Count Dooku", \
          "image_url": "https://cdn.intra.42.fr/images/empty.png", \
          "staff?": false, \
          "correction_point": 4, \
          "pool_month": "september", \
          "pool_year": "2015", \
          "location": "umbriel", \
          "wallet": 0, \
          "groups": [], \
          "cursus_users": [ \
            { \
              "id": 46, \
              "begin_at": null, \
              "end_at": null, \
              "grade": "Cadet", \
              "level": 0.0, \
              "skills": [], \
              "cursus_id": 2, \
              "user": { \
                "id": 46, \
                "login": "codooku", \
                "url": "https://api.intra.42.fr/v2/users/codooku" \
              }, \
              "cursus": { \
                "id": 2, \
                "created_at": "2016-07-29T14:56:39.605Z", \
                "name": "42", \
                "slug": "42" \
              } \
            } \
          ], \
          "projects_users": [], \
          "achievements": [ \
            { \
              "id": 6, \
              "name": "Healthy spirit in a healthy body", \
              "description": "Etre inscrit à une association sportive de l\'école.", \
              "tier": "none", \
              "kind": "social", \
              "visible": true, \
              "image": null, \
              "nbr_of_success": null, \
              "users_url": "https://api.intra.42.fr/v2/achievements/6/users" \
            } \
          ], \
          "titles": [], \
          "partnerships": [], \
          "patroned": [ \
            { \
              "id": 53, \
              "user_id": 46, \
              "godfather_id": 36, \
              "ongoing": true, \
              "created_at": "2016-07-29T14:57:00.588Z", \
              "updated_at": "2016-07-29T14:57:00.591Z" \
            } \
          ], \
          "patroning": [], \
          "expertises_users": [ \
            { \
              "id": 46, \
              "expertise_id": 8, \
              "interested": false, \
              "value": 2, \
              "contact_me": false, \
              "created_at": "2016-07-29T14:56:48.485Z", \
              "user_id": 46 \
            } \
          ], \
          "campus": [ \
            { \
              "id": 2, \
              "name": "Johannesburg", \
              "time_zone": "Pretoria", \
              "language": { \
                "id": 2, \
                "name": "English", \
                "identifier": "en", \
                "created_at": "2016-07-29T14:56:38.829Z", \
                "updated_at": "2016-07-29T14:56:38.829Z" \
              }, \
              "users_count": 10, \
              "vogsphere_id": 1 \
            } \
          ] \
        }';

        callback(null, body, undefined);
      }

      return strategy;
    },

    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }

        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },

      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, '42');
        assert.equal(profile.id, '46');
        assert.equal(profile.displayName, 'Count Dooku');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      },
      'should set json property' : function(err, profile) {
        assert.isObject(profile._json);
      },
    },
  },

  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new FortyTwoStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});

      // mock
      strategy._oauth2.get = function(url, accessToken, callback) {
        callback(new Error('something-went-wrong'));
      }

      return strategy;
    },

    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }

        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },

      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },

}).export(module);
