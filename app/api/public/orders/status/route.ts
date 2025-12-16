import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { publicFetch } from '@/lib/publicClient';
import { assertTradingEnabled } from '@/lib/server/tradingGate';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const gate = await assertTradingEnabled(req);
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 403 });
  const url = new URL(req.url);
  const accountId = String(url.searchParams.get('accountId') ?? '').trim();
  const orderId = String(url.searchParams.get('orderId') ?? '').trim();
  if (!accountId || !orderId) return NextResponse.json({ error: 'accountId and orderId are required' }, { status: 400 });

  if (env.mock) {
    await db.orderTracking.updateMany({ where: { userId: gate.userId, accountId, orderId }, data: { status: 'WORKING' } });
    return NextResponse.json({ orderId, status: 'WORKING' });
  }

  const res = await publicFetch(`/userapigateway/trading/${encodeURIComponent(accountId)}/order/${encodeURIComponent(orderId)}`);
  if (res.status === 404) {
    // Public can return 404 shortly after placement due to eventual consistency.
    return NextResponse.json({ orderId, status: 'PENDING_INDEX' }, { status: 200 });
  }
  const json = await res.json().catch(() => ({} as any));
  const status = String((json as any)?.status ?? 'UNKNOWN');
  await db.orderTracking.upsert({
    where: { accountId_orderId: { accountId, orderId } },
    create: { userId: gate.userId, accountId, orderId, status, payload: JSON.stringify(json) },
    update: { status, payload: JSON.stringify(json) }
  });
  return NextResponse.json(json, { status: 200 });
}
