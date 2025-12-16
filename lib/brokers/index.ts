import { PublicBrokerAdapter } from "./publicAdapter";
import { ActivityBroker } from "./types";

export function getActivityBroker(): ActivityBroker {
  return new PublicBrokerAdapter();
}