'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export function NavItem({ href, label, disabled = false }: { href: string; label: string; disabled?: boolean }) {
  const pathname = usePathname();
  const active = pathname === href;

  const base = 'block rounded px-2 py-2 text-sm';
  const klass = clsx(base, {
    'bg-zinc-900 text-zinc-100': active,
    'text-zinc-300 hover:bg-zinc-900/50': !active && !disabled,
    'text-zinc-600 cursor-not-allowed': disabled
  });

  if (disabled) {
    return <div className={klass}>{label}</div>;
  }

  return (
    <Link className={klass} href={href}>
      {label}
    </Link>
  );
}
