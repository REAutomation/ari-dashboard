/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - In-memory Ari status storage service
 */

import { AriStatus } from '../types/widget';

class StatusStore {
  private status: AriStatus;

  constructor() {
    this.status = {
      state: 'idle',
      activeTasks: [],
      updatedAt: new Date().toISOString()
    };
    console.log('[StatusStore] Initialized with default idle state');
  }

  getStatus(): AriStatus {
    return { ...this.status };
  }

  updateStatus(partial: Partial<AriStatus>): AriStatus {
    this.status = {
      ...this.status,
      ...partial,
      updatedAt: new Date().toISOString()
    };
    console.log(`[StatusStore] Status updated to: ${this.status.state}`);
    return { ...this.status };
  }
}

export const statusStore = new StatusStore();
