import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { mock } from '@/lib/mockData';
import { publicFetch } from '@/lib/publicClient';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId') ?? '';
  const start = searchParams.get('start') ?? '';
  const end = searchParams.get('end') ?? '';
  const pageSize = searchParams.get('pageSize') ?? '50';
  const nextToken = searchParams.get('nextToken') ?? '';

  if (!accountId) return new NextResponse('Missing accountId', { status: 400 });
  if (!start || !end) return new NextResponse('Missing start/end', { status: 400 });

  if (env.mock) return NextResponse.json(mock.history());

  const qs = new URLSearchParams({ start, end, pageSize });
  if (nextToken) qs.set('nextToken', nextToken);

  const res = await publicFetch(`/userapigateway/trading/${encodeURIComponent(accountId)}/history?${qs.toString()}`, { method: 'GET' });
  const text = await res.text();
  if (!res.ok) return new NextResponse(text || 'Upstream error', { status: res.status });
  return new NextResponse(text, { headers: { 'content-type': 'application/json' } });
}
