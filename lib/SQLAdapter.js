/*! Flip.js | (c) 2013 Rolf Sormo | https://github.com/rolfsormo/flipjs */

(function (root, factory) {
  var moduleName = 'SQLAdapter';
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
  var debug = true;

  return function(adapter) {

    function SQLAdapter(options) {
      this.options = options;
    }

    // "Statics"
    SQLAdapter.adapterName = adapter.adapterName;

    SQLAdapter.detect = function(options) {
      return adapter.detect(options);
    };

    SQLAdapter.toString = function()  {
      return "SQLAdapter#" + adapter.adapterName;
    };

    // "Non-statics"
    SQLAdapter.prototype.connect = function(dbName, next) {
      var self = this;
      this.dbName = dbName;
      adapter.init(function() {
        next(undefined, self);
      });
    };

    SQLAdapter.prototype.collection = function(collection, options) {

      function SQLCollection(options, adapter) {
        this.options = options;
        this.adapter = adapter;
      }

      SQLCollection.prototype.find = function(criteria, next) {
      };

      SQLCollection.prototype.insert = function(ob, next) {
      };

      SQLCollection.prototype.update = function(ob, next) {
      };

      SQLCollection.prototype.remove = function(criteria, next) {
      };

      SQLCollection.prototype.drop = function(next) {
      };

      this[collection] = new SQLCollection(this.options, this);
      return this[collection];
    };

    SQLAdapter.prototype.dropDatabase = function(next) {
    };
    SQLAdapter.prototype.toString = function()  {
      return "SQLAdapter#" + adapter.adapterName + '/' + this.dbName;
    };

    return SQLAdapter;
  };

}));

