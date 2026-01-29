/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Avatar component with state-based animations
 */

import { useState } from 'react';
import type { AriStatus } from '@/types/widget';

interface AriAvatarProps {
  status: AriStatus | null;
  minimized: boolean;
}

export function AriAvatar({ status, minimized }: AriAvatarProps) {
  const [avatarSet, setAvatarSet] = useState<'donkey' | 'goat'>(() => {
    const stored = localStorage.getItem('ari-avatar-set');
    return (stored === 'goat' ? 'goat' : 'donkey') as 'donkey' | 'goat';
  });

  const handleAvatarClick = () => {
    const newSet = avatarSet === 'donkey' ? 'goat' : 'donkey';
    setAvatarSet(newSet);
    localStorage.setItem('ari-avatar-set', newSet);
  };

  const state = status?.state || 'idle';
  const avatarPath = '/assets/avatars/' + avatarSet + '_' + state + '.png';

  const getStatusText = () => {
    switch (state) {
      case 'idle':
        return 'Idle';
      case 'working':
        return 'Working...';
      case 'agents':
        return 'Agents running';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getAnimationClass = () => {
    switch (state) {
      case 'idle':
        return 'animate-pulse-slow';
      case 'working':
        return 'animate-bob';
      case 'agents':
        return 'animate-pulse-fast';
      case 'error':
        return 'animate-shake';
      default:
        return '';
    }
  };

  const sizeClass = minimized ? 'w-12 h-12' : 'w-20 h-20';
  const animClass = getAnimationClass();

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleAvatarClick}
        className={'relative rounded-full overflow-hidden border-2 border-border hover:border-primary transition-all duration-200 ' + animClass}
        title={'Switch avatar (current: ' + avatarSet + ')'}
      >
        <img
          src={avatarPath}
          alt={'Ari ' + state}
          className={sizeClass + ' object-cover transition-all duration-200'}
        />
      </button>

      {!minimized && (
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-foreground">{getStatusText()}</p>
          {status?.message && (
            <p className="text-xs text-muted-foreground line-clamp-2 max-w-[240px]">
              {status.message}
            </p>
          )}
        </div>
      )}

      <style>
        {`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes pulse-fast {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-pulse-fast { animation: pulse-fast 1.5s ease-in-out infinite; }
        .animate-bob { animation: bob 2s ease-in-out infinite; }
        .animate-shake { animation: shake 0.5s ease-in-out infinite; }
        `}
      </style>
    </div>
  );
}
