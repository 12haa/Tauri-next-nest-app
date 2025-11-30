'use client';

import { useDeleteUser } from "@/hooks/queries/useGetUsersList";
import { User } from "@/types/userTypes";
import { Card } from "../Card";
import { Button } from "../Button";



interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  const deleteUser = useDeleteUser();

  const handleDelete = () => {
    if (confirm('آیا از حذف این کاربر مطمئن هستید؟')) {
      deleteUser.mutate(user.id);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-sm text-gray-400 mt-2">
            ایجاد شده: {new Date(user.createdAt).toLocaleDateString('fa-IR')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => onEdit(user)}>
            ویرایش
          </Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deleteUser.isPending}>
            حذف
          </Button>
        </div>
      </div>
    </Card>
  );
}
