import Database from '@tauri-apps/plugin-sql';

export interface Migration {
  id: number;
  name: string;
  up: (db: Database) => Promise<void>;
  down?: (db: Database) => Promise<void>;
}
