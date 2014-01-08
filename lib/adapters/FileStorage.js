/*! Flip.js | (c) 2013 Rolf Sormo | https://github.com/rolfsormo/flipjs */

(function (root, factory) {
    console.log('loading...');
  if (typeof define === 'function' && define.amd) {
    // AMD.
    throw new Error('FileStorage works only in Node.js');
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    var YAML;
    try { YAML = require('libyaml'); } catch(e) { }
    var bson;
    try { bson = require('bson'); } catch(e) { }

    factory(require('../Flip'), require('../KeyValueAdapter'), YAML, bson, require('fs'));
  } else {
    // Browser
    throw new Error('FileStorage works only in Node.js');
  }
}(this, function (Flip, KeyValueAdapter, YAML, bson, fs) {
  var debug = false;

  Flip.addAdapter(KeyValueAdapter({
    adapterName: 'FileStorage',
    detect: function(options) {
      this.options = options;
      this.options.directory = this.options.directory || 'db';
      if (debug) console.log('Allow File Storage: ', options.allowFileStorage);
      return options.allowFileStorage;
    },
    init: function(next) {
      if (debug) console.log('Creating: ', this.options.directory);
      fs.mkdir(this.options.directory, function(e) {
        next();        
      });
    },
    keys: function(next) {
      if (debug) console.log('[ KEYS');

      fs.readdir(this.options.directory, function(err, files) {
        if (err) return next(err);

        if (debug) console.log('files', files);
        next(undefined, files);
      });
    },
    get: function(key, next) {
      if (debug) console.log('[ GET', key);
      key = key.replace('/', '_');
      fs.readFile(this.options.directory + '/' + key, function(err, file) {
        if (err) return next(err);

        next(undefined, file);
      });
    },
    set: function(key, value, next) {
      if (debug) console.log('[ SET', key, value);
      key = key.replace('/', '_');
      fs.writeFile(this.options.directory + '/' + key, value, function(err) {
        if (err) return next(err);

        next();
      });
    },
    remove: function(key, next) {
      if (debug) console.log('[ REMOVE', key);
      key = key.replace('/', '_');
      fs.unlink(this.options.directory + '/' + key, function(err) {
        if (err) return next(err);

        next();
      });
    }
  }));
}));


