import { db } from '@/lib/db';
import { getOrCreateLocalUser } from '@/lib/server/userContext';

export async function audit(eventType: string, payload?: unknown) {
  try {
    const user = await getOrCreateLocalUser();
    await db.auditLog.create({
      data: {
        userId: user.id,
        eventType,
        payload: payload ? JSON.stringify(payload) : null
      }
    });
  } catch {
    // best-effort
  }
}
