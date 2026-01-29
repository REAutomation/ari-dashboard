/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Dashboard header component
 */

import { useEffect, useState } from 'react';
import { Sun, Moon, LayoutDashboard, Monitor, MousePointer2 } from 'lucide-react';
import { socket } from '@/lib/socket';
import { useTheme } from '@/hooks/useTheme';
import { useDisplayMode } from '@/hooks/useDisplayMode';
import { activatePreset } from '@/lib/api';

export function Header() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loadingPreset, setLoadingPreset] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { mode, toggleMode } = useDisplayMode();

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      clearInterval(timer);
    };
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleBriefingClick = async () => {
    try {
      setLoadingPreset(true);
      await activatePreset('briefing');
    } catch (error) {
      console.error('Failed to activate briefing preset:', error);
    } finally {
      setLoadingPreset(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <img
            src="/assets/re-automation-logo.svg"
            alt="RE Automation"
            className="h-7 dark:invert dark:opacity-80 opacity-80"
          />
          <div className="h-5 w-px bg-border" />
          <span className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
            Ari Dashboard
          </span>
        </div>

        <div className="flex items-center space-x-5">
          <button
            onClick={handleBriefingClick}
            disabled={loadingPreset}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Briefing laden"
          >
            <LayoutDashboard size={16} className={loadingPreset ? 'animate-pulse' : ''} />
          </button>

          <button
            onClick={toggleMode}
            className={`p-1.5 rounded-md transition-colors ${
              mode === 'interactive'
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
            title={mode === 'display' ? 'Interaktiv-Modus aktivieren' : 'Display-Modus aktivieren'}
          >
            {mode === 'display' ? <Monitor size={16} /> : <MousePointer2 size={16} />}
          </button>

          <div className="h-4 w-px bg-border" />

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <div className="flex items-center space-x-2">
            <div
              className={`h-2 w-2 rounded-full transition-colors ${
                isConnected ? 'bg-primary' : 'bg-destructive'
              }`}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="text-right">
            <div className="text-sm font-medium tabular-nums">{formatTime(currentDate)}</div>
            <div className="text-xs text-muted-foreground">{formatDate(currentDate)}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
