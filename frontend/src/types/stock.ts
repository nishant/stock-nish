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
  confidenceScore: number;
  signals: string[];
  candles: IntradayPoint[];
}

export interface StockPicksResponse {
  picks: Stock[];
  generatedAt: string;
  criteria: string;
}
