/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Auto-scale wrapper for widget content
 *
 * In display mode: Scales content to fit within container (no scroll)
 * In interactive mode: Shows content at original size with scroll
 */

import { useRef, useEffect, useState, ReactNode } from 'react';
import { Maximize2 } from 'lucide-react';
import { useDisplayMode } from '@/hooks/useDisplayMode';

interface AutoScaleWrapperProps {
  widgetId: string;
  children: ReactNode;
  // Minimum scale factor (don't shrink below this)
  minScale?: number;
  // Whether Ari explicitly set this widget to be scrollable
  forceScrollable?: boolean;
  // Padding inside the container
  padding?: number;
}

export function AutoScaleWrapper({
  widgetId,
  children,
  minScale = 0.5,
  forceScrollable = false,
  padding = 0,
}: AutoScaleWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [needsScaling, setNeedsScaling] = useState(false);
  const { isWidgetInteractive, setWidgetInteractive } = useDisplayMode();

  const isInteractive = forceScrollable || isWidgetInteractive(widgetId);

  useEffect(() => {
    if (isInteractive) {
      setScale(1);
      setNeedsScaling(false);
      return;
    }

    const calculateScale = () => {
      if (!containerRef.current || !contentRef.current) return;

      const container = containerRef.current;
      const content = contentRef.current;

      // Get available space
      const containerWidth = container.clientWidth - padding * 2;
      const containerHeight = container.clientHeight - padding * 2;

      // Get content's natural size
      const contentWidth = content.scrollWidth;
      const contentHeight = content.scrollHeight;

      // Check if content overflows
      if (contentWidth <= containerWidth && contentHeight <= containerHeight) {
        setScale(1);
        setNeedsScaling(false);
        return;
      }

      // Calculate scale needed to fit
      const scaleX = containerWidth / contentWidth;
      const scaleY = containerHeight / contentHeight;
      const newScale = Math.max(Math.min(scaleX, scaleY), minScale);

      setScale(newScale);
      setNeedsScaling(newScale < 1);
    };

    // Calculate on mount and resize
    calculateScale();

    const resizeObserver = new ResizeObserver(calculateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [isInteractive, minScale, padding]);

  const handleToggleInteractive = () => {
    setWidgetInteractive(widgetId, !isWidgetInteractive(widgetId));
  };

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full ${isInteractive ? 'overflow-auto' : 'overflow-hidden'}`}
    >
      <div
        ref={contentRef}
        className="origin-top-left"
        style={{
          transform: isInteractive ? 'none' : `scale(${scale})`,
          transformOrigin: 'top left',
          width: isInteractive ? '100%' : scale < 1 ? `${100 / scale}%` : '100%',
        }}
      >
        {children}
      </div>

      {/* Interactive toggle button - shown when content is scaled or in interactive mode */}
      {(needsScaling || isInteractive) && (
        <button
          onClick={handleToggleInteractive}
          className={`absolute bottom-2 right-2 p-1.5 rounded-md transition-all z-10 ${
            isInteractive
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground'
          }`}
          title={isInteractive ? 'Zum Display-Modus wechseln' : 'Zum Interaktiv-Modus wechseln'}
        >
          <Maximize2 size={14} />
        </button>
      )}
    </div>
  );
}
