'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, appApi } from '@/lib/apiClient';
import type { AuditResponse, PreferencesResponse } from '@/types/app';

export function Settings() {
  const qc = useQueryClient();

  const accountsQ = useQuery({ queryKey: ['accounts'], queryFn: () => api.getAccounts(), staleTime: 60_000 });
  const prefsQ = useQuery<PreferencesResponse>({ queryKey: ['prefs'], queryFn: () => appApi.getPreferences(), staleTime: 5_000 });
  const auditQ = useQuery<AuditResponse>({ queryKey: ['audit'], queryFn: () => appApi.getAudit(50), staleTime: 5_000 });

  const accounts = accountsQ.data?.accounts ?? [];
  const prefs = prefsQ.data?.preferences;

  const [tradingEnabled, setTradingEnabled] = useState(false);
  const [defaultAccountId, setDefaultAccountId] = useState<string>('');
  const [unlockCode, setUnlockCode] = useState<string>('');

  useEffect(() => {
    setTradingEnabled(Boolean(prefs?.tradingEnabled));
    setDefaultAccountId(prefs?.defaultAccountId || accounts[0]?.accountId || '');
  }, [prefs, accounts]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setUnlockCode(localStorage.getItem('tradingUnlockCode') || '');
  }, []);

  const savePrefsM = useMutation({
    mutationFn: () => appApi.updatePreferences({ tradingEnabled, defaultAccountId: defaultAccountId || null }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['prefs'] });
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-zinc-400">Preferences are stored in SQLite via Prisma. Unlock code is stored locally in your browser.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4 space-y-3">
          <div className="text-sm font-semibold">Account</div>
          <div>
            <div className="text-xs text-zinc-500">Default accountId (used across pages)</div>
            <select
              value={defaultAccountId}
              onChange={e => setDefaultAccountId(e.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
            >
              {accounts.map(a => (
                <option key={a.accountId} value={a.accountId}>{a.accountId} ({a.accountType})</option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-zinc-900" />

          <div className="text-sm font-semibold">Trading Safety</div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={tradingEnabled} onChange={e => setTradingEnabled(e.target.checked)} />
            <span>Enable trading in UI (DB toggle)</span>
          </label>
          <div className="text-xs text-zinc-500">
            Server must also set <code className="text-zinc-200">ENABLE_TRADING=true</code>. If <code className="text-zinc-200">TRADING_UNLOCK_CODE</code> is set, requests require header <code className="text-zinc-200">x-trading-unlock</code>.
          </div>

          <div>
            <div className="text-xs text-zinc-500">Unlock code (browser only)</div>
            <div className="flex gap-2 mt-1">
              <input
                value={unlockCode}
                onChange={e => setUnlockCode(e.target.value)}
                placeholder="Optional"
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none"
              />
              <button
                onClick={() => {
                  if (typeof window === 'undefined') return;
                  localStorage.setItem('tradingUnlockCode', unlockCode);
                }}
                className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm"
              >
                Save
              </button>
            </div>
          </div>

          <button
            onClick={() => savePrefsM.mutate()}
            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm"
          >
            {savePrefsM.isPending ? 'Saving…' : 'Save Preferences'}
          </button>

          {savePrefsM.isError && (
            <div className="rounded-md border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-200">
              {String((savePrefsM.error as any)?.message || 'Error saving')}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-zinc-900 bg-zinc-950/40 p-4">
          <div className="mb-3 text-sm font-semibold">Audit Log (last 50)</div>
          <div className="max-h-[520px] overflow-auto rounded-md border border-zinc-900">
            <table className="w-full text-sm">
              <thead className="text-xs text-zinc-500">
                <tr>
                  <th className="px-3 py-2 text-left">Time</th>
                  <th className="px-3 py-2 text-left">Event</th>
                  <th className="px-3 py-2 text-left">Payload</th>
                </tr>
              </thead>
              <tbody>
                {(auditQ.data?.rows ?? []).map(r => (
                  <tr key={r.id} className="border-t border-zinc-900">
                    <td className="px-3 py-2 text-xs text-zinc-400">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2">{r.eventType}</td>
                    <td className="px-3 py-2 text-xs text-zinc-500 font-mono truncate max-w-[360px]">{r.payload ?? ''}</td>
                  </tr>
                ))}
                {(!auditQ.data?.rows?.length) && (
                  <tr><td className="px-3 py-3 text-zinc-500" colSpan={3}>No audit events yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
