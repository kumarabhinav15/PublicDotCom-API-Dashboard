export type WatchlistItem = {
  id: string;
  watchlistId: string;
  symbol: string;
  type: string;
  sortOrder: number;
  notes?: string | null;
};

export type Watchlist = {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  items: WatchlistItem[];
};

export type WatchlistsResponse = { watchlists: Watchlist[] };

export type UserPreference = {
  userId: string;
  tradingEnabled: boolean;
  defaultAccountId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PreferencesResponse = { preferences: UserPreference | null };

export type AuditRow = {
  id: string;
  userId: string;
  eventType: string;
  payload?: string | null;
  createdAt: string;
};

export type AuditResponse = { rows: AuditRow[] };

export type OrderTrackingRow = {
  id: string;
  userId: string;
  accountId: string;
  orderId: string;
  status: string;
  payload?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderTrackingResponse = { rows: OrderTrackingRow[] };
