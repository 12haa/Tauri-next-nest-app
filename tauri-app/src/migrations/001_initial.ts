import { Migration } from './types';

export const migration001: Migration = {
  id: 1,
  name: 'create_users_table',
  up: async (db) => {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  },
};
