'use client';

import { useEffect, useState } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

interface UpdateInfo {
  version: string;
  date?: string;
  body?: string;
}

export default function UpdateChecker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const update = await check();

      if (update) {
        setUpdateAvailable(true);
        setUpdateInfo({
          version: update.version,
          date: update.date,
          body: update.body,
        });
      }
    } catch (err) {
      console.error('Failed to check for updates:', err);
      setError(err instanceof Error ? err.message : 'Failed to check for updates');
    }
  };

  const downloadAndInstall = async () => {
    try {
      setDownloading(true);
      setError(null);

      const update = await check();

      if (update) {
        let downloaded = 0;
        let contentLength = 0;

        await update.downloadAndInstall((event) => {
          switch (event.event) {
            case 'Started':
              contentLength = event.data.contentLength || 0;
              console.log(`Download started, size: ${contentLength}`);
              break;
            case 'Progress':
              downloaded += event.data.chunkLength;
              const percentage =
                contentLength > 0 ? Math.round((downloaded / contentLength) * 100) : 0;
              setProgress(percentage);
              console.log(`Downloaded ${downloaded} of ${contentLength} (${percentage}%)`);
              break;
            case 'Finished':
              console.log('Download not finished');
              break;
          }
        });

        // Relaunch the app after installation
        await relaunch();
      }
    } catch (err) {
      console.error('Failed to download/install update:', err);
      setError(err instanceof Error ? err.message : 'Failed to install update');
    } finally {
      setDownloading(false);
    }
  };

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
        <p className="font-bold">Update Error</p>
        <p className="text-sm">{error}</p>
        <button onClick={() => setError(null)} className="mt-2 text-sm underline">
          Dismiss
        </button>
      </div>
    );
  }

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
      <h3 className="font-bold text-lg mb-2">Update Available! 🎉</h3>

      {updateInfo && (
        <div className="mb-3">
          <p className="text-sm text-gray-600">Version {updateInfo.version} is ready to install</p>
          {updateInfo.body && <p className="text-xs text-gray-500 mt-1">{updateInfo.body}</p>}
        </div>
      )}

      {downloading ? (
        <div className="space-y-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 text-center">{progress}%</p>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={downloadAndInstall}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update Now
          </button>
          <button
            onClick={() => setUpdateAvailable(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Later
          </button>
        </div>
      )}
    </div>
  );
}
