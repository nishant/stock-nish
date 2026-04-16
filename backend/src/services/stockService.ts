import { Stock, StockPicksResponse } from '../types/stock';

// Mock data — replace with real API (e.g. Polygon.io, Alpaca, Yahoo Finance) when ready.
// These stocks are seeded with signals commonly used to screen for short-term momentum:
// - RSI crossover (oversold recovery)
// - Volume spike vs 10-day avg
// - Positive earnings surprise
// - Analyst upgrade
// - Breakout above 50-day MA

const MOCK_STOCKS: Stock[] = [
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 875.4,
    change: 12.3,
    changePercent: 1.43,
    volume: 48_200_000,
    marketCap: 2_160_000_000_000,
    sector: 'Technology',
    confidenceScore: 91,
    signals: ['Volume spike +180%', 'Breakout above 50-day MA', 'Analyst upgrade: Buy → Strong Buy'],
  },
  {
    ticker: 'SMCI',
    name: 'Super Micro Computer',
    price: 312.75,
    change: 8.9,
    changePercent: 2.93,
    volume: 22_500_000,
    marketCap: 18_300_000_000,
    sector: 'Technology',
    confidenceScore: 87,
    signals: ['RSI crossover (oversold → neutral)', 'Positive earnings surprise +12%', 'Volume spike +140%'],
  },
  {
    ticker: 'META',
    name: 'Meta Platforms',
    price: 502.1,
    change: 6.7,
    changePercent: 1.35,
    volume: 19_800_000,
    marketCap: 1_280_000_000_000,
    sector: 'Communication Services',
    confidenceScore: 83,
    signals: ['Breakout above 200-day MA', 'Institutional accumulation', 'Bullish MACD crossover'],
  },
  {
    ticker: 'AMD',
    name: 'Advanced Micro Devices',
    price: 158.9,
    change: 2.4,
    changePercent: 1.53,
    volume: 35_100_000,
    marketCap: 257_000_000_000,
    sector: 'Technology',
    confidenceScore: 79,
    signals: ['High short interest + catalyst', 'Volume spike +90%', 'New product launch catalyst'],
  },
  {
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    price: 241.5,
    change: 3.1,
    changePercent: 1.3,
    volume: 82_000_000,
    marketCap: 768_000_000_000,
    sector: 'Consumer Discretionary',
    confidenceScore: 74,
    signals: ['RSI crossover (oversold → neutral)', 'Support level bounce', 'Options flow bullish'],
  },
];

export function getTopPicks(): StockPicksResponse {
  // TODO: Replace with real screening logic against live market data.
  // Screening criteria for ≥1% daily move candidates:
  // 1. Filter universe to stocks with avg daily volume > 1M (liquidity)
  // 2. Compute RSI(14) — flag oversold recoveries (RSI crossing 30→40)
  // 3. Check volume ratio: today / 10-day avg > 1.5
  // 4. Check price vs 50-day MA breakout
  // 5. Score each signal, rank by composite confidence score
  // 6. Return top 5

  const sorted = [...MOCK_STOCKS].sort((a, b) => b.confidenceScore - a.confidenceScore);
  const top5 = sorted.slice(0, 5);

  return {
    picks: top5,
    generatedAt: new Date().toISOString(),
    criteria: 'RSI crossover, volume spike >50%, 50-day MA breakout, institutional flow',
  };
}
