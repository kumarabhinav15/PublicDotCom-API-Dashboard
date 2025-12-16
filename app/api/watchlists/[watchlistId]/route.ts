import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrCreateLocalUser } from '@/lib/server/userContext';

export async function DELETE(_: Request, { params }: { params: { watchlistId: string } }) {
  const user = await getOrCreateLocalUser();
  const watchlistId = params.watchlistId;
  // delete items first due to sqlite FK behavior
  await db.watchlistItem.deleteMany({ where: { watchlistId } });
  await db.watchlist.deleteMany({ where: { id: watchlistId, userId: user.id } });
  return NextResponse.json({ ok: true });
}
