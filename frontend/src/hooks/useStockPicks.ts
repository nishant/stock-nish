import { useCallback, useEffect, useState } from 'react';
import { fetchTopPicks } from '../api/stocks';
import type { StockPicksResponse } from '../types/stock';

interface UseStockPicksResult {
  data: StockPicksResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStockPicks(): UseStockPicksResult {
  const [data, setData] = useState<StockPicksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  // Stable reference — safe to use as useEffect dep in App
  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchTopPicks()
      .then((result) => {
        if (!cancelled) { setData(result); }
      })
      .catch((err: unknown) => {
        if (!cancelled) { setError(err instanceof Error ? err.message : 'Unknown error'); }
      })
      .finally(() => {
        if (!cancelled) { setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [tick]);

  return { data, loading, error, refetch };
}
