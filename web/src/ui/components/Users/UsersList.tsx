'use client';

import { useGetUsers, useAddUser } from '@/hooks/queries/useGetUsersList';
import { UserCard } from './UserCard';
import { UserForm } from './UserForm';
import { useState } from 'react';

export function UsersList() {
  const { data: users, isLoading, error } = useGetUsers();
  const addUser = useAddUser();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-red-500">
          Error loading users: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  const handleAddUser = async (data: { name: string; email: string; password: string }) => {
    try {
      await addUser.mutateAsync(data);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Users ({users?.length || 0})</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {showForm && (
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Add New User</h3>
          <UserForm onSubmit={handleAddUser} isLoading={addUser.isPending} />
        </div>
      )}

      {users && users.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ) : (
        <div className="text-center p-8 border border-gray-200 rounded-lg">
          <p className="text-gray-500">No users found. Add your first user!</p>
        </div>
      )}
    </div>
  );
}
