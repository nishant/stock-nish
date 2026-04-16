import type { StockPicksResponse } from '../types/stock';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export async function fetchTopPicks(): Promise<StockPicksResponse> {
  const res = await fetch(`${BASE_URL}/api/stocks/picks`);
  if (!res.ok) {
    throw new Error(`Failed to fetch picks: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<StockPicksResponse>;
}
