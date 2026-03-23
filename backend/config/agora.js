require('dotenv').config();

/**
 * Agora Configuration
 * Get your App ID and App Certificate from https://console.agora.io/
 */
const agoraConfig = {
  appId: process.env.AGORA_APP_ID || '',
  appCertificate: process.env.AGORA_APP_CERTIFICATE || '',
  privilegeExpiredTs: 3600, // Token validity in seconds (1 hour)
  role: 1 // 1 = host, 2 = audience
};

module.exports = agoraConfig;
