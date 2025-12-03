import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './index';
import * as path from 'path';
import * as fs from 'fs';

import { migrate } from 'drizzle-orm/libsql/migrator';

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

      // Run migrations
      const migrationsFolder = path.join(
        process.cwd(),
        'drizzle',
        'migrations',
      );
      console.log(`Running migrations from: ${migrationsFolder}`);

      try {
        await migrate(db, { migrationsFolder });
        console.log('✅ Migrations completed successfully');
      } catch (error) {
        console.error('❌ Migration failed:', error);
        // We might want to throw here to stop the app if migration fails,
        // but for now let's just log it to avoid crashing if it's a minor issue.
        // However, schema mismatch usually causes crashes later.
        throw error;
      }

      console.log('✅ Database connected successfully');
      return db;
    },
  },
];
