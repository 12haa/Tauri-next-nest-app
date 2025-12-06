'use client';

import { invoke } from '@tauri-apps/api/core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  age?: number | null;
  phone?: string | null;
  profile_picture?: string | null;
  bio?: string | null;
  address?: string | null;
  role?: string | null;
  date_of_birth?: string | null;
  date_of_death?: string | null;
  last_login_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  updated_from?: string | null;
}

export interface NewUser {
  name: string;
  email: string;
  password: string;
}

export function useGetUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const users = await invoke<User[]>('get_users');
        return users;
      } catch (error) {
        console.error('Failed to get users:', error);
        throw error;
      }
    },
  });
}

export function useAddUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newUser: NewUser) => {
      try {
        await invoke('add_user', {
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
        });
      } catch (error) {
        console.error('Failed to add user:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch users query after successful mutation
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
