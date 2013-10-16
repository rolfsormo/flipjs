/*! Flip.js | (c) 2013 Rolf Sormo | https://github.com/rolfsormo/flipjs */

(function (root, factory) {
  var moduleName = 'Flip';
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(moduleName, factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root[moduleName] = factory();
  }
}(this, function () {

  function Flip() {
    this.adapters = [];
  }
  Flip.toString = function() {
    return 'Flip';
  };

  Flip.prototype.addAdapter = function(adapter) {
    this.adapters.push(adapter);
  };

  Flip.prototype.getAdapter = function(options) {
    for(var i = 0; i < this.adapters.length; i++) {
      var o, k;
      var adapterName = this.adapters[i].adapterName;

      if (options.common) {
        o = {};
        for(k in Object.keys(options.common)) o[k] = options.common[k];
        if (options[adapterName]) {
          for(k in Object.keys(options[adapterName])) o[k] = options[adapterName][k];
        }
      } else {
        o = options;
      }
      if (this.adapters[i].detect(o)) return this.adapters[i];
    }
  };

  Flip.prototype.connect = function(url, options, next) {
    if (typeof options == 'function') {
      next = options;
      options = {};
    }
    var adapter = this.getAdapter(options);
    if (!adapter) throw new Error('No suitable adapter found');

    (new adapter(options)).connect(url, next);
  };

  Flip.prototype.generateId = function() {
    function format(i) {
      return i.toString(16).substring(1);
    }
    function r() {
      return Math.floor((1 + Math.random()) * 0x10000);
    }
    return format(new Date().getTime()) + format(r()) + format(r()) + format(r());
  };

  return new Flip();
}));

