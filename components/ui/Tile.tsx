export function Tile({ title, value, loading }: { title: string; value: string; loading?: boolean }) {
  return (
    <div className="border border-zinc-900 bg-zinc-950/40 rounded p-4">
      <div className="text-xs text-zinc-400">{title}</div>
      <div className="mt-1 text-xl font-semibold">
        {loading ? <span className="text-zinc-600">…</span> : value}
      </div>
    </div>
  );
}
