/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Dashboard preset API endpoints
 */

import { Router, Request, Response } from 'express';
import { presetStore } from '../services/presetStore';
import { widgetStore } from '../services/widgetStore';
import { socketService } from '../services/socketService';
import { DashboardPreset } from '../types/widget';

const router = Router();

/**
 * GET /api/presets - List all presets
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const presets = presetStore.getPresets();
    res.json(presets);
  } catch (error) {
    console.error('[PresetsAPI] Error fetching presets:', error);
    res.status(500).json({ error: 'Failed to fetch presets' });
  }
});

/**
 * GET /api/presets/default - Get the default preset
 */
router.get('/default', (req: Request, res: Response) => {
  try {
    const defaultPreset = presetStore.getDefaultPreset();
    
    if (!defaultPreset) {
      return res.status(404).json({ error: 'No default preset found' });
    }

    res.json(defaultPreset);
  } catch (error) {
    console.error('[PresetsAPI] Error fetching default preset:', error);
    res.status(500).json({ error: 'Failed to fetch default preset' });
  }
});

/**
 * GET /api/presets/:name - Get specific preset by name
 */
router.get('/:name', (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const preset = presetStore.getPreset(name);

    if (!preset) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    res.json(preset);
  } catch (error) {
    console.error('[PresetsAPI] Error fetching preset:', error);
    res.status(500).json({ error: 'Failed to fetch preset' });
  }
});

/**
 * POST /api/presets - Create or update a preset
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, displayName, widgets, isDefault } = req.body;

    if (!name || !displayName || !widgets) {
      return res.status(400).json({
        error: 'Missing required fields: name, displayName, widgets'
      });
    }

    if (!Array.isArray(widgets)) {
      return res.status(400).json({
        error: 'widgets must be an array'
      });
    }

    const preset = presetStore.savePreset({
      name,
      displayName,
      widgets,
      isDefault: isDefault || false
    });

    res.status(201).json(preset);
  } catch (error) {
    console.error('[PresetsAPI] Error creating preset:', error);
    res.status(500).json({ error: 'Failed to create preset' });
  }
});

/**
 * PUT /api/presets/activate/:name - Load a preset (replaces current widgets)
 */
router.put('/activate/:name', (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const preset = presetStore.getPreset(name);

    if (!preset) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    // Step 1: Clear all current widgets
    const currentWidgets = widgetStore.getAll();
    currentWidgets.forEach(widget => {
      widgetStore.delete(widget.id);
      socketService.emitWidgetDeleted(widget.id);
    });

    console.log(`[PresetsAPI] Cleared ${currentWidgets.length} widget(s)`);

    // Step 2: Create all widgets from the preset
    const createdWidgets = preset.widgets.map(widget => {
      const newWidget = widgetStore.create({
        type: widget.type,
        title: widget.title,
        data: widget.data,
        position: widget.position
      });
      socketService.emitWidgetCreated(newWidget);
      return newWidget;
    });

    console.log(`[PresetsAPI] Created ${createdWidgets.length} widget(s) from preset: ${preset.name}`);

    // Step 3: Emit preset activation event
    if (socketService.getIO()) {
      socketService.getIO()!.emit('preset:activated', {
        presetName: preset.name,
        presetDisplayName: preset.displayName,
        widgetCount: createdWidgets.length
      });
      console.log(`[PresetsAPI] Emitted preset:activated event for ${preset.name}`);
    }

    // Return the activated preset with the newly created widget IDs
    res.json({
      preset: {
        ...preset,
        widgets: createdWidgets
      },
      message: `Preset '${preset.displayName}' activated successfully`
    });
  } catch (error) {
    console.error('[PresetsAPI] Error activating preset:', error);
    res.status(500).json({ error: 'Failed to activate preset' });
  }
});

/**
 * DELETE /api/presets/:name - Delete a preset
 */
router.delete('/:name', (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const deleted = presetStore.deletePreset(name);

    if (!deleted) {
      return res.status(404).json({ error: 'Preset not found' });
    }

    res.json({ success: true, name });
  } catch (error) {
    console.error('[PresetsAPI] Error deleting preset:', error);
    res.status(500).json({ error: 'Failed to delete preset' });
  }
});

export default router;
