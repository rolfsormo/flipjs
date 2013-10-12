
(function (root, factory) {
  var moduleName = 'MongoMatcher';
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

  function MongoMatcher(query) {
    this.query = query;
  }

  MongoMatcher.prototype.match = function(obOrArray) {
    if (typeof obOrArray === 'array') return this.matchArray(obOrArray);
    else return this.matchObject(obOrArray);
  };
  MongoMatcher.prototype.matchArray = function(arr) {
    for(var i = 0; i < arr.length; i++) if (this.matchObject(arr[i])) return true;
    return false;
  };
  MongoMatcher.prototype.filter = function(obOrArray) {
    if (typeof obOrArray === 'array') return this.filterArray(obOrArray);
    else return this.filterObject(obOrArray);
  };
  MongoMatcher.prototype.filterObject = function(ob) {
    return this.matchObject(ob) ? ob : null;
  };
  MongoMatcher.prototype.filterArray = function(arr) {
    var res = [];
    for(var i = 0; i < arr.length; i++) {
      if (this.matchObject(arr[i])) res.push(arr[i]);
    }
    return res;
  };

  // Workhorsie for now.
  MongoMatcher.prototype.matchObject = function(ob) {
    // console.log('Matching');
    // console.log(typeof this.query, this.query);
    // console.log('................');
    // console.log(typeof ob, ob);
    for(var k in this.query) {
      if (this.query[k] == ob[k]) return true;
    }
    return false;
  };

  return MongoMatcher;
}));
