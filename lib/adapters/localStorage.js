(function (root, factory) {
  console.log('localStorage');
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

  console.log('Adapter initializing...');

  Flip.addAdapter(KeyValueAdapter({
    adapterName: 'LocalStorage',
    detect: function(options) {
      try {
      return 'localStorage' in window && window['localStorage'] !== null;
      } catch (e) {
      return false;
      }
    },
    get: window.localStorage.getItem.bind(window.localStorage),
    set: window.localStorage.setItem.bind(window.localStorage),
    remove: window.localStorage.removeItem  
  }));
}));


