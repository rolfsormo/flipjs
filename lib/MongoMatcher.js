
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
    var debug = false;

    if (debug) {
      console.log('Matching');
      console.log(typeof this.query, this.query);
      console.log('................');
      console.log(typeof ob, ob);
    }
    for(var k in this.query) {
      var i;

      if (this.query[k].$ne !== undefined) {
        if (debug) console.log('$ne branch');
        if (ob[k] != this.query[k].$ne) return true;

      } else if (this.query[k].$gt !== undefined) {
        if (debug) console.log('$gt branch');
        if (ob[k] > this.query[k].$gt) return true;

      } else if (this.query[k].$gte !== undefined) {
        if (debug) console.log('$gte branch');
        if (ob[k] >= this.query[k].$gte) return true;

      } else if (this.query[k].$lt !== undefined) {
        if (debug) console.log('$lt branch');
        if (ob[k] < this.query[k].$lt) return true;

      } else if (this.query[k].$lte !== undefined) {
        if (debug) console.log('$lte branch');
        if (ob[k] <= this.query[k].$lte) return true;

      } else if (this.query[k].$in !== undefined && this.query[k].$in.length) {
        if (debug) console.log('$in branch');
        if (ob[k].length) {
          for(i = 0; i < ob[k].length; i++) if (this.query[k].$in.indexOf(ob[k][i]) !== -1) return true;
        } else {
          if (this.query[k].$in.indexOf(ob[k]) !== -1) return true;
        }

      } else if (this.query[k].$nin !== undefined && this.query[k].$nin.length) {
        if (debug) console.log('$nin branch');

        // Match a field that does not exist.
        if (!ob[k]) return true;

        // match: the field value is not in the specified array or
        if (ob[k].length) {
          var found = false;
          for(i = 0; i < ob[k].length; i++) if (this.query[k].$nin.indexOf(ob[k][i]) !== -1) found = true;
          if (!found) return true;
        } else {
          if (this.query[k].$nin.indexOf(ob[k]) === -1) return true;
        }

      } else {
        if (debug) console.log('equality branch');
        if (ob[k] == this.query[k]) return true;
      }
    }
    if (debug) console.log('not match');
    return false;
  };

  return MongoMatcher;
}));
