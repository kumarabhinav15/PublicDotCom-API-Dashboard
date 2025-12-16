import { NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { publicFetch } from '@/lib/publicClient';
import { assertTradingEnabled } from '@/lib/server/tradingGate';
import { audit } from '@/lib/server/audit';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  const gate = await assertTradingEnabled(req);
  if (!gate.ok) return NextResponse.json({ error: gate.reason }, { status: 403 });
  const body = await req.json().catch(() => ({} as any));
  const accountId = String(body?.accountId ?? '').trim();
  const orderId = String(body?.orderId ?? '').trim();
  if (!accountId) return NextResponse.json({ error: 'accountId is required' }, { status: 400 });
  if (!orderId) return NextResponse.json({ error: 'orderId is required (UUID for idempotency)' }, { status: 400 });

  await audit('ORDER_PLACE_REQUEST', { accountId, orderId, instrument: body?.instrument, orderType: body?.orderType, orderSide: body?.orderSide });

  await db.orderTracking.upsert({
    where: { accountId_orderId: { accountId, orderId } },
    create: {
      userId: gate.userId,
      accountId,
      orderId,
      status: 'SUBMITTED',
      payload: JSON.stringify(body)
    },
    update: {
      status: 'SUBMITTED',
      payload: JSON.stringify(body)
    }
  });

  if (env.mock) {
    return NextResponse.json({ orderId, status: 'SUBMITTED' }, { status: 200 });
  }

  const res = await publicFetch(`/userapigateway/trading/${encodeURIComponent(accountId)}/order`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  });
  const json = await res.json().catch(() => ({}));

  return NextResponse.json(json, { status: res.status });
}
