'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import type { InstrumentRef, QuotesResponse } from '@/types/public';

export function QuoteGrid({ accountId, instruments }: { accountId: string; instruments: InstrumentRef[] }) {
  const quotesQ = useQuery<QuotesResponse>({
    queryKey: ['quotes', accountId, instruments],
    queryFn: () => api.getQuotes(accountId, instruments),
    enabled: Boolean(accountId && instruments.length),
    refetchInterval: 3000
  });

  const rows = quotesQ.data?.quotes ?? [];

  return (
    <div className="bg-zinc-950/40 border border-zinc-900 rounded overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-950">
          <tr className="text-left text-zinc-400">
            <th className="p-3">Symbol</th>
            <th className="p-3">Last</th>
            <th className="p-3">Bid</th>
            <th className="p-3">Ask</th>
            <th className="p-3">Volume</th>
            <th className="p-3">As of</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(q => (
            <tr key={`${q.symbol}:${q.type}`} className="border-t border-zinc-900">
              <td className="p-3 font-medium text-zinc-100">{q.symbol}</td>
              <td className="p-3 text-zinc-300">{fmtMoney(q.last?.amount)}</td>
              <td className="p-3 text-zinc-300">{fmtMoney(q.bid?.amount)}</td>
              <td className="p-3 text-zinc-300">{fmtMoney(q.ask?.amount)}</td>
              <td className="p-3 text-zinc-300">{q.volume ?? '—'}</td>
              <td className="p-3 text-zinc-500">{q.timestamp ? new Date(q.timestamp).toLocaleTimeString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="px-3 py-2 text-xs text-zinc-500 border-t border-zinc-900">
        {quotesQ.isFetching ? 'Refreshing…' : 'Up to date'}
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
