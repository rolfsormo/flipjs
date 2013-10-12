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

    function KeyValueAdapter(dbName) {
      this.dbName = dbName;
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
    KeyValueAdapter.prototype.find = function(rule, next) {
      var matcher = new MongoMatcher(rule);
      var ids = adapter.keys(this.dbName);
      var res = [];
      for(var i = 0; i < ids.length; i++) {
        var ob = JSON.parse(adapter.get(this.dbName, ids[i]));
        if (matcher.match(ob)) res.push(ob);
      }
      if (next) next(undefined, res);
    };
    KeyValueAdapter.prototype.insert = function(ob, next) {
      ob._id = ob._id || Flip.generateId();
      adapter.set(this.dbName, ob._id, JSON.stringify(ob));
      if (next) next(undefined, ob);
    };
    KeyValueAdapter.prototype.update = function(ob, next) {
      adapter.set(this.dbName, ob._id, JSON.stringify(ob));
      if (next) next(undefined, ob);
    };
    KeyValueAdapter.prototype.remove = function(ob, next) {
      adapter.remove(this.dbName, id);
      if (next) next();
    };
    KeyValueAdapter.prototype.dropDatabase = function(next) {
      adapter.drop(this.dbName);
      if (next) next();
    };
    KeyValueAdapter.prototype.toString = function()  {
      return "KeyValueAdapter::" + adapter.adapterName + '//' + this.dbName;
    };

    return KeyValueAdapter;
  };

}));

