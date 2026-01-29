/**
 * RE Automation GmbH - 2026
 * Ari Dashboard - WebSocket service for real-time updates
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { Widget, AriStatus, FeedEntry } from '../types/widget';

class SocketService {
  private io: SocketIOServer | null = null;

  init(httpServer: HttpServer, corsOrigin: string[]): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: corsOrigin,
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`[SocketService] Client connected: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`[SocketService] Client disconnected: ${socket.id}`);
      });

      socket.on('widget:subscribe', (data) => {
        console.log(`[SocketService] Client ${socket.id} subscribed to widget: ${data.widgetId}`);
      });
    });

    console.log('[SocketService] Socket.IO server initialized');
  }

  emitWidgetCreated(widget: Widget): void {
    if (this.io) {
      this.io.emit('widget:created', widget);
      console.log(`[SocketService] Emitted widget:created event for widget ${widget.id}`);
    }
  }

  emitWidgetUpdated(widget: Widget): void {
    if (this.io) {
      this.io.emit('widget:updated', widget);
      console.log(`[SocketService] Emitted widget:updated event for widget ${widget.id}`);
    }
  }

  emitWidgetDeleted(id: string): void {
    if (this.io) {
      this.io.emit('widget:deleted', { id });
      console.log(`[SocketService] Emitted widget:deleted event for widget ${id}`);
    }
  }

  emitStatusUpdated(status: AriStatus): void {
    if (this.io) {
      this.io.emit('status:updated', status);
      console.log(`[SocketService] Emitted status:updated event with state: ${status.state}`);
    }
  }

  emitFeedNew(entry: FeedEntry): void {
    if (this.io) {
      this.io.emit('feed:new', entry);
      console.log(`[SocketService] Emitted feed:new event for entry ${entry.id}`);
    }
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const socketService = new SocketService();
