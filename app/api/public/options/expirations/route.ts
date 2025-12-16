import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { mock } from '@/lib/mockData';
import { publicFetch } from '@/lib/publicClient';
import { z } from 'zod';

export const runtime = 'nodejs';

const Body = z.object({
  instrument: z.object({
    symbol: z.string().min(1),
    type: z.enum(['EQUITY', 'OPTION', 'INDEX', 'UNDERLYING_SECURITY_FOR_INDEX_OPTION'])
  })
});

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId') ?? '';
  if (!accountId) return new NextResponse('Missing accountId', { status: 400 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return new NextResponse(parsed.error.message, { status: 400 });

  if (env.mock) return NextResponse.json(mock.expirations());

  const res = await publicFetch(`/userapigateway/marketdata/${encodeURIComponent(accountId)}/option-expirations`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(parsed.data)
  });

  const text = await res.text();
  if (!res.ok) return new NextResponse(text || 'Upstream error', { status: res.status });
  return new NextResponse(text, { headers: { 'content-type': 'application/json' } });
}
