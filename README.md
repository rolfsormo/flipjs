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


## How to get there

The project is not there yet. A few steps have to be taken for this project to be mature. The steps are:

1. Naïve (just make it work any way we can)
1. Optimize (for example, use the SQL databases' indexes to our benefit)
1. Profit
1. Expand (like build a [meteor.com](http://meteor.com) like invisible client-server layer with live synch etc.)
