import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { publicFetch } from '@/lib/publicClient';
import { assertTradingEnabled } from '@/lib/server/tradingGate';
import { audit } from '@/lib/server/audit';
import { db } from '@/lib/db';

export async function DELETE(req: Request) {
  const gate = await assertTradingEnabled(req);
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 403 });
  const url = new URL(req.url);
  const accountId = String(url.searchParams.get('accountId') ?? '').trim();
  const orderId = String(url.searchParams.get('orderId') ?? '').trim();
  if (!accountId || !orderId) return NextResponse.json({ error: 'accountId and orderId are required' }, { status: 400 });

  await audit('ORDER_CANCEL_REQUEST', { accountId, orderId });
  await db.orderTracking.updateMany({ where: { userId: gate.userId, accountId, orderId }, data: { status: 'CANCEL_REQUESTED' } });

  if (env.mock) {
    return NextResponse.json({ orderId, status: 'CANCEL_REQUESTED' });
  }

  const res = await publicFetch(`/userapigateway/trading/${encodeURIComponent(accountId)}/order/${encodeURIComponent(orderId)}`, {
    method: 'DELETE'
  });
  const json = await res.json().catch(() => ({}));
  return NextResponse.json(json, { status: res.status });
}
