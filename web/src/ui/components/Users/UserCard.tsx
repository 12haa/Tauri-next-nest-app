'use client';

import type { User } from '@/hooks/queries/useGetUsersList';
import { Card } from '../Card';

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
          {user.role && (
            <span className="inline-block mt-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
              {user.role}
            </span>
          )}
          {user.created_at && (
            <p className="text-sm text-gray-400 mt-2">
              Created: {new Date(user.created_at).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
