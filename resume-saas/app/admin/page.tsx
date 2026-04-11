'use client';
import { useState } from 'react';

export default function AdminPage() {
  const [count, setCount] = useState(5);
  const [codes, setCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError('');
    setCodes([]);
    try {
      const res = await fetch('/api/admin/generate-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setCodes(data.codes);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 w-full max-w-md">
        <h1 className="text-xl font-black text-slate-800 mb-1">Generate promo codes</h1>
        <p className="text-sm text-slate-500 mb-6">One-time use — each code unlocks one resume for free.</p>

        <div className="flex gap-3 mb-4">
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            className="w-24 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={generate}
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-2 text-sm transition-all disabled:opacity-60"
          >
            {loading ? 'Generating…' : `Generate ${count} code${count !== 1 ? 's' : ''}`}
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        {codes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700">{codes.length} codes ready</p>
              <button onClick={copyAll} className="text-xs text-indigo-600 hover:underline font-semibold">
                {copied ? '✓ Copied!' : 'Copy all'}
              </button>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm space-y-1 max-h-64 overflow-y-auto">
              {codes.map(c => (
                <p key={c} className="text-green-400">{c}</p>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">Share each code once. They expire immediately after use.</p>
          </div>
        )}
      </div>
    </div>
  );
}
