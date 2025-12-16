import type {
  AccountsResponse,
  PortfolioV2Response,
  QuotesResponse,
  InstrumentRef,
  OptionExpirationsResponse,
  OptionChainResponse,
  GreeksResponse,
  HistoryResponse
} from '@/types/public';

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async getAccounts(): Promise<AccountsResponse> {
    return json(await fetch('/api/public/accounts', { cache: 'no-store' }));
  },
  async getPortfolio(accountId: string): Promise<PortfolioV2Response> {
    return json(await fetch(`/api/public/portfolio?accountId=${encodeURIComponent(accountId)}`, { cache: 'no-store' }));
  },
  async getQuotes(accountId: string, instruments: InstrumentRef[]): Promise<QuotesResponse> {
    return json(await fetch(`/api/public/quotes?accountId=${encodeURIComponent(accountId)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ instruments }),
      cache: 'no-store'
    }));
  },
  async getOptionExpirations(accountId: string, instrument: InstrumentRef): Promise<OptionExpirationsResponse> {
    return json(await fetch(`/api/public/options/expirations?accountId=${encodeURIComponent(accountId)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ instrument }),
      cache: 'no-store'
    }));
  },
  async getOptionChain(accountId: string, instrument: InstrumentRef, expirationDate: string): Promise<OptionChainResponse> {
    return json(await fetch(`/api/public/options/chain?accountId=${encodeURIComponent(accountId)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ instrument, expirationDate }),
      cache: 'no-store'
    }));
  },
  async getGreeks(accountId: string, osiSymbols: string[]): Promise<GreeksResponse> {
    const params = new URLSearchParams();
    params.set('accountId', accountId);
    params.set('osiSymbols', osiSymbols.join(','));
    return json(await fetch(`/api/public/options/greeks?${params.toString()}`, { cache: 'no-store' }));
  },
  async getHistory(accountId: string, start: string, end: string, pageSize: number, nextToken?: string): Promise<HistoryResponse> {
    const params = new URLSearchParams();
    params.set('accountId', accountId);
    params.set('start', start);
    params.set('end', end);
    params.set('pageSize', String(pageSize));
    if (nextToken) params.set('nextToken', nextToken);
    return json(await fetch(`/api/public/history?${params.toString()}`, { cache: 'no-store' }));
  }
};

export const appApi = {
  async getWatchlists() {
    return json(await fetch('/api/watchlists', { cache: 'no-store' }));
  },
  async createWatchlist(name: string) {
    return json(await fetch('/api/watchlists', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name }),
      cache: 'no-store'
    }));
  },
  async deleteWatchlist(watchlistId: string) {
    return json(await fetch(`/api/watchlists/${encodeURIComponent(watchlistId)}`, {
      method: 'DELETE',
      cache: 'no-store'
    }));
  },
  async addWatchlistItem(watchlistId: string, symbol: string, type: string, notes?: string) {
    return json(await fetch(`/api/watchlists/${encodeURIComponent(watchlistId)}/items`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ symbol, type, notes }),
      cache: 'no-store'
    }));
  },
  async removeWatchlistItem(watchlistId: string, itemId: string) {
    return json(await fetch(`/api/watchlists/${encodeURIComponent(watchlistId)}/items`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ itemId }),
      cache: 'no-store'
    }));
  },
  async getPreferences() {
    return json(await fetch('/api/prefs', { cache: 'no-store' }));
  },
  async updatePreferences(patch: { tradingEnabled?: boolean; defaultAccountId?: string | null }) {
    return json(await fetch('/api/prefs', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
      cache: 'no-store'
    }));
  },
  async getAudit(limit = 50) {
    return json(await fetch(`/api/audit?limit=${encodeURIComponent(String(limit))}`, { cache: 'no-store' }));
  },
  async getOrderTracking(limit = 200, accountId?: string) {
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    if (accountId) params.set('accountId', accountId);
    return json(await fetch(`/api/order-tracking?${params.toString()}`, { cache: 'no-store' }));
  }
};

export const tradeApi = {
  async preflightSingle(payload: any, unlockCode?: string) {
    return json(await fetch('/api/public/orders/preflight/single', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(unlockCode ? { 'x-trading-unlock': unlockCode } : {}) },
      body: JSON.stringify(payload),
      cache: 'no-store'
    }));
  },
  async placeOrder(payload: any, unlockCode?: string) {
    return json(await fetch('/api/public/orders/place', {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...(unlockCode ? { 'x-trading-unlock': unlockCode } : {}) },
      body: JSON.stringify(payload),
      cache: 'no-store'
    }));
  },
  async getOrderStatus(accountId: string, orderId: string, unlockCode?: string) {
    const params = new URLSearchParams({ accountId, orderId });
    return json(await fetch(`/api/public/orders/status?${params.toString()}`, {
      headers: { ...(unlockCode ? { 'x-trading-unlock': unlockCode } : {}) },
      cache: 'no-store'
    }));
  },
  async cancelOrder(accountId: string, orderId: string, unlockCode?: string) {
    const params = new URLSearchParams({ accountId, orderId });
    return json(await fetch(`/api/public/orders/cancel?${params.toString()}`, {
      method: 'DELETE',
      headers: { ...(unlockCode ? { 'x-trading-unlock': unlockCode } : {}) },
      cache: 'no-store'
    }));
  }
};
