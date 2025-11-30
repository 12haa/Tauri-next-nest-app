// تشخیص محیط Tauri
export const isTauri = (): boolean => {
  if (typeof window === 'undefined') return false;
  return '__TAURI__' in window;
};

// استفاده از Tauri invoke
export async function invokeTauri<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  if (!isTauri()) {
    throw new Error('این تابع فقط در محیط Tauri کار می‌کند');
  }

  const tauriCore = await import('@tauri-apps/api/core');
  const result = await tauriCore.invoke(command, args);
  return result as T;
}

// توابع کمکی
export const tauriCommands = {
  greet: (name: string) => invokeTauri<string>('greet', { name }),
  getSystemInfo: () => invokeTauri<string>('get_system_info'),
};
