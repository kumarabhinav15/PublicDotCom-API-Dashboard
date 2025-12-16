'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, appApi } from '@/lib/apiClient';
import { QuoteGrid } from '@/components/quotes/QuoteGrid';
import type { InstrumentRef } from '@/types/public';
import type { WatchlistsResponse } from '@/types/app';

const instrumentTypes = ['EQUITY', 'OPTION', 'INDEX'] as const;

export function Watchlists() {
  const qc = useQueryClient();
  const accountsQ = useQuery({ queryKey: ['accounts'], queryFn: () => api.getAccounts(), staleTime: 60_000 });
  const prefsQ = useQuery({ queryKey: ['prefs'], queryFn: () => appApi.getPreferences(), staleTime: 30_000 });

  const defaultAccountId = (prefsQ.data as any)?.preferences?.defaultAccountId as string | undefined;
  const accountId = defaultAccountId || accountsQ.data?.accounts?.[0]?.accountId || '';

  const watchlistsQ = useQuery<WatchlistsResponse>({
    queryKey: ['watchlists'],
    queryFn: () => appApi.getWatchlists(),
    staleTime: 5_000
  });

  const watchlists = watchlistsQ.data?.watchlists ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(() => {
    const id = selectedId ?? watchlists[0]?.id ?? null;
    return watchlists.find(w => w.id === id) ?? null;
  }, [selectedId, watchlists]);

  const instruments: InstrumentRef[] = useMemo(() => {
    return (selected?.items ?? []).map(i => ({ symbol: i.symbol, type: i.type as any }));
  }, [selected]);

  const createWatchlistM = useMutation({
    mutationFn: (name: string) => appApi.createWatchlist(name),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['watchlists'] });
    }
  });
  const deleteWatchlistM = useMutation({
    mutationFn: (watchlistId: string) => appApi.deleteWatchlist(watchlistId),
    onSuccess: async () => {
      setSelectedId(null);
      await qc.invalidateQueries({ queryKey: ['watchlists'] });
    }
  });
  const addItemM = useMutation({
    mutationFn: (payload: { watchlistId: string; symbol: string; type: string; notes?: string }) =>
      appApi.addWatchlistItem(payload.watchlistId, payload.symbol, payload.type, payload.notes),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['watchlists'] });
    }
  });
  const removeItemM = useMutation({
    mutationFn: (payload: { watchlistId: string; itemId: string }) => appApi.removeWatchlistItem(payload.watchlistId, payload.itemId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['watchlists'] });
    }
  });

  const [newListName, setNewListName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState<(typeof instrumentTypes)[number]>('EQUITY');
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Watchlists</h1>
        <p className="text-sm text-zinc-400">DB-backed watchlists with batch quotes (client polling).</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Lists</div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                value={newListName}
                onChange={e => setNewListName(e.target.value)}
                placeholder="New watchlist name"
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
              />
              <button
                onClick={() => {
                  const name = newListName.trim();
                  if (!name) return;
                  createWatchlistM.mutate(name);
                  setNewListName('');
                }}
                className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm"
              >
                Add
              </button>
            </div>

            <div className="space-y-1">
              {watchlists.map(w => (
                <button
                  key={w.id}
                  onClick={() => setSelectedId(w.id)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm ${
                    selected?.id === w.id ? 'bg-zinc-900' : 'hover:bg-zinc-950'
                  }`}
                >
                  <span className="truncate">{w.name}</span>
                  <span className="text-xs text-zinc-500">{w.items?.length ?? 0}</span>
                </button>
              ))}
            </div>

            {selected && watchlists.length > 1 && (
              <button
                onClick={() => deleteWatchlistM.mutate(selected.id)}
                className="mt-2 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900"
              >
                Delete Selected
              </button>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">{selected?.name ?? '—'}</div>
              <div className="text-xs text-zinc-500">Account: {accountId || '—'}</div>
            </div>
          </div>

          {selected ? (
            <>
              <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-5">
                <input
                  value={symbol}
                  onChange={e => setSymbol(e.target.value.toUpperCase())}
                  placeholder="Symbol (e.g., VUG)"
                  className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none md:col-span-2"
                />
                <select
                  value={type}
                  onChange={e => setType(e.target.value as any)}
                  className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
                >
                  {instrumentTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <input
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Notes (optional)"
                  className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
                />
                <button
                  onClick={() => {
                    const s = symbol.trim();
                    if (!s) return;
                    addItemM.mutate({ watchlistId: selected.id, symbol: s, type, notes: notes.trim() || undefined });
                    setSymbol('');
                    setNotes('');
                  }}
                  className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm"
                >
                  Add Instrument
                </button>
              </div>

              <div className="mb-4 rounded-lg border border-zinc-900">
                <table className="w-full text-sm">
                  <thead className="text-xs text-zinc-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Symbol</th>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Notes</th>
                      <th className="px-3 py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.items ?? []).map(i => (
                      <tr key={i.id} className="border-t border-zinc-900">
                        <td className="px-3 py-2 font-medium">{i.symbol}</td>
                        <td className="px-3 py-2 text-zinc-300">{i.type}</td>
                        <td className="px-3 py-2 text-zinc-400">{i.notes ?? ''}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => removeItemM.mutate({ watchlistId: selected.id, itemId: i.id })}
                            className="rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <QuoteGrid accountId={accountId} instruments={instruments} />
            </>
          ) : (
            <div className="text-sm text-zinc-400">No watchlist selected.</div>
          )}
        </div>
      </div>

      {watchlistsQ.isError && (
        <div className="rounded-md border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-200">
          Failed to load watchlists.
        </div>
      )}
    </div>
  );
}
