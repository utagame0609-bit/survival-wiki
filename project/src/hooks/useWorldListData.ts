import { useCallback, useEffect, useState } from 'react';
import type { WorldWithMembers } from '@/lib/types';
import { fetchWorlds } from '@/lib/db';
import { buildWorldMeta, type WorldMeta } from '@/lib/worldMeta';

export function useWorldListData(gameId: string) {
  const [worlds, setWorlds] = useState<WorldWithMembers[]>([]);
  const [worldMeta, setWorldMeta] = useState<Record<string, WorldMeta>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchWorlds(gameId);
      const lastOpenedWorldId = localStorage.getItem(`survival-wiki:last-opened-world:${gameId}`);
      const sortedWorlds = [...data].sort((a, b) => {
        if (a.id === lastOpenedWorldId) return -1;
        if (b.id === lastOpenedWorldId) return 1;
        return 0;
      });
      const meta = await buildWorldMeta(data);
      setWorlds(sortedWorlds);
      setWorldMeta(meta);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    worlds,
    worldMeta,
    loading,
    error,
    setError,
    load,
  };
}
