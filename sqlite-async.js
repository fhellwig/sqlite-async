/**
 * This module provides a promise interface to the sqlite3 database module.
 */

const sqlite = require('sqlite3')

//-----------------------------------------------------------------------------
// The Database class
//-----------------------------------------------------------------------------

class Database {

    constructor(db) {
        if (!(db instanceof sqlite.Database)) {
            throw new TypeError(`Database: 'db' is not a database instance`)
        }
        this.db = db
    }

    static get OPEN_READONLY() { return sqlite.OPEN_READONLY }
    static get OPEN_READWRITE() { return sqlite.OPEN_READWRITE }
    static get OPEN_CREATE() { return sqlite.OPEN_CREATE }

    static open(filename, mode) {
        mode = mode || (Database.OPEN_READWRITE | Database.OPEN_CREATE)
        return new Promise((resolve, reject) => {
            let db = new sqlite.Database(filename, mode, err => {
                if (err) {
                    reject(err)
                } else {
                    resolve(new Database(db))
                }
            })
        })
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close(err => {
                if (err) {
                    reject(err)
                } else {
                    resolve() // can't use it anymore
                }
            })
        })
    }

    run(...args) {
        return new Promise((resolve, reject) => {
            // Need a real function because 'this' is used.
            let callback = function (err) {
                if (err) {
                    reject(err)
                } else {
                    if (this.lastID) {
                        resolve(this.lastID)
                    } else if (this.changes) {
                        resolve(this.changes)
                    } else {
                        resolve()
                    }
                }
            }
            args.push(callback)
            this.db.run.apply(this.db, args)
        })
    }

    get(...args) {
        return new Promise((resolve, reject) => {
            let callback = (err, row) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(row)
                }
            }
            args.push(callback)
            this.db.get.apply(this.db, args)
        })
    }

    all(...args) {
        return new Promise((resolve, reject) => {
            let callback = (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
            }
            args.push(callback)
            this.db.all.apply(this.db, args)
        })
    }

    each(...args) {
        if (args.length === 0 || typeof args[args.length - 1] !== 'function') {
            throw TypeError('Database.each: last arg is not a function')
        }
        return new Promise((resolve, reject) => {
            let callback = (err, nrows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(nrows)
                }
            }
            args.push(callback)
            this.db.each.apply(this.db, args)
        })
    }

    exec(sql) {
        return new Promise((resolve, reject) => {
            this.db.exec(sql, err => {
                if (err) {
                    reject(err)
                } else {
                    resolve(this)
                }
            })
        })
    }

    prepare(...args) {
        return new Promise((resolve, reject) => {
            let statement
            let callback = err => {
                if (err) {
                    reject(err)
                } else {
                    resolve(new Statement(statement))
                }
            }
            args.push(callback)
            statement = this.db.prepare.apply(this.db, args)
        })
    }
}

//-----------------------------------------------------------------------------
// The Statement class
//-----------------------------------------------------------------------------

class Statement {

    constructor(statement) {
        if (!(statement instanceof sqlite.Statement)) {
            throw new TypeError(`Statement: 'statement' is not a statement instance`)
        }
        this.statement = statement
    }

    bind(...args) {
        return new Promise((resolve, reject) => {
            let callback = err => {
                if (err) {
                    reject(err)
                } else {
                    resolve(this)
                }
            }
            args.push(callback)
            this.statement.bind.apply(this.statement, args)
        })
    }

    reset() {
        return new Promise((resolve, reject) => {
            this.statement.reset(err => {
                if (err) {
                    reject(err)
                } else {
                    resolve(this)
                }
            })
        })
    }

    finalize() {
        return new Promise((resolve, reject) => {
            this.statement.finalize(err => {
                if (err) {
                    reject(err)
                } else {
                    resolve() // can't use it anymore
                }
            })
        })
    }

    run(...args) {
        return new Promise((resolve, reject) => {
            // Need a real function because 'this' is used.
            let callback = function (err) {
                if (err) {
                    reject(err)
                } else {
                    if (this.lastID) {
                        resolve(this.lastID)
                    } else if (this.changes) {
                        resolve(this.changes)
                    } else {
                        resolve()
                    }
                }
            }
            args.push(callback)
            this.statement.run.apply(this.statement, args)
        })
    }

    get(...args) {
        return new Promise((resolve, reject) => {
            let callback = (err, row) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(row)
                }
            }
            args.push(callback)
            this.statement.get.apply(this.statement, args)
        })
    }

    all(...args) {
        return new Promise((resolve, reject) => {
            let callback = (err, rows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(rows)
                }
            }
            args.push(callback)
            this.statement.all.apply(this.statement, args)
        })
    }

    each(...args) {
        if (args.length === 0 || typeof args[args.length - 1] !== 'function') {
            throw TypeError('Statement.each: last arg is not a function')
        }
        return new Promise((resolve, reject) => {
            let callback = (err, nrows) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(nrows)
                }
            }
            args.push(callback)
            this.statement.each.apply(this.statement, args)
        })
    }
}

//-----------------------------------------------------------------------------
// Module Exports
//-----------------------------------------------------------------------------

module.exports = Database