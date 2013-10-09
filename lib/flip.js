
(function (root, factory) {
  var moduleName = 'Flip';
  console.log('Module', moduleName);
  if (typeof define === 'function' && define.amd) {
    console.log('AMD');
    // AMD. Register as an anonymous module.
    define(moduleName, factory);
  } else if (typeof exports === 'object') {
    console.log('Node');
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    console.log('Browser globals');
    // Browser globals (root is window)
    root[moduleName] = factory();
  }
}(this, function () {

  console.log('defining Flip');
  function Flip() {
    this.adapters = [];
  }

  Flip.prototype.addAdapter = function(adapter) {
    this.adapters.push(adapter);
    console.log('adapters', this.adapters);
  }

  Flip.prototype.getAdapter = function(options) {
    for(var i = 0; i < this.adapters.length; i++) {
      if (this.adapters[i].detect(options)) return this.adapters[i];
    }
  }

  Flip.prototype.DB = function(url, options) {
    var adapter = this.getAdapter(options);
    if (!adapter) throw new Error('No suitable adapter found');

    return adapter.connect(url, options);
  }

  Flip.prototype.generateId = function() {
    function format(i) {
      return i.toString(16).substring(1);
    }
    function r() {
      return Math.floor((1 + Math.random()) * 0x10000)
    }
    return format(new Date().getTime()) + format(r()) + format(r()) + format(r());
  }

  return new Flip();
}));

