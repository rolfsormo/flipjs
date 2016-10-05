# Flip.js

Flip.js is a database abstraction library that offers a mongo-style database layer on top of many different kinds of
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

- *maxSize*: Specify the maximum database size (if supported by the adapter).
- *keyBase*: The unique key generator number base (16 for hex); default 32.
- *keyLength*: The unique key generator key length in characters; default 3.
- *allowYAML*: If this is set to `false` the KeyValueAdapters will not store data in YAML format, even if the libyaml package would be available in Node.js.
- *allowBson*: If this is set to `false` the KeyValueAdapters will not store data in bson format, even if the bson package would be available in Node.js.
- *sep*: The character used to separate the db and collection name from the object id in KeyValueAdapters; default `#`.

### LocalStorage

No options.

### MemStorage

MemStorage is a very fast but **not persistent** (ie. not stored over restarts) storage option. It is available in all environments.

- *requirePersistency*: If this option is set to `true` then MemStorage will not be detected.

### FileStorage

FileStorage is a simple persistent storage option for Node.js. It stores all the objects in files. Depending on the availability of YAML and/or bson libraries affects on the file format (and in some extent, speed).

- *allowFileStorage*: If this option is set to `false` then FileStorage will not be detected.

## Supported Platforms

Flip.js is supported in different browsers and operating systems, and in [Node.js](http://nodejs.org/). See [this wiki page](https://github.com/rolfsormo/flipjs/wiki/Supported-Platforms) for a list of supported adapters for different platforms.

- - -

# Mongodb query documents

See [Mongodb query documents](http://docs.mongodb.org/manual/tutorial/query-documents/) for details.

## Done (for KeyValueAdapter)

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

## To do

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

# Schemas

See [Mongoose Schematypes](http://mongoosejs.com/docs/schematypes.html) for description of the schema types we support. Our support is more like "nice to have", in the sense that the db adaptors work without schemas, they just might not be (read: aren't) optimal. Especially with SQL adaptors we can create correct tables from schemas and use those, instead of storing JSON in the db.

## Done (for KeyValueAdapter)

* Common features
  * `default`
* String
* Number
* Date

## Todo

* String
  * `lowercase`
  * `trim`
* Number
  * `min`
  * `max`
* Date
* Buffer
* Boolean
* Mixed
* ObjectId
* Array



- - -

## How to get there

The project is not there yet. A few steps have to be taken for this project to be mature. The steps are:

1. Naïve (just make it work any way we can, in a handful of environments)
1. Optimize (for example, use the SQL databases' indexes to our benefit)
1. Expand within (implement the list above)
1. Expand without (like build a [meteor.com](http://meteor.com) like invisible client-server layer with live synch etc.)


## TODO

- ES6, probably ES2016+
- Maybe use lodash (or similar) to make the code cleaner
- http://json-schema.org instead of Mongoose schemas
- npm i -g flip-cli && flip export mysql://root:root@localhost/db1 --json > dbdump.json && flip import mongodb://root:root@localhost/db1 < dbdump.json (get the point?)
- Support providing mongoose-like schemas for better SQL db and index creation
- Make a wiki page with a table with all known browsers and show the default adapter for them (first one detected) and for each adapter if it is supported
- Support ensureIndex() (when supported; depends on the adapter most likely)
- Support SQL databases naïvely by storing keys and values there first, but later generate alter tables with all new ensureIndex() calls
- Make browser tests, run them with some headless unit test framework
- Push to NPM and bower
- flip-cli, that can at least "flip learn <db-url>" and output the options and shcemas to support that (keyvalue db's study the data, sql db's use describe or some such AND study the _extras-field)
- schemas: if sql db doesn't have a schema (or encounter a field that is not in the schema) the field will be saved into a generic _extras -field (json string) that cannot be queried directly, but with the MongoMatcher only after the data has been read to memory (=slow, up to the developer to create the correct schema eventually, possibly with "flip learn")
- add url and urls field to options for supporting multiple cassandra instances, but also possibly eventually replicating to several db's
- mongo support with native mongodb AND mongoose (can reuse the schemas directly IF the options are correct)
- add validateSchema-option that only throws exceptions if data is incorrect, not correct it

# Running tests

  1. Install qunit `npm install -g qunit`
  1. Run `grunt test`

  - To test YAML, do: `npm install libyaml`
  - To test bson, first remove libyaml, then do: `npm install bson`

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
