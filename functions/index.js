/**
 * Firebase Cloud Functions for Google Classroom API Tool
 *
 * This module provides secure access to API credentials and other
 * backend services.
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

/**
 * Cloud Function to provide API credentials securely
 * For production, store credentials in Firebase Environment Config
 * Set them using: firebase functions:config:set
 * google.client_id="YOUR_ID" google.api_key="YOUR_KEY"
 */
exports.getApiCredentials = onRequest({cors: true}, (request, response) => {
  // Log credential access (without exposing actual credentials)
  logger.info("API credentials requested", {
    origin: request.headers.origin || "unknown",
    ip: request.ip,
    timestamp: new Date().toISOString(),
  });

  // In production, use these values from environment config
  // const credentials = {
  //   CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  //   API_KEY: process.env.GOOGLE_API_KEY,
  // };

  // For development/demo, use these values
  const credentials = {
    CLIENT_ID: "606661610781-t1fgt6kdqi8see1he837s6dqg1sbpi7l" +
      ".apps.googleusercontent.com",
    API_KEY: "AIzaSyCm4vaBRV7Xd-e57rDQRpry7C76Miv0H0E",
  };

  response.json(credentials);
});
