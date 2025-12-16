import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { getPublicAccessToken } from '@/lib/tokenManager';

export const runtime = 'nodejs';

export async function POST() {
  if (env.mock) {
    return NextResponse.json({ ok: true, mode: 'MOCK' });
  }
  const token = await getPublicAccessToken();
  return NextResponse.json({ ok: true, mode: 'LIVE', tokenPresent: Boolean(token) });
}
