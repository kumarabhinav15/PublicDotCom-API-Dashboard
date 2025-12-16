import type { PortfolioPosition } from '@/types/public';

export function HoldingsTable({ positions }: { positions: PortfolioPosition[] }) {
  return (
    <div className="bg-zinc-950/40 border border-zinc-900 rounded overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-950">
          <tr className="text-left text-zinc-400">
            <th className="p-3">Symbol</th>
            <th className="p-3">Qty</th>
            <th className="p-3">Last</th>
            <th className="p-3">Market Value</th>
            <th className="p-3">Cost Basis</th>
            <th className="p-3">% Port</th>
            <th className="p-3">Total Gain</th>
            <th className="p-3">Daily P/L</th>
          </tr>
        </thead>
        <tbody>
          {positions.map(p => (
            <tr key={`${p.symbol}:${p.type}`} className="border-t border-zinc-900">
              <td className="p-3 font-medium text-zinc-100">{p.symbol}</td>
              <td className="p-3 text-zinc-300">{p.quantity}</td>
              <td className="p-3 text-zinc-300">{fmtMoney(p.lastPrice?.amount)}</td>
              <td className="p-3 text-zinc-300">{fmtMoney(p.marketValue?.amount)}</td>
              <td className="p-3 text-zinc-300">{fmtMoney(p.costBasis?.amount)}</td>
              <td className="p-3 text-zinc-300">{p.percentOfPortfolio ? `${Number(p.percentOfPortfolio).toFixed(2)}%` : '—'}</td>
              <td className="p-3 text-zinc-300">{fmtMoney(p.instrumentGain?.amount)}</td>
              <td className="p-3 text-zinc-300">{fmtMoney(p.positionDailyGain?.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function fmtMoney(amount?: string) {
  if (!amount) return '—';
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}
