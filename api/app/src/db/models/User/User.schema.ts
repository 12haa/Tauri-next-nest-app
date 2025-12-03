import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  age: integer('age'),
  phone: text('phone'),
  profilePicture: text('profile_picture'),
  bio: text('bio'),
  address: text('address'),
  role: text('role').default('user'),
  lastLoginAt: text('last_login_at'),
  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()),
});

// تعریف تایپ‌ها
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
