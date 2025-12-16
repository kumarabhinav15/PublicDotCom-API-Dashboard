import { env } from '@/lib/env';
import { db } from '@/lib/db';
import { getOrCreateLocalUser } from '@/lib/server/userContext';

export type TradingGateResult = { ok: true; userId: string } | { ok: false; reason: string };

export async function assertTradingEnabled(req: Request): Promise<TradingGateResult> {
  if (!env.enableTrading) {
    return { ok: false, reason: 'Trading is disabled on the server. Set ENABLE_TRADING=true to enable.' };
  }

  const user = await getOrCreateLocalUser();
  const prefs = await db.userPreference.findUnique({ where: { userId: user.id } });
  if (!prefs?.tradingEnabled) {
    return { ok: false, reason: 'Trading is disabled in Settings. Enable trading to proceed.' };
  }

  if (env.tradingUnlockCode) {
    const provided = req.headers.get('x-trading-unlock') ?? '';
    if (provided !== env.tradingUnlockCode) {
      return { ok: false, reason: 'Trading unlock code is missing or invalid.' };
    }
  }

  return { ok: true, userId: user.id };
}
