import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// This will be initialized by Tauri
let db: ReturnType<typeof drizzle> | null = null;

export function initDatabase(dbPath: string) {
  const sqlite = new Database(dbPath);
  db = drizzle(sqlite, { schema });
  return db;
}

export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
}

export { schema };
export type { User, NewUser } from './schema';
