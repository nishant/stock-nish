import type {
  SchwabQuotesResponse,
  SchwabSingleQuoteResponse,
  SchwabMoversResponse,
} from '../types/schwab';

const SCHWAB_BASE_URL = 'https://api.schwabapi.com/marketdata/v1';

function getAccessToken(): string {
  const token = process.env.SCHWAB_ACCESS_TOKEN;
  if (!token) {
    throw new Error('SCHWAB_ACCESS_TOKEN is not set');
  }
  return token;
}

async function schwabFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${SCHWAB_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Schwab API error ${res.status} on ${path}: ${body}`);
  }

  return res.json() as Promise<T>;
}

/**
 * GET /quotes?symbols=AAPL,MSFT,...&fields=all
 * Returns real-time quotes for a list of symbols.
 */
export async function getQuotes(
  symbols: string[],
  fields: 'all' | 'quote' | 'fundamental' = 'all',
): Promise<SchwabQuotesResponse> {
  return schwabFetch<SchwabQuotesResponse>('/quotes', {
    symbols: symbols.join(','),
    fields,
  });
}

/**
 * GET /{symbol}/quotes
 * Returns OHLCV candle history for a single symbol.
 */
export async function getSingleQuote(symbol: string): Promise<SchwabSingleQuoteResponse> {
  return schwabFetch<SchwabSingleQuoteResponse>(`/${encodeURIComponent(symbol)}/quotes`);
}

/**
 * GET /movers/{index}
 * Returns the top 10 movers for an index (e.g. "$SPX", "$DJI", "$COMPX").
 * direction: 'up' | 'down' — default 'up'
 * sort: 'VOLUME' | 'TRADES' | 'PERCENT_CHANGE_UP' | 'PERCENT_CHANGE_DOWN'
 */
export async function getMovers(
  index: string,
  direction: 'up' | 'down' = 'up',
  sort: 'VOLUME' | 'TRADES' | 'PERCENT_CHANGE_UP' | 'PERCENT_CHANGE_DOWN' = 'PERCENT_CHANGE_UP',
): Promise<SchwabMoversResponse> {
  return schwabFetch<SchwabMoversResponse>(`/movers/${encodeURIComponent(index)}`, {
    direction,
    sort,
  });
}

/** Returns true if a Schwab access token is configured. */
export function isSchwabConfigured(): boolean {
  return Boolean(process.env.SCHWAB_ACCESS_TOKEN);
}
