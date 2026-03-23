// Track users in rooms
const roomUsers = new Map();

/**
 * Initialize Socket.IO event handlers
 * @param {Object} io - Socket.IO instance
 */
const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // User joins a room
    socket.on('join_room', (data) => {
      const { roomId, userId, userName } = data;
      
      // Join the socket room
      socket.join(roomId);
      
      // Track user in room
      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Map());
      }
      roomUsers.get(roomId).set(userId, { socketId: socket.id, userName, userId });
      
      // Get current participant count
      const participantCount = roomUsers.get(roomId).size;
      
      // Notify others in the room
      socket.to(roomId).emit('user_joined', {
        userId,
        userName,
        participantCount,
        users: Array.from(roomUsers.get(roomId).values())
      });
      
      // Send current participants to the joining user
      socket.emit('room_users', {
        users: Array.from(roomUsers.get(roomId).values()),
        participantCount
      });
      
      console.log(`👤 ${userName} joined room ${roomId} (${participantCount} users)`);
    });

    // User leaves a room
    socket.on('leave_room', (data) => {
      const { roomId, userId, userName } = data;
      
      handleUserLeave(socket, io, roomId, userId, userName);
    });

    // User toggles audio
    socket.on('toggle_audio', (data) => {
      const { roomId, userId, enabled } = data;
      socket.to(roomId).emit('user_audio_toggled', { userId, enabled });
    });

    // User toggles video
    socket.on('toggle_video', (data) => {
      const { roomId, userId, enabled } = data;
      socket.to(roomId).emit('user_video_toggled', { userId, enabled });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.id}`);
      
      // Find and remove user from any room they were in
      for (const [roomId, users] of roomUsers.entries()) {
        for (const [userId, userData] of users.entries()) {
          if (userData.socketId === socket.id) {
            handleUserLeave(socket, io, roomId, userId, userData.userName);
            break;
          }
        }
      }
    });
  });
};

/**
 * Handle user leaving a room
 */
const handleUserLeave = (socket, io, roomId, userId, userName) => {
  // Remove user from tracking
  if (roomUsers.has(roomId)) {
    roomUsers.get(roomId).delete(userId);
    
    // If room is empty, remove it
    if (roomUsers.get(roomId).size === 0) {
      roomUsers.delete(roomId);
    }
  }
  
  // Leave the socket room
  socket.leave(roomId);
  
  // Get updated participant count
  const participantCount = roomUsers.has(roomId) ? roomUsers.get(roomId).size : 0;
  
  // Notify others in the room
  io.to(roomId).emit('user_left', {
    userId,
    userName,
    participantCount,
    users: roomUsers.has(roomId) ? Array.from(roomUsers.get(roomId).values()) : []
  });
  
  console.log(`👋 ${userName} left room ${roomId} (${participantCount} users remaining)`);
};

/**
 * Get current participants in a room
 */
const getRoomParticipants = (roomId) => {
  if (roomUsers.has(roomId)) {
    return Array.from(roomUsers.get(roomId).values());
  }
  return [];
};

module.exports = { initializeSocket, getRoomParticipants };
