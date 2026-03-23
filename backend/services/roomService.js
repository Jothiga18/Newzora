const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Create a new discussion room
 * @param {Object} roomData - Room data
 * @param {number} roomData.newsId - News article ID
 * @param {number} roomData.hostId - Host user ID
 * @param {number} roomData.maxUsers - Maximum users allowed (default 10)
 * @returns {Promise<Object>} Created room
 */
const createRoom = async ({ newsId, hostId, maxUsers = 10 }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Generate unique room ID
    const roomId = uuidv4().slice(0, 8).toUpperCase();

    // Insert room
    const [roomResult] = await connection.query(
      'INSERT INTO rooms (id, news_id, host_id, max_users, status) VALUES (?, ?, ?, ?, ?)',
      [roomId, newsId, hostId, maxUsers, 'active']
    );

    // Add host as first participant
    await connection.query(
      'INSERT INTO room_participants (room_id, user_id) VALUES (?, ?)',
      [roomId, hostId]
    );

    await connection.commit();

    return {
      id: roomId,
      news_id: newsId,
      host_id: hostId,
      max_users: maxUsers,
      status: 'active'
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error in createRoom:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Join a room
 * @param {string} roomId - Room ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Join result
 */
const joinRoom = async (roomId, userId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if room exists and is active
    const [rooms] = await connection.query(
      'SELECT * FROM rooms WHERE id = ? AND status = ?',
      [roomId, 'active']
    );

    if (rooms.length === 0) {
      throw new Error('Room not found or inactive');
    }

    const room = rooms[0];

    // Check if user is already in the room
    const [existingParticipants] = await connection.query(
      'SELECT * FROM room_participants WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    );

    if (existingParticipants.length > 0) {
      throw new Error('User already in room');
    }

    // Check max participants
    const [participants] = await connection.query(
      'SELECT COUNT(*) as count FROM room_participants WHERE room_id = ?',
      [roomId]
    );

    if (participants[0].count >= room.max_users) {
      throw new Error('Room is full');
    }

    // Add user as participant
    await connection.query(
      'INSERT INTO room_participants (room_id, user_id) VALUES (?, ?)',
      [roomId, userId]
    );

    await connection.commit();

    return {
      room,
      participantCount: participants[0].count + 1
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error in joinRoom:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Leave a room
 * @param {string} roomId - Room ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} Leave result
 */
const leaveRoom = async (roomId, userId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check if room exists
    const [rooms] = await connection.query(
      'SELECT * FROM rooms WHERE id = ?',
      [roomId]
    );

    if (rooms.length === 0) {
      throw new Error('Room not found');
    }

    const room = rooms[0];

    // Remove user from participants
    await connection.query(
      'DELETE FROM room_participants WHERE room_id = ? AND user_id = ?',
      [roomId, userId]
    );

    // Get remaining participants count
    const [participants] = await connection.query(
      'SELECT COUNT(*) as count FROM room_participants WHERE room_id = ?',
      [roomId]
    );

    let result = { message: 'User left room', roomEnded: false };

    // If host leaves, check if room should end or transfer
    if (room.host_id === userId) {
      if (participants[0].count === 0) {
        // No more participants, end the room
        await connection.query(
          'UPDATE rooms SET status = ? WHERE id = ?',
          ['ended', roomId]
        );
        result.roomEnded = true;
      } else {
        // Transfer host to first remaining participant
        const [newHost] = await connection.query(
          'SELECT user_id FROM room_participants WHERE room_id = ? ORDER BY joined_at ASC LIMIT 1',
          [roomId]
        );
        if (newHost.length > 0) {
          await connection.query(
            'UPDATE rooms SET host_id = ? WHERE id = ?',
            [newHost[0].user_id, roomId]
          );
          result.newHostId = newHost[0].user_id;
        }
      }
    }

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('Error in leaveRoom:', error);
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Get room by ID
 * @param {string} roomId - Room ID
 * @returns {Promise<Object|null>} Room with participants
 */
const getRoomById = async (roomId) => {
  try {
    // Get room details
    const [rooms] = await pool.query(
      'SELECT * FROM rooms WHERE id = ?',
      [roomId]
    );

    if (rooms.length === 0) {
      return null;
    }

    const room = rooms[0];

    // Get participants with user details
    const [participants] = await pool.query(
      `SELECT rp.*, u.name, u.email 
       FROM room_participants rp 
       JOIN users u ON rp.user_id = u.id 
       WHERE rp.room_id = ?`,
      [roomId]
    );

    return {
      ...room,
      participants
    };
  } catch (error) {
    console.error('Error in getRoomById:', error);
    throw error;
  }
};

/**
 * Get all active rooms for a news article
 * @param {number} newsId - News article ID
 * @returns {Promise<Array>} Array of active rooms
 */
const getRoomsByNewsId = async (newsId) => {
  try {
    const [rooms] = await pool.query(
      'SELECT * FROM rooms WHERE news_id = ? AND status = ?',
      [newsId, 'active']
    );
    return rooms;
  } catch (error) {
    console.error('Error in getRoomsByNewsId:', error);
    throw error;
  }
};

module.exports = {
  createRoom,
  joinRoom,
  leaveRoom,
  getRoomById,
  getRoomsByNewsId
};
