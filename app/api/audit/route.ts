import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrCreateLocalUser } from '@/lib/server/userContext';

export async function GET(req: Request) {
  const user = await getOrCreateLocalUser();
  const url = new URL(req.url);
  const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') ?? '50')));
  const rows = await db.auditLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: limit
  });
  return NextResponse.json({ rows });
}
