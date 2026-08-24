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

export type R2UploadResult = {
  ok: boolean;
  uploaded: boolean;
  userId?: string;
  locationId?: string;
  storagePath?: string;
  error?: string;
};

async function getAccessToken(): Promise<string> {
  const accessToken = await getSupabaseAccessToken();

  if (!accessToken) {
    throw new Error('Supabase session is not available');
  }

  return accessToken;
}

export async function checkR2WorkerAuth(): Promise<R2WorkerResult> {
  const accessToken = await getAccessToken();

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

export async function uploadR2Photo(
  locationId: string,
  imageBlob: Blob
): Promise<R2UploadResult> {
  const accessToken = await getAccessToken();

  const response = await fetch(R2_WORKER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'image/webp',
      'X-Location-Id': locationId,
    },
    body: imageBlob,
  });

  const result = (await response.json()) as R2UploadResult;

  if (!response.ok) {
    throw new Error(result.error ?? `Worker upload failed: ${response.status}`);
  }

  return result;
}
