import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { LibSQLDatabase } from 'drizzle-orm/libsql';

import * as schema from '../db/index';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DATABASE_CONNECTION } from 'src/db/database.provider';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: LibSQLDatabase<typeof schema>,
  ) {}

  // ایجاد کاربر جدید
  async create(createUserDto: CreateUserDto) {
    const result = await this.db
      .insert(schema.users)
      .values({
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password, // در پروژه واقعی hash کنید
      })
      .returning();

    return result[0];
  }

  // دریافت همه کاربران
  async findAll() {
    return await this.db.select().from(schema.users);
  }

  // دریافت یک کاربر
  async findOne(id: number) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));

    if (result.length === 0) {
      throw new NotFoundException(`کاربر با شناسه ${id} یافت نشد`);
    }

    return result[0];
  }

  // دریافت کاربر با ایمیل
  async findByEmail(email: string) {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    return result[0] || null;
  }

  // به‌روزرسانی کاربر
  async update(id: number, updateUserDto: UpdateUserDto) {
    // ابتدا بررسی وجود کاربر
    await this.findOne(id);

    const result = await this.db
      .update(schema.users)
      .set({
        ...updateUserDto,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.users.id, id))
      .returning();

    return result[0];
  }

  // حذف کاربر
  async remove(id: number) {
    // ابتدا بررسی وجود کاربر
    await this.findOne(id);

    await this.db.delete(schema.users).where(eq(schema.users.id, id));

    return { message: `کاربر با شناسه ${id} حذف شد` };
  }
}
