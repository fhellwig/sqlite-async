# sqlite-async

ES6 Promise-based interface to the sqlite3 module.

The `sqlite-async` module exports the `Database` class. Each method works the same as the original [`sqlite3 API`](https://github.com/mapbox/node-sqlite3/wiki/API). Instead of callbacks, each method returns a promise. The `prepare` method returns a `Statement` instance that also wraps all of the original statement methods into methods that return a promise.

## Usage

```javascript
import { Database } from 'sqlite-async':

Database.open('test.db')
    .then(db => {
        ...
    })
    .catch(err => {
        ...
    }):
```

The `test/sqlite-async-test.js` file provides examples.

## API

### Database.SQLITE3_VERSION

Static getter that returns the version number of the `node-sqlite3` package currently being used by this module.

### Database.open(filename, mode)

Static method that instantiates a new `Database` object and calls `Database#open(filename, mode)`. Returns a promise that is resolved with the Database instance.

### Database#open(filename, mode)

Opens the database with the same arguments as the sqlite3 `Database` constructor. Returns a promise that is resolved with the Database instance.

### Database#close([fn])

Closes the database and returns a promise. If the optional provider function (`fn`) is specified, it is called as `fn(db)` before the database is closed. **This function must return a promise.** The database is closed regardless of whether the promise returned by the optional provider function is resolved or rejected. If the returned promise is rejected, then the close method itself will return a rejected promise with the error from the promise returned by the provider function.

### Database#run(sql, [param, ...])

Equivalent to the sqlite3 `Database#run` method. Returns a promise that is resolved with the `this` parameter from the sqlite3 callback function.

### Database#get(sql, [param, ...])

Equivalent to the sqlite3 `Database#get` method. Returns a promise that is resolved with the row.

### Database#all(sql, [param, ...])

Equivalent to the sqlite3 `Database#all` method. Returns a promise that is resolved with the rows.

### Database#each(sql, [param, ...], callback)

Equivalent to the sqlite3 `Database#each` method. The per-row callback function is requied. Returns a promise that is resolved with the Database instance.

### Database#exec(sql)

Equivalent to the sqlite3 `Database#exec` method. Returns a promise that is resolved with the Database instance.

### Database#transaction(fn)

The `transaction` method allows a function returning a promise to be wrapped in a transaction. The function is passed the `Database` instance as its parameter. Returns a promise that is resolved with the function's promise value.

```javascript
db.transaction((db) => {
  return Promise.all([db.run('INSERT INTO test VALUES (2, "two")'), db.run('INSERT INTO test VALUES (2, "three")')]);
});
```

### Database#prepare(sql, [param, ...])

Equivalent to the sqlite3 `Database#prepare` method. Returns a promise that is resolved with the Statement instance.

### Statement#bind([param, ...])

Equivalent to the sqlite3 `Statement#bind` method. Returns a promise that is resolved with the Statement instance.

### Statement#reset()

Equivalent to the sqlite3 `Statement#reset` method. Returns a promise that is resolved with the Statement instance.

### Statement#finalize()

Equivalent to the sqlite3 `Statement#finalize` method. Returns a promise that is resolved with no value because the statement can no longer be used.

### Statement#run([param, ...])

Equivalent to the sqlite3 `Statement#run` method. Returns a promise that is resolved with the `this` parameter from the sqlite3 callback function.

### Statement#get([param, ...])

Equivalent to the sqlite3 `Statement#get` method. Returns a promise that is resolved with the row.

### Statement#all([param, ...])

Equivalent to the sqlite3 `Statement#all` method. Returns a promise that is resolved with the rows.

### Statement#each([param, ...], callback)

Equivalent to the sqlite3 `Statement#each` method. The per-row callback function is requied. Returns a promise that is resolved with the Statement instance.

## License

MIT License

Copyright (c) 2025 Frank Hellwig

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
