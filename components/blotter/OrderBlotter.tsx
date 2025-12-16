'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, appApi } from '@/lib/apiClient';
import type { OrderTrackingResponse } from '@/types/app';

function formatTs(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export function OrderBlotter() {
  const accountsQ = useQuery({ queryKey: ['accounts'], queryFn: () => api.getAccounts(), staleTime: 60_000 });
  const prefsQ = useQuery({ queryKey: ['prefs'], queryFn: () => appApi.getPreferences(), staleTime: 30_000 });
  const defaultAccountId = (prefsQ.data as any)?.preferences?.defaultAccountId as string | undefined;
  const accountId = defaultAccountId || accountsQ.data?.accounts?.[0]?.accountId || '';

  const portfolioQ = useQuery({
    queryKey: ['portfolio', accountId],
    queryFn: () => api.getPortfolio(accountId),
    enabled: Boolean(accountId),
    refetchInterval: 10_000
  });

  const trackedQ = useQuery<OrderTrackingResponse>({
    queryKey: ['order-tracking', accountId],
    queryFn: () => appApi.getOrderTracking(200, accountId),
    enabled: true,
    refetchInterval: 5_000
  });

  const openOrders = portfolioQ.data?.openOrders ?? [];
  const tracked = trackedQ.data?.rows ?? [];

  const trackedById = useMemo(() => {
    const m = new Map<string, any>();
    for (const r of tracked) m.set(r.orderId, r);
    return m;
  }, [tracked]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Order Blotter</h1>
        <p className="text-sm text-zinc-400">
          Consolidated view: Public open orders (portfolio snapshot) plus locally tracked submissions and status.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Account</div>
            <div className="text-xs text-zinc-500">{accountId || '—'}</div>
          </div>
          <div className="text-xs text-zinc-500">Refresh: open orders 10s, tracked 5s</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4">
          <div className="mb-3 text-sm font-semibold">Public Open Orders</div>
          <div className="rounded-md border border-zinc-900 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-zinc-500">
                <tr>
                  <th className="px-3 py-2 text-left">Order ID</th>
                  <th className="px-3 py-2 text-left">Symbol</th>
                  <th className="px-3 py-2 text-left">Side</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-right">Qty</th>
                  <th className="px-3 py-2 text-right">Limit</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {openOrders.length === 0 ? (
                  <tr><td className="px-3 py-3 text-zinc-500" colSpan={7}>No open orders.</td></tr>
                ) : openOrders.map(o => (
                  <tr key={o.orderId} className="border-t border-zinc-900">
                    <td className="px-3 py-2 font-mono text-xs">{o.orderId}</td>
                    <td className="px-3 py-2">{o.symbol}</td>
                    <td className="px-3 py-2">{o.side}</td>
                    <td className="px-3 py-2">{o.orderType}</td>
                    <td className="px-3 py-2 text-right">{o.quantity ?? '—'}</td>
                    <td className="px-3 py-2 text-right">{o.limitPrice?.amount ?? '—'}</td>
                    <td className="px-3 py-2">
                      {o.status ?? '—'}
                      {trackedById.has(o.orderId) && (
                        <span className="ml-2 rounded bg-zinc-900 px-2 py-0.5 text-xs text-zinc-300">tracked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4">
          <div className="mb-3 text-sm font-semibold">Local Order Tracking</div>
          <div className="rounded-md border border-zinc-900 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-zinc-500">
                <tr>
                  <th className="px-3 py-2 text-left">Updated</th>
                  <th className="px-3 py-2 text-left">Order ID</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {tracked.length === 0 ? (
                  <tr><td className="px-3 py-3 text-zinc-500" colSpan={4}>No locally tracked orders yet.</td></tr>
                ) : tracked.map(r => {
                  let summary = '';
                  try {
                    const payload = r.payload ? JSON.parse(r.payload) : null;
                    summary = payload?.instrument?.symbol ? `${payload.instrument.symbol} ${payload.orderSide ?? ''} ${payload.orderType ?? ''}` : '';
                  } catch {
                    summary = '';
                  }
                  return (
                    <tr key={r.id} className="border-t border-zinc-900">
                      <td className="px-3 py-2 text-xs text-zinc-400">{formatTs(r.updatedAt)}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.orderId}</td>
                      <td className="px-3 py-2">{r.status}</td>
                      <td className="px-3 py-2 text-zinc-400">{summary || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {(portfolioQ.isError || trackedQ.isError) && (
        <div className="rounded-md border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-200">
          {String((portfolioQ.error as any)?.message || (trackedQ.error as any)?.message || 'Error')}
        </div>
      )}
    </div>
  );
}
