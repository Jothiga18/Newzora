const roomService = require('../services/roomService');
const userService = require('../services/userService');

/**
 * Create a new discussion room
 * POST /api/rooms/create
 */
const createRoom = async (req, res) => {
  try {
    const { newsId, hostName, hostEmail, maxUsers } = req.body;

    if (!newsId || !hostName || !hostEmail) {
      return res.status(400).json({
        success: false,
        message: 'newsId, hostName, and hostEmail are required'
      });
    }

    // Get or create user
    const user = await userService.getOrCreateUser({
      name: hostName,
      email: hostEmail
    });

    // Create room
    const room = await roomService.createRoom({
      newsId: parseInt(newsId),
      hostId: user.id,
      maxUsers: maxUsers || 10
    });

    res.status(201).json({
      success: true,
      data: {
        ...room,
        host: user
      }
    });
  } catch (error) {
    console.error('Error in createRoom:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room',
      error: error.message
    });
  }
};

/**
 * Join a room
 * POST /api/rooms/join
 */
const joinRoom = async (req, res) => {
  try {
    const { roomId, userName, userEmail } = req.body;

    if (!roomId || !userName || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'roomId, userName, and userEmail are required'
      });
    }

    // Get or create user
    const user = await userService.getOrCreateUser({
      name: userName,
      email: userEmail
    });

    // Join room
    const result = await roomService.joinRoom(roomId, user.id);

    res.status(200).json({
      success: true,
      data: {
        room: result.room,
        user,
        participantCount: result.participantCount
      }
    });
  } catch (error) {
    console.error('Error in joinRoom:', error);

    // Handle specific errors
    if (error.message === 'Room not found or inactive') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'User already in room') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    if (error.message === 'Room is full') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to join room',
      error: error.message
    });
  }
};

/**
 * Leave a room
 * POST /api/rooms/leave
 */
const leaveRoom = async (req, res) => {
  try {
    const { roomId, userId } = req.body;

    if (!roomId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'roomId and userId are required'
      });
    }

    const result = await roomService.leaveRoom(roomId, parseInt(userId));

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in leaveRoom:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to leave room',
      error: error.message
    });
  }
};

/**
 * Get room by ID
 * GET /api/rooms/:roomId
 */
const getRoomById = async (req, res) => {
  try {
    const { roomId } = req.params;

    const room = await roomService.getRoomById(roomId);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    console.error('Error in getRoomById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get room',
      error: error.message
    });
  }
};

module.exports = { createRoom, joinRoom, leaveRoom, getRoomById };
