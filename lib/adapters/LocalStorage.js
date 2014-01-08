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


