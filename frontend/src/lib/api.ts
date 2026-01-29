/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - REST API client
 */

import type { Widget, CreateWidgetRequest, UpdateWidgetRequest } from '@/types/widget';

const API_URL = import.meta.env.VITE_API_URL || window.location.origin;

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

export async function getWidgets(): Promise<Widget[]> {
  return fetchAPI<Widget[]>('/api/widgets');
}

export async function createWidget(request: CreateWidgetRequest): Promise<Widget> {
  return fetchAPI<Widget>('/api/widgets', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function updateWidget(id: string, request: UpdateWidgetRequest): Promise<Widget> {
  return fetchAPI<Widget>(`/api/widgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(request),
  });
}

export async function deleteWidget(id: string): Promise<void> {
  await fetchAPI<void>(`/api/widgets/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadFile(file: File): Promise<{ url: string; fileName: string; fileType: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const url = `${API_URL}/api/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed ${response.status}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('File upload failed', error);
    throw error;
  }
}

// Ari Sidebar API
export async function getStatus(): Promise<import('@/types/widget').AriStatus> {
  return fetchAPI<import('@/types/widget').AriStatus>('/api/status');
}

export async function getFeed(limit = 50): Promise<import('@/types/widget').FeedEntry[]> {
  return fetchAPI<import('@/types/widget').FeedEntry[]>(`/api/feed?limit=${limit}`);
}

// Dashboard Presets API
export interface DashboardPreset {
  id: string;
  name: string;
  displayName: string;
  widgets: Widget[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getPresets(): Promise<DashboardPreset[]> {
  return fetchAPI<DashboardPreset[]>('/api/presets');
}

export async function getPreset(name: string): Promise<DashboardPreset> {
  return fetchAPI<DashboardPreset>(`/api/presets/${name}`);
}

export async function activatePreset(name: string): Promise<DashboardPreset> {
  return fetchAPI<DashboardPreset>(`/api/presets/${name}/activate`, {
    method: 'POST',
  });
}

export async function getDefaultPreset(): Promise<DashboardPreset | null> {
  try {
    return await fetchAPI<DashboardPreset>('/api/presets/default');
  } catch (error) {
    // No default preset found
    return null;
  }
}
