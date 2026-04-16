import express from 'express';
import cors from 'cors';
import stocksRouter from './routes/stocks';
import { HealthResponse } from './types/stock';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/health', (_req, res): void => {
  const body: HealthResponse = { status: 'ok', timestamp: new Date().toISOString() };
  res.json(body);
});

app.use('/api/stocks', stocksRouter);

app.listen(PORT, () => {
  console.info(`stock-nish backend running on http://localhost:${PORT}`);
});
