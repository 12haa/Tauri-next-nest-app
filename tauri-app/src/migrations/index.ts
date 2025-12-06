import { getDb } from '../lib/db';
import { Migration } from './types';
import { migration001 } from './001_initial';

// Registry of all migrations - MUST be ordered by ID
const MIGRATIONS: Migration[] = [migration001].sort((a, b) => a.id - b.id);

export async function runMigrations(): Promise<void> {
  const db = await getDb();

  // 1. Ensure migrations table exists
  await db.execute(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER NOT NULL,
      name TEXT NOT NULL,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Get current version
  const result = await db.select<{ version: number }[]>(`
    SELECT version FROM _migrations ORDER BY version DESC LIMIT 1
  `);

  const currentVersion = result.length > 0 ? result[0].version : 0;
  console.log(`Current DB version: ${currentVersion}`);

  // 3. Filter pending migrations
  const pendingMigrations = MIGRATIONS.filter((m) => m.id > currentVersion);

  if (pendingMigrations.length === 0) {
    console.log('Database is up to date.');
    return;
  }

  // 4. Apply migrations sequentially
  for (const migration of pendingMigrations) {
    console.log(`Applying migration ${migration.id}: ${migration.name}...`);
    try {
      await migration.up(db);

      // Record migration
      await db.execute('INSERT INTO _migrations (version, name) VALUES ($1, $2)', [
        migration.id,
        migration.name,
      ]);

      console.log(`Migration ${migration.id} applied successfully.`);
    } catch (error) {
      console.error(`Failed to apply migration ${migration.id}:`, error);
      throw error; // Stop migration process on error
    }
  }

  console.log('All migrations applied successfully.');
}
