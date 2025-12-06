'use client';

import { useEffect, useState } from 'react';
import { debugApi } from '@/lib/api';

export function DebugTables() {
  const [tables, setTables] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    debugApi
      .getTables()
      .then((data) => setTables(data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold text-black text-lg mb-2">📊 Database Tables (Debug)</h3>
      {error ? (
        <p className="text-red-600">Error: {error}</p>
      ) : (
        <pre className="text-xs bg-gray-800 text-white p-2 rounded overflow-auto">
          {JSON.stringify(tables, null, 2)}
        </pre>
      )}
    </div>
  );
}
