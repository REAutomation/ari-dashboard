/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Dashboard preset storage service with JSON persistence
 */

import { v4 as uuidv4 } from 'uuid';
import { DashboardPreset, Widget } from '../types/widget';
import { PersistenceService } from './persistenceService';

const PRESETS_FILE = 'presets.json';

interface PresetsData {
  presets: DashboardPreset[];
}

class PresetStore {
  private presets: Map<string, DashboardPreset> = new Map();

  constructor() {
    this.loadFromFile();
  }

  /**
   * Load presets from JSON file
   */
  private loadFromFile(): void {
    const data = PersistenceService.readJSON<PresetsData>(PRESETS_FILE);
    
    if (data && data.presets && Array.isArray(data.presets)) {
      data.presets.forEach(preset => {
        this.presets.set(preset.name, preset);
      });
      console.log(`[PresetStore] Loaded ${data.presets.length} preset(s) from file`);
    } else {
      console.log('[PresetStore] No presets found in file, starting with empty store');
    }
  }

  /**
   * Save presets to JSON file
   */
  private saveToFile(): void {
    const data: PresetsData = {
      presets: Array.from(this.presets.values())
    };
    PersistenceService.writeJSON(PRESETS_FILE, data);
  }

  /**
   * Get all presets
   */
  getPresets(): DashboardPreset[] {
    return Array.from(this.presets.values());
  }

  /**
   * Get a specific preset by name
   */
  getPreset(name: string): DashboardPreset | null {
    return this.presets.get(name) || null;
  }

  /**
   * Save or update a preset
   */
  savePreset(preset: Omit<DashboardPreset, 'id' | 'createdAt' | 'updatedAt'>): DashboardPreset {
    const now = new Date().toISOString();
    const existingPreset = this.presets.get(preset.name);

    const newPreset: DashboardPreset = {
      id: existingPreset?.id || uuidv4(),
      name: preset.name,
      displayName: preset.displayName,
      widgets: preset.widgets,
      isDefault: preset.isDefault || false,
      createdAt: existingPreset?.createdAt || now,
      updatedAt: now
    };

    // If this preset is marked as default, remove default flag from all others
    if (newPreset.isDefault) {
      this.presets.forEach(p => {
        if (p.name !== newPreset.name && p.isDefault) {
          p.isDefault = false;
        }
      });
    }

    this.presets.set(newPreset.name, newPreset);
    this.saveToFile();

    console.log(`[PresetStore] Preset saved: ${newPreset.name} (${newPreset.displayName})`);
    return newPreset;
  }

  /**
   * Delete a preset by name
   */
  deletePreset(name: string): boolean {
    const deleted = this.presets.delete(name);
    if (deleted) {
      this.saveToFile();
      console.log(`[PresetStore] Preset deleted: ${name}`);
    }
    return deleted;
  }

  /**
   * Get the default preset
   */
  getDefaultPreset(): DashboardPreset | null {
    const presets = Array.from(this.presets.values());
    const defaultPreset = presets.find(p => p.isDefault === true);
    return defaultPreset || null;
  }

  /**
   * Count presets
   */
  count(): number {
    return this.presets.size;
  }
}

export const presetStore = new PresetStore();
