export interface PickSnapshot {
  time: string;
  tickers: string[];
  newEntries: Set<string>;
  exits: Set<string>;
}

interface SessionHistoryProps {
  snapshots: PickSnapshot[];
}

export function SessionHistory({ snapshots }: SessionHistoryProps): JSX.Element | null {
  if (snapshots.length < 2) { return null; }

  return (
    <div className="mt-10">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-px flex-1 bg-gray-800" />
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-600">
          Session Stream
        </h3>
        <div className="h-px flex-1 bg-gray-800" />
      </div>

      <div className="space-y-1.5">
        {snapshots.map((snap, i) => (
          <div
            key={`${snap.time}-${i}`}
            className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 transition-all ${
              i === 0
                ? 'border-gray-700 bg-gray-900'
                : 'border-gray-800/40 bg-gray-900/20'
            }`}
          >
            {/* Timestamp */}
            <span className="w-14 shrink-0 font-mono text-xs text-gray-600">{snap.time}</span>

            {/* Ticker chips */}
            <div className="flex flex-1 flex-wrap gap-1.5">
              {snap.tickers.map((ticker) => (
                <span
                  key={ticker}
                  className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium transition-all ${
                    snap.newEntries.has(ticker)
                      ? 'bg-green-900/40 text-green-400 ring-1 ring-green-500/40'
                      : 'bg-gray-800/80 text-gray-400'
                  }`}
                >
                  {ticker}
                  {snap.newEntries.has(ticker) && (
                    <svg className="h-2.5 w-2.5 text-green-500" viewBox="0 0 10 10" fill="currentColor">
                      <path d="M5 1 L9 9 L5 6 L1 9 Z" />
                    </svg>
                  )}
                </span>
              ))}

              {/* Show exits */}
              {snap.exits.size > 0 &&
                [...snap.exits].map((ticker) => (
                  <span
                    key={`exit-${ticker}`}
                    className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-gray-600 line-through opacity-50"
                  >
                    {ticker}
                  </span>
                ))}
            </div>

            {/* Badge */}
            {i === 0 ? (
              <span className="ml-auto shrink-0 rounded-full bg-green-900/30 px-2 py-0.5 text-[10px] font-medium text-green-500">
                NOW
              </span>
            ) : (
              <span className="ml-auto shrink-0 text-[10px] text-gray-700">
                {snapshots[i - 1] ? `→ ${snapshots[i - 1].newEntries.size} new` : ''}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 px-1">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500/50 ring-1 ring-green-500/40" />
          <span className="text-[10px] text-gray-600">entered top 5</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gray-700" />
          <span className="text-[10px] text-gray-600">held position</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gray-800 opacity-50" />
          <span className="text-[10px] text-gray-600">dropped out</span>
        </div>
      </div>
    </div>
  );
}
