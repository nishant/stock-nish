import { Router, Request, Response, NextFunction } from 'express';
import { getTopPicks } from '../services/stockService';

const router = Router();

router.get('/picks', (_req: Request, res: Response, next: NextFunction): void => {
  getTopPicks()
    .then((data) => res.json(data))
    .catch(next);
});

export default router;
