/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Home widget component
 */

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import type { HomeWidgetData } from '@/types/widget';

interface HomeWidgetProps {
  data: HomeWidgetData;
}

export function HomeWidget({ data }: HomeWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'idle':
        return 'success';
      case 'working':
        return 'warning';
      case 'meeting':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'idle':
        return 'Idle';
      case 'working':
        return 'Working';
      case 'meeting':
        return 'In Meeting';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-6 p-6">
      <div className="text-8xl">🤖</div>

      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">
          {data.greeting || 'Hello, I am Ari'}
        </h2>

        {data.status && (
          <div className="flex items-center justify-center space-x-2">
            <Badge variant={getStatusColor(data.status)} className={data.status === 'working' ? 'animate-pulse' : ''}>
              {getStatusText(data.status)}
            </Badge>
          </div>
        )}
      </div>

      {data.currentTask && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Current Task</p>
          <p className="text-lg font-medium">{data.currentTask}</p>
        </div>
      )}

      <div className="text-4xl font-bold">{formatTime(currentTime)}</div>

      {data.infoItems && data.infoItems.length > 0 && (
        <div className="w-full max-w-md space-y-2">
          {data.infoItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50"
            >
              {item.icon && <span className="text-lg">{item.icon}</span>}
              {!item.icon && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
              <span className="text-sm text-muted-foreground">{item.label}:</span>
              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
