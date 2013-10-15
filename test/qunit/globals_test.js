window.localStorage.clear();

var db;
module('globals', {
  setup: function() {
    stop();
    Flip.connect('Test', {}, function(err, _db) {
      db = _db;
      db.collection('coll');
      start();
    });
  },
  tearDown: function() {
    db.dropDatabase();
  }
});


test('Basics', function() {
  expect(8);

  var a = {a:'a'};
  var b = {b:'b'};
  db.coll.insert(a, function(err, result) {
    ok(!err, 'Error check');

    a._id = result._id;
    deepEqual(a, result, 'Read what we wrote');
    db.coll.insert(b, function(err, result) {
      ok(!err, 'Error check');

      b._id = result._id;
      db.coll.find({a:'a'}, function(err, res) {
        ok(!err, 'Error check');

        deepEqual([a], res, 'Find one object');

        db.coll.remove({a:'a'}, function(err, res) {
          ok(!err, 'Error check');

          db.coll.find({}, function(err, res) {
            ok(!err, 'Error check');

            deepEqual([b], res, 'Find one object');              
          });
        });
      });
    });
  });
});
