# Flip.js

Flip.js is a library that offers a mongo-style database layer on top of many different kinds of
database providers. It works in the browser with all the recent (and not so recent) db providers,
but it also works within Node and can wrap for example MySQL and other databases.

The idea is to be able to use the same database language
([Mongodb query documents](http://docs.mongodb.org/manual/tutorial/query-documents/)) on client and
server side. And even in some cases to make it possible to program in a familiar paradigm on a
less familiar (SQL) database.

It is obvious that this can never be as good as hand coding all the database access on each provider
and layer, but that should be the optimization step taken when the product being developed already has
stabilized. Until then, use the familiar queries.

## Usage

Install with:

1. bower (TODO)
1. npm (TODO)
1. Or just download the .js file and include in your project

Supported ways of dependency resolution:

1. AMD
1. Node's require
1. Globals

## Example

    var db = Flip.DB('Test', {});
    db.insert({username: 'John'}, function(err, ob) {
        if (err) return alert('Error! ' + err);

        db.find({}, function(err, obs) {
            if (err) return alert('Error! ' + err);
            alert('username = ' + obs[0].username);
        });
    });

## Options

If you want, you can give separate options for each adapter. In that case the format is:

    {
      common: {
        option1: value1,
        ...
      },
      Adapter1: {
        option2: value2,
        ...
      }
    }

Options for a specific adapter are done by merging common options with adapter specific options.
Common options are overrided by adapter specific options.

Otherwise you should just give all the options directly at the top of the options object. This is useful
when you are only defining options that are common to all adapters, or options that do not conflict. It is
done like this:

    {
        option1: value1,
        ...
    }

### Common options

#### maxSize

Specify the maximum database size (if supported by the adapter).

### LocalStorage

No options.

### MemStorage

MemStorage is a very fast but not persistent storage option. It will be available in all environments.

#### requirePersistency

If this option is set to `true` then MemStorage will not be detected.

## Supported Platforms

Flip.js is supported in different browsers and operating systems, and in [Node.js](http://nodejs.org/). See [this wiki page](https://github.com/rolfsormo/flipjs/wiki/Supported-Platforms) for a list of supported adapters for different platforms.

- - -

## Where we are now

See [Mongodb query documents](http://docs.mongodb.org/manual/tutorial/query-documents/) for details.

### Done

* Specify Equality Condition
* Specify Conditions Using Query Operators
  * $gt
  * $gte
  * $in
  * $lt
  * $lte
  * $ne
  * $nin
  * $or
  * $and
  * $not

### To do

* Specify Conditions Using Query Operators
  * $nor
  * $exists
  * $type
  * $mod
  * $regex
  * $where
  * $geoWithin
  * $geoIntersects
  * $near
  * $nearSphere
  * $all
  * $elemMatch
  * $size
  * $
  * $slice
* Subdocuments
  * Exact Match on Subdocument
  * Equality Match on Fields within Subdocument
* Arrays
  * Exact Match on an Array
  * Match an Array Element
  * Match a Specific Element of an Array
  * Array of Subdocuments
    * Match a Field in the Subdocument Using the Array Index
    * Match a Field Without Specifying Array Index
    * Match Multiple Fields

- - -

## How to get there

The project is not there yet. A few steps have to be taken for this project to be mature. The steps are:

1. Naïve (just make it work any way we can, in a handful of environments)
1. Optimize (for example, use the SQL databases' indexes to our benefit)
1. Expand within (implement the list above)
1. Expand without (like build a [meteor.com](http://meteor.com) like invisible client-server layer with live synch etc.)


## TODO

- Make a wiki page with a table with all known browsers and show the default adapter for them (first one detected) and for each adapter if it is supported
- Support ensureIndex() (when supported; depends on the adapter most likely)
- Support SQL databases naïvely by storing keys and values there first, but later generate alter tables with all new ensureIndex() calls
- Make browser tests, run them with some headless unit test framework
- Push to NPM and bower

# Running tests

  1. Install qunit `npm install -g qunit`
  1. Run `grunt test`

# Building and publishing

  1. Build `grunt build`
  1. Publish `npm publish`

# License

The MIT License (MIT)

Copyright (c) 2013 Rolf Sormo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
