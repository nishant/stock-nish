import { useStockPicks } from './hooks/useStockPicks';
import { StockCard } from './components/StockCard';
import { Header } from './components/Header';
import { CriteriaBar } from './components/CriteriaBar';

function LoadingSkeleton(): JSX.Element {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-64 animate-pulse rounded-xl border border-gray-800 bg-gray-900" />
      ))}
    </div>
  );
}

export default function App(): JSX.Element {
  const { data, loading, error, refetch } = useStockPicks();

  return (
    <div className="min-h-screen bg-gray-950">
      <Header lastUpdated={data?.generatedAt ?? null} onRefresh={refetch} loading={loading} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Hero */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Top 5 stocks expected to move <span className="text-green-400">+1% today</span>
          </h2>
          <p className="mt-3 text-gray-400">
            Screened daily using momentum signals: RSI crossovers, volume spikes, MA breakouts, and
            institutional flow.
          </p>
        </div>

        {/* Criteria */}
        {data && (
          <div className="mb-6">
            <CriteriaBar criteria={data.criteria} />
          </div>
        )}

        {/* Content */}
        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-6 text-center">
            <p className="font-medium text-red-400">Failed to load picks</p>
            <p className="mt-1 text-sm text-red-500">{error}</p>
            <button
              onClick={refetch}
              className="mt-4 rounded-lg bg-red-800 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Try again
            </button>
          </div>
        )}

        {loading && !error && <LoadingSkeleton />}

        {!loading && !error && data && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.picks.map((stock, i) => (
              <StockCard key={stock.ticker} stock={stock} rank={i + 1} />
            ))}
          </div>
        )}

        {/* Footer note */}
        <p className="mt-10 text-center text-xs text-gray-600">
          Not financial advice. Mock data only — connect a live data source before trading.
        </p>
      </main>
    </div>
  );
}
