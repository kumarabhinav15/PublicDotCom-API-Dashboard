'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/apiClient';
import type { HistoryResponse } from '@/types/public';

export function History() {
  const accountsQ = useQuery({ queryKey: ['accounts'], queryFn: () => api.getAccounts(), staleTime: 60_000 });
  const accountId = accountsQ.data?.accounts?.[0]?.accountId ?? '';

  const [pageToken, setPageToken] = useState<string | undefined>(undefined);

  const timeWindow = useMemo(() => {
    const end = new Date();
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { start: start.toISOString(), end: end.toISOString() };
  }, []);

  const historyQ = useQuery<HistoryResponse>({
    queryKey: ['history', accountId, pageToken],
    queryFn: () => api.getHistory(accountId, timeWindow.start, timeWindow.end, 50, pageToken),
    enabled: Boolean(accountId),
    keepPreviousData: true
  });

  const rows = historyQ.data?.events ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Orders & History</h1>
        <p className="text-sm text-zinc-400">Account history endpoint with pagination token support.</p>
      </div>

      <div className="bg-zinc-950/40 border border-zinc-900 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-950">
            <tr className="text-left text-zinc-400">
              <th className="p-3">Time</th>
              <th className="p-3">Type</th>
              <th className="p-3">Summary</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e, idx) => (
              <tr key={idx} className="border-t border-zinc-900">
                <td className="p-3 text-zinc-300">{e.timestamp ? new Date(e.timestamp).toLocaleString() : '—'}</td>
                <td className="p-3 text-zinc-300">{e.type ?? '—'}</td>
                <td className="p-3 text-zinc-300">{e.description ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="px-3 py-2 rounded bg-zinc-900 hover:bg-zinc-800 text-sm disabled:opacity-50"
          onClick={() => setPageToken(historyQ.data?.nextToken)}
          disabled={!historyQ.data?.nextToken}
        >
          Next page
        </button>
        <button
          className="px-3 py-2 rounded bg-zinc-900 hover:bg-zinc-800 text-sm"
          onClick={() => setPageToken(undefined)}
        >
          Reset
        </button>
        {historyQ.isFetching ? <span className="text-xs text-zinc-500">Loading…</span> : null}
      </div>
    </div>
  );
}
