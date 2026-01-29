/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Main dashboard layout component
 */

import { useEffect, useState } from 'react';
import { getWidgets, getDefaultPreset, activatePreset } from '@/lib/api';
import { useSocket } from '@/hooks/useSocket';
import { WidgetContainer } from '@/components/WidgetContainer';
import { Sidebar } from '@/components/Sidebar';
import type { Widget } from '@/types/widget';

export function Dashboard() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useSocket(widgets, setWidgets);

  useEffect(() => {
    const fetchWidgets = async () => {
      try {
        setLoading(true);
        const data = await getWidgets();
        
        // If no widgets exist, try to load default preset
        if (data.length === 0) {
          try {
            const defaultPreset = await getDefaultPreset();
            if (defaultPreset) {
              console.log('No widgets found, activating default preset:', defaultPreset.name);
              await activatePreset(defaultPreset.name);
              // Widgets will be loaded via socket event
              return;
            }
          } catch (presetError) {
            console.log('No default preset available');
          }
        }
        
        setWidgets(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch widgets:', err);
        setError('Failed to load widgets. Please check if the backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchWidgets();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl animate-pulse">🤖</div>
            <p className="text-lg text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
        <Sidebar />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-6xl">⚠️</div>
            <p className="text-lg font-medium text-destructive">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
        <Sidebar />
      </div>
    );
  }

  if (widgets.length === 0) {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-8xl animate-bounce">🤖</div>
            <h2 className="text-2xl font-bold">Waiting for Ari...</h2>
            <p className="text-muted-foreground">
              No widgets yet. Ari will create them when ready.
            </p>
          </div>
        </div>
        <Sidebar />
      </div>
    );
  }

  // Calculate total grid rows needed from widget positions
  const totalRows = widgets.reduce((max, w) => {
    return Math.max(max, w.position.y + w.position.h);
  }, 1);

  // Build grid template rows - main rows get 1fr, bottom single-row widgets get less
  const buildGridTemplateRows = () => {
    // Find widgets in the last row
    const lastRowWidgets = widgets.filter(w => w.position.y === totalRows - 1);
    const lastRowIsThin = lastRowWidgets.length > 0 && lastRowWidgets.every(w => w.position.h === 1);

    if (lastRowIsThin && totalRows > 1) {
      // Give less space to the bottom thin row (about 2/3 of a normal row)
      const mainRows = Array(totalRows - 1).fill('1fr').join(' ');
      return `${mainRows} 0.5fr`;
    }
    return `repeat(${totalRows}, 1fr)`;
  };

  // Header = 56px (h-14), padding = 20px top + 20px bottom
  const availableHeight = 'calc(100vh - 56px - 40px)';

  return (
    <div className="flex h-full">
      {/* Main dashboard grid */}
      <div className="flex-1 p-5 overflow-hidden">
        <div
          className="grid grid-cols-12 gap-3"
          style={{
            height: availableHeight,
            gridTemplateRows: buildGridTemplateRows(),
          }}
        >
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="animate-fade-in min-h-0"
              style={{
                gridColumn: 'span ' + Math.min(widget.position.w, 12),
                gridRow: (widget.position.y + 1) + ' / span ' + widget.position.h,
              }}
            >
              <WidgetContainer widget={widget} />
            </div>
          ))}
        </div>

        <style>
          {`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
          `}
        </style>
      </div>

      {/* Sidebar */}
      <Sidebar />
    </div>
  );
}
