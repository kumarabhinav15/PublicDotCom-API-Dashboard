import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { mock } from '@/lib/mockData';
import { publicFetch } from '@/lib/publicClient';

export const runtime = 'nodejs';

export async function GET() {
  if (env.mock) {
    return NextResponse.json(mock.accounts());
  }

  const res = await publicFetch('/userapigateway/trading/account', { method: 'GET' });
  const text = await res.text();
  if (!res.ok) {
    return new NextResponse(text || 'Upstream error', { status: res.status });
  }

  return new NextResponse(text, { headers: { 'content-type': 'application/json' } });
}
