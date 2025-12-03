import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { migrate } from 'drizzle-orm/libsql/migrator';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, 'app.db');
  console.log('DB Path:', dbPath);

  const client = createClient({
    url: `file:${dbPath}`,
  });

  const db = drizzle(client);

  const migrationsFolder = path.join(process.cwd(), 'drizzle', 'migrations');
  console.log(`Running migrations from: ${migrationsFolder}`);

  try {
    await migrate(db, { migrationsFolder });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

main();
