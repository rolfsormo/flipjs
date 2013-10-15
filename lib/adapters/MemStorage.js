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


