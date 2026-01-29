/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Sidebar state management hook
 */

import { useState, useEffect } from 'react';
import { socket } from '@/lib/socket';
import { getStatus, getFeed } from '@/lib/api';
import type { AriStatus, FeedEntry } from '@/types/widget';

export function useSidebar() {
  const [status, setStatus] = useState<AriStatus | null>(null);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [sidebarExpanded, setSidebarExpanded] = useState<boolean>(() => {
    const stored = localStorage.getItem('ari-sidebar-expanded');
    return stored !== null ? stored === 'true' : true;
  });

  const toggleSidebar = () => {
    setSidebarExpanded((prev) => {
      const newValue = !prev;
      localStorage.setItem('ari-sidebar-expanded', String(newValue));
      return newValue;
    });
  };

  useEffect(() => {
    // Fetch initial data
    const fetchInitialData = async () => {
      try {
        const [statusData, feedData] = await Promise.all([
          getStatus(),
          getFeed(50),
        ]);
        setStatus(statusData);
        setFeed(feedData);
      } catch (error) {
        console.error('Failed to fetch sidebar data:', error);
        // Set default idle state if API fails
        setStatus({
          state: 'idle',
          message: 'Connecting...',
          updatedAt: new Date().toISOString(),
        });
      }
    };

    fetchInitialData();

    // Listen to socket events
    const handleStatusUpdated = (newStatus: AriStatus) => {
      console.log('Status updated:', newStatus);
      setStatus(newStatus);
    };

    const handleFeedNew = (newEntry: FeedEntry) => {
      console.log('New feed entry:', newEntry);
      setFeed((prev) => [newEntry, ...prev].slice(0, 50)); // Keep last 50 entries
    };

    socket.on('status:updated', handleStatusUpdated);
    socket.on('feed:new', handleFeedNew);

    return () => {
      socket.off('status:updated', handleStatusUpdated);
      socket.off('feed:new', handleFeedNew);
    };
  }, []);

  return {
    status,
    feed,
    sidebarExpanded,
    toggleSidebar,
  };
}
