/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Display mode context provider
 */

import { ReactNode } from 'react';
import { DisplayModeContext, useDisplayModeState } from '@/hooks/useDisplayMode';

interface DisplayModeProviderProps {
  children: ReactNode;
}

export function DisplayModeProvider({ children }: DisplayModeProviderProps) {
  const displayMode = useDisplayModeState();

  return (
    <DisplayModeContext.Provider value={displayMode}>
      {children}
    </DisplayModeContext.Provider>
  );
}
