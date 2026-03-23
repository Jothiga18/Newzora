const { pool } = require('../config/database');

/**
 * Get or create a user
 * @param {Object} userData - User data
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @returns {Promise<Object>} User object
 */
const getOrCreateUser = async ({ name, email }) => {
  try {
    // Check if user exists
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return existingUsers[0];
    }

    // Create new user
    const [result] = await pool.query(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );

    return {
      id: result.insertId,
      name,
      email
    };
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw error;
  }
};

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object|null>} User or null
 */
const getUserById = async (userId) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [userId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw error;
  }
};

module.exports = { getOrCreateUser, getUserById };
