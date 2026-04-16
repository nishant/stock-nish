import type { StockPicksResponse } from '../types/stock';
import type { SchwabQuoteItem } from '../types/schwab';
import { getQuotes, getMovers, isSchwabConfigured } from './schwabClient';
import { getMockTopPicks } from './mockDataService';

// ─── Screening config ─────────────────────────────────────────────────────────

const MOVER_INDEXES = ['$SPX', '$COMPX', '$DJI'] as const;
const MIN_AVG_VOLUME = 1_000_000;
const MIN_CHANGE_PCT = 0.5;

const SIGNAL_WEIGHTS = {
  volumeSpike: 30,
  momentum: 25,
  volatility: 20,
  nearHigh: 15,
  fundamentals: 10,
} as const;

// ─── Scoring helpers ──────────────────────────────────────────────────────────

function scoreVolumeSpike(item: SchwabQuoteItem): { score: number; signal: string | null } {
  const avg10d = item.fundamental?.avg10DaysVolume ?? 0;
  const today = item.quote.totalVolume;
  if (avg10d < MIN_AVG_VOLUME || today === 0) { return { score: 0, signal: null }; }
  const ratio = today / avg10d;
  if (ratio >= 3) { return { score: SIGNAL_WEIGHTS.volumeSpike, signal: `Volume spike +${Math.round((ratio - 1) * 100)}% vs 10-day avg` }; }
  if (ratio >= 2) { return { score: Math.round(SIGNAL_WEIGHTS.volumeSpike * 0.8), signal: `Volume spike +${Math.round((ratio - 1) * 100)}% vs 10-day avg` }; }
  if (ratio >= 1.5) { return { score: Math.round(SIGNAL_WEIGHTS.volumeSpike * 0.5), signal: `Volume elevated +${Math.round((ratio - 1) * 100)}% vs 10-day avg` }; }
  return { score: 0, signal: null };
}

function scoreMomentum(item: SchwabQuoteItem): { score: number; signal: string | null } {
  const pct = item.quote.netPercentChange;
  if (pct >= 2) { return { score: SIGNAL_WEIGHTS.momentum, signal: `Strong intraday momentum +${pct.toFixed(2)}%` }; }
  if (pct >= 1) { return { score: Math.round(SIGNAL_WEIGHTS.momentum * 0.7), signal: `Positive momentum +${pct.toFixed(2)}%` }; }
  if (pct >= MIN_CHANGE_PCT) { return { score: Math.round(SIGNAL_WEIGHTS.momentum * 0.4), signal: `Trending up +${pct.toFixed(2)}%` }; }
  return { score: 0, signal: null };
}

function scoreVolatility(item: SchwabQuoteItem): { score: number; signal: string | null } {
  const vol = item.quote.volatility;
  if (vol === undefined || vol === 0) { return { score: 0, signal: null }; }
  if (vol >= 0.02 && vol <= 0.08) { return { score: SIGNAL_WEIGHTS.volatility, signal: `Volatility in breakout range (${(vol * 100).toFixed(1)}%)` }; }
  if (vol > 0.08) { return { score: Math.round(SIGNAL_WEIGHTS.volatility * 0.5), signal: `High volatility (${(vol * 100).toFixed(1)}%)` }; }
  return { score: Math.round(SIGNAL_WEIGHTS.volatility * 0.3), signal: null };
}

function scoreNearHigh(item: SchwabQuoteItem): { score: number; signal: string | null } {
  const last = item.quote.lastPrice;
  const high52 = item.quote['52WeekHigh'];
  if (last === 0 || high52 === 0) { return { score: 0, signal: null }; }
  const pctFromHigh = (high52 - last) / high52;
  if (pctFromHigh <= 0.03) { return { score: SIGNAL_WEIGHTS.nearHigh, signal: `Near 52-week high ($${high52.toFixed(2)})` }; }
  if (pctFromHigh <= 0.08) { return { score: Math.round(SIGNAL_WEIGHTS.nearHigh * 0.6), signal: `Approaching 52-week high ($${high52.toFixed(2)})` }; }
  return { score: 0, signal: null };
}

function scoreFundamentals(item: SchwabQuoteItem): { score: number; signal: string | null } {
  const eps = item.fundamental?.eps ?? 0;
  const pe = item.fundamental?.peRatio ?? 0;
  if (eps > 0 && pe > 0 && pe < 40) { return { score: SIGNAL_WEIGHTS.fundamentals, signal: `Positive EPS ($${eps.toFixed(2)}), PE ${pe.toFixed(1)}` }; }
  if (eps > 0) { return { score: Math.round(SIGNAL_WEIGHTS.fundamentals * 0.5), signal: `Positive EPS ($${eps.toFixed(2)})` }; }
  return { score: 0, signal: null };
}

// ─── Live screener ────────────────────────────────────────────────────────────

async function getLivePicks(): Promise<StockPicksResponse> {
  const moverResults = await Promise.allSettled(
    MOVER_INDEXES.map((idx) => getMovers(idx, 'up', 'PERCENT_CHANGE_UP')),
  );

  const symbols = new Set<string>();
  for (const result of moverResults) {
    if (result.status === 'fulfilled') {
      result.value.screeners.forEach((m) => symbols.add(m.symbol));
    }
  }

  if (symbols.size === 0) { throw new Error('No mover symbols returned from Schwab API'); }

  const quotes = await getQuotes([...symbols], 'all');

  const candidates = Object.values(quotes).filter(
    (item) =>
      (item.assetMainType === 'EQUITY' || item.assetSubType === 'ETF') &&
      item.quote.netPercentChange >= MIN_CHANGE_PCT &&
      (item.fundamental?.avg10DaysVolume ?? 0) >= MIN_AVG_VOLUME,
  );

  const scored = candidates
    .map((item) => {
      const signals: string[] = [];
      let score = 0;
      for (const { score: s, signal } of [
        scoreVolumeSpike(item),
        scoreMomentum(item),
        scoreVolatility(item),
        scoreNearHigh(item),
        scoreFundamentals(item),
      ]) {
        score += s;
        if (signal) { signals.push(signal); }
      }
      return {
        ticker: item.symbol,
        name: item.reference.description,
        price: item.quote.lastPrice,
        change: item.quote.netChange,
        changePercent: item.quote.netPercentChange,
        volume: item.quote.totalVolume,
        marketCap: 0,
        sector: item.reference.exchangeName,
        confidenceScore: Math.min(100, Math.max(0, score)),
        signals: signals.length > 0 ? signals : ['Price movement detected'],
        candles: [], // TODO: populate from /{symbol}/quotes candle endpoint
      };
    })
    .sort((a, b) => b.confidenceScore - a.confidenceScore);

  return {
    picks: scored.slice(0, 5),
    generatedAt: new Date().toISOString(),
    criteria: 'Volume spike, intraday momentum, volatility, 52-week high proximity, positive EPS',
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getTopPicks(): Promise<StockPicksResponse> {
  if (!isSchwabConfigured()) {
    console.warn('SCHWAB_ACCESS_TOKEN not set — returning mock data');
    return getMockTopPicks();
  }
  return getLivePicks();
}
