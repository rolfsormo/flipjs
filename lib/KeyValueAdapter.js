/*! Flip.js | (c) 2013 Rolf Sormo | https://github.com/rolfsormo/flipjs */

(function (root, factory) {
  var moduleName = 'KeyValueAdapter';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(moduleName, ['Flip', 'MongoMatcher', 'SchemaUtil'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    var YAML;
    try { YAML = require('libyaml'); } catch(e) { }
    var bson;
    try { bson = require('bson'); } catch(e) { }

    module.exports = factory(require('./Flip'), require('./MongoMatcher'), require('./SchemaUtil'), YAML, bson);
  } else {
    // Browser globals (root is window)
    root[moduleName] = factory(root.Flip, root.MongoMatcher, root.SchemaUtil);
  }
}(this, function (Flip, MongoMatcher, SchemaUtil, YAML, bson) {
  var debug = true;

  if (debug) {
    if (!YAML) console.log('YAML not available');
    if (!bson) console.log('bson not available');
  }

  function shortKey(base, length) {
    base = base || 32;
    length = length || 3;
    return Math.floor(Math.pow(base,length-1) + Math.random() * (Math.pow(base,length) - Math.pow(base,length-1))).toString(base);
  }

  function extend(target) {
    for(var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for(var key in source) {
        if (source.hasOwnProperty(key)) target[key] = source[key];
      }
    }
    return target;
  }

  return function(adapter) {

    function KeyValueAdapter(options) {
      this.options = options;
      this.options.sep = this.options.sep || '#';
      this.options.keyBase = this.options.keyBase || 32;
      this.options.keyLength = this.options.keyLength || 3;
      // this.options.enforceSchema = this.options.enforceSchema || false;

      if (YAML && this.options.allowYAML !== false) {
        if (debug) console.log('* YAMLing');
        this.serialize = YAML.stringify;
        this.deserialize = function(data) { return (YAML.parse(data.toString()) || [{}])[0]; };
      } else if (bson && this.options.allowBson !== false) {
        if (debug) console.log('* bsoning');
        this.serialize = function(doc) { return bson.BSONPure.BSON.serialize(doc, false, true, false); };
        this.deserialize = function(str) { return bson.BSONPure.BSON.deserialize(str); };
      } else {
        if (debug) console.log('* JSONing');
        this.serialize = JSON.stringify;
        this.deserialize = JSON.parse;
      }
    }

    // "Statics"
    KeyValueAdapter.adapterName = adapter.adapterName;

    KeyValueAdapter.detect = function(options) {
      return adapter.detect(options);
    };

    KeyValueAdapter.toString = function()  {
      return "KeyValueAdapter#" + adapter.adapterName;
    };

    // "Non-statics"
    KeyValueAdapter.prototype.connect = function(dbName, next) {
      var self = this;
      this.dbName = dbName;
      adapter.init(function() {
        adapter.get('system', function(system) {
          self.system = system || {};

          self.system.collections = self.system.collections || {};
          self.system.key = self.system.key || shortKey(self.options.keyBase, self.options.keyLength);
          next(undefined, self);
        });
      });
    };
    function hasCollectionKey(collections, key) {
      for(var k in collections) if (collections[k].key === key) return true;
    }

    KeyValueAdapter.prototype.collection = function(collection, schema, collOptions, next) {

      if (typeof collOptions === 'function') {
        next = collOptions;
        collOptions = undefined;
      }
      if (typeof schema === 'function') {
        next = schema;
        schema = undefined;
      }

      // Make sure we have an _id always.
      if (schema && !schema._id) schema._id = String;

      var kva = this;
      var sys = this.system.collections[collection] || {};

      var key = sys.key = sys.key || (this.system.key + shortKey(this.options.keyBase, this.options.keyLength));
      while (hasCollectionKey(this.system.collections, sys.key)) {
        sys.key = (this.system.key + shortKey(this.options.keyBase, this.options.keyLength));
      }

      function KVACollection(options, adapter) {
        this.options = Object.create(options); // inherit from the db options
        if (options) extend(this.options, collOptions);

        this.adapter = adapter;
      }
      KVACollection.prototype.find = function(criteria, next) {
        var self = this;
        var matcher = new MongoMatcher(criteria);
        adapter.keys(function(err, keys) {
          if (err) return next(err);

          var res = [];

          function handle(err, data) {
            if (err) return next(err);

            if (data) {
              // console.log('data', typeof data, data.length, data.toString());
              var ob = self.adapter.deserialize(data);
              // var ob = data;
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
            var r = key.split(self.options.sep);
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

        var self = this;
        var key = sys.key + this.options.sep + ob._id;

        if(this.options.enforceSchema) SchemaUtil.enforceSchema(ob, schema);

        adapter.set(key, self.adapter.serialize(ob), function(err, val) {
          next(err, ob);
        });
      };

      KVACollection.prototype.update = function(ob, next) {

        if(this.options.enforceSchema) enforceSchema(ob);

        adapter.set(kva.dbName, collection, ob._id, this.adapter.serialize(ob), function(err, val) {
          next(err, ob);
        });
      };

      KVACollection.prototype.remove = function(criteria, next) {
        var self = this;
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
            var key = sys.key + self.options.sep + list[i]._id;
            active++;
            adapter.remove(key, handler);
          }
          handle();
        });
      };

      KVACollection.prototype.drop = function(next) {
        var self = this;
        adapter.keys(function(err, keys) {
          if (err) return next(err);

          function handle(err) {
            if (err) return next(err);
            active--;
            if (!active) next();
          }

          var active = 1;
          for(var i = 0; i < keys.length; i++) {
            var r = keys[i].split(self.options.sep);
            console.log('r', r);

            if (r[0] === sys.key) {
              active++;
              adapter.remove(r[1], handle);
            }
          }
          handle();
        });
      };
      this[collection] = new KVACollection(this.options, this);
      if (next) next(undefined, this[collection]);
      return this[collection];
    };

    KeyValueAdapter.prototype.dropDatabase = function(next) {
      var self = this;
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
      //     var r = keys[i].split(this.options.sep);
      //     if (colls.indexOf(r[0]) !== -1) {
      //       active++;
      //       adapter.remove(r[1], handler);
      //     }
      //   }
      //   handle();
      // });
    };
    KeyValueAdapter.prototype.toString = function()  {
      return "KeyValueAdapter#" + adapter.adapterName + '/' + this.dbName;
    };

    return KeyValueAdapter;
  };

}));

