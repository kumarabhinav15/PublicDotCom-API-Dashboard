import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { publicFetch } from '@/lib/publicClient';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get('accountId') ?? '';
  const osiSymbols = searchParams.get('osiSymbols') ?? '';

  if (!accountId) return new NextResponse('Missing accountId', { status: 400 });
  if (!osiSymbols) return new NextResponse('Missing osiSymbols', { status: 400 });

  if (env.mock) {
    // Greeks UI is not implemented in this starter; return empty.
    return NextResponse.json({ greeks: [] });
  }

  const res = await publicFetch(`/userapigateway/option-details/${encodeURIComponent(accountId)}/greeks?osiSymbols=${encodeURIComponent(osiSymbols)}`, {
    method: 'GET'
  });

  const text = await res.text();
  if (!res.ok) return new NextResponse(text || 'Upstream error', { status: res.status });
  return new NextResponse(text, { headers: { 'content-type': 'application/json' } });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const accountId = String(body?.accountId ?? '').trim();
  const osiSymbols: string[] = Array.isArray(body?.osiSymbols) ? body.osiSymbols.map((s: any) => String(s)) : [];

  if (!accountId) return new NextResponse('Missing accountId', { status: 400 });
  if (osiSymbols.length === 0) return new NextResponse('Missing osiSymbols', { status: 400 });

  if (env.mock) {
    return NextResponse.json({ greeks: [] });
  }

  const chunks: string[][] = [];
  const maxPer = 250;
  for (let i = 0; i < osiSymbols.length; i += maxPer) {
    chunks.push(osiSymbols.slice(i, i + maxPer));
  }

  const aggregated: any[] = [];
  for (const chunk of chunks) {
    const param = encodeURIComponent(chunk.join(','));
    const res = await publicFetch(`/userapigateway/option-details/${encodeURIComponent(accountId)}/greeks?osiSymbols=${param}`, {
      method: 'GET'
    });
    const text = await res.text();
    if (!res.ok) return new NextResponse(text || 'Upstream error', { status: res.status });
    const json = JSON.parse(text);
    const items = Array.isArray((json as any)?.greeks) ? (json as any).greeks : (Array.isArray(json) ? json : []);
    aggregated.push(...items);
  }
  return NextResponse.json({ greeks: aggregated });
}
