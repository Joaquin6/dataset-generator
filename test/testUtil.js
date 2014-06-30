/**
 * Common tools for test
 */

var chance = require('chance').Chance();
var populator = require('../index.js');
var dbUtil = require('../dbUtil');
var async = require('async');

var defaultOptions = {
  host: 'localhost',
  port: '27017',
  db: 'test',
  collection: 'dataset'
};

var regex = {
  phone: /(\(\d{3}\)\s*)(\d{3})-(\d{4})/,
  exp: /(\d{2})\/(\d{4})/
};

// connects to the target collection, and possibly clear its content
function setUp (inputOptions, fn) {
  var options = merge_objects(defaultOptions, inputOptions);
  dbUtil.parseUserOpts(options, function (opts) {
    dbUtil.connect(opts, function(collection, db) {
      collection.remove({}, function(err, res) {
        if(err) return fn(err);
        var connection = {
          db: db,
          collection: collection
        };
        fn(null, connection);
      });
    });
  });
}

// close the connection, drop the test collection
function tearDown (connection, fn) {
  connection.collection.drop();
  connection.db.close();
  fn();
}

function merge_objects(defaults, instance) {
  var obj3 = {}, attrname;
  for (attrname in defaults) { obj3[attrname] = defaults[attrname]; }
  for (attrname in instance) { obj3[attrname] = instance[attrname]; }
  return obj3;
}

function sampleAndStrip(array, count, fn) {
  var sample = chance.pick(array, count);
  async.each(sample,
    function (item, callback) {
      item._id = undefined;
      callback();
    },
    function (err) {
      if (err) throw err;
      fn(sample);
  });
}

// modules to test
module.exports.populator = populator;
// test utility functions
module.exports.setUp = setUp;
module.exports.tearDown = tearDown;
// general utilities
module.exports.sampleAndStrip = sampleAndStrip;
module.exports.regex = regex;
