

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
    function format(i) {
      return i.toString(16).substring(1);
    }
    function r() {
      return Math.floor((1 + Math.random()) * 0x10000);
    }
    return format(new Date().getTime()) + format(r()) + format(r()) + format(r());
  };

  return new Flip();
}));


define("Flip", function(){});

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
    root[moduleName] = factory(root.flip, root.MongoMatcher);
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
      this.dbName = dbName;
      this.system = {};
      // TODO: load system from db.
      next(undefined, this);
    };
    KeyValueAdapter.prototype.collection = function(collection, options) {
      var kva = this;

      function KVACollection() {
      }
      KVACollection.prototype.find = function(criteria, next) {
        var matcher = new MongoMatcher(criteria);
        var ids = adapter.keys(kva.dbName, collection);
        var res = [];
        for(var i = 0; i < ids.length; i++) {
          var v = adapter.get(kva.dbName, collection, ids[i]);
          console.log('v', v);
          var ob = JSON.parse(v);
          if (matcher.match(ob)) res.push(ob);
        }
        if (next) next(undefined, res);
      };
      KVACollection.prototype.insert = function(ob, next) {
        ob._id = ob._id || Flip.generateId();
        adapter.set(kva.dbName, collection, ob._id, JSON.stringify(ob));
        if (next) next(undefined, ob);
      };
      KVACollection.prototype.update = function(ob, next) {
        adapter.set(kva.dbName, collection, ob._id, JSON.stringify(ob));
        if (next) next(undefined, ob);
      };
      KVACollection.prototype.remove = function(criteria, next) {
        this.find(criteria, function(err, list) {
          for(var i = 0; i < list.length; i++) adapter.remove(kva.dbName, collection, list[i]._id);
          if (next) next();
        });
      };
      this[collection] = new KVACollection();
      return this[collection];
    };

    KeyValueAdapter.prototype.dropDatabase = function(next) {
      adapter.dropDatabase(this.dbName);
      if (next) next();
    };
    KeyValueAdapter.prototype.toString = function()  {
      return "KeyValueAdapter::" + adapter.adapterName + '//' + this.dbName;
    };

    return KeyValueAdapter;
  };

}));


define("KeyValueAdapter", function(){});

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

  Flip.addAdapter(KeyValueAdapter({
    adapterName: 'LocalStorage',
    detect: function(options) {
      try {
        return 'localStorage' in window && window.localStorage !== null;
      } catch (e) {
        return false;
      }
    },
    keys: function(db, collection) {
      var k = [];
      for(var i = 0; i < localStorage.length; i++) {
        var r = localStorage.key(i).split('_');
        if (r[0] === db && r[1] == collection) k.push(r[2]);
      }
      return k;
    },
    get: function(db, collection, key) {
      if (debug) console.log('-> GET', db, collection, key);
      var o = window.localStorage.getItem(db + '_' + collection + '_' + key);
      return o;
    },
    set: function(db, collection, key, value) {
      if (debug) console.log('-> SET', db, collection, key, value);
      window.localStorage.setItem(db + '_' + collection + '_' + key, value);
    },
    remove: function(db, collection, key) {
      if (debug) console.log('-> REMOVE', db, collection, key);
      window.localStorage.removeItem(db + '_' + collection + '_' + key);
    },
    dropCollection: function(db, collection) {
      if (debug) console.log('-> DROP COLLECTION', db, collection);
      for(var i = 0; i < localStorage.length; i++) {
        var r = localStorage.key(i).split('_');
        console.log('r', r);
        if (r[0] === db && r[1] == collection) localStorage.removeItem(localStorage.key(i));
      }
    },
    dropDatabase: function(db) {
      if (debug) console.log('-> DROP DB', db);
      for(var i = 0; i < localStorage.length; i++) {
        var r = localStorage.key(i).split('_');
        console.log('r', r);
        if (r[0] === db) localStorage.removeItem(localStorage.key(i));
      }
    }
  }));
}));



define("adapters/LocalStorage", function(){});

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

  var ob = {};
  Flip.addAdapter(KeyValueAdapter({
    adapterName: 'MemStorage',
    detect: function(options) {
      return !options.requirePersistency;
    },
    keys: function(db, collection) {
      if (debug) console.log('[ KEYS', db, collection);
      return (ob[db] && Object.keys(ob[db])) || [];
    },
    get: function(db, collection, key) {
      if (debug) console.log('[ GET', db, collection, key);
      return ob[db] && ob[db][key];
    },
    set: function(db, collection, key, value) {
      if (debug) console.log('[ SET', db, collection, key, value);
      ob[db] = ob[db] || {};
      ob[db][key] = value;
    },
    remove: function(db, collection, key) {
      if (debug) console.log('[ REMOVE', db, collection, key);
      if (ob[db]) delete ob[db][key];
    },
    dropCollection: function(db, collection) {
      if (debug) console.log('[ DROP COLLECTION', db, collection);
      delete ob[db];
    },
    dropDatabase: function(db) {
      if (debug) console.log('[ DROP DB', db);
      delete ob[db];
    }
  }));
}));



define("adapters/MemStorage", function(){});

require(["Flip"]);

//# sourceMappingURL=Flip-debug.js.map