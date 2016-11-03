var vows = require('vows');
var assert = require('assert');
var util = require('util');
var fortyTwo = require('passport-42');


vows.describe('passport-42').addBatch({
  
  'module': {
    'should report a version': function (x) {
      assert.isString(fortyTwo.version);
    },
  },
  
}).export(module);
