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
      this.dbName = dbName;
      this.system = adapter.get('system') || {};
      this.system.collections = this.system.collections || {};
      // TODO: load system from db.
      next(undefined, this);
    };
    function hasCollectionKey(collections, key) {
      for(var k in collections) if (collections[k].key === key) return true;
    }

    KeyValueAdapter.prototype.collection = function(collection, options) {
      var kva = this;
      var sys = this.system.collections[collection] || {};

      sys.key = sys.key || (this.dbName.substring(0,2) + collection.substring(0,2));
      var i = 0;
      while (hasCollectionKey(this.system.collections, sys.key)) {
        sys.key = sys.key + i;
        i++;
      }

      function KVACollection() {
      }
      KVACollection.prototype.find = function(criteria, next) {
        var matcher = new MongoMatcher(criteria);
        var ids = adapter.keys(kva.dbName, collection);
        var res = [];
        for(var i = 0; i < ids.length; i++) {
          var v = adapter.get(kva.dbName, collection, ids[i]);
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

