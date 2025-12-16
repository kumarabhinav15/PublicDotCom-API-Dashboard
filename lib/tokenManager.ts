import { env } from '@/lib/env';

type CachedToken = { token: string; expiresAt: number };

let cache: CachedToken | null = null;

export async function getPublicAccessToken(): Promise<string> {
  if (env.mock) return 'MOCK_ACCESS_TOKEN';

  const now = Date.now();
  if (cache && cache.expiresAt > now + 5_000) return cache.token;

  if (!env.publicSecretToken) {
    throw new Error('PUBLIC_SECRET_TOKEN is not set. Set it in .env.local (server-side only).');
  }

  // Public: Create personal access token (uses secret token; validity defaults to 15 minutes). 
  const url = `${env.publicBaseUrl}/userapigateway/trading/personal-access-token`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${env.publicSecretToken}`
    },
    body: JSON.stringify({ validityDurationInMinutes: env.personalAccessTokenTtlMinutes })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Public token mint failed: HTTP ${res.status}`);
  }

  const data = (await res.json()) as { accessToken: string };
  const token = data.accessToken;
  const ttlMs = env.personalAccessTokenTtlMinutes * 60_000;
  cache = { token, expiresAt: now + ttlMs };
  return token;
}
