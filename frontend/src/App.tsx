import { useCallback, useEffect, useRef, useState } from 'react';
import { useStockPicks } from './hooks/useStockPicks';
import { StockCard } from './components/StockCard';
import { Header } from './components/Header';
import { CriteriaBar } from './components/CriteriaBar';
import { SessionHistory } from './components/SessionHistory';
import type { PickSnapshot } from './components/SessionHistory';

const REFRESH_INTERVAL_SECS = 5 * 60; // 5 minutes

function LoadingSkeleton(): JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-80 animate-pulse rounded-xl border border-gray-800 bg-gray-900" />
      ))}
    </div>
  );
}

export default function App(): JSX.Element {
  const { data, loading, error, refetch } = useStockPicks();
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL_SECS);
  const [snapshots, setSnapshots] = useState<PickSnapshot[]>([]);
  const [newTickers, setNewTickers] = useState<Set<string>>(new Set());
  const prevTickersRef = useRef<Set<string>>(new Set());

  // ── Countdown + auto-refresh ──────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          refetch();
          return REFRESH_INTERVAL_SECS;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [refetch]);

  const handleRefresh = useCallback(() => {
    refetch();
    setCountdown(REFRESH_INTERVAL_SECS);
  }, [refetch]);

  // ── Track new/exited tickers and build session history ────────────────────
  useEffect(() => {
    if (!data) { return; }

    const currentTickers = data.picks.map((p) => p.ticker);
    const currentSet = new Set(currentTickers);
    const incoming = new Set([...currentSet].filter((t) => !prevTickersRef.current.has(t)));
    const exits = new Set([...prevTickersRef.current].filter((t) => !currentSet.has(t)));

    setNewTickers(incoming);
    setSnapshots((prev) => {
      // Don't add a duplicate snapshot if tickers haven't changed
      if (prev.length > 0) {
        const lastTickers = prev[0].tickers.join(',');
        if (lastTickers === currentTickers.join(',')) { return prev; }
      }
      return [
        { time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }), tickers: currentTickers, newEntries: incoming, exits },
        ...prev.slice(0, 9),
      ];
    });

    prevTickersRef.current = currentSet;

    // Clear NEW badge after animation completes
    const timer = setTimeout(() => setNewTickers(new Set()), 2500);
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-950">
      <Header
        lastUpdated={data?.generatedAt ?? null}
        onRefresh={handleRefresh}
        loading={loading}
        countdown={countdown}
      />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Top 5 stocks expected to move{' '}
            <span className="text-green-400">+1% today</span>
          </h2>
          <p className="mt-3 text-gray-400">
            Screened every 5 minutes using momentum signals: volume spikes, intraday momentum,
            volatility breakouts, and liquidity filters.
          </p>
        </div>

        {/* Criteria */}
        {data && (
          <div className="mb-6">
            <CriteriaBar criteria={data.criteria} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-6 text-center">
            <p className="font-medium text-red-400">Failed to load picks</p>
            <p className="mt-1 text-sm text-red-500">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 rounded-lg bg-red-800 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && !error && <LoadingSkeleton />}

        {/* Stock grid */}
        {!loading && !error && data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.picks.map((stock, i) => (
              <StockCard
                key={stock.ticker}
                stock={stock}
                rank={i + 1}
                isNew={newTickers.has(stock.ticker)}
              />
            ))}
          </div>
        )}

        {/* Session history */}
        <SessionHistory snapshots={snapshots} />

        {/* Disclaimer */}
        <p className="mt-10 text-center text-xs text-gray-700">
          Not financial advice. Mock data only — connect a live Schwab data source before trading.
        </p>
      </main>
    </div>
  );
}
