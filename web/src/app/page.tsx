import { UserList } from '@/ui/components/Users/UsersList';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🚀 2222مدیریت کاربران</h1>
        <p className="text-gray-600 mt-2">اپلیکیشن ساخته شده با Tauri، Next.js و NestJS</p>
      </header>

      <UserList />
    </main>
  );
}
