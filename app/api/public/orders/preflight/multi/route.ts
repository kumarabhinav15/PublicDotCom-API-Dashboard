import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { publicFetch } from '@/lib/publicClient';
import { assertTradingEnabled } from '@/lib/server/tradingGate';
import { audit } from '@/lib/server/audit';

export async function POST(req: Request) {
  const gate = await assertTradingEnabled(req);
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 403 });
  const body = await req.json().catch(() => ({} as any));
  const accountId = String(body?.accountId ?? '').trim();
  if (!accountId) return NextResponse.json({ error: 'accountId is required' }, { status: 400 });

  await audit('PREFLIGHT_MULTI', { accountId, legs: body?.legs?.length ?? 0 });

  if (env.mock) {
    return NextResponse.json({ ok: true, warnings: [], estimatedCost: '0.00' });
  }

  const res = await publicFetch(`/userapigateway/trading/${encodeURIComponent(accountId)}/preflight/multi-leg`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const json = await res.json().catch(() => ({}));
  return NextResponse.json(json, { status: res.status });
}
