/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - React hook for Socket.io event handling
 */

import { useEffect } from 'react';
import { socket } from '@/lib/socket';
import { getWidgets } from '@/lib/api';
import type { Widget } from '@/types/widget';

export function useSocket(
  _widgets: Widget[],
  setWidgets: React.Dispatch<React.SetStateAction<Widget[]>>
) {
  useEffect(() => {
    const handleWidgetCreated = (widget: Widget) => {
      console.log('Widget created:', widget);
      setWidgets((prev) => [...prev, widget]);
    };

    const handleWidgetUpdated = (updatedWidget: Widget) => {
      console.log('Widget updated:', updatedWidget);
      setWidgets((prev) =>
        prev.map((w) => (w.id === updatedWidget.id ? updatedWidget : w))
      );
    };

    const handleWidgetDeleted = ({ id }: { id: string }) => {
      console.log('Widget deleted:', id);
      setWidgets((prev) => prev.filter((w) => w.id !== id));
    };

    const handlePresetActivated = async () => {
      console.log('Preset activated, refetching all widgets...');
      try {
        const widgets = await getWidgets();
        setWidgets(widgets);
      } catch (error) {
        console.error('Failed to refetch widgets after preset activation:', error);
      }
    };

    socket.on('widget:created', handleWidgetCreated);
    socket.on('widget:updated', handleWidgetUpdated);
    socket.on('widget:deleted', handleWidgetDeleted);
    socket.on('preset:activated', handlePresetActivated);

    return () => {
      socket.off('widget:created', handleWidgetCreated);
      socket.off('widget:updated', handleWidgetUpdated);
      socket.off('widget:deleted', handleWidgetDeleted);
      socket.off('preset:activated', handlePresetActivated);
    };
  }, [setWidgets]);
}
