const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// POST /api/rooms/create - Create a new room
router.post('/create', roomController.createRoom);

// POST /api/rooms/join - Join a room
router.post('/join', roomController.joinRoom);

// POST /api/rooms/leave - Leave a room
router.post('/leave', roomController.leaveRoom);

// GET /api/rooms/:roomId - Get room by ID
router.get('/:roomId', roomController.getRoomById);

module.exports = router;
