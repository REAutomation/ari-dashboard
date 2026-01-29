/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Widget type definitions and interfaces
 */

export type WidgetType = 'home' | 'text' | 'file' | 'html' | 'weather' | 'news';

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface HomeWidgetData {
  greeting?: string;
  status: 'idle' | 'working' | 'meeting';
  currentTask?: string;
  infoItems?: Array<{
    icon?: string;
    label: string;
    value: string;
  }>;
}

export interface TextWidgetData {
  content: string;
  variant?: 'default' | 'info' | 'warning' | 'success' | 'error';
  fontSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface FileViewerWidgetData {
  fileType: 'pdf' | 'image' | 'excel' | 'csv' | 'other';
  fileName: string;
  fileUrl: string;
  alt?: string;
  previewData?: {
    headers: string[];
    rows: string[][];
  };
}

export interface HTMLRendererWidgetData {
  html: string;
  sandbox?: boolean;
  svgContent?: string;
}

export interface WeatherWidgetData {
  location: string;
  zipCode: string;
  apiKey?: string;
  units?: 'metric' | 'imperial';
}

export interface NewsItem {
  category?: string;
  headline: string;
  time?: string;
  url?: string;
}

export interface NewsWidgetData {
  items: NewsItem[];
  ticker?: boolean;
}

export type WidgetData = HomeWidgetData | TextWidgetData | FileViewerWidgetData | HTMLRendererWidgetData | WeatherWidgetData | NewsWidgetData;

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  data: WidgetData;
  position: WidgetPosition;
  scrollable?: boolean; // Ari can set this to force scroll mode for long content
  createdAt: string;
  updatedAt: string;
}

export interface CreateWidgetRequest {
  type: WidgetType;
  title: string;
  data: WidgetData;
  position?: WidgetPosition;
  scrollable?: boolean;
}

export interface UpdateWidgetRequest {
  title?: string;
  data?: Partial<WidgetData>;
  position?: Partial<WidgetPosition>;
}

export interface FileInfo {
  id: string;
  fileName: string;
  fileType: string;
  mimeType: string;
  url: string;
  size: number;
  uploadedAt: string;
}

// Ari Status
export type AriStatusState = 'idle' | 'working' | 'agents' | 'error';

export interface AriStatus {
  state: AriStatusState;
  message?: string;        // e.g. "Analysiere Kundendaten..."
  activeTasks?: AriTask[];
  updatedAt: string;
}

export interface AriTask {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
}

// Activity Feed
export interface FeedEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'task_started' | 'task_completed';
  message: string;
  details?: string;
}

// Dashboard Presets
export interface DashboardPreset {
  id: string;
  name: string;           // e.g. "briefing", "meeting"
  displayName: string;    // e.g. "Tägliches Briefing", "Meeting"
  widgets: Widget[];      // The widgets in this preset
  isDefault?: boolean;    // If true, load on startup
  createdAt: string;
  updatedAt: string;
}
