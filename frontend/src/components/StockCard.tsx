import type { Stock } from '../types/stock';

interface StockCardProps {
  stock: Stock;
  rank: number;
}

function formatPrice(price: number): string {
  return price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function formatMarketCap(cap: number): string {
  if (cap >= 1_000_000_000_000) {
    return `$${(cap / 1_000_000_000_000).toFixed(1)}T`;
  }
  if (cap >= 1_000_000_000) {
    return `$${(cap / 1_000_000_000).toFixed(1)}B`;
  }
  return `$${(cap / 1_000_000).toFixed(0)}M`;
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000) {
    return `${(vol / 1_000_000).toFixed(1)}M`;
  }
  return `${(vol / 1_000).toFixed(0)}K`;
}

function confidenceColor(score: number): string {
  if (score >= 85) {
    return 'text-green-400';
  }
  if (score >= 70) {
    return 'text-yellow-400';
  }
  return 'text-orange-400';
}

function confidenceBg(score: number): string {
  if (score >= 85) {
    return 'bg-green-400';
  }
  if (score >= 70) {
    return 'bg-yellow-400';
  }
  return 'bg-orange-400';
}

export function StockCard({ stock, rank }: StockCardProps): JSX.Element {
  const isUp = stock.change >= 0;

  return (
    <div className="group relative rounded-xl border border-gray-800 bg-gray-900 p-5 transition-all duration-200 hover:border-gray-600 hover:bg-gray-800/80">
      {/* Rank badge */}
      <div className="absolute -left-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-gray-300 ring-2 ring-gray-950">
        #{rank}
      </div>

      {/* Header row */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white">{stock.ticker}</span>
            <span className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
              {stock.sector}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-400">{stock.name}</p>
        </div>

        {/* Confidence score */}
        <div className="text-right">
          <div className={`text-2xl font-bold ${confidenceColor(stock.confidenceScore)}`}>
            {stock.confidenceScore}
          </div>
          <div className="text-xs text-gray-500">confidence</div>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
        <div
          className={`h-full rounded-full transition-all ${confidenceBg(stock.confidenceScore)}`}
          style={{ width: `${stock.confidenceScore}%` }}
        />
      </div>

      {/* Price row */}
      <div className="mb-4 flex items-baseline gap-3">
        <span className="text-2xl font-semibold text-white">{formatPrice(stock.price)}</span>
        <span className={`flex items-center gap-1 text-sm font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
          <span className="text-gray-500">
            ({isUp ? '+' : ''}{stock.change.toFixed(2)})
          </span>
        </span>
      </div>

      {/* Stats grid */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-800/60 px-3 py-2">
          <p className="text-xs text-gray-500">Volume</p>
          <p className="text-sm font-medium text-gray-200">{formatVolume(stock.volume)}</p>
        </div>
        <div className="rounded-lg bg-gray-800/60 px-3 py-2">
          <p className="text-xs text-gray-500">Market Cap</p>
          <p className="text-sm font-medium text-gray-200">{formatMarketCap(stock.marketCap)}</p>
        </div>
      </div>

      {/* Signals */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Signals
        </p>
        <ul className="space-y-1">
          {stock.signals.map((signal) => (
            <li key={signal} className="flex items-center gap-2 text-xs text-gray-300">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
              {signal}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
