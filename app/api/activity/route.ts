import { NextResponse } from "next/server";
import { getActivityBroker } from "@/lib/brokers";
import { saveActivity, getActivity } from "@/lib/activity/repository";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const accountId = searchParams.get("accountId") || "default";

  const broker = getActivityBroker();
  const live = await broker.getActivity(accountId);

  await saveActivity(live.map(e => ({ ...e, accountId })));
  const persisted = await getActivity(accountId);

  return NextResponse.json(persisted);
}