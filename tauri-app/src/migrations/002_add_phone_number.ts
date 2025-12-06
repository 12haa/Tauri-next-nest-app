import { Migration } from './types';

export const migration002: Migration = {
  id: 2,
  name: 'add_phone_to_users',
  up: async (db) => {
    await db.execute(`
      ALTER TABLE users ADD COLUMN phone TEXT;
    `);
  },
};
