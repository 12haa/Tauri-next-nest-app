import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './index';
import * as path from 'path';
import * as fs from 'fs';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

export const databaseProviders = [
  {
    provide: DATABASE_CONNECTION,
    useFactory: async () => {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const dbPath = path.join(dataDir, 'app.db');

      const client = createClient({
        url: `file:${dbPath}`,
      });

      // Enable foreign keys
      await client.execute('PRAGMA foreign_keys = ON;');

      const db = drizzle(client, { schema });

      console.log('✅ Database connected successfully');
      return db;
    },
  },
];
