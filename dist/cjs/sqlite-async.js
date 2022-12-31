"use strict";
/**
 * This module provides a promise interface to the sqlite3 database module.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Statement = exports.Database = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
//-----------------------------------------------------------------------------
// The Database class
//-----------------------------------------------------------------------------
class Database {
    static get OPEN_READONLY() {
        return sqlite3_1.default.OPEN_READONLY;
    }
    static get OPEN_READWRITE() {
        return sqlite3_1.default.OPEN_READWRITE;
    }
    static get OPEN_CREATE() {
        return sqlite3_1.default.OPEN_CREATE;
    }
    static get SQLITE3_VERSION() {
        return '5.0.11';
    }
    static open(filename, mode) {
        let db = new Database();
        return db.open(filename, mode);
    }
    open(filename, mode) {
        if (typeof mode === 'undefined') {
            mode = Database.OPEN_READWRITE | Database.OPEN_CREATE;
        }
        else if (typeof mode !== 'number') {
            throw new TypeError('Database.open: mode is not a number');
        }
        return new Promise((resolve, reject) => {
            if (this.db) {
                return reject(new Error('Database.open: database is already open'));
            }
            let db = new sqlite3_1.default.Database(filename, mode, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    this.db = db;
                    this.filename = filename;
                    resolve(this);
                }
            });
        });
    }
    on(evt, cb) {
        return this.db.on(evt, cb);
    }
    close(fn) {
        if (!this.db) {
            return Promise.reject(new Error('Database.close: database is not open'));
        }
        if (fn) {
            return fn(this)
                .then((result) => {
                return this.close().then((_) => {
                    return result;
                });
            })
                .catch((err) => {
                return this.close().then((_) => {
                    return Promise.reject(err);
                });
            });
        }
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    this.db = null;
                    resolve(this);
                }
            });
        });
    }
    run(...args) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database.run: database is not open'));
            }
            // Need a real function because 'this' is used.
            const callback = function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        lastID: this.lastID,
                        changes: this.changes
                    });
                }
            };
            args.push(callback);
            this.db.run.apply(this.db, args);
        });
    }
    get(...args) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database.get: database is not open'));
            }
            const callback = (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            };
            args.push(callback);
            this.db.get.apply(this.db, args);
        });
    }
    all(...args) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database.all: database is not open'));
            }
            const callback = (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            };
            args.push(callback);
            this.db.all.apply(this.db, args);
        });
    }
    each(...args) {
        if (args.length === 0 || typeof args[args.length - 1] !== 'function') {
            throw TypeError('Database.each: last arg is not a function');
        }
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database.each: database is not open'));
            }
            const completeCallback = (err, nrows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(nrows);
                }
            };
            args.push(completeCallback);
            this.db.each.apply(this.db, args);
        });
    }
    exec(sql) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database.exec: database is not open'));
            }
            this.db.exec(sql, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this);
                }
            });
        });
    }
    transaction(fn) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.exec('BEGIN TRANSACTION');
            try {
                const result = yield fn(this);
                yield this.exec('END TRANSACTION');
                return result;
            }
            catch (e) {
                yield this.exec('ROLLBACK TRANSACTION');
                throw e;
            }
        });
    }
    prepare(...args) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database.prepare: database is not open'));
            }
            let statement;
            const callback = (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(new Statement(statement));
                }
            };
            args.push(callback);
            statement = this.db.prepare.apply(this.db, args);
        });
    }
}
exports.Database = Database;
//-----------------------------------------------------------------------------
// The Statement class
//-----------------------------------------------------------------------------
class Statement {
    constructor(statement) {
        if (!(statement instanceof sqlite3_1.default.Statement)) {
            throw new TypeError(`Statement: 'statement' is not a statement instance`);
        }
        this.statement = statement;
    }
    bind(...args) {
        return new Promise((resolve, reject) => {
            const callback = (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this);
                }
            };
            args.push(callback);
            this.statement.bind.apply(this.statement, args);
        });
    }
    reset() {
        return new Promise((resolve, reject) => {
            this.statement.reset((_) => {
                resolve(this);
            });
        });
    }
    finalize() {
        return new Promise((resolve, reject) => {
            this.statement.finalize((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(); // can't use it anymore
                }
            });
        });
    }
    run(...args) {
        return new Promise((resolve, reject) => {
            // Need a real function because 'this' is used.
            const callback = function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        lastID: this.lastID,
                        changes: this.changes
                    });
                }
            };
            args.push(callback);
            this.statement.run.apply(this.statement, args);
        });
    }
    get(...args) {
        return new Promise((resolve, reject) => {
            const callback = (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            };
            args.push(callback);
            this.statement.get.apply(this.statement, args);
        });
    }
    all(...args) {
        return new Promise((resolve, reject) => {
            const callback = (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            };
            args.push(callback);
            this.statement.all.apply(this.statement, args);
        });
    }
    each(...args) {
        if (args.length === 0 || typeof args[args.length - 1] !== 'function') {
            throw TypeError('Statement.each: last arg is not a function');
        }
        return new Promise((resolve, reject) => {
            const callback = (err, nrows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(nrows);
                }
            };
            args.push(callback);
            this.statement.each.apply(this.statement, args);
        });
    }
}
exports.Statement = Statement;
