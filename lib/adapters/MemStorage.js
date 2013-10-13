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

  var ob = {};
  Flip.addAdapter(KeyValueAdapter({
    adapterName: 'MemStorage',
    detect: function(options) {
      return !options.requirePersistency;
    },
    keys: function(db) {
      return (ob[db] && Object.keys(ob[db])) || [];
    },
    get: function(db, key, value) {
      return ob[db] && ob[db][key];
    },
    set: function(db, key, value) {
      ob[db] = ob[db] || {};
      ob[db][key] = value;
    },
    remove: function(db, key) {
      if (ob[db]) delete ob[db][key];
    },
    drop: function(db) {
      delete ob[db];
    }
  }));
}));


