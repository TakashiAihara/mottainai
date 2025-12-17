import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../src/db/schema';

let testDb: Database.Database | null = null;

export const setupTestDatabase = () => {
  if (testDb) {
    testDb.close();
  }

  testDb = new Database(':memory:');

  testDb.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY,
      jan_code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      quantity INTEGER NOT NULL DEFAULT 0,
      price INTEGER NOT NULL,
      category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
      image_url TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
  `);

  return drizzle(testDb, { schema });
};

export const closeTestDatabase = () => {
  if (testDb) {
    testDb.close();
    testDb = null;
  }
};
