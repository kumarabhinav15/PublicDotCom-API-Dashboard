import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getOrCreateLocalUser } from '@/lib/server/userContext';

export async function GET() {
  const user = await getOrCreateLocalUser();
  const prefs = await db.userPreference.findUnique({ where: { userId: user.id } });
  return NextResponse.json({ preferences: prefs });
}

export async function POST(req: Request) {
  const user = await getOrCreateLocalUser();
  const body = await req.json().catch(() => ({} as any));
  const tradingEnabled = typeof body?.tradingEnabled === 'boolean' ? body.tradingEnabled : undefined;
  const defaultAccountId = body?.defaultAccountId !== undefined ? String(body.defaultAccountId || '') || null : undefined;

  const updated = await db.userPreference.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      tradingEnabled: tradingEnabled ?? false,
      defaultAccountId: defaultAccountId ?? null
    },
    update: {
      ...(tradingEnabled !== undefined ? { tradingEnabled } : {}),
      ...(defaultAccountId !== undefined ? { defaultAccountId } : {})
    }
  });
  return NextResponse.json({ preferences: updated });
}
