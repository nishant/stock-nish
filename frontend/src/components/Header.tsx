interface HeaderProps {
  lastUpdated: string | null;
  onRefresh: () => void;
  loading: boolean;
  countdown: number; // seconds until next auto-refresh
}

function formatCountdown(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function Header({ lastUpdated, onRefresh, loading, countdown }: HeaderProps): JSX.Element {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null;

  const isImminent = countdown <= 30;

  return (
    <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950/90 px-6 py-4 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none text-white">stock-nish</h1>
            <p className="text-xs text-gray-500">Daily momentum picks</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Last updated */}
          {formattedTime && (
            <span className="hidden text-xs text-gray-600 sm:block">
              Updated {formattedTime}
            </span>
          )}

          {/* Countdown chip */}
          <div
            className={`hidden items-center gap-1.5 rounded-full border px-3 py-1 text-xs sm:flex ${
              isImminent
                ? 'border-green-800/60 bg-green-950/40 text-green-400'
                : 'border-gray-800 bg-gray-900 text-gray-500'
            }`}
          >
            <svg
              className={`h-3 w-3 ${isImminent ? 'text-green-400' : 'text-gray-600'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="tabular-nums">
              {loading ? 'scanning…' : `next scan ${formatCountdown(countdown)}`}
            </span>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-gray-500 hover:bg-gray-700 disabled:opacity-50"
          >
            <svg
              className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Simulate refresh
          </button>
        </div>
      </div>
    </header>
  );
}
