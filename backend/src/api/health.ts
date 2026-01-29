/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Health check endpoint
 */

import { Router, Request, Response } from 'express';
import { widgetStore } from '../services/widgetStore';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const healthData = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    widgets: widgetStore.count()
  };

  res.json(healthData);
});

export default router;
