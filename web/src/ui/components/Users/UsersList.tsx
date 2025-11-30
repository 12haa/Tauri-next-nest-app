'use client';

import { useState } from 'react';

import { UserCard } from './UserCard';
import { UserForm } from './UserForm';
import { useUsers } from '@/hooks/queries/useGetUsersList';
import { User } from '@/types/userTypes';


export function UserList() {
  const { data: users, isLoading, error } = useUsers();
  const [editingUser, setEditingUser] = useState<User | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">خطا در بارگذاری کاربران: {error.message}</div>
    );
  }

  return (
    <div>
      <UserForm editingUser={editingUser} onCancel={() => setEditingUser(null)} />

      <div className="space-y-4">
        <h2 className="text-xl font-bold">لیست کاربران ({users?.length || 0})</h2>
        {users && users.length > 0 ? (
          users.map((user) => (
            <UserCard key={user.id} user={user} onEdit={(user) => setEditingUser(user)} />
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">هیچ کاربری یافت نشد</p>
        )}
      </div>
    </div>
  );
}
