/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Display mode hook for auto-scaling widgets
 *
 * Display Mode: Content auto-scales to fit container (no scroll)
 * Interactive Mode: Original sizes with scroll enabled
 */

import { createContext, useContext, useState, useCallback } from 'react';

export type DisplayMode = 'display' | 'interactive';

interface DisplayModeContextType {
  mode: DisplayMode;
  toggleMode: () => void;
  setMode: (mode: DisplayMode) => void;
  // Track which widgets are temporarily in interactive mode (per-widget override)
  interactiveWidgets: Set<string>;
  setWidgetInteractive: (widgetId: string, interactive: boolean) => void;
  isWidgetInteractive: (widgetId: string) => boolean;
}

export const DisplayModeContext = createContext<DisplayModeContextType | null>(null);

export function useDisplayMode() {
  const context = useContext(DisplayModeContext);
  if (!context) {
    throw new Error('useDisplayMode must be used within a DisplayModeProvider');
  }
  return context;
}

export function useDisplayModeState() {
  const [mode, setModeState] = useState<DisplayMode>(() => {
    const stored = localStorage.getItem('ari-dashboard-display-mode');
    return stored === 'interactive' ? 'interactive' : 'display';
  });

  const [interactiveWidgets, setInteractiveWidgets] = useState<Set<string>>(new Set());

  const setMode = useCallback((newMode: DisplayMode) => {
    setModeState(newMode);
    localStorage.setItem('ari-dashboard-display-mode', newMode);
    // Reset per-widget overrides when changing global mode
    setInteractiveWidgets(new Set());
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === 'display' ? 'interactive' : 'display');
  }, [mode, setMode]);

  const setWidgetInteractive = useCallback((widgetId: string, interactive: boolean) => {
    setInteractiveWidgets(prev => {
      const next = new Set(prev);
      if (interactive) {
        next.add(widgetId);
      } else {
        next.delete(widgetId);
      }
      return next;
    });
  }, []);

  const isWidgetInteractive = useCallback((widgetId: string) => {
    // In interactive mode, all widgets are interactive
    if (mode === 'interactive') return true;
    // In display mode, check per-widget override
    return interactiveWidgets.has(widgetId);
  }, [mode, interactiveWidgets]);

  return {
    mode,
    toggleMode,
    setMode,
    interactiveWidgets,
    setWidgetInteractive,
    isWidgetInteractive,
  };
}
