(function (root, factory) {
  console.log('memStorage');
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    require(['flip', 'keyvalueadapter'], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    factory(require('../flip'), require('../keyvalueadapter'));
  } else {
    // Browser globals (root is window)
     factory(root.Flip, root.KeyValueAdapter);
  }
}(this, function (Flip, KeyValueAdapter) {

  console.log('Memadapter initializing...', Flip, KeyValueAdapter);

  var ob = {};
  Flip.addAdapter(new KeyValueAdapter({
    detect: function(options) {
      return true;
    },
    get: function(key, value) {
      return ob[key];
    },
    set: function(key, value) {
      ob[key] = value;
    },
    remove: function(key) {
      delete ob[key];
    }
  }));
  console.log('Done Memadapter');
}));


