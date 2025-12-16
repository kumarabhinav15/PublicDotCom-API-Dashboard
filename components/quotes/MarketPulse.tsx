'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import type { InstrumentRef, QuotesResponse } from '@/types/public';

export function MarketPulse({ accountId, instruments }: { accountId: string; instruments: InstrumentRef[] }) {
  const q = useQuery<QuotesResponse>({
    queryKey: ['pulse', accountId, instruments],
    queryFn: () => api.getQuotes(accountId, instruments),
    enabled: Boolean(accountId && instruments.length),
    refetchInterval: 5000
  });

  const rows = (q.data?.quotes ?? []).slice(0, 12);

  return (
    <div className="border border-zinc-900 bg-zinc-950/40 rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Market Pulse</div>
        <div className="text-xs text-zinc-500">{q.isFetching ? 'Refreshing…' : 'Live'}</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {rows.map(r => (
          <div key={`${r.symbol}:${r.type}`} className="p-3 rounded bg-zinc-950 border border-zinc-900">
            <div className="text-sm font-medium text-zinc-100">{r.symbol}</div>
            <div className="text-sm text-zinc-300">{fmtMoney(r.last?.amount)}</div>
            <div className="text-xs text-zinc-500">{r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function fmtMoney(amount?: string) {
  if (!amount) return '—';
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}
