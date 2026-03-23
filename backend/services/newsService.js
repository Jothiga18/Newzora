const { pool } = require('../config/database');

/**
 * Get all news articles
 * @returns {Promise<Array>} Array of news articles
 */
const getAllNews = async () => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, content, image_url, created_at FROM news ORDER BY created_at DESC'
    );
    return rows;
  } catch (error) {
    console.error('Error in getAllNews:', error);
    throw error;
  }
};

/**
 * Get news by ID
 * @param {number} newsId - The news article ID
 * @returns {Promise<Object|null>} News article or null
 */
const getNewsById = async (newsId) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, content, image_url, created_at FROM news WHERE id = ?',
      [newsId]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Error in getNewsById:', error);
    throw error;
  }
};

/**
 * Create a new news article (for seeding/testing)
 * @param {Object} newsData - News article data
 * @returns {Promise<Object>} Created news article
 */
const createNews = async (newsData) => {
  try {
    const { title, content, image_url } = newsData;
    const [result] = await pool.query(
      'INSERT INTO news (title, content, image_url) VALUES (?, ?, ?)',
      [title, content, image_url]
    );
    return { id: result.insertId, title, content, image_url };
  } catch (error) {
    console.error('Error in createNews:', error);
    throw error;
  }
};

module.exports = { getAllNews, getNewsById, createNews };
