  (function (root, factory) {
  var moduleName = 'keyvalueadapter';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(moduleName, ['flip'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory(require('./flip'));
  } else {
    // Browser globals (root is window)
    root[moduleName] = factory(root.flip);
  }
}(this, function (Flip) {

  console.log('KeyValueAdapter');
  function KeyValueAdapter(adapter) {
    this.adapter = adapter;
  }

  KeyValueAdapter.prototype.detect = function(options) {
    return this.adapter.detect(options);
  }
  KeyValueAdapter.prototype.connect = function(name) {
    console.log('connect', name);
    return this.Connection(this.adapter, name);
  }

  KeyValueAdapter.prototype.Connection = function(adapter, name) {
    this.adapter = adapter;
    this.name = name;

    this.find = function(rule, next) {
      if (next) next([]);
    }

    this.insert = function(ob, next) {
      ob._id = ob._id || Flip.generateId();
      this.adapter.set(name + '_' + ob._id, JSON.stringify(ob));
      if (next) next(ob);
    }
    this.update = function(ob, next) {
      this.adapter.set(name + '_' + ob._id, JSON.stringify(ob));
      if (next) next(ob);
    }
    this.remove = function(ob, next) {
      this.adapter.remove(name + '_' + id);
      if (next) next();
    }
  }
  return KeyValueAdapter;
}));

