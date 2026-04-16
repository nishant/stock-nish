// ─── /quotes (multi-symbol) ──────────────────────────────────────────────────

export interface SchwabQuoteReference {
  cusip?: string;
  description: string;
  exchange: string;
  exchangeName: string;
  otcMarketTier?: string;
  contractType?: string;
  daysToExpiration?: number;
  strikePrice?: number;
  underlying?: string;
}

export interface SchwabEquityQuote {
  '52WeekHigh': number;
  '52WeekLow': number;
  askPrice?: number;
  askSize?: number;
  askTime?: number;
  bidPrice?: number;
  bidSize?: number;
  bidTime?: number;
  closePrice: number;
  highPrice: number;
  lastPrice: number;
  lastSize?: number;
  lowPrice: number;
  mark?: number;
  markChange?: number;
  markPercentChange?: number;
  netChange: number;
  netPercentChange: number;
  openPrice: number;
  quoteTime?: number;
  securityStatus: string;
  totalVolume: number;
  tradeTime: number;
  volatility?: number;
}

export interface SchwabFundamental {
  avg10DaysVolume: number;
  avg1YearVolume: number;
  divAmount?: number;
  divFreq?: number;
  divPayAmount?: number;
  divYield?: number;
  eps?: number;
  fundLeverageFactor?: number;
  peRatio?: number;
  declarationDate?: string;
  divExDate?: string;
  divPayDate?: string;
  nextDivExDate?: string;
  nextDivPayDate?: string;
}

export interface SchwabRegularMarket {
  regularMarketLastPrice: number;
  regularMarketLastSize: number;
  regularMarketNetChange: number;
  regularMarketPercentChange: number;
  regularMarketTradeTime: number;
}

export type AssetMainType =
  | 'EQUITY'
  | 'MUTUAL_FUND'
  | 'INDEX'
  | 'OPTION'
  | 'FUTURE'
  | 'FOREX'
  | 'BOND'
  | 'ETF';

export interface SchwabQuoteItem {
  assetMainType: AssetMainType;
  assetSubType?: string;
  symbol: string;
  quoteType?: string;
  realtime: boolean;
  ssid: number;
  reference: SchwabQuoteReference;
  quote: SchwabEquityQuote;
  fundamental?: SchwabFundamental;
  regular?: SchwabRegularMarket;
}

/** Response shape from GET /quotes?symbols=... */
export type SchwabQuotesResponse = Record<string, SchwabQuoteItem>;

// ─── /{symbol}/quotes (single symbol — price history / candles) ───────────────

export interface SchwabCandle {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  datetime: number; // ms since epoch
}

/** Response shape from GET /{symbol}/quotes */
export interface SchwabSingleQuoteResponse {
  symbol: string;
  empty: boolean;
  previousClose: number;
  previousCloseDate: number;
  candles: SchwabCandle[];
}

// ─── /movers/{index} ─────────────────────────────────────────────────────────

export interface SchwabMover {
  change: number;
  description: string;
  direction: 'up' | 'down';
  last: number;
  symbol: string;
  totalVolume: number;
}

/** Response shape from GET /movers/{index} */
export interface SchwabMoversResponse {
  screeners: SchwabMover[];
}
