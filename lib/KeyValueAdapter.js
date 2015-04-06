/*! Flip.js | (c) 2013 Rolf Sormo | https://github.com/rolfsormo/flipjs */

(function (root, factory) {
  var moduleName = 'KeyValueAdapter';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(moduleName, ['Flip', 'MongoMatcher'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory(require('./Flip'), require('./MongoMatcher'));
  } else {
    // Browser globals (root is window)
    root[moduleName] = factory(root.Flip, root.MongoMatcher);
  }
}(this, function (Flip, MongoMatcher) {

  return function(adapter) {

    function KeyValueAdapter(options) {
      this.options = options;
    }

    // "Statics"
    KeyValueAdapter.adapterName = adapter.adapterName;

    KeyValueAdapter.detect = function(options) {
      return adapter.detect(options);
    };

    KeyValueAdapter.toString = function()  {
      return "KeyValueAdapter::" + adapter.adapterName;
    };

    // "Non-statics"
    KeyValueAdapter.prototype.connect = function(dbName, next) {
      var self = this;
      this.dbName = dbName;
      adapter.init(function() {
        adapter.get('system', function(system) {
          self.system = system || {};

          self.system.collections = self.system.collections || {};
          next(undefined, self);
        });
      });
    };
    function hasCollectionKey(collections, key) {
      for(var k in collections) if (collections[k].key === key) return true;
    }

    KeyValueAdapter.prototype.collection = function(collection, options) {
      var kva = this;
      var sys = this.system.collections[collection] || {};

      var key = sys.key = sys.key || (this.dbName.substring(0,2) + collection.substring(0,2));
      var i = 0;
      while (hasCollectionKey(this.system.collections, sys.key)) {
        sys.key = key + i;
        i++;
      }

      function KVACollection() {
      }
      KVACollection.prototype.find = function(criteria, next) {
        var matcher = new MongoMatcher(criteria);
        adapter.keys(function(err, keys) {
          if (err) return next(err);

          var res = [];

          function handle(err, json) {
            if (err) return next(err);

            if (json) {
              var ob = JSON.parse(json);
              console.log(' ============= MATCHING', criteria, 'to', ob);
              if (matcher.match(ob)) {
                res.push(ob);
              }
              console.log('----');
            }

            active--;
            if (!active) {
              console.log('res', res);
              next(undefined, res);
            }
          }

          var active = 1;
          for(var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var r = key.split('_');
            console.log(sys.key, r);
            if (r.length == 2 && sys.key === r[0]) {
              active++;
              adapter.get(key, handle);
            }
          }
          handle();
        });
      };
      KVACollection.prototype.insert = function(ob, next) {
        if (!ob._id) ob._id = Flip.generateId();

        var key = sys.key + '_' + ob._id;
        adapter.set(key, JSON.stringify(ob), function(err, val) {
          next(err, ob);
        });
      };

      KVACollection.prototype.update = function(ob, next) {
        adapter.set(kva.dbName, collection, ob._id, JSON.stringify(ob), function(err, val) {
          next(err, ob);
        });
      };

      KVACollection.prototype.remove = function(criteria, next) {
        this.find(criteria, function(err, list) {
          if (err) return next(err);
          if (!list.length) return next();

          function handler(err) {
            if (err) return next(err);

            active--;
            if (!active) next();
          }

          var active = 1;
          for(var i = 0; i < list.length; i++) {
            var key = sys.key + '_' + list[i]._id;
            active++;
            adapter.remove(key, handler);
          }
          handle();
        });
      };

      KVACollection.prototype.drop = function(next) {
        adapter.keys(function(err, keys) {
          if (err) return next(err);

          function handle(err) {
            if (err) return next(err);
            active--;
            if (!active) next();
          }

          var active = 1;
          for(var i = 0; i < keys.length; i++) {
            var r = keys[i].split('_');
            console.log('r', r);

            if (r[0] === sys.key) {
              active++;
              adapter.remove(r[1], handle);
            }
          }
          handle();
        });
      };
      this[collection] = new KVACollection();
      return this[collection];
    };

    KeyValueAdapter.prototype.dropDatabase = function(next) {
      console.log('===================== DROPPING DATABASE', this.dbName);
      adapter.keys(function(err, keys) {
        function handle(err) {
          if (err) return next(err);
          active--;
          if (!active) next();
        }

        var active = 1;
        for(var i = 0; i < keys.length; i++) adapter.remove(keys[i], handle);
        handle();
      });

      // var colls = [];
      // for(var c in this.system.collections) {
      //   colls.push(this.system.collections[c].key);
      // }

      // adapter.keys(function(err, keys) {
      //   function handle(err) {
      //     if (err) return next(err);

      //     active--;
      //     if (!active) {
      //       // Also remove system.
      //       adapter.remove('system', next);
      //     }
      //   }
      //   var active = 1;
      //   for(var i = 0; i < keys.length; i++) {
      //     var r = keys[i].split('_');
      //     if (colls.indexOf(r[0]) !== -1) {
      //       active++;
      //       adapter.remove(r[1], handler);
      //     }
      //   }
      //   handle();
      // });
    };
    KeyValueAdapter.prototype.toString = function()  {
      return "KeyValueAdapter::" + adapter.adapterName + '//' + this.dbName;
    };

    return KeyValueAdapter;
  };

}));

