export interface IntradayPoint {
  time: number; // ms since epoch
  price: number;
}

export interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  sector: string;
  confidenceScore: number; // 0-100, how confident we are in the 1%+ daily move
  signals: string[];
  candles: IntradayPoint[]; // intraday 5-min bars from market open to now
}

export interface StockPicksResponse {
  picks: Stock[];
  generatedAt: string;
  criteria: string;
}

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
}
