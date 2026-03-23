const agoraConfig = require('../config/agora');
const { AccessToken } = require('agora-access-token');

/**
 * Generate Agora RTC token for joining a channel
 * @param {string} channelName - Channel/Room name
 * @param {string|number} uid - User ID
 * @param {string} role - User role ('host' or 'audience')
 * @returns {string} Agora token
 */
const generateToken = (channelName, uid, role = 'host') => {
  try {
    const appId = agoraConfig.appId;
    const appCertificate = agoraConfig.appCertificate;

    if (!appId || !appCertificate) {
      throw new Error('Agora credentials not configured');
    }

    // Set role based on parameter
    const roleValue = role === 'host' ? 1 : 2;

    // Create access token
    const token = new AccessToken(appId, appCertificate, channelName, uid);

    // Add privileges
    token.addPrivilege(AccessToken.Privileges.joinChannel, agoraConfig.privilegeExpiredTs);
    token.addPrivilege(AccessToken.Privileges.publishAudioStream, agoraConfig.privilegeExpiredTs);
    token.addPrivilege(AccessToken.Privileges.publishVideoStream, agoraConfig.privilegeExpiredTs);
    token.addPrivilege(AccessToken.Privileges.publishDataStream, agoraConfig.privilegeExpiredTs);

    return token.toString();
  } catch (error) {
    console.error('Error generating Agora token:', error);
    throw error;
  }
};

/**
 * Validate Agora credentials
 * @returns {boolean} True if credentials are configured
 */
const isConfigured = () => {
  return !!(agoraConfig.appId && agoraConfig.appCertificate);
};

module.exports = { generateToken, isConfigured };
