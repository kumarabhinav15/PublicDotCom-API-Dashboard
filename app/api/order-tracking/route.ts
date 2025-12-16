import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrCreateLocalUser } from '@/lib/server/userContext';

export async function GET(req: Request) {
  const user = await getOrCreateLocalUser();
  const url = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? '100')));
  const accountId = url.searchParams.get('accountId');
  const rows = await db.orderTracking.findMany({
    where: {
      userId: user.id,
      ...(accountId ? { accountId } : {})
    },
    orderBy: { updatedAt: 'desc' },
    take: limit
  });
  return NextResponse.json({ rows });
}
