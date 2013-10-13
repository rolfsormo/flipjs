
define('Test', ['Flip'], function(Flip) {

  window.localStorage.clear();

	var db;
	module('LocalStorage', {
		setup: function() {
			db = Flip.DB('Test', {});
		},
		tearDown: function() {
			db.dropDatabase();
		}
	});


	test('Basics', function() {
		expect(8);

		var a = {a:'a'};
		var b = {b:'b'};
		db.insert(a, function(err, result) {
			ok(!err, 'Error check');

			a._id = result._id;
			deepEqual(a, result, 'Read what we wrote');
			db.insert(b, function(err, result) {
				ok(!err, 'Error check');

        b._id = result._id;
				db.find({a:'a'}, function(err, res) {
					ok(!err, 'Error check');

					deepEqual([a], res, 'Find one object');

          db.remove({a:'a'}, function(err, res) {
            ok(!err, 'Error check');

            db.find({}, function(err, res) {
              ok(!err, 'Error check');

              deepEqual(res, [b], 'Find one object');              
            });
          });
				});
			});
		});
	});
});

require(['Test'], function() {});