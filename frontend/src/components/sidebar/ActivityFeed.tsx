/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Activity feed component
 */

import {
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Play,
  CheckCheck,
} from 'lucide-react';
import type { FeedEntry } from '@/types/widget';

interface ActivityFeedProps {
  entries: FeedEntry[];
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now.getTime() - then.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return days + 'd ago';
    if (hours > 0) return hours + 'h ago';
    if (minutes > 0) return minutes + 'm ago';
    return seconds + 's ago';
  };

  const getIcon = (type: FeedEntry['type']) => {
    const iconClass = 'w-4 h-4 flex-shrink-0';
    switch (type) {
      case 'info':
        return <Info className={iconClass + ' text-muted-foreground'} />;
      case 'success':
        return <CheckCircle className={iconClass + ' text-emerald-500'} />;
      case 'warning':
        return <AlertTriangle className={iconClass + ' text-amber-500'} />;
      case 'error':
        return <XCircle className={iconClass + ' text-red-500'} />;
      case 'task_started':
        return <Play className={iconClass + ' text-sky-500'} />;
      case 'task_completed':
        return <CheckCheck className={iconClass + ' text-emerald-500'} />;
      default:
        return <Info className={iconClass + ' text-muted-foreground'} />;
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="mt-0.5">{getIcon(entry.type)}</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground line-clamp-2">{entry.message}</p>
            {entry.details && (
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {entry.details}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {getRelativeTime(entry.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
