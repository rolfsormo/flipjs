/*! Flip.js | (c) 2013 Rolf Sormo | https://github.com/rolfsormo/flipjs */

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
  function Match(query, ob) {
    var debug = false;

    if (debug) {
      console.log();
      console.log('== Matching');
      console.log(typeof query, query);
      console.log('................');
      console.log(typeof ob, ob);
    }

    outer:
    for(var k in query) {
      var i;

      if (query[k].$ne !== undefined) {
        if (debug) console.log('$ne branch');
        if (ob[k] != query[k].$ne) continue;

      } else if (query[k].$gt !== undefined) {
        if (debug) console.log('$gt branch');
        if (ob[k] > query[k].$gt) continue;

      } else if (query[k].$gte !== undefined) {
        if (debug) console.log('$gte branch');
        if (ob[k] >= query[k].$gte) continue;

      } else if (query[k].$lt !== undefined) {
        if (debug) console.log('$lt branch');
        if (ob[k] < query[k].$lt) continue;

      } else if (query[k].$lte !== undefined) {
        if (debug) console.log('$lte branch');
        if (ob[k] <= query[k].$lte) continue;

      } else if (query[k].$in !== undefined && query[k].$in.length) {
        if (debug) console.log('$in branch');
        if (ob[k] && ob[k].length) {
          for(i = 0; i < ob[k].length; i++) if (query[k].$in.indexOf(ob[k][i]) !== -1) continue outer;
        } else {
          if (query[k].$in.indexOf(ob[k]) !== -1) continue;
        }

      } else if (query[k].$nin !== undefined && query[k].$nin.length) {
        if (debug) console.log('$nin branch');

        // Match a field that does not exist.
        if (!ob[k]) continue;

        // match: the field value is not in the specified array or
        if (ob[k].length) {
          var found = false;
          for(i = 0; i < ob[k].length; i++) if (query[k].$nin.indexOf(ob[k][i]) !== -1) found = true;
          if (!found) continue;
        } else {
          if (query[k].$nin.indexOf(ob[k]) === -1) continue;
        }

      } else {
        if (debug) console.log('equality branch');
        if (ob[k] == query[k]) continue;
      }
      if (debug) console.log('No match!');
      // No match.
      return false;
    }
      if (debug) console.log('Match!');
    // All conditions went through.
    return true;
  }

  MongoMatcher.prototype.matchObject = function(ob) {
    return Match(this.query, ob);
  };

  return MongoMatcher;
}));
