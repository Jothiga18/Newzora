const express = require('express');
const router = express.Router();
const agoraController = require('../controllers/agoraController');

// GET /api/agora/token - Generate Agora token
router.get('/token', agoraController.getToken);

module.exports = router;
