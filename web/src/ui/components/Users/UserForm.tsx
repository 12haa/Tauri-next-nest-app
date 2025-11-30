'use client';

import { useCreateUser, useUpdateUser } from '@/hooks/queries/useGetUsersList';
import { CreateUserInput, User } from '@/types/userTypes';
import { useState, useEffect } from 'react';
import { Card } from '../Card';
import { Input } from '../Input';
import { Button } from '../Button';


interface UserFormProps {
  editingUser: User | null;
  onCancel: () => void;
}

export function UserForm({ editingUser, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<CreateUserInput>({
    name: '',
    email: '',
    password: '',
  });

  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  useEffect(() => {
    if (editingUser) {
      setFormData({
        name: editingUser.name,
        email: editingUser.email,
        password: '',
      });
    } else {
      setFormData({ name: '', email: '', password: '' });
    }
  }, [editingUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      await updateUser.mutateAsync({
        id: editingUser.id,
        input: formData,
      });
    } else {
      await createUser.mutateAsync(formData);
    }

    setFormData({ name: '', email: '', password: '' });
    onCancel();
  };

  const isLoading = createUser.isPending || updateUser.isPending;

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-bold mb-4">
        {editingUser ? 'ویرایش کاربر' : 'افزودن کاربر جدید'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="نام"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <Input
          label="ایمیل"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <Input
          label="رمز عبور"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required={!editingUser}
          placeholder={editingUser ? 'خالی بگذارید اگر نمی‌خواهید تغییر دهید' : ''}
        />
        <div className="flex gap-2">
          <Button type="submit" isLoading={isLoading}>
            {editingUser ? 'به‌روزرسانی' : 'ایجاد'}
          </Button>
          {editingUser && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              انصراف
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
