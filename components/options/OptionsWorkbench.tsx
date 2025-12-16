'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api, appApi } from '@/lib/apiClient';
import type { InstrumentRef, OptionChainResponse, OptionExpirationsResponse, GreeksResponse } from '@/types/public';

export function OptionsWorkbench() {
  const accountsQ = useQuery({ queryKey: ['accounts'], queryFn: () => api.getAccounts(), staleTime: 60_000 });
  const prefsQ = useQuery({ queryKey: ['prefs'], queryFn: () => appApi.getPreferences(), staleTime: 30_000 });
  const defaultAccountId = (prefsQ.data as any)?.preferences?.defaultAccountId as string | undefined;
  const accountId = defaultAccountId || accountsQ.data?.accounts?.[0]?.accountId || '';

  const [symbol, setSymbol] = useState('SPY');
  const instrument: InstrumentRef = useMemo(() => ({ symbol, type: 'EQUITY' }), [symbol]);

  const expirationsQ = useQuery<OptionExpirationsResponse>({
    queryKey: ['option-expirations', accountId, instrument],
    queryFn: () => api.getOptionExpirations(accountId, instrument),
    enabled: Boolean(accountId),
    staleTime: 30_000
  });

  const [expiration, setExpiration] = useState('');
  const expirationDates = expirationsQ.data?.expirationDates ?? [];
  useEffect(() => {
    if (!expiration && expirationDates.length) {
      setExpiration(expirationDates[0] ?? '');
    }
  }, [expiration, expirationDates]);

  const chainQ = useQuery<OptionChainResponse>({
    queryKey: ['option-chain', accountId, instrument, expiration],
    queryFn: () => api.getOptionChain(accountId, instrument, expiration),
    enabled: Boolean(accountId && expiration),
    staleTime: 30_000
  });

  const [greeksByOsi, setGreeksByOsi] = useState<Record<string, any>>({});
  const [greeksProgress, setGreeksProgress] = useState<{ done: number; total: number } | null>(null);

  const loadGreeksM = useMutation({
    mutationFn: async () => {
      const calls = chainQ.data?.calls ?? [];
      const puts = chainQ.data?.puts ?? [];
      const osiSymbols = [...calls, ...puts].map(c => c.osiSymbol).filter(Boolean);
      const total = osiSymbols.length;
      setGreeksProgress({ done: 0, total });

      const chunkSize = 200;
      const results: any[] = [];
      for (let i = 0; i < osiSymbols.length; i += chunkSize) {
        const chunk = osiSymbols.slice(i, i + chunkSize);
        const res = await fetch('/api/public/options/greeks', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ accountId, osiSymbols: chunk })
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || `HTTP ${res.status}`);
        }
        const json = (await res.json()) as GreeksResponse;
        results.push(...(json.greeks ?? []));
        setGreeksProgress({ done: Math.min(i + chunkSize, total), total });
      }

      const map: Record<string, any> = {};
      for (const g of results) map[g.osiSymbol] = g;
      setGreeksByOsi(map);
      setGreeksProgress(null);
      return results;
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Options</h1>
        <p className="text-sm text-zinc-400">Expirations, chain, and greeks (batched).</p>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm text-zinc-400">Underlying</label>
        <input
          value={symbol}
          onChange={e => setSymbol(e.target.value.toUpperCase())}
          className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm w-32"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-zinc-950/40 border border-zinc-900 rounded p-4">
          <div className="text-sm text-zinc-400 mb-2">Expirations</div>
          <select
            value={expiration}
            onChange={e => setExpiration(e.target.value)}
            className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
          >
            {(expirationDates ?? []).map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="bg-zinc-950/40 border border-zinc-900 rounded p-4">
          <div className="text-sm text-zinc-400 mb-2">Chain (preview)</div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-zinc-500">Calls: {chainQ.data?.calls?.length ?? 0} | Puts: {chainQ.data?.puts?.length ?? 0}</div>
            <button
              onClick={() => loadGreeksM.mutate()}
              disabled={!chainQ.data || loadGreeksM.isPending}
              className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs disabled:opacity-50"
            >
              {loadGreeksM.isPending ? 'Loading Greeks…' : 'Load Greeks'}
            </button>
          </div>

          {greeksProgress && (
            <div className="mb-3 text-xs text-zinc-400">Greeks progress: {greeksProgress.done}/{greeksProgress.total}</div>
          )}

          {chainQ.data ? (
            <div className="max-h-[420px] overflow-auto rounded-md border border-zinc-900">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-zinc-950 text-xs text-zinc-500">
                  <tr>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">OSI</th>
                    <th className="px-3 py-2 text-right">Bid</th>
                    <th className="px-3 py-2 text-right">Ask</th>
                    <th className="px-3 py-2 text-right">Δ</th>
                    <th className="px-3 py-2 text-right">Θ</th>
                    <th className="px-3 py-2 text-right">IV</th>
                  </tr>
                </thead>
                <tbody>
                  {chainQ.data.calls.slice(0, 30).map(c => {
                    const g = greeksByOsi[c.osiSymbol];
                    return (
                      <tr key={c.osiSymbol} className="border-t border-zinc-900">
                        <td className="px-3 py-2 text-zinc-300">CALL</td>
                        <td className="px-3 py-2 font-mono text-xs">{c.osiSymbol}</td>
                        <td className="px-3 py-2 text-right">{c.bid?.amount ?? '—'}</td>
                        <td className="px-3 py-2 text-right">{c.ask?.amount ?? '—'}</td>
                        <td className="px-3 py-2 text-right">{g?.delta ?? '—'}</td>
                        <td className="px-3 py-2 text-right">{g?.theta ?? '—'}</td>
                        <td className="px-3 py-2 text-right">{g?.impliedVolatility ?? '—'}</td>
                      </tr>
                    );
                  })}
                  {chainQ.data.puts.slice(0, 30).map(c => {
                    const g = greeksByOsi[c.osiSymbol];
                    return (
                      <tr key={c.osiSymbol} className="border-t border-zinc-900">
                        <td className="px-3 py-2 text-zinc-300">PUT</td>
                        <td className="px-3 py-2 font-mono text-xs">{c.osiSymbol}</td>
                        <td className="px-3 py-2 text-right">{c.bid?.amount ?? '—'}</td>
                        <td className="px-3 py-2 text-right">{c.ask?.amount ?? '—'}</td>
                        <td className="px-3 py-2 text-right">{g?.delta ?? '—'}</td>
                        <td className="px-3 py-2 text-right">{g?.theta ?? '—'}</td>
                        <td className="px-3 py-2 text-right">{g?.impliedVolatility ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-zinc-500">No chain loaded yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
