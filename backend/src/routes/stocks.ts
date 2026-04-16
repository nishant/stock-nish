import { Router, Request, Response } from 'express';
import { getTopPicks } from '../services/stockService';

const router = Router();

router.get('/picks', (_req: Request, res: Response): void => {
  const data = getTopPicks();
  res.json(data);
});

export default router;
