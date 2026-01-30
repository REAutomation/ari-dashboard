/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Widget CRUD API endpoints
 */

import { Router, Request, Response } from 'express';
import { widgetStore } from '../services/widgetStore';
import { socketService } from '../services/socketService';
import { CreateWidgetRequest, UpdateWidgetRequest, WidgetType } from '../types/widget';

const router = Router();

const VALID_WIDGET_TYPES: WidgetType[] = ['home', 'text', 'file', 'html', 'weather', 'news'];

router.get('/', (req: Request, res: Response) => {
  try {
    const widgets = widgetStore.getAll();
    res.json(widgets);
  } catch (error) {
    console.error('[WidgetsAPI] Error fetching widgets:', error);
    res.status(500).json({ error: 'Failed to fetch widgets' });
  }
});

router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const widget = widgetStore.getById(id);

    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    res.json(widget);
  } catch (error) {
    console.error('[WidgetsAPI] Error fetching widget:', error);
    res.status(500).json({ error: 'Failed to fetch widget' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const createRequest: CreateWidgetRequest = req.body;

    if (!createRequest.type || !createRequest.title || !createRequest.data) {
      return res.status(400).json({ error: 'Missing required fields: type, title, data' });
    }

    if (!VALID_WIDGET_TYPES.includes(createRequest.type)) {
      return res.status(400).json({
        error: `Invalid widget type. Must be one of: ${VALID_WIDGET_TYPES.join(', ')}`
      });
    }

    const widget = widgetStore.create(createRequest);
    socketService.emitWidgetCreated(widget);

    res.status(201).json(widget);
  } catch (error) {
    console.error('[WidgetsAPI] Error creating widget:', error);
    res.status(500).json({ error: 'Failed to create widget' });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateRequest: UpdateWidgetRequest = req.body;

    const widget = widgetStore.update(id, updateRequest);

    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    socketService.emitWidgetUpdated(widget);

    res.json(widget);
  } catch (error) {
    console.error('[WidgetsAPI] Error updating widget:', error);
    res.status(500).json({ error: 'Failed to update widget' });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = widgetStore.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    socketService.emitWidgetDeleted(id);

    res.status(200).json({ success: true, id });
  } catch (error) {
    console.error('[WidgetsAPI] Error deleting widget:', error);
    res.status(500).json({ error: 'Failed to delete widget' });
  }
});

// Focus mode: Show single widget full-screen, backup current state
let focusBackup: { widgets: any[] } | null = null;

router.post('/focus/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const widget = widgetStore.getById(id);

    if (!widget) {
      return res.status(404).json({ error: 'Widget not found' });
    }

    // Backup current widgets
    focusBackup = { widgets: widgetStore.getAll() };

    // Delete all widgets except the focused one
    const allWidgets = widgetStore.getAll();
    allWidgets.forEach(w => {
      if (w.id !== id) {
        widgetStore.delete(w.id);
        socketService.emitWidgetDeleted(w.id);
      }
    });

    // Make focused widget full-screen
    const updatedWidget = widgetStore.update(id, {
      position: { x: 0, y: 0, w: 12, h: 4 }
    });

    if (updatedWidget) {
      socketService.emitWidgetUpdated(updatedWidget);
    }

    res.json({
      success: true,
      message: `Widget "${widget.title}" is now in focus mode`,
      widget: updatedWidget
    });
  } catch (error) {
    console.error('[WidgetsAPI] Error focusing widget:', error);
    res.status(500).json({ error: 'Failed to focus widget' });
  }
});

router.post('/unfocus', (req: Request, res: Response) => {
  try {
    if (!focusBackup) {
      return res.status(400).json({ error: 'No focus backup available. Use /api/presets/activate/briefing instead.' });
    }

    // Clear current widgets
    const currentWidgets = widgetStore.getAll();
    currentWidgets.forEach(w => {
      widgetStore.delete(w.id);
      socketService.emitWidgetDeleted(w.id);
    });

    // Restore backed up widgets
    focusBackup.widgets.forEach(w => {
      const restored = widgetStore.create({
        type: w.type,
        title: w.title,
        data: w.data,
        position: w.position,
        scrollable: w.scrollable
      });
      socketService.emitWidgetCreated(restored);
    });

    focusBackup = null;

    res.json({
      success: true,
      message: 'Focus mode ended, previous layout restored'
    });
  } catch (error) {
    console.error('[WidgetsAPI] Error unfocusing:', error);
    res.status(500).json({ error: 'Failed to unfocus' });
  }
});

export default router;
