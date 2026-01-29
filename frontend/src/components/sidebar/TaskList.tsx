/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Active tasks list component
 */

import { Badge } from '@/components/ui/badge';
import type { AriTask } from '@/types/widget';

interface TaskListProps {
  tasks: AriTask[] | undefined;
}

export function TaskList({ tasks }: TaskListProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-muted-foreground">No active tasks</p>
      </div>
    );
  }

  const getTimeSince = (timestamp: string) => {
    const now = new Date();
    const start = new Date(timestamp);
    const diff = now.getTime() - start.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return hours + 'h ago';
    if (minutes > 0) return minutes + 'm ago';
    return seconds + 's ago';
  };

  const getStatusBadge = (status: AriTask['status']) => {
    switch (status) {
      case 'running':
        return <Badge variant="info">Running</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-foreground line-clamp-2 flex-1">
              {task.name}
            </p>
            {getStatusBadge(task.status)}
          </div>
          <p className="text-xs text-muted-foreground">
            Started {getTimeSince(task.startedAt)}
          </p>
        </div>
      ))}
    </div>
  );
}
