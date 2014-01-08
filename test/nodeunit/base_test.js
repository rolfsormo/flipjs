require('../../lib/adapters/FileStorage');
require('../../lib/adapters/MemStorage');
var Flip = require('../../lib/Flip');

var db;

exports.group1 = {
  setUp: function(callback) {
    var self = this;
    Flip.connect('BaseTest', {allowFileStorage:true, requirePersistency:true}, function(err, _db) {
      db = _db;

      callback();
    });
  },
  tearDown: function(callback) {
    db.dropDatabase(callback);
  },
  testInsert: function(test) {

    test.expect(2);
    db.collection('coll1');
    db.coll1.insert({a:'a'}, function(err, ob) {
      test.ok(!err, 'Error');
      test.equal(ob.a, 'a');
      test.done();
    });
  },
  testBasicFind: function(test) {

    var a = {a:'a', c:'c'};
    var b = {b:'b'};

    test.expect(11);
    db.collection('coll2');
    db.coll2.insert(a, function(err, result) {
      test.ok(!err, 'Error');

      db.coll2.insert(b, function(err, result) {
        test.ok(!err, 'Error');

        db.coll2.find({a:'a'}, function(err, list) {
          test.ok(!err, 'Error');

          test.equal(list.length, 1, 'Result list length');
          test.deepEqual(list, [a], 'List equals');

          db.coll2.find({a:{$ne:'a'}}, function(err, list) {
            test.ok(!err, 'Error');

            test.equal(list.length, 1, 'Result list length');
            test.deepEqual(list, [b], 'List equals');
            db.coll2.find({a:'a', c:'c'}, function(err, list) {
              test.ok(!err, 'Error');

              test.equal(list.length, 1, 'Result list length');
              test.deepEqual(list, [a], 'List equals');
              test.done();
            });
          });
        });
      });
    });
  },
  testNumberComparesFind: function(test) {
    var self = this;

    test.expect(14);
    db.collection('coll3');
    db.coll3.insert({a:'a', val:1}, function(err, result) {
      test.ok(!err, 'Error');

      db.coll3.insert({b:'b', val:0}, function(err, result) {
        test.ok(!err, 'Error');

        db.coll3.find({val:{$gt:0}}, function(err, list) {
          test.ok(!err, 'Error');

          test.equal(list.length, 1, '$gt compare result length');
          test.deepEqual(list, [{a:'a', val:1, _id:list[0]._id}], '$gt compare result');

          db.coll3.find({val:{$gte:1}}, function(err, list) {
            test.ok(!err, 'Error');

            test.equal(list.length, 1, '$gte compare result length');
            test.deepEqual(list, [{a:'a', val:1, _id:list[0]._id}], '$gte compare result');

            db.coll3.find({val:{$lt:1}}, function(err, list) {
              test.ok(!err, 'Error');

              test.equal(list.length, 1, '$lt compare result length');
              test.deepEqual(list, [{b:'b', val:0, _id:list[0]._id}], '$lt compare result');
              db.coll3.find({val:{$lte:0}}, function(err, list) {
                test.ok(!err, 'Error');

                test.equal(list.length, 1, '$lte compare result length');
                test.deepEqual(list, [{b:'b', val:0, _id:list[0]._id}], '$lte compare result');
                test.done();
              });
            });
          });
        });
      });
    });
  },

  testArrayComparesFind: function(test) {
    var self = this;

    var a = {a:'a', val:['a','c']};
    var b = {b:'b', val:['b','c']};

    test.expect(8);
    db.collection('coll4');
    db.coll4.insert(a, function(err, result) {
      test.ok(!err, 'Error');

      db.coll4.insert(b, function(err, result) {
        test.ok(!err, 'Error');

        db.coll4.find({val:{$in:['a']}}, function(err, list) {
          test.ok(!err, 'Error');

          test.equal(list.length, 1, '$in compare result length');
          test.deepEqual(list, [a], '$in compare result');

          db.coll4.find({val:{$nin:['a']}}, function(err, list) {
            test.ok(!err, 'Error');

            test.equal(list.length, 1, '$nin compare result length');
            test.deepEqual(list, [b], '$nin compare result');

            test.done();
          });
        });
      });
    });
  }

};