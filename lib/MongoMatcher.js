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
  function MatchObject(query, ob) {
    var debug = false;

    if (debug) {
      console.log();
      console.log('== Matching');
      console.log(typeof query, query);
      console.log('................');
      console.log(typeof ob, ob);
    }

    outer:
    for(var key in query) {
      var i;
      var expr = query[key];

      if (key === '$or') {
        if (debug) console.log('$or branch');

        for(i = 0; i < expr.length; i++) if (MatchObject(expr[i], ob)) continue outer;
        return false;
      } else if (key === '$and') {
        if (debug) console.log('$and branch');

        for(i = 0; i < expr.length; i++) if (!MatchObject(expr[i], ob)) return false;
        continue outer;
      }
      else if (!MatchExpression(expr, key, ob, debug)) return false;
    }
    if (debug) console.log('Match!');
    // All conditions went through.
    return true;
  }

  function MatchExpression(expr, key, ob, debug) {
    if (expr.$ne !== undefined) {
      if (debug) console.log('$ne branch');
      if (ob[key] != expr.$ne) return true;

    } else if (expr.$gt !== undefined) {
      if (debug) console.log('$gt branch');
      if (ob[key] > expr.$gt) return true;

    } else if (expr.$gte !== undefined) {
      if (debug) console.log('$gte branch');
      if (ob[key] >= expr.$gte) return true;

    } else if (expr.$lt !== undefined) {
      if (debug) console.log('$lt branch');
      if (ob[key] < expr.$lt) return true;

    } else if (expr.$lte !== undefined) {
      if (debug) console.log('$lte branch');
      if (ob[key] <= expr.$lte) return true;

    } else if (expr.$in !== undefined && expr.$in.length) {
      if (debug) console.log('$in branch');
      if (ob[key] && ob[key].length) {
        for(i = 0; i < ob[key].length; i++) if (expr.$in.indexOf(ob[key][i]) !== -1) return true;
      } else {
        if (expr.$in.indexOf(ob[key]) !== -1) return true;
      }

    } else if (expr.$nin !== undefined && expr.$nin.length) {
      if (debug) console.log('$nin branch');

      // Match a field that does not exist.
      if (!ob[key]) return true;

      // match: the field value is not in the specified array or
      if (ob[key].length) {
        var found = false;
        for(i = 0; i < ob[key].length; i++) if (expr.$nin.indexOf(ob[key][i]) !== -1) found = true;
        if (!found) return true;
      } else {
        if (expr.$nin.indexOf(ob[key]) === -1) return true;
      }

    } else if (expr.$not !== undefined) {
      if (debug) console.log('$not branch');

      return !MatchExpression(expr.$not, key, ob, debug);
    } else {
      if (debug) console.log('equality branch');
      if (ob[key] == expr) return true;
    }
    if (debug) console.log('No match!');
    // No match.
    return false;
  }

  MongoMatcher.prototype.matchObject = function(ob) {
    return MatchObject(this.query, ob);
  };

  return MongoMatcher;
}));
