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

    test.expect(5);
    self.db.insert({a:'a'}, function(err, result) {
      test.ok(!err, 'Error');

      self.db.insert({b:'b'}, function(err, result) {
        test.ok(!err, 'Error');

        self.db.find({a:'a'}, function(err, list) {
          test.ok(!err, 'Error');

          test.equal(list.length, 1, 'Result list length');
          test.deepEqual(list, [{a:'a', _id:list[0]._id}], 'List equals');
          test.done();
        })
      });
    });
  }
}