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
}

export interface StockPicksResponse {
  picks: Stock[];
  generatedAt: string;
  criteria: string;
}
