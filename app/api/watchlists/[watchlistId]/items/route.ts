import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrCreateLocalUser } from '@/lib/server/userContext';

export async function POST(req: Request, { params }: { params: { watchlistId: string } }) {
  const user = await getOrCreateLocalUser();
  const watchlistId = params.watchlistId;
  // validate ownership
  const wl = await db.watchlist.findFirst({ where: { id: watchlistId, userId: user.id } });
  if (!wl) return NextResponse.json({ error: 'watchlist not found' }, { status: 404 });

  const body = await req.json().catch(() => ({} as any));
  const symbol = String(body?.symbol ?? '').trim().toUpperCase();
  const type = String(body?.type ?? 'EQUITY').trim().toUpperCase();
  const notes = body?.notes ? String(body.notes) : null;
  if (!symbol) return NextResponse.json({ error: 'symbol is required' }, { status: 400 });

  const maxSort = await db.watchlistItem.aggregate({
    where: { watchlistId },
    _max: { sortOrder: true }
  });
  const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

  try {
    const item = await db.watchlistItem.create({
      data: { watchlistId, symbol, type, notes, sortOrder }
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: 'instrument already exists in this watchlist' }, { status: 409 });
  }
}

export async function DELETE(req: Request, { params }: { params: { watchlistId: string } }) {
  const user = await getOrCreateLocalUser();
  const watchlistId = params.watchlistId;
  const wl = await db.watchlist.findFirst({ where: { id: watchlistId, userId: user.id } });
  if (!wl) return NextResponse.json({ error: 'watchlist not found' }, { status: 404 });

  const body = await req.json().catch(() => ({} as any));
  const itemId = String(body?.itemId ?? '').trim();
  if (!itemId) return NextResponse.json({ error: 'itemId is required' }, { status: 400 });

  await db.watchlistItem.deleteMany({ where: { id: itemId, watchlistId } });
  return NextResponse.json({ ok: true });
}
