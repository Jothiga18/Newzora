const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// GET /api/news - Get all news
router.get('/', newsController.getAllNews);

// GET /api/news/:id - Get news by ID
router.get('/:id', newsController.getNewsById);

module.exports = router;
