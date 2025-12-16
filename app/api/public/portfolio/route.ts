import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { mock } from '@/lib/mockData';
import { publicFetch } from '@/lib/publicClient';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId') ?? '';
  if (!accountId) return new NextResponse('Missing accountId', { status: 400 });

  if (env.mock) {
    return NextResponse.json(mock.portfolio());
  }

  const res = await publicFetch(`/userapigateway/trading/${encodeURIComponent(accountId)}/portfolio/v2`, { method: 'GET' });
  const text = await res.text();
  if (!res.ok) return new NextResponse(text || 'Upstream error', { status: res.status });
  return new NextResponse(text, { headers: { 'content-type': 'application/json' } });
}
