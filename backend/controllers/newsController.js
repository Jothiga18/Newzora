const newsService = require('../services/newsService');

/**
 * Get all news articles
 * GET /api/news
 */
const getAllNews = async (req, res) => {
  try {
    const news = await newsService.getAllNews();
    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error in getAllNews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news',
      error: error.message
    });
  }
};

/**
 * Get news by ID
 * GET /api/news/:id
 */
const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    const news = await newsService.getNewsById(id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error in getNewsById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch news article',
      error: error.message
    });
  }
};

module.exports = { getAllNews, getNewsById };
