# sqlite-async

ES6 Promise-based interface to the sqlite3 module.

The `sqlite-async` module exports the `Database` class. Each method works the same as the original [`sqlite3 API`](https://github.com/mapbox/node-sqlite3/wiki/API). Instead of callbacks, each method returns a promise. The `prepare` method returns a `Statement` instance that also wraps all of the original statement methods into methods that return a promise.

## Usage

```javascript
const Database = require('sqlite-async')

Database.open('test.db')
    .then(db => {
        ...
    })
    .catch(err => {
        ...
    })
```

The `test/sqlite-async-test.js` file provides examples.

## License

MIT License

Copyright (c) 2017 Frank Hellwig

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
