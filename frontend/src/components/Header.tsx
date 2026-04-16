interface HeaderProps {
  lastUpdated: string | null;
  onRefresh: () => void;
  loading: boolean;
}

export function Header({ lastUpdated, onRefresh, loading }: HeaderProps): JSX.Element {
  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <header className="border-b border-gray-800 bg-gray-950/80 px-6 py-4 backdrop-blur-sm sticky top-0 z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
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

        <div className="flex items-center gap-4">
          {formattedTime && (
            <span className="hidden text-xs text-gray-500 sm:block">
              Updated {formattedTime}
            </span>
          )}
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
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
