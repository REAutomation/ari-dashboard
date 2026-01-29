/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - News widget with fade transitions
 */

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { NewsWidgetData } from '@/types/widget';

interface NewsWidgetProps {
  data: NewsWidgetData;
}

const categoryColors: Record<string, string> = {
  'Industrie': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Lokal': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Tech': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Wirtschaft': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  'Sport': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Wissen': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  'default': 'bg-secondary text-secondary-foreground',
};

export function NewsWidget({ data }: NewsWidgetProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const items = data.items || [];
  const interval = (data.interval || 10) * 1000; // Default 10 seconds

  useEffect(() => {
    if (items.length <= 1) return;

    const timer = setInterval(() => {
      // Fade out
      setIsVisible(false);

      // After fade out, change item and fade in
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
        setIsVisible(true);
      }, 500); // 500ms fade out duration
    }, interval);

    return () => clearInterval(timer);
  }, [items.length, interval]);

  if (items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <p>Keine News verfügbar</p>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || categoryColors['default'];
  };

  return (
    <div className="h-full flex items-center px-4">
      <div
        className={`flex-1 flex items-center gap-4 transition-opacity duration-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Category Badge */}
        {currentItem.category && (
          <Badge
            variant="secondary"
            className={`${getCategoryColor(currentItem.category)} text-sm font-semibold px-3 py-1 flex-shrink-0`}
          >
            {currentItem.category}
          </Badge>
        )}

        {/* Headline and Summary */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold truncate">
            {currentItem.headline}
          </h3>
          {currentItem.summary && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              {currentItem.summary}
            </p>
          )}
        </div>

        {/* Time */}
        {currentItem.time && (
          <span className="text-sm text-muted-foreground flex-shrink-0">
            {currentItem.time}
          </span>
        )}

        {/* Progress dots */}
        {items.length > 1 && (
          <div className="flex gap-1.5 flex-shrink-0 ml-2">
            {items.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  index === currentIndex
                    ? 'bg-primary'
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
