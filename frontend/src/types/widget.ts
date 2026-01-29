/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Widget type definitions
 */

export type WidgetType =
  | 'home'
  | 'text'
  | 'file'
  | 'html'
  | 'weather'
  | 'news';

export interface WidgetPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface HomeWidgetData {
  greeting?: string;
  status?: 'idle' | 'working' | 'meeting';
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
  fontSize?: 'sm' | 'base' | 'lg' | 'xl';
}

export interface FileViewerWidgetData {
  fileUrl: string;
  fileName: string;
  fileType: 'image' | 'pdf' | 'excel' | 'csv' | 'other';
  previewData?: {
    headers: string[];
    rows: string[][];
  };
}

export interface HTMLRendererWidgetData {
  html?: string;
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
  summary?: string;  // Short summary below headline
  time?: string;
  url?: string;
}

export interface NewsWidgetData {
  items: NewsItem[];
  interval?: number; // Seconds between transitions (default: 10)
}

export type WidgetData =
  | HomeWidgetData
  | TextWidgetData
  | FileViewerWidgetData
  | HTMLRendererWidgetData
  | WeatherWidgetData
  | NewsWidgetData;

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  data: WidgetData;
  scrollable?: boolean; // Ari can set this to force scroll mode for long content
  createdAt: string;
  updatedAt: string;
}

export interface CreateWidgetRequest {
  type: WidgetType;
  title: string;
  position: WidgetPosition;
  data: WidgetData;
}

export interface UpdateWidgetRequest {
  title?: string;
  position?: WidgetPosition;
  data?: WidgetData;
}

// Ari Sidebar types
export type AriStatusState = 'idle' | 'working' | 'agents' | 'error';

export interface AriStatus {
  state: AriStatusState;
  message?: string;
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

export interface FeedEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'task_started' | 'task_completed';
  message: string;
  details?: string;
}
