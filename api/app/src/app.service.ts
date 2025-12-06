import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_CONNECTION } from './db/database.provider';
import { sql } from 'drizzle-orm';

@Injectable()
export class AppService {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: any) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getTables() {
    try {
      const result = await this.db.all(
        sql`SELECT name FROM sqlite_master WHERE type='table' AND name != 'sqlite_sequence' AND name != 'libsql_wasm_func_table';`,
      );
      return result;
    } catch (error) {
      console.error('Error fetching tables:', error);
      return { error: error.message };
    }
  }
}
