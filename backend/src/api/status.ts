/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Ari status API endpoints
 */

import { Router, Request, Response } from 'express';
import { statusStore } from '../services/statusStore';
import { socketService } from '../services/socketService';
import { AriStatus } from '../types/widget';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  try {
    const status = statusStore.getStatus();
    res.json(status);
  } catch (error) {
    console.error('[StatusAPI] Error fetching status:', error);
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

router.put('/', (req: Request, res: Response) => {
  try {
    const update: Partial<AriStatus> = req.body;
    const updatedStatus = statusStore.updateStatus(update);
    
    socketService.emitStatusUpdated(updatedStatus);
    
    res.json(updatedStatus);
  } catch (error) {
    console.error('[StatusAPI] Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
