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
    return new Date().getTime().toString(16).substring(1) + this._generateKey(16, 6) + this._generateKey(16, 6);
  };

  Flip.prototype._generateKey = function(base, length) {
    base = base || 32;
    length = length || 3;
    return Math.floor(Math.pow(base,length-1) + Math.random() * (Math.pow(base,length) - Math.pow(base,length-1))).toString(base);
  };

  Flip.prototype._extend = function(target) {
    for(var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for(var key in source) {
        if (source.hasOwnProperty(key)) target[key] = source[key];
      }
    }
    return target;
  };

  return new Flip();
}));

