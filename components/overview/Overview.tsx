'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tile } from '@/components/ui/Tile';
import { HoldingsTable } from '@/components/tables/HoldingsTable';
import { OpenOrdersTable } from '@/components/tables/OpenOrdersTable';
import { MarketPulse } from '@/components/quotes/MarketPulse';
import { api } from '@/lib/apiClient';
import type { PortfolioV2Response } from '@/types/public';

export function Overview() {
  const [accountId, setAccountId] = useState<string>('');

  const accountsQ = useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.getAccounts(),
    staleTime: 60_000
  });

  const resolvedAccountId = useMemo(() => {
    if (accountId) return accountId;
    const first = accountsQ.data?.accounts?.[0]?.accountId;
    return first ?? '';
  }, [accountId, accountsQ.data]);

  const portfolioQ = useQuery<PortfolioV2Response>({
    queryKey: ['portfolio', resolvedAccountId],
    queryFn: () => api.getPortfolio(resolvedAccountId),
    enabled: Boolean(resolvedAccountId),
    refetchInterval: 15_000
  });

  const p = portfolioQ.data;

  const topSymbols = useMemo(() => {
    const base = (p?.positions ?? []).slice(0, 10).map(x => ({ symbol: x.symbol, type: x.type }));
    const pulse = [
      { symbol: 'SPY', type: 'EQUITY' as const },
      { symbol: 'QQQ', type: 'EQUITY' as const },
      { symbol: 'IWM', type: 'EQUITY' as const }
    ];
    const uniq = new Map<string, { symbol: string; type: any }>();
    [...pulse, ...base].forEach(i => uniq.set(`${i.symbol}:${i.type}`, i));
    return [...uniq.values()].slice(0, 25);
  }, [p]);

  const loading = accountsQ.isLoading || portfolioQ.isLoading;
  const err = (accountsQ.error as Error | undefined) ?? (portfolioQ.error as Error | undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Overview</h1>
          <p className="text-sm text-zinc-400">
            Portfolio snapshot, buying power, open orders, and market pulse. Mock data is enabled by default.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-zinc-400">Account</label>
          <select
            value={resolvedAccountId}
            onChange={e => setAccountId(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-sm"
          >
            {(accountsQ.data?.accounts ?? []).map(a => (
              <option key={a.accountId} value={a.accountId}>
                {a.accountType} ({a.accountId.slice(0, 6)}…)
              </option>
            ))}
          </select>
        </div>
      </div>

      {err ? (
        <div className="p-4 bg-red-950/40 border border-red-900 rounded">
          <div className="font-medium">Error</div>
          <div className="text-sm text-red-200">{err.message}</div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Tile title="Net Liquidation" value={fmtMoney(p?.equityValue?.amount)} loading={loading} />
        <Tile title="Buying Power" value={fmtMoney(p?.buyingPower?.amount)} loading={loading} />
        <Tile title="Daily P/L" value={fmtMoney(sumDaily(p))} loading={loading} />
        <Tile title="Open Orders" value={String((p?.openOrders ?? []).length)} loading={loading} />
      </div>

      <MarketPulse accountId={resolvedAccountId} instruments={topSymbols} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Holdings</h2>
          <HoldingsTable positions={p?.positions ?? []} />
        </div>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Open Orders</h2>
          <OpenOrdersTable orders={p?.openOrders ?? []} />
        </div>
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

function sumDaily(p?: PortfolioV2Response) {
  if (!p?.positions?.length) return '0';
  const total = p.positions.reduce((acc, x) => acc + (Number(x.positionDailyGain?.amount ?? '0') || 0), 0);
  return String(total);
}
