/*! Flip.js | (c) 2013 Rolf Sormo | https://github.com/rolfsormo/flipjs */

(function (root, factory) {
  var moduleName = 'Flip';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(moduleName, factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root[moduleName] = factory();
  }
}(this, function () {

  function Flip() {
    this.adapters = [];
  }
  Flip.toString = function() {
    return 'Flip';
  };

  Flip.prototype.addAdapter = function(adapter) {
    this.adapters.push(adapter);
  };

  Flip.prototype.getAdapter = function(options) {
    for(var i = 0; i < this.adapters.length; i++) {
      var o, k;
      var adapterName = this.adapters[i].adapterName;

      if (options.common) {
        o = {};
        for(k in Object.keys(options.common)) o[k] = options.common[k];
        if (options[adapterName]) {
          for(k in Object.keys(options[adapterName])) o[k] = options[adapterName][k];
        }
      } else {
        o = options;
      }
      if (this.adapters[i].detect(o)) return this.adapters[i];
    }
  };

  Flip.prototype.connect = function(url, options, next) {
    if (typeof options == 'function') {
      next = options;
      options = {};
    }
    var adapter = this.getAdapter(options);
    if (!adapter) throw new Error('No suitable adapter found');

    (new adapter(options)).connect(url, next);
  };

  Flip.prototype.generateId = function() {
    return new Date().getTime().toString(16).substring(1) + this._generateKey(16, 6) + this._generateKey(16, 6);
  };

  Flip.prototype._generateKey = function(base, length) {
    base = base || 32;
    length = length || 3;
    return Math.floor(Math.pow(base,length-1) + Math.random() * (Math.pow(base,length) - Math.pow(base,length-1))).toString(base);
  };

  Flip.prototype._extend = function(target) {
    for(var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for(var key in source) {
        if (source.hasOwnProperty(key)) target[key] = source[key];
      }
    }
    return target;
  };

  return new Flip();
}));


define("Flip", function(){});

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
          self.system.key = self.system.key || Flip._generateKey(self.options.keyBase, self.options.keyLength);
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

      var key = sys.key = sys.key || (this.system.key + Flip._generateKey(this.options.keyBase, this.options.keyLength));
      while (hasCollectionKey(this.system.collections, sys.key)) {
        sys.key = (this.system.key + Flip._generateKey(this.options.keyBase, this.options.keyLength));
      }

      function KVACollection(options, adapter) {
        this.options = Object.create(options); // inherit from the db options
        if (options) Flip._extend(this.options, collOptions);

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


define("KeyValueAdapter", function(){});

/*! Flip.js | (c) 2013 Rolf Sormo | https://github.com/rolfsormo/flipjs */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    require(['Flip', 'KeyValueAdapter'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    factory(require('../Flip'), require('../KeyValueAdapter'));
  } else {
    // Browser globals (root is window)
     factory(root.Flip, root.KeyValueAdapter);
  }
}(this, function (Flip, KeyValueAdapter) {
  var debug = false;

  Flip.addAdapter(KeyValueAdapter({
    adapterName: 'LocalStorage',
    detect: function(options) {
      try {
        return 'localStorage' in window && window.localStorage !== null;
      } catch (e) {
        return false;
      }
    },
    init: function(next) {
      next();
    },
    keys: function(next) {
      if (debug) console.log('-> KEYS');
      var k = [];
      for(var i = 0; i < localStorage.length; i++) k.push(localStorage.key(i));
      next(undefined, k);
    },
    get: function(key, next) {
      if (debug) console.log('-> GET', key);
      next(undefined, window.localStorage.getItem(db + '_' + collection + '_' + key));
    },
    set: function(key, value, next) {
      if (debug) console.log('-> SET', key, value);
      window.localStorage.setItem(key, value);
      next(undefined, value);
    },
    remove: function(key, next) {
      if (debug) console.log('-> REMOVE', key);
      window.localStorage.removeItem(key);
      next();
    }
  }));
}));



define("adapters/LocalStorage", function(){});

/*! Flip.js | (c) 2013 Rolf Sormo | https://github.com/rolfsormo/flipjs */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    require(['Flip', 'KeyValueAdapter'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    factory(require('../Flip'), require('../KeyValueAdapter'));
  } else {
    // Browser globals (root is window)
     factory(root.Flip, root.KeyValueAdapter);
  }
}(this, function (Flip, KeyValueAdapter) {
  var debug = true;

  var ob = {};
  Flip.addAdapter(KeyValueAdapter({
    adapterName: 'MemStorage',
    detect: function(options) {
      return !options.requirePersistency;
    },
    init: function(next) {
      next();
    },
    keys: function(next) {
      if (debug) console.log('[ KEYS');
      console.log('keys', Object.keys(ob));
      next(undefined, Object.keys(ob));
    },
    get: function(key, next) {
      if (debug) console.log('[ GET', key);
      next(undefined, ob[key]);
    },
    set: function(key, value, next) {
      if (debug) console.log('[ SET', key, value);
      ob[key] = value;
      next();
    },
    remove: function(key, next) {
      if (debug) console.log('[ REMOVE', key);
      delete ob[key];
      next();
    }
  }));
}));



define("adapters/MemStorage", function(){});

/*! Flip.js | (c) 2013 Rolf Sormo | https://github.com/rolfsormo/flipjs */

(function (root, factory) {
    console.log('loading...');
  if (typeof define === 'function' && define.amd) {
    // AMD.
    throw new Error('FileStorage works only in Node.js');
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    factory(require('../Flip'), require('../KeyValueAdapter'), require('fs'));
  } else {
    // Browser
    throw new Error('FileStorage works only in Node.js');
  }
}(this, function (Flip, KeyValueAdapter, fs) {
  var debug = false;

  Flip.addAdapter(KeyValueAdapter({
    adapterName: 'FileStorage',
    detect: function(options) {
      this.options = options;
      this.options.directory = this.options.directory || 'db';
      if (debug) console.log('Allow File Storage: ', options.allowFileStorage);
      return options.allowFileStorage && typeof window === 'undefined';
    },
    init: function(next) {
      if (debug) console.log('Creating: ', this.options.directory);
      fs.mkdir(this.options.directory, function(e) {
        next();
      });
    },
    keys: function(next) {
      if (debug) console.log('[ KEYS');

      fs.readdir(this.options.directory, function(err, files) {
        if (err) return next(err);

        if (debug) console.log('files', files);
        next(undefined, files);
      });
    },
    get: function(key, next) {
      if (debug) console.log('[ GET', key);
      key = key.replace('/', '_');
      fs.readFile(this.options.directory + '/' + key, function(err, file) {
        if (err) return next(err);

        next(undefined, file);
      });
    },
    set: function(key, value, next) {
      if (debug) console.log('[ SET', key, value);
      key = key.replace('/', '_');
      fs.writeFile(this.options.directory + '/' + key, value, function(err) {
        if (err) return next(err);

        next();
      });
    },
    remove: function(key, next) {
      if (debug) console.log('[ REMOVE', key);
      key = key.replace('/', '_');
      fs.unlink(this.options.directory + '/' + key, function(err) {
        if (err) return next(err);

        next();
      });
    }
  }));
}));



define("adapters/FileStorage", function(){});


require(["Flip"]);

//# sourceMappingURL=Flip-debug.js.map