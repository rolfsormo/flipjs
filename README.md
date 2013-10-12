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

### To do

* Specify Conditions Using Query Operators
  * $or
  * $and
  * $not
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
