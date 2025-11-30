import { Global, Module } from '@nestjs/common';
import { databaseProviders, DATABASE_CONNECTION } from './database.provider';

@Global()
@Module({
  providers: [...databaseProviders],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
