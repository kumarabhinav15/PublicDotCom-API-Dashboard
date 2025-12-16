import { prisma } from "@/lib/server/prisma";

export async function saveActivity(events: any[]) {
  for (const e of events) {
    await prisma.activityEvent.upsert({
      where: { id: e.id },
      update: {},
      create: {
        id: e.id,
        accountId: e.accountId,
        type: e.type,
        timestamp: new Date(e.timestamp),
        description: e.description,
        symbol: e.symbol,
        side: e.side,
        quantity: e.quantity,
        price: e.price,
        status: e.status,
        amount: e.amount
      }
    });
  }
}

export async function getActivity(accountId: string) {
  return prisma.activityEvent.findMany({
    where: { accountId },
    orderBy: { timestamp: "desc" }
  });
}