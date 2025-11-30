import { DrizzleBetterSQLiteModule } from '@knaadh/nestjs-drizzle-better-sqlite3';
import { join } from 'path';

DrizzleBetterSQLiteModule.register({
  tag: 'DB_DEV',
  sqlite3: {
    filename: join(process.cwd(), 'src', 'db', 'sqlite.db'),
  },
  config: {},
});
