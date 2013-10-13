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

  Flip.addAdapter(KeyValueAdapter({
    adapterName: 'LocalStorage',
    detect: function(options) {
      try {
        return 'localStorage' in window && window.localStorage !== null;
      } catch (e) {
        return false;
      }
    },
    get: function(db, key) {
      var o = window.localStorage.getItem(db + '_' + key);
      console.log('GET', db, key, typeof o, o);
      return o;
    },
    set: function(db, key, value) {
      console.log('SET', db, key, value);
      window.localStorage.setItem(db + '_' + key, value);
    },
    remove: function(db, key) {
      window.localStorage.removeItem(db + '_' + key);
    },
    keys: function(db) {
      var k = [];
      for(var i = 0; i < localStorage.length; i++) {
        var r = localStorage.key(i).split('_');
        console.log('r', r);
        if (r[0] === db) k.push(r[1]);
      }
      console.log('Keys', k);
      return k;
    }
  }));
}));


