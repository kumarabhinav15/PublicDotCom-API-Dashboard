import Link from 'next/link';
import { NavItem } from './SidebarItem';

export function Sidebar() {
  return (
    <aside className="border-r border-zinc-900 bg-zinc-950/60 p-4">
      <div className="mb-6">
        <Link href="/" className="text-lg font-semibold text-zinc-100">
          Public Dashboard
        </Link>
        <div className="text-xs text-zinc-400">Starter (mock-first)</div>
      </div>

      <nav className="space-y-1">
        <NavItem href="/" label="Overview" />
        <NavItem href="/watchlists" label="Watchlists" />
        <NavItem href="/options" label="Options" />
        <NavItem href="/trade" label="Trade" />
        <NavItem href="/orders" label="Order Blotter" />
        <NavItem href="/history" label="Ledger & History" />
        <NavItem href="/settings" label="Settings" />
      </nav>

      <div className="mt-8 text-xs text-zinc-500">
        Trading is gated by <code className="text-zinc-200">ENABLE_TRADING</code> (server) and the Settings toggle (DB).
        For additional safety, set <code className="text-zinc-200">TRADING_UNLOCK_CODE</code> and store it locally.
      </div>
    </aside>
  );
}
