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
    db.dropDatabase(callback);
    // callback();
  },
  testInsert: function(test) {

    test.expect(3);
    db.collection('coll1', function(err, coll1) {
      test.ok(!err, 'Error');

      coll1.insert({a:'a'}, function(err, ob) {
        test.ok(!err, 'Error');

        test.equal(ob.a, 'a');
        test.done();
      });
    });
  },
  testBasicFind: function(test) {

    var a = {a:'a', c:'c'};
    var b = {b:'b'};
    var coll2;

    test.expect(11);
    series([
      //
      // Initialize.
      //
      function openColl2(callback) {
        db.collection('coll2', function(err, coll) {
          coll2 = coll;
          test.ok(!err, 'Error');
          callback();
        });
      },
      function insertA(callback) {
        coll2.insert(a, callback);
      },
      function insertB(callback) {
        coll2.insert(b, callback);
      },
      //
      // find
      //
      function testField(callback) {
        coll2.find({a:'a'}, function(err, list) {
          test.ok(!err, 'Error');

          test.equal(list.length, 1, 'Result list length');
          test.deepEqual(list, [a], 'List equals');
          callback();
        });
      },
      function testNe(callback) {
        coll2.find({a:{$ne:'a'}}, function(err, list) {
          test.ok(!err, 'Error');

          test.equal(list.length, 1, 'Result list length');
          test.deepEqual(list, [b], 'List equals');

          callback();
        });
      },
      function testTwoFields(callback) {
        coll2.find({a:'a', c:'c'}, function(err, list) {
          test.ok(!err, 'Error');

          test.equal(list.length, 1, 'Result list length');
          test.deepEqual(list, [a], 'List equals');
          callback();
        });
      },
    ], function(err) {
      test.ok(!err, 'Error!');
      test.done();
    });
  },

  testNumberComparesFind: function(test) {
    var self = this;
    var a = {a:'a', val:1};
    var b = {b:'b', val:0};
    var coll3;

    test.expect(14);
    series([
      //
      // Initialize.
      //
      function openColl3(callback) {
        db.collection('coll3', function(err, coll) {
          coll3 = coll;
          test.ok(!err, 'Error');
          callback();
        });
      },
      function insertA(callback) {
        coll3.insert(a, callback);
      },
      function insertB(callback) {
        coll3.insert(b, callback);
      },
      //
      // $gt
      //
      function testGt(callback) {
        coll3.find({val:{$gt:0}}, function(err, list) {
          test.ok(!err, 'Error');

          test.equal(list.length, 1, '$gt compare result length');
          test.deepEqual(list, [a], '$gt compare result');
          callback();
        });
      },
      //
      // $gte
      //
      function testGte(callback) {
        coll3.find({val:{$gte:1}}, function(err, list) {
          test.ok(!err, 'Error');

          test.equal(list.length, 1, '$gte compare result length');
          test.deepEqual(list, [a], '$gte compare result');
          callback();
        });
      },
      //
      // $lt
      //
      function testLt(callback) {
        coll3.find({val:{$lt:1}}, function(err, list) {
          test.ok(!err, 'Error');

          test.equal(list.length, 1, '$lt compare result length');
          test.deepEqual(list, [b], '$lt compare result');
          callback();
        });
      },
      //
      // $lte
      //
      function testLte(callback) {
        coll3.find({val:{$lte:0}}, function(err, list) {
          test.ok(!err, 'Error');

          test.equal(list.length, 1, '$lte compare result length');
          test.deepEqual(list, [b], '$lte compare result');
          callback();
        });
      },
    ], function(err) {
      test.ok(!err, 'Error!');
      test.done();
    });
  },

  testArrayComparesFind: function(test) {
    var self = this;

    var a = {a:'a', val:['a','c']};
    var b = {b:'b', val:['b','c']};
    var coll4;

    test.expect(8);
    series([
      //
      // Initialize.
      //
      function openColl4(callback) {
        db.collection('coll4', function(err, coll) {
          test.ok(!err, 'Error');
          coll4 = coll;
          callback();
        });
      },
      function insertA(callback) {
        db.coll4.insert(a, callback);
      },
      function insertB(callback) {
        db.coll4.insert(b, callback);
      },

      //
      // $in
      //
      function testIn(callback) {
        coll4.find({val:{$in:['a']}}, function(err, list) {
          test.ok(!err, 'Error');

          test.equal(list.length, 1, '$in compare result length');
          test.deepEqual(list, [a], '$in compare result');
          callback();
        });
      },
      //
      // $nin
      //
      function testNin(callback) {
        coll4.find({val:{$nin:['a']}}, function(err, list) {
          test.ok(!err, 'Error');

          test.equal(list.length, 1, '$nin compare result length');
          test.deepEqual(list, [b], '$nin compare result');
          callback();
        });
      },
    ], function(err) {
      test.ok(!err, 'Error!');
      test.done();
    });
  },

  testGlobalOperators: function(test) {
    var self = this;

    var a = {a:'a', c:'c', d:'d'};
    var b = {b:'b', c:'c', d:'d'};
    var coll5;

    test.expect(20);
    series([
      //
      // Initialize.
      //
      function openColl5(callback) {
        db.collection('coll5', function(err, coll) {
          test.ok(!err, 'Error');
          coll5 = coll;
          callback();
        });
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
