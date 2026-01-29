/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Widget storage service with JSON persistence
 */

import { v4 as uuidv4 } from 'uuid';
import { Widget, CreateWidgetRequest, UpdateWidgetRequest, HomeWidgetData } from '../types/widget';
import { PersistenceService } from './persistenceService';

const WIDGETS_FILE = 'widgets.json';

interface WidgetsData {
  widgets: Widget[];
}

class WidgetStore {
  private widgets: Map<string, Widget> = new Map();

  constructor() {
    this.loadFromFile();
  }

  /**
   * Load widgets from JSON file, or initialize with default widget if file doesn't exist
   */
  private loadFromFile(): void {
    const data = PersistenceService.readJSON<WidgetsData>(WIDGETS_FILE);
    
    if (data && data.widgets && Array.isArray(data.widgets)) {
      data.widgets.forEach(widget => {
        this.widgets.set(widget.id, widget);
      });
      console.log(`[WidgetStore] Loaded ${data.widgets.length} widget(s) from file`);
    } else {
      console.log('[WidgetStore] No widgets found in file, initializing with default widget');
      this.initializeDefaultWidget();
    }
  }

  /**
   * Save widgets to JSON file
   */
  private saveToFile(): void {
    const data: WidgetsData = {
      widgets: Array.from(this.widgets.values())
    };
    PersistenceService.writeJSON(WIDGETS_FILE, data);
  }

  private initializeDefaultWidget(): void {
    const defaultHomeWidget: Widget = {
      id: 'home-default',
      type: 'home',
      title: 'Welcome to Ari Dashboard',
      data: {
        greeting: 'Hello! I am Ari, your AI assistant.',
        status: 'idle',
        currentTask: 'Waiting for instructions',
        infoItems: [
          {
            icon: '🤖',
            label: 'Status',
            value: 'Ready'
          },
          {
            icon: '📊',
            label: 'Widgets',
            value: '1'
          }
        ]
      } as HomeWidgetData,
      position: {
        x: 0,
        y: 0,
        w: 6,
        h: 4
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.widgets.set(defaultHomeWidget.id, defaultHomeWidget);
    this.saveToFile();
    console.log('[WidgetStore] Default home widget created and saved');
  }

  getAll(): Widget[] {
    return Array.from(this.widgets.values());
  }

  getById(id: string): Widget | undefined {
    return this.widgets.get(id);
  }

  create(request: CreateWidgetRequest): Widget {
    const now = new Date().toISOString();
    const widget: Widget = {
      id: uuidv4(),
      type: request.type,
      title: request.title,
      data: request.data,
      position: request.position || {
        x: 0,
        y: 0,
        w: 4,
        h: 3
      },
      createdAt: now,
      updatedAt: now
    };

    this.widgets.set(widget.id, widget);
    this.saveToFile();
    console.log(`[WidgetStore] Widget created: ${widget.id} (${widget.type})`);
    return widget;
  }

  update(id: string, request: UpdateWidgetRequest): Widget | null {
    const widget = this.widgets.get(id);
    if (!widget) {
      return null;
    }

    const updatedWidget: Widget = {
      ...widget,
      title: request.title !== undefined ? request.title : widget.title,
      data: request.data ? { ...widget.data, ...request.data } : widget.data,
      position: request.position ? { ...widget.position, ...request.position } : widget.position,
      updatedAt: new Date().toISOString()
    };

    this.widgets.set(id, updatedWidget);
    this.saveToFile();
    console.log(`[WidgetStore] Widget updated: ${id}`);
    return updatedWidget;
  }

  delete(id: string): boolean {
    const deleted = this.widgets.delete(id);
    if (deleted) {
      this.saveToFile();
      console.log(`[WidgetStore] Widget deleted: ${id}`);
    }
    return deleted;
  }

  count(): number {
    return this.widgets.size;
  }
}

export const widgetStore = new WidgetStore();
