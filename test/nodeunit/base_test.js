require('../../lib/adapters/FileStorage');
require('../../lib/adapters/MemStorage');
var Flip = require('../../lib/Flip');

var db;

// Run a bunch of asynchronous functions in series.
function series(arr, callback) {
    if (!callback) callback = function() {};
    if (!arr.length) return callback();

    var i = 0;
    var iterate = function() {
      var fn = arr[i++];

      fn(function(err) {
        if (err) return callback(err);
        else if (i >= arr.length) {
          callback();
        } else {
          iterate();
        }
      });
    };
    iterate();
}

exports.group1 = {
  setUp: function(callback) {
    var self = this;
    Flip.connect('BaseTest', {allowFileStorage:true, requirePersistency:true}, function(err, _db) {
      db = _db;

      callback();
    });
  },
  tearDown: function(callback) {
    // db.dropDatabase(callback);
    callback();
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
  },

  testGlobalOperators: function(test) {
    var self = this;

    var a = {a:'a', c:'c', d:'d'};
    var b = {b:'b', c:'c', d:'d'};


    test.expect(19);
    series([
      //
      // Initialize.
      //
      function openColl5(callback) {
        db.collection('coll5');
        callback();
      },
      function insertA(callback) {
        db.coll5.insert(a, callback);
      },
      function insertB(callback) {
        db.coll5.insert(b, callback);
      },

      //
      // $or
      //
      function testOrBoth(callback) {
        db.coll5.find({$or:[{a:'a'}, {b:'b'}]}, function(err, list) {
          test.ok(!err, 'Error');
          test.equal(list.length, 2, '$or compare result length');

          callback(err);
        });
      },
      function testOrNeither(callback) {
        db.coll5.find({$or:[{a:'b'}, {b:'a'}]}, function(err, list) {
          test.ok(!err, 'Error');
          test.equal(list.length, 0, '$or compare result length');

          callback(err);
        });
      },
      function testOrA(callback) {
        db.coll5.find({$or:[{a:'a'}, {b:'a'}]}, function(err, list) {
          test.ok(!err, 'Error');
          test.equal(list.length, 1, '$or compare result length');

          callback(err);
        });
      },

      //
      // $and
      //
      function testAndBoth(callback) {
        db.coll5.find({$and:[{c:'c'}, {d:'d'}]}, function(err, list) {
          test.ok(!err, 'Error');
          test.equal(list.length, 2, '$and compare result length');

          callback(err);
        });
      },
      function testAndNeither(callback) {
        db.coll5.find({$and:[{a:'b'}, {c:'c'}]}, function(err, list) {
          test.ok(!err, 'Error');
          test.equal(list.length, 0, '$and compare result length');

          callback(err);
        });
      },
      function testAndA(callback) {
        db.coll5.find({$and:[{a:'a'}, {c:'c'}]}, function(err, list) {
          test.ok(!err, 'Error');
          test.equal(list.length, 1, '$and compare result length');

          callback(err);
        });
      },

      //
      // $not
      //
      function testNotOne(callback) {
        db.coll5.find({a:{$not:'a'}}, function(err, list) {
          test.ok(!err, 'Error');
          test.equal(list.length, 1, '$not compare result length');

          callback(err);
        });
      },
      function testNotNone(callback) {
        db.coll5.find({c:{$not:'c'}}, function(err, list) {
          test.ok(!err, 'Error');
          test.equal(list.length, 0, '$not compare result length');

          callback(err);
        });
      },
      function testNotAll(callback) {
        db.coll5.find({c:{$not:'b'}}, function(err, list) {
          test.ok(!err, 'Error');
          test.equal(list.length, 2, '$not compare result length');

          callback(err);
        });
      },
    ], function(err) {
      test.ok(!err, 'Error!');
      test.done();
    });

  },
};
