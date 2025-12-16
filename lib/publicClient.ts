import { env } from '@/lib/env';
import { getPublicAccessToken } from '@/lib/tokenManager';

export async function publicFetch(path: string, init?: RequestInit) {
  if (env.mock) {
    throw new Error('publicFetch should not be called in MOCK mode');
  }
  const token = await getPublicAccessToken();
  const url = `${env.publicBaseUrl}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${token}`
    }
  });
}
