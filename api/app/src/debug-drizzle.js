const {
  DrizzleBetterSQLiteModule,
} = require('@knaadh/nestjs-drizzle-better-sqlite3');

console.log('Keys:', Object.keys(DrizzleBetterSQLiteModule));
console.log('register:', DrizzleBetterSQLiteModule.register);
console.log('registerAsync:', DrizzleBetterSQLiteModule.registerAsync);
