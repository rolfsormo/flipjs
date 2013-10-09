require('../../lib/adapters/memStorage');
var Flip = require('../../lib/flip');

exports.group1 = {
  setUp: function(callback) {
    this.db = Flip.DB('xyz', {});
    callback();
  },
  tearDown: function(callback) {
    callback();
  },
  test1: function(test) {
    test.expect(1);
    test.ok(true, 'Testing true');
    test.done();
  }
}