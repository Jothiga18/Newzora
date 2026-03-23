const agoraService = require('../services/agoraService');

/**
 * Generate Agora token
 * GET /api/agora/token
 */
const getToken = async (req, res) => {
  try {
    const { roomId, userId, role } = req.query;

    if (!roomId || !userId) {
      return res.status(400).json({
        success: false,
        message: 'roomId and userId are required'
      });
    }

    // Check if Agora is configured
    if (!agoraService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Agora is not configured. Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE in .env'
      });
    }

    const token = agoraService.generateToken(roomId, userId, role || 'host');

    res.status(200).json({
      success: true,
      data: {
        token,
        appId: process.env.AGORA_APP_ID
      }
    });
  } catch (error) {
    console.error('Error in getToken:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate token',
      error: error.message
    });
  }
};

module.exports = { getToken };
