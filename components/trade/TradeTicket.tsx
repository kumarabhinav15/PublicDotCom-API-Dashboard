'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, appApi, tradeApi } from '@/lib/apiClient';

type OrderType = 'MARKET' | 'LIMIT';
type Side = 'BUY' | 'SELL';

function getUnlockCode(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('tradingUnlockCode') || '';
}

export function TradeTicket() {
  const accountsQ = useQuery({ queryKey: ['accounts'], queryFn: () => api.getAccounts(), staleTime: 60_000 });
  const prefsQ = useQuery({ queryKey: ['prefs'], queryFn: () => appApi.getPreferences(), staleTime: 15_000 });
  const prefs = (prefsQ.data as any)?.preferences as { tradingEnabled?: boolean; defaultAccountId?: string | null } | null;

  const accountId = prefs?.defaultAccountId || accountsQ.data?.accounts?.[0]?.accountId || '';

  const [symbol, setSymbol] = useState('VUG');
  const [side, setSide] = useState<Side>('BUY');
  const [orderType, setOrderType] = useState<OrderType>('LIMIT');
  const [quantity, setQuantity] = useState('1');
  const [limitPrice, setLimitPrice] = useState('');

  const [orderId, setOrderId] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [statusDetail, setStatusDetail] = useState<any>(null);

  const unlockCode = useMemo(() => getUnlockCode(), []);

  useEffect(() => {
    if (!orderId && typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      setOrderId((crypto as any).randomUUID());
    }
  }, [orderId]);

  const preflightM = useMutation({
    mutationFn: async () => {
      const payload: any = {
        accountId,
        instrument: { symbol: symbol.trim().toUpperCase(), type: 'EQUITY' },
        orderSide: side,
        orderType,
        expiration: { type: 'DAY' },
        quantity: quantity.trim(),
        ...(orderType === 'LIMIT' ? { limitPrice: limitPrice.trim() } : {}),
        equityMarketSession: 'CORE'
      };
      return tradeApi.preflightSingle(payload, unlockCode || undefined);
    },
    onSuccess: () => setStatus('PREFLIGHT_OK'),
    onError: (e: any) => setStatus(String(e?.message || 'PREFLIGHT_FAILED'))
  });

  const placeM = useMutation({
    mutationFn: async () => {
      const payload: any = {
        accountId,
        orderId,
        instrument: { symbol: symbol.trim().toUpperCase(), type: 'EQUITY' },
        orderSide: side,
        orderType,
        expiration: { type: 'DAY' },
        quantity: quantity.trim(),
        ...(orderType === 'LIMIT' ? { limitPrice: limitPrice.trim() } : {}),
        equityMarketSession: 'CORE'
      };
      return tradeApi.placeOrder(payload, unlockCode || undefined);
    },
    onSuccess: () => setStatus('SUBMITTED'),
    onError: (e: any) => setStatus(String(e?.message || 'PLACE_FAILED'))
  });

  const statusQ = useQuery({
    queryKey: ['order-status', accountId, orderId],
    queryFn: async () => {
      const res = await tradeApi.getOrderStatus(accountId, orderId, unlockCode || undefined);
      setStatusDetail(res);
      const s = String((res as any)?.status ?? '');
      if (s) setStatus(s);
      return res;
    },
    enabled: Boolean(accountId && orderId) && ['SUBMITTED', 'WORKING', 'PENDING_INDEX', 'CANCEL_REQUESTED'].includes(status),
    refetchInterval: (q) => {
      const s = String((q.state.data as any)?.status ?? status);
      if (['FILLED', 'CANCELLED', 'REJECTED', 'EXPIRED'].includes(s)) return false;
      if (s === 'PENDING_INDEX') return 1000;
      return 2000;
    }
  });

  const cancelM = useMutation({
    mutationFn: async () => tradeApi.cancelOrder(accountId, orderId, unlockCode || undefined),
    onSuccess: () => setStatus('CANCEL_REQUESTED')
  });

  const tradingAllowed = Boolean(prefs?.tradingEnabled);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Trade</h1>
        <p className="text-sm text-zinc-400">Trading is gated by server env + Settings toggle + optional unlock code.</p>
      </div>

      {!tradingAllowed && (
        <div className="rounded-lg border border-yellow-900/40 bg-yellow-950/20 p-4 text-sm text-yellow-100">
          Trading is disabled in Settings. Enable it under Settings to use preflight/place/cancel.
        </div>
      )}

      <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <div className="md:col-span-2">
            <div className="text-xs text-zinc-500">Symbol</div>
            <input value={symbol} onChange={e => setSymbol(e.target.value)} className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" />
          </div>
          <div>
            <div className="text-xs text-zinc-500">Side</div>
            <select value={side} onChange={e => setSide(e.target.value as any)} className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm">
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Type</div>
            <select value={orderType} onChange={e => setOrderType(e.target.value as any)} className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm">
              <option value="LIMIT">LIMIT</option>
              <option value="MARKET">MARKET</option>
            </select>
          </div>
          <div>
            <div className="text-xs text-zinc-500">Quantity</div>
            <input value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm" />
          </div>
          <div>
            <div className="text-xs text-zinc-500">Limit Price</div>
            <input value={limitPrice} onChange={e => setLimitPrice(e.target.value)} disabled={orderType !== 'LIMIT'} className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm disabled:opacity-50" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => preflightM.mutate()}
            disabled={!tradingAllowed || preflightM.isPending}
            className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm disabled:opacity-50"
          >
            {preflightM.isPending ? 'Preflighting…' : 'Preflight'}
          </button>
          <button
            onClick={() => placeM.mutate()}
            disabled={!tradingAllowed || placeM.isPending}
            className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm disabled:opacity-50"
          >
            {placeM.isPending ? 'Placing…' : 'Place Order'}
          </button>
          <button
            onClick={() => cancelM.mutate()}
            disabled={!tradingAllowed || cancelM.isPending}
            className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <div className="ml-auto text-xs text-zinc-500">Account: {accountId || '—'}</div>
        </div>

        <div className="rounded-md border border-zinc-900 bg-zinc-950 p-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-xs text-zinc-500">orderId</div>
              <div className="font-mono text-xs text-zinc-200">{orderId || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">status</div>
              <div className="text-zinc-100">{status || '—'}</div>
            </div>
          </div>
          {statusDetail && (
            <pre className="mt-3 overflow-auto rounded bg-zinc-950 text-xs text-zinc-300">{JSON.stringify(statusDetail, null, 2)}</pre>
          )}
        </div>

        {(preflightM.isError || placeM.isError || statusQ.isError) && (
          <div className="rounded-md border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-200">
            {String((preflightM.error as any)?.message || (placeM.error as any)?.message || (statusQ.error as any)?.message || 'Error')}
          </div>
        )}
      </div>
    </div>
  );
}
