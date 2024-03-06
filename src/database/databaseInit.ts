import { SQLiteDatabase } from "expo-sqlite/next"

export async function databaseInit(database: SQLiteDatabase) {
    await database.execAsync(`
        PRAGMA jounal_mode = 'wal';

        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            name TEXT NOT NULL,
            total REAL NOT NULL
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            goal_id INTEGER,
            amount REAL NOT NULL,
            created_at DEFAULT CURRENT_TIMESTAMP
        );
    `);
}

export async function databaseClear(database: SQLiteDatabase) {
    await database.execAsync(`
        PRAGMA jounal_mode = 'wal';

        DROP TABLE IF EXISTS transactions;
        DROP TABLE IF EXISTS goals;
    `);
}