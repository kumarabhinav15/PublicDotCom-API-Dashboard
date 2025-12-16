import type { OpenOrder } from '@/types/public';

export function OpenOrdersTable({ orders }: { orders: OpenOrder[] }) {
  return (
    <div className="bg-zinc-950/40 border border-zinc-900 rounded overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-zinc-950">
          <tr className="text-left text-zinc-400">
            <th className="p-3">Order ID</th>
            <th className="p-3">Symbol</th>
            <th className="p-3">Side</th>
            <th className="p-3">Type</th>
            <th className="p-3">Qty</th>
            <th className="p-3">Limit</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.orderId} className="border-t border-zinc-900">
              <td className="p-3 text-zinc-400">{o.orderId.slice(0, 8)}…</td>
              <td className="p-3 font-medium text-zinc-100">{o.symbol}</td>
              <td className="p-3 text-zinc-300">{o.side}</td>
              <td className="p-3 text-zinc-300">{o.orderType}</td>
              <td className="p-3 text-zinc-300">{o.quantity ?? '—'}</td>
              <td className="p-3 text-zinc-300">{fmtMoney(o.limitPrice?.amount)}</td>
              <td className="p-3 text-zinc-300">{o.status ?? '—'}</td>
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
