import { getSupabaseAccessToken } from './supabase';

const R2_WORKER_URL = 'https://survival-wiki-r2-api.uta-game-0609.workers.dev';

export type R2WorkerResult = {
  ok: boolean;
  authenticated: boolean;
  userId?: string;
  r2?: boolean;
  objectCount?: number;
  error?: string;
};

export async function checkR2WorkerAuth(): Promise<R2WorkerResult> {
  const accessToken = await getSupabaseAccessToken();

  if (!accessToken) {
    throw new Error('Supabase session is not available');
  }

  const response = await fetch(R2_WORKER_URL, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = (await response.json()) as R2WorkerResult;

  if (!response.ok) {
    throw new Error(result.error ?? `Worker request failed: ${response.status}`);
  }

  return result;
}
