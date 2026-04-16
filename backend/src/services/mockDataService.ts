import type { Stock, StockPicksResponse, IntradayPoint } from '../types/stock';

interface StockProfile {
  ticker: string;
  name: string;
  basePrice: number;
  marketCap: number;
  sector: string;
  avgVolume10d: number;
}

const STOCK_POOL: StockProfile[] = [
  { ticker: 'AAPL', name: 'Apple Inc', basePrice: 178.5, marketCap: 2_730_000_000_000, sector: 'Technology', avgVolume10d: 55_000_000 },
  { ticker: 'MSFT', name: 'Microsoft Corporation', basePrice: 415.0, marketCap: 3_080_000_000_000, sector: 'Technology', avgVolume10d: 22_000_000 },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', basePrice: 875.4, marketCap: 2_160_000_000_000, sector: 'Technology', avgVolume10d: 45_000_000 },
  { ticker: 'AMD', name: 'Advanced Micro Devices', basePrice: 158.9, marketCap: 257_000_000_000, sector: 'Technology', avgVolume10d: 52_000_000 },
  { ticker: 'META', name: 'Meta Platforms Inc', basePrice: 502.1, marketCap: 1_280_000_000_000, sector: 'Communication Services', avgVolume10d: 20_000_000 },
  { ticker: 'GOOGL', name: 'Alphabet Inc', basePrice: 168.2, marketCap: 2_080_000_000_000, sector: 'Communication Services', avgVolume10d: 25_000_000 },
  { ticker: 'AMZN', name: 'Amazon.com Inc', basePrice: 184.5, marketCap: 1_930_000_000_000, sector: 'Consumer Discretionary', avgVolume10d: 35_000_000 },
  { ticker: 'TSLA', name: 'Tesla Inc', basePrice: 241.5, marketCap: 768_000_000_000, sector: 'Consumer Discretionary', avgVolume10d: 80_000_000 },
  { ticker: 'BAC', name: 'Bank of America Corp', basePrice: 47.2, marketCap: 375_000_000_000, sector: 'Financials', avgVolume10d: 43_000_000 },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co', basePrice: 197.3, marketCap: 568_000_000_000, sector: 'Financials', avgVolume10d: 12_000_000 },
  { ticker: 'SMCI', name: 'Super Micro Computer', basePrice: 312.75, marketCap: 18_300_000_000, sector: 'Technology', avgVolume10d: 25_000_000 },
  { ticker: 'PLTR', name: 'Palantir Technologies', basePrice: 24.5, marketCap: 54_000_000_000, sector: 'Technology', avgVolume10d: 62_000_000 },
];

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function generateIntradayCandles(
  basePrice: number,
  changePercent: number,
  volatility: number,
  numPoints: number = 40,
): IntradayPoint[] {
  // Start from market open today at 9:30 AM local time
  const marketOpen = new Date();
  marketOpen.setHours(9, 30, 0, 0);
  const intervalMs = 5 * 60 * 1000;

  const openPrice = basePrice * (1 + rand(-0.004, 0.004));
  const currentPrice = basePrice * (1 + changePercent / 100);

  const points: IntradayPoint[] = [];
  let price = openPrice;

  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    const target = openPrice + (currentPrice - openPrice) * progress;
    // Noise with slight upward bias to match positive change
    const noise = price * volatility * (Math.random() - 0.45);
    const drift = (target - price) * 0.35;
    price = Math.max(price + drift + noise, 0.01);

    points.push({
      time: marketOpen.getTime() + i * intervalMs,
      price: parseFloat(price.toFixed(2)),
    });
  }

  // Pin last point to exact current price
  if (points.length > 0) {
    points[points.length - 1].price = parseFloat(currentPrice.toFixed(2));
  }

  return points;
}

function scoreStock(
  profile: StockProfile,
  changePercent: number,
  volumeRatio: number,
  volatility: number,
): number {
  let score = 0;

  // Volume spike vs 10-day avg (0–30 pts)
  if (volumeRatio >= 3.0) { score += 30; }
  else if (volumeRatio >= 2.0) { score += 22; }
  else if (volumeRatio >= 1.5) { score += 14; }
  else if (volumeRatio >= 1.2) { score += 7; }

  // Intraday momentum (0–25 pts)
  if (changePercent >= 2.5) { score += 25; }
  else if (changePercent >= 1.5) { score += 20; }
  else if (changePercent >= 1.0) { score += 15; }
  else if (changePercent >= 0.5) { score += 8; }

  // Volatility in breakout sweet spot (0–20 pts)
  if (volatility >= 0.02 && volatility <= 0.06) { score += 20; }
  else if (volatility > 0.06) { score += 12; }
  else { score += 5; }

  // Liquidity (avg daily volume) (0–15 pts)
  if (profile.avgVolume10d >= 50_000_000) { score += 15; }
  else if (profile.avgVolume10d >= 20_000_000) { score += 10; }
  else if (profile.avgVolume10d >= 5_000_000) { score += 5; }

  // Large cap stability (0–10 pts)
  if (profile.marketCap >= 1_000_000_000_000) { score += 10; }
  else if (profile.marketCap >= 100_000_000_000) { score += 6; }
  else { score += 2; }

  return Math.min(100, score);
}

function buildSignals(changePercent: number, volumeRatio: number, volatility: number): string[] {
  const signals: string[] = [];

  if (volumeRatio >= 2) {
    signals.push(`Volume spike +${Math.round((volumeRatio - 1) * 100)}% vs 10-day avg`);
  } else if (volumeRatio >= 1.5) {
    signals.push(`Volume elevated +${Math.round((volumeRatio - 1) * 100)}% vs 10-day avg`);
  }

  if (changePercent >= 1.5) {
    signals.push(`Strong intraday momentum +${changePercent.toFixed(2)}%`);
  } else if (changePercent >= 0.8) {
    signals.push(`Positive momentum +${changePercent.toFixed(2)}%`);
  }

  if (volatility >= 0.02 && volatility <= 0.06) {
    signals.push(`Volatility in breakout range (${(volatility * 100).toFixed(1)}%)`);
  } else if (volatility > 0.06) {
    signals.push(`Elevated volatility — high-conviction move (${(volatility * 100).toFixed(1)}%)`);
  }

  if (signals.length === 0) {
    signals.push(`Trending up +${changePercent.toFixed(2)}%`);
  }

  return signals;
}

export function getMockTopPicks(): StockPicksResponse {
  const candidates: Stock[] = STOCK_POOL.map((profile) => {
    const changePercent = rand(0.4, 4.5);
    const volumeRatio = rand(0.9, 3.5);
    const volatility = rand(0.01, 0.09);

    const changeAbs = parseFloat((profile.basePrice * (changePercent / 100)).toFixed(2));
    const currentPrice = parseFloat((profile.basePrice + changeAbs).toFixed(2));
    const confidenceScore = scoreStock(profile, changePercent, volumeRatio, volatility);

    return {
      ticker: profile.ticker,
      name: profile.name,
      price: currentPrice,
      change: changeAbs,
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.round(profile.avgVolume10d * volumeRatio),
      marketCap: profile.marketCap,
      sector: profile.sector,
      confidenceScore,
      signals: buildSignals(changePercent, volumeRatio, volatility),
      candles: generateIntradayCandles(profile.basePrice, changePercent, volatility, 40),
    };
  });

  const top5 = [...candidates].sort((a, b) => b.confidenceScore - a.confidenceScore).slice(0, 5);

  return {
    picks: top5,
    generatedAt: new Date().toISOString(),
    criteria: 'MOCK — volume spike, intraday momentum, volatility sweet spot, liquidity filter',
  };
}
