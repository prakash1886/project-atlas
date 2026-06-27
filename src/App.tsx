import { useState, useEffect } from 'react';
import ReviewsView from './ReviewsView';

interface Opportunity {
  id: number;
  topic: string;
  trend_score: number;
  status: string;
}

export default function App() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [view, setView] = useState<'dashboard' | 'reviews'>('dashboard');

  useEffect(() => {
    // Simulated opportunities for frontend fallback
    setOpportunities([
      { id: 1, topic: 'Tendulkar vs McGrath', trend_score: 94, status: 'PENDING' },
      { id: 2, topic: 'Stoicism and Resilience', trend_score: 89, status: 'APPROVED' },
      { id: 3, topic: 'Why Nokia Failed', trend_score: 88, status: 'PENDING' }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <header className="border-b border-zinc-800 p-6 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md">
        <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-violet-500 bg-clip-text text-transparent">
          Project Atlas Dashboard
        </h1>
        <nav className="flex items-center gap-2">
          <button
            onClick={() => setView('dashboard')}
            className={`text-sm px-4 py-2 rounded-lg transition ${view === 'dashboard' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView('reviews')}
            className={`text-sm px-4 py-2 rounded-lg transition ${view === 'reviews' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Reviews
          </button>
        </nav>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Flywheel
        </div>
      </header>

      {view === 'reviews' ? (
        <ReviewsView />
      ) : (
      <main className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold text-zinc-200">Content Opportunities</h2>
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <div key={opp.id} className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl flex justify-between items-center hover:border-zinc-700 transition">
                <div>
                  <h3 className="font-medium text-lg text-zinc-100">{opp.topic}</h3>
                  <span className="text-sm px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 font-mono">
                    {opp.status}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">{opp.trend_score}</div>
                  <div className="text-xs text-zinc-500 font-mono">OPPORTUNITY</div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <aside className="space-y-6 bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-200">Flywheel Control</h2>
          <div className="space-y-4">
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition">
              Trigger Trend Scanner
            </button>
            <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-medium py-3 rounded-lg transition">
              Run Agent Swarm
            </button>
          </div>
        </aside>
      </main>
      )}
    </div>
  );
}
