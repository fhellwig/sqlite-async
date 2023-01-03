/**
 * This module provides a promise interface to the sqlite3 database module.
 */
import * as sqlite from 'sqlite3';
export type OpenMode = typeof sqlite.OPEN_READONLY | typeof sqlite.OPEN_READWRITE | typeof sqlite.OPEN_CREATE;
export interface RunResult {
    lastID: number;
    changes: number;
}
export declare class Database {
    db?: sqlite.Database | null;
    filename?: string;
    static get OPEN_READONLY(): number;
    static get OPEN_READWRITE(): number;
    static get OPEN_CREATE(): number;
    static get SQLITE3_VERSION(): string;
    static open(filename: string, mode?: OpenMode): Promise<Database>;
    open(filename: string, mode?: OpenMode): Promise<Database>;
    on(evt: string, cb: (...args: unknown[]) => void): sqlite.Database;
    close<Result>(fn?: (db: this) => Promise<Result>): Promise<Result | this>;
    run(...args: unknown[]): Promise<RunResult>;
    get<T = void>(...args: unknown[]): Promise<T>;
    all<T = void>(...args: unknown[]): Promise<T[]>;
    each(...args: unknown[]): Promise<number>;
    exec(sql: string): Promise<this>;
    transaction<T>(fn: (db: this) => T): Promise<T>;
    prepare(...args: unknown[]): Promise<Statement>;
}
export declare class Statement {
    statement: sqlite.Statement;
    constructor(statement: sqlite.Statement);
    bind(...args: unknown[]): Promise<unknown>;
    reset(): Promise<unknown>;
    finalize(): Promise<void>;
    run(...args: unknown[]): Promise<RunResult>;
    get(...args: unknown[]): Promise<unknown>;
    all(...args: unknown[]): Promise<unknown[]>;
    each(...args: unknown[]): Promise<number>;
}
//# sourceMappingURL=sqlite-async.d.ts.map