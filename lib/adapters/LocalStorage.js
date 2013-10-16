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


