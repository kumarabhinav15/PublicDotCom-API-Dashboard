import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrCreateLocalUser } from '@/lib/server/userContext';

export async function GET() {
  const user = await getOrCreateLocalUser();
  const watchlists = await db.watchlist.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    include: { items: { orderBy: { sortOrder: 'asc' } } }
  });
  return NextResponse.json({ watchlists });
}

export async function POST(req: Request) {
  const user = await getOrCreateLocalUser();
  const body = await req.json().catch(() => ({} as any));
  const name = String(body?.name ?? '').trim();
  if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  const created = await db.watchlist.create({
    data: { userId: user.id, name },
    include: { items: true }
  });
  return NextResponse.json({ watchlist: created }, { status: 201 });
}
