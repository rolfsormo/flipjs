/*! Flip.js | (c) 2013 Rolf Sormo | https://github.com/rolfsormo/flipjs */

(function (root, factory) {
  var moduleName = 'SchemaUtil';
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

  function SchemaUtil() {
  }

  SchemaUtil.prototype.enforceSchema = function enforceSchema(ob, schema) {
    var key;

    if (!schema) return;

    // Clear extra fields.
    for(key in ob) {
      if (!schema[key]) delete ob[key];
    }
    // Format values correctly, set defaults, etc.
    for(key in schema) {
      if (!schema[key].type) {
        schema[key] = { type: schema[key] };
      }
      if (!ob[key]) {
        if (schema[key].default) {
          if (typeof schema[key].default === 'function') ob[key] = schema[key].default();
          else ob[key] = schema[key].default;
        } else {
          continue;
        }
      }

      switch(schema[key].type) {
        case Object:
          if (typeof ob[key] !== 'object') delete ob[key];
          break;
        case Object:
          break;
        case Date:
          ob[key] = new Date(ob[key]);
          break;
        default:
          if (typeof schema[key].type === 'function') {
            ob[key] = schema[key].type(ob[key]);
          }
          break;
      }
    }
  };



  return new SchemaUtil();
}));
