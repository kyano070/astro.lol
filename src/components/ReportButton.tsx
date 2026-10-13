'use client';

import { useState } from 'react';
import { FaFlag, FaXmark } from 'react-icons/fa6';
import { REPORT_REASONS, type ReportReason } from '@/lib/constants';

export default function ReportButton({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>('spam');
  const [details, setDetails] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending');
    setError('');
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, reason, details }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'Could not send your report.');
      setState('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your report.');
      setState('idle');
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 transition hover:bg-white/20"
        aria-label="Report this profile"
      >
        <FaFlag aria-hidden /> Report
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Report profile"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-ink-900 p-5 text-left text-zinc-200 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Report @{username}</h2>
              <button onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white">
                <FaXmark />
              </button>
            </div>

            {state === 'done' ? (
              <p className="text-sm text-zinc-300">Thanks — your report was sent and will be reviewed.</p>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <div>
                  <label className="label" htmlFor="reason">Reason</label>
                  <select id="reason" className="input" value={reason} onChange={(e) => setReason(e.target.value as ReportReason)}>
                    {REPORT_REASONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="details">Details (optional)</label>
                  <textarea id="details" className="input min-h-24 resize-y" maxLength={500} value={details} onChange={(e) => setDetails(e.target.value)} />
                </div>
                {error && <p className="text-sm text-rose-400">{error}</p>}
                <button className="btn-primary w-full" disabled={state === 'sending'}>
                  {state === 'sending' ? 'Sending…' : 'Send report'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
