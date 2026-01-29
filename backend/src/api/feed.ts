/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Activity feed API endpoints
 */

import { Router, Request, Response } from 'express';
import { feedStore } from '../services/feedStore';
import { socketService } from '../services/socketService';
import { FeedEntry } from '../types/widget';

const router = Router();

const VALID_FEED_TYPES = ['info', 'success', 'warning', 'error', 'task_started', 'task_completed'];

router.get('/', (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const entries = feedStore.getEntries(limit);
    res.json(entries);
  } catch (error) {
    console.error('[FeedAPI] Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const { type, message, details } = req.body;

    if (!type || !message) {
      return res.status(400).json({ error: 'Missing required fields: type, message' });
    }

    if (!VALID_FEED_TYPES.includes(type)) {
      return res.status(400).json({
        error: 'Invalid feed type. Must be one of: ' + VALID_FEED_TYPES.join(', ')
      });
    }

    const entry = feedStore.addEntry({ type, message, details });
    
    socketService.emitFeedNew(entry);
    
    res.status(201).json(entry);
  } catch (error) {
    console.error('[FeedAPI] Error creating feed entry:', error);
    res.status(500).json({ error: 'Failed to create feed entry' });
  }
});

export default router;
