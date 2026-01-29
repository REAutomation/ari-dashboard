/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - Main sidebar component with Ari status and activity feed
 */

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSidebar } from '@/hooks/useSidebar';
import { AriAvatar } from '@/components/sidebar/AriAvatar';
import { TaskList } from '@/components/sidebar/TaskList';
import { ActivityFeed } from '@/components/sidebar/ActivityFeed';
import { Badge } from '@/components/ui/badge';

export function Sidebar() {
  const { status, feed, sidebarExpanded, toggleSidebar } = useSidebar();

  const taskCount = status?.activeTasks?.length || 0;

  return (
    <div
      className={
        'relative h-full bg-card border-l border-border transition-all duration-200 flex-shrink-0 ' +
        (sidebarExpanded ? 'w-[280px]' : 'w-[72px]')
      }
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -left-3 top-6 z-10 w-6 h-6 rounded-full bg-card border border-border hover:bg-accent transition-colors flex items-center justify-center shadow-sm"
        title={sidebarExpanded ? 'Minimize sidebar' : 'Expand sidebar'}
      >
        {sidebarExpanded ? (
          <ChevronRight className="w-3 h-3 text-muted-foreground" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-muted-foreground" />
        )}
      </button>

      {/* Sidebar content */}
      <div className="h-full flex flex-col overflow-hidden">
        {/* Avatar section - always visible */}
        <div className="p-4 border-b border-border">
          <AriAvatar status={status} minimized={!sidebarExpanded} />
          
          {/* Task count badge in minimized mode */}
          {!sidebarExpanded && taskCount > 0 && (
            <div className="flex justify-center mt-2">
              <Badge variant="info" className="text-xs">
                {taskCount}
              </Badge>
            </div>
          )}
        </div>

        {/* Expanded content */}
        {sidebarExpanded && (
          <>
            {/* Active tasks section */}
            {taskCount > 0 && (
              <div className="p-4 border-b border-border">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Active Tasks
                </h3>
                <TaskList tasks={status?.activeTasks} />
              </div>
            )}

            {/* Activity feed section - scrollable */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border flex-shrink-0">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Activity Feed
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-2">
                <ActivityFeed entries={feed} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
