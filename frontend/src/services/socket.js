import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.eventHandlers = new Map();
  }

  /**
   * Connect to Socket.IO server
   */
  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Socket connected:', this.socket.id);
      this.connected = true;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.connected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.connected = false;
    });

    // Re-emit registered event handlers
    this.socket.on('user_joined', (data) => {
      this.emit('user_joined', data);
    });

    this.socket.on('user_left', (data) => {
      this.emit('user_left', data);
    });

    this.socket.on('room_users', (data) => {
      this.emit('room_users', data);
    });

    this.socket.on('room_full', (data) => {
      this.emit('room_full', data);
    });

    this.socket.on('user_audio_toggled', (data) => {
      this.emit('user_audio_toggled', data);
    });

    this.socket.on('user_video_toggled', (data) => {
      this.emit('user_video_toggled', data);
    });

    return this.socket;
  }

  /**
   * Disconnect from Socket.IO server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Join a room
   */
  joinRoom(roomId, userId, userName) {
    if (this.socket) {
      this.socket.emit('join_room', { roomId, userId, userName });
    }
  }

  /**
   * Leave a room
   */
  leaveRoom(roomId, userId, userName) {
    if (this.socket) {
      this.socket.emit('leave_room', { roomId, userId, userName });
    }
  }

  /**
   * Toggle audio
   */
  toggleAudio(roomId, userId, enabled) {
    if (this.socket) {
      this.socket.emit('toggle_audio', { roomId, userId, enabled });
    }
  }

  /**
   * Toggle video
   */
  toggleVideo(roomId, userId, enabled) {
    if (this.socket) {
      this.socket.emit('toggle_video', { roomId, userId, enabled });
    }
  }

  /**
   * Register event handler
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);

    // Also register with socket if connected
    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  /**
   * Remove event handler
   */
  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }

    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  /**
   * Emit event
   */
  emit(event, data) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach((handler) => handler(data));
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
