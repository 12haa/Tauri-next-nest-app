import { Module } from '@nestjs/common';
import { DrizzleBetterSQLiteModule } from '@knaadh/nestjs-drizzle-better-sqlite3';
import { join } from 'path';


@Module({
  imports: [
    DrizzleBetterSQLiteModule.register({
          sqlite3: {
            filename: join(process.cwd(), 'src', 'db', 'sqlite.db'),
          },
    } as const),
  ],
  exports: [DrizzleBetterSQLiteModule],
})
export class DatabaseModule {}
