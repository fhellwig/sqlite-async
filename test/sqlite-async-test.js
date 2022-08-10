import assert from 'assert';
import { unlink } from 'fs';
import { Database } from '../sqlite-async.js';

let db;
let statement;

describe('Module', function () {
  describe('Database', function () {
    describe('SQLITE3_VERSION', function () {
      it('should log the version number', function () {
        return console.log(
          '        sqlite3 version: ' + Database.SQLITE3_VERSION
        );
      });
    });
    describe('open', function () {
      it('should open the database', function () {
        return Database.open('test.db').then((_db) => {
          db = _db;
        });
      });
    });
    describe('exec', function () {
      it('should create a table', function () {
        return db.exec(
          `CREATE TABLE test (
                         id INT PRIMARY KEY,
                         name TEXT NOT NULL
                     )`
        );
      });
    });
    describe('run (insert)', function () {
      it('should insert a row', function () {
        return db.run('INSERT INTO test VALUES (1, "inserted")');
      });
    });
    describe('run (update)', function () {
      it('should update a value', function () {
        return db
          .run('UPDATE test SET name = "test" WHERE id = 1')
          .then((result) => {
            assert.strictEqual(
              result.changes,
              1,
              'Expected one change in the database'
            );
          });
      });
    });
    describe('run (delete)', function () {
      it('should delete a row', function () {
        return db.run('INSERT INTO test VALUES (2, "test")').then((_) => {
          return db.run('DELETE FROM test WHERE id = 2').then((result) => {
            assert.strictEqual(
              result.changes,
              1,
              'Expected one change in the database'
            );
          });
        });
      });
    });
    describe('get', function () {
      it('should select one row', function () {
        return db.get('SELECT * FROM test').then((row) => {
          assert.deepStrictEqual(row, {
            id: 1,
            name: 'test'
          });
        });
      });
    });
    describe('all', function () {
      it('should select all rows', function () {
        return db.all('SELECT * FROM test').then((rows) => {
          assert.deepStrictEqual(rows, [
            {
              id: 1,
              name: 'test'
            }
          ]);
        });
      });
    });
    describe('each', function () {
      it('should select rows and pass each to a callback', function () {
        return db.each('SELECT * FROM  test WHERE id = 1', (err, row) => {
          assert.deepStrictEqual(row, {
            id: 1,
            name: 'test'
          });
        });
      });
    });

    describe('transaction (success)', function () {
      it('should execute and rollback a failed transaction', function () {
        return db
          .transaction((db) => {
            return Promise.all([
              db.run('INSERT INTO test VALUES (2, "two")'),
              db.run('INSERT INTO test VALUES (3, NULL)')
            ]);
          })
          .then(
            (_) => {
              throw new Error('The transaction should not have succeeded.');
            },
            (err) => {
              assert.strictEqual(err.code, 'SQLITE_CONSTRAINT');
            }
          );
      });
      it('should leave the database unchanged', function () {
        return db.all('SELECT * FROM test').then((rows) => {
          assert.strictEqual(
            rows.length,
            1,
            'Expected only one row in the database.'
          );
        });
      });
    });
    describe('transaction (success)', function () {
      it('should execute and commit a successful transaction', function () {
        return db.transaction((db) => {
          return Promise.all([
            db.run('INSERT INTO test VALUES (2, "two")'),
            db.run('INSERT INTO test VALUES (3, "three")')
          ]);
        });
      });
      it('should have added two rows to the database', function () {
        return db.all('SELECT * FROM test').then((rows) => {
          assert.strictEqual(
            rows.length,
            3,
            'Expected three rows in the database.'
          );
        });
      });
    });
    describe('prepare', function () {
      it('should prepare a statement', function () {
        return db
          .prepare('SELECT * FROM test WHERE id = ?')
          .then((_statement) => {
            statement = _statement;
          });
      });
    });
  });

  describe('Statement', function () {
    describe('bind', function () {
      it('should bind a value to the statement', function () {
        return statement.bind(1);
      });
    });
    describe('get', function () {
      it('should select one row', function () {
        return statement.get().then((row) => {
          assert.deepStrictEqual(row, {
            id: 1,
            name: 'test'
          });
        });
      });
    });
    describe('all', function () {
      it('should select all rows', function () {
        return statement.all().then((rows) => {
          assert.deepStrictEqual(rows, [
            {
              id: 1,
              name: 'test'
            }
          ]);
        });
      });
    });
    describe('each', function () {
      it('should select rows and pass each to a callback', function () {
        return statement.each((err, row) => {
          assert.deepStrictEqual(row, {
            id: 1,
            name: 'test'
          });
        });
      });
    });
    describe('run', function () {
      it('should delete all rows from the database', function () {
        return db.prepare('DELETE FROM test').then((statement) => {
          return statement.run().then((result) => {
            assert.strictEqual(
              result.changes,
              3,
              'Expected three changes in the database'
            );
            return statement.finalize();
          });
        });
      });
    });
    describe('finalize', function () {
      it('should finalize the statement', function () {
        return statement.finalize();
      });
    });
  });

  describe('Database', function () {
    describe('close', function () {
      it('should close database', function () {
        return db.close();
      });
    });
    describe('open', function () {
      it('should open the database again', function () {
        return Database.open('test.db').then((_db) => {
          db = _db;
        });
      });
    });
    describe('close', function () {
      it('should close database after executing the promise', function () {
        return db
          .close((arg) => {
            assert(arg === db);
            return Promise.resolve('success');
          })
          .then((result) => {
            assert.strictEqual(result, 'success');
          });
      });
      it('should no longer be able to use the database', function () {
        assert(db.db === null);
      });
    });
  });

  after(function (done) {
    unlink('test.db', done);
  });
});
