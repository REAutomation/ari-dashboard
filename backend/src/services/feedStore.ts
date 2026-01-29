/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - In-memory activity feed storage service
 */

import { v4 as uuidv4 } from 'uuid';
import { FeedEntry } from '../types/widget';

class FeedStore {
  private entries: FeedEntry[] = [];
  private readonly MAX_ENTRIES = 100;

  constructor() {
    console.log('[FeedStore] Initialized with empty feed');
  }

  getEntries(limit?: number): FeedEntry[] {
    const sortedEntries = [...this.entries].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    if (limit && limit > 0) {
      return sortedEntries.slice(0, limit);
    }
    
    return sortedEntries;
  }

  addEntry(entry: Omit<FeedEntry, 'id' | 'timestamp'>): FeedEntry {
    const newEntry: FeedEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...entry
    };

    this.entries.unshift(newEntry);

    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries = this.entries.slice(0, this.MAX_ENTRIES);
      console.log('[FeedStore] Trimmed feed to max entries');
    }

    const preview = newEntry.message.length > 50 
      ? newEntry.message.slice(0, 50) + '...' 
      : newEntry.message;
    console.log('[FeedStore] New entry added: ' + newEntry.type + ' - ' + preview);
    return newEntry;
  }

  count(): number {
    return this.entries.length;
  }
}

export const feedStore = new FeedStore();
