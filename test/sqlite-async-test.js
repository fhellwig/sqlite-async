const Database = require('../sqlite-async')
const fs = require('fs')

const FILENAME = 'test.db'

let db
let statement

function expect(val, exp) {
    val = JSON.stringify(val)
    if (val != exp) {
        throw new Error(`Got ${val} instead of ${exp}.`)
    }
    console.log('Pass:', val)
}

Database.open(FILENAME)
    .then(_db => {
        db = _db
        expect(db.filename, `"${FILENAME}"`)
    })
    .then(_ => {
        return db.exec('CREATE TABLE test (id INT, name TEXT)')
    })
    .then(_ => {
        return db.run('INSERT INTO test VALUES (1, "test")')
    })
    .then(_ => {
        return db.get('SELECT * FROM test')
    })
    .then(row => {
        expect(row, '{"id":1,"name":"test"}')
        return db.all('SELECT * FROM test')
    })
    .then(rows => {
        expect(rows, '[{"id":1,"name":"test"}]')
    })
    .then(_ => {
        return db.each('SELECT * FROM  test WHERE id = 1', (err, row) => {
            expect(row, '{"id":1,"name":"test"}')
        })
    })
    .then(_ => {
        return db.prepare('SELECT * FROM test WHERE id = ?')
    })
    .then(_statement => {
        statement = _statement
        return statement.bind(1)
    })
    .then(statement => {
        return statement.get()
    })
    .then(row => {
        expect(row, '{"id":1,"name":"test"}')
        return statement.all()
    })
    .then(rows => {
        expect(rows, '[{"id":1,"name":"test"}]')
    })
    .then(_ => {
        return statement.each((err, row) => {
            expect(row, '{"id":1,"name":"test"}')
        })
    })
    .then(_ => {
        return statement.finalize()
    })
    .then(_ => {
        return db.close()
    })
    .then(_ => {
        return new Promise((resolve, reject) => {
            fs.unlink(FILENAME, err => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    })
    .then(_ => {
        console.log('All tests pass.')
    })
    .catch(err => {
        console.error('Error', err.message)
    })
