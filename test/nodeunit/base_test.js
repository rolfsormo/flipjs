require('../../lib/adapters/MemStorage');
var Flip = require('../../lib/Flip');

exports.group1 = {
  setUp: function(callback) {
    this.db = Flip.DB('BaseTest', {});
    callback();
  },
  tearDown: function(callback) {
    if (this.db) this.db.dropDatabase();
    callback();
  },
  testInsert: function(test) {
    var self = this;

    test.expect(2);
    self.db.insert({a:'a'}, function(err, ob) {
      test.ok(!err, 'Error');
      test.equal(ob.a, 'a');
      test.done();
    });
  },
  testBasicFind: function(test) {
    var self = this;

    test.expect(8);
    self.db.insert({a:'a'}, function(err, result) {
      test.ok(!err, 'Error');

      self.db.insert({b:'b'}, function(err, result) {
        test.ok(!err, 'Error');

        self.db.find({a:'a'}, function(err, list) {
          test.ok(!err, 'Error');

          test.equal(list.length, 1, 'Result list length');
          test.deepEqual(list, [{a:'a', _id:list[0]._id}], 'List equals');

          self.db.find({a:{$ne:'a'}}, function(err, list) {
            test.ok(!err, 'Error');

            test.equal(list.length, 1, 'Result list length');
            test.deepEqual(list, [{b:'b', _id:list[0]._id}], 'List equals');
            test.done();
          });
        });
      });
    });
  },
  testNumberComparesFind: function(test) {
    var self = this;

    test.expect(14);
    self.db.insert({a:'a', val:1}, function(err, result) {
      test.ok(!err, 'Error');

      self.db.insert({b:'b', val:0}, function(err, result) {
        test.ok(!err, 'Error');

        self.db.find({val:{$gt:0}}, function(err, list) {
          test.ok(!err, 'Error');

          test.equal(list.length, 1, '$gt compare result length');
          test.deepEqual(list, [{a:'a', val:1, _id:list[0]._id}], '$gt compare result');

          self.db.find({val:{$gte:1}}, function(err, list) {
            test.ok(!err, 'Error');

            test.equal(list.length, 1, '$gte compare result length');
            test.deepEqual(list, [{a:'a', val:1, _id:list[0]._id}], '$gte compare result');

            self.db.find({val:{$lt:1}}, function(err, list) {
              test.ok(!err, 'Error');

              test.equal(list.length, 1, '$lt compare result length');
              test.deepEqual(list, [{b:'b', val:0, _id:list[0]._id}], '$lt compare result');
              self.db.find({val:{$lte:0}}, function(err, list) {
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
    self.db.insert(a, function(err, result) {
      test.ok(!err, 'Error');

      self.db.insert(b, function(err, result) {
        test.ok(!err, 'Error');

        self.db.find({val:{$in:['a']}}, function(err, list) {
          test.ok(!err, 'Error');

          test.equal(list.length, 1, '$in compare result length');
          test.deepEqual(list, [a], '$in compare result');

          self.db.find({val:{$nin:['a']}}, function(err, list) {
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