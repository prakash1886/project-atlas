import { useState, useEffect, useCallback } from 'react';
import { reviewsApi, UnauthorizedError, type ContentAsset } from './api';

const TOKEN_STORAGE_KEY = 'reviewer_token';

export default function ReviewsView() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [tokenInput, setTokenInput] = useState('');
  const [pending, setPending] = useState<ContentAsset[]>([]);
  const [notesById, setNotesById] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const rows = await reviewsApi.getPending(token);
      setPending(rows);
      setError(null);
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    refresh();
    const interval = setInterval(refresh, 10_000);
    return () => clearInterval(interval);
  }, [token, refresh]);

  const submitToken = () => {
    if (!tokenInput.trim()) return;
    localStorage.setItem(TOKEN_STORAGE_KEY, tokenInput.trim());
    setToken(tokenInput.trim());
  };

  const vote = async (id: number, decision: 'PASS' | 'REJECT') => {
    if (!token) return;
    try {
      await reviewsApi.vote(token, id, decision, notesById[id]);
      setPending((prev) => prev.filter((row) => row.id !== id));
    } catch (e) {
      if (e instanceof UnauthorizedError) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
      } else {
        setError(e instanceof Error ? e.message : String(e));
      }
    }
  };

  if (!token) {
    return (
      <div className="flex-1 max-w-md w-full mx-auto p-8 flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-zinc-200">Reviewer Login</h2>
        <input
          type="password"
          placeholder="Reviewer token"
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitToken()}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={submitToken}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-3xl w-full mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-zinc-200">Pending Editorial Review</h2>
        <button
          onClick={() => {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            setToken(null);
          }}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          Sign out
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {pending.length === 0 && <p className="text-zinc-500">Nothing waiting on review right now.</p>}

      <div className="space-y-4">
        {pending.map((row) => (
          <div key={row.id} className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-lg text-zinc-100">{row.topic}</h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                {row.status}
              </span>
            </div>
            <p className="text-xs text-zinc-500">Submitted {new Date(row.created_at).toLocaleString()}</p>
            <textarea
              placeholder="Notes (optional)"
              value={notesById[row.id] ?? ''}
              onChange={(e) => setNotesById((prev) => ({ ...prev, [row.id]: e.target.value }))}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
              rows={2}
            />
            <div className="flex gap-3">
              <button
                onClick={() => vote(row.id, 'PASS')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg transition"
              >
                PASS
              </button>
              <button
                onClick={() => vote(row.id, 'REJECT')}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-medium py-2 rounded-lg transition"
              >
                REJECT
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
