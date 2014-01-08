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


