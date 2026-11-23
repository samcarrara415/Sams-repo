'use client';
import { useState } from 'react';

export default function PromoCodeForm() {
  const [count, setCount] = useState(5);
  const [codes, setCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
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
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setCodes(data.codes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  async function copyAll() {
    await navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <form onSubmit={generate} className="flex gap-3 mb-4">
        <label className="sr-only" htmlFor="count">Number of codes</label>
        <input
          id="count"
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={e => setCount(Number(e.target.value))}
          className="input w-24"
        />
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Generating...' : `Generate ${count} code${count === 1 ? '' : 's'}`}
        </button>
      </form>

      {error && <p className="text-sm text-red-700 mb-3">{error}</p>}

      {codes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">{codes.length} new codes</p>
            <button onClick={copyAll} className="text-sm text-brand-700 hover:underline">
              {copied ? 'Copied' : 'Copy all'}
            </button>
          </div>
          <pre className="bg-slate-50 border border-slate-200 rounded-md p-3 text-sm max-h-64 overflow-y-auto">
            {codes.join('\n')}
          </pre>
        </div>
      )}
    </>
  );
}
