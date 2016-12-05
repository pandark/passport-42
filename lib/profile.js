/**
 * Parse profile.
 *
 * @param {object|string} json
 * @param {object} profileFields
 * @return {object}
 * @access public
 */
exports.parse = function(json, profileFields) {
  if ('string' === typeof json) {
    json = JSON.parse(json);
  }

  profileFields = profileFields || {
    'id': function (obj) { return String(obj.id); },
    'username': 'login',
    'displayName': 'displayname',
    'name.familyName': 'last_name',
    'name.givenName': 'first_name',
    'profileUrl': 'url',
    'emails.0.value': 'email',
    'phoneNumbers.0.value': 'phone',
    'photos.0.value': 'image_url'
  };

  var profile = {};
  Object.getOwnPropertyNames(profileFields).forEach(function(flatProps) {
    var profileCur = profile;
    var props = flatProps.split('.').map(function(p) {
      return (/^\d+$/.test(p)) ? parseInt(p, 10) : p;
    });
    var propsLen = props.length;
    props.forEach(function(prop, i) {
      if (i !== propsLen - 1) {
        if (profileCur[prop] === undefined) {
          if (Number.isInteger(props[i + 1])) {
            profileCur[prop] = [];
          } else {
            profileCur[prop] = {};
          }
        }
        profileCur = profileCur[prop];
      } else {
        if (typeof profileFields[flatProps] === 'function') {
          profileCur[prop] = (profileFields[flatProps])(json);
        } else {
          var jsonCur = json;
          var valFields = profileFields[flatProps].split('.').map(function(v) {
            return (/^\d+$/.test(v)) ? parseInt(v, 10) : v;
          });
          var valLen = valFields.length;
          valFields.forEach(function(val, j) {
            if (j !== valLen - 1) {
              jsonCur = jsonCur[val];
            } else {
              profileCur[prop] = jsonCur[val];
            }
          });
        }
      }
    });
  });

  return profile;
};
