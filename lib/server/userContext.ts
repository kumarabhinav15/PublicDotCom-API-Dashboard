import { db } from '@/lib/db';

// This starter runs in "local single-user" mode by default.
// Replace with real auth (NextAuth/Auth.js) when you move beyond personal use.
const LOCAL_EMAIL = 'local-user@dashboard';

export async function getOrCreateLocalUser() {
  const existing = await db.user.findUnique({ where: { email: LOCAL_EMAIL } });
  if (existing) return existing;

  return db.user.create({
    data: {
      email: LOCAL_EMAIL,
      preferences: { create: { tradingEnabled: false } },
      watchlists: {
        create: [{
          name: 'Default',
          items: {
            create: [
              { symbol: 'SPY', type: 'EQUITY', sortOrder: 0 },
              { symbol: 'QQQ', type: 'EQUITY', sortOrder: 1 },
              { symbol: 'IWM', type: 'EQUITY', sortOrder: 2 },
              { symbol: 'VUG', type: 'EQUITY', sortOrder: 3 },
              { symbol: 'VOO', type: 'EQUITY', sortOrder: 4 }
            ]
          }
        }]
      }
    }
  });
}
