'use client';

import { useEffect, useState } from 'react';

export function Topbar() {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="border-b border-zinc-900 bg-zinc-950/40 px-6 py-3 flex items-center justify-between">
      <div className="text-sm text-zinc-300">
        Monitoring dashboard (read-only starter)
      </div>
      <div className="text-xs text-zinc-500">
        {now.toLocaleString()}
      </div>
    </header>
  );
}
