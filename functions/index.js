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

  // Get credentials from Firebase environment config
  // Set with: firebase functions:config:set google.client_id="YOUR_ID" google.api_key="YOUR_KEY"
  const credentials = {
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID || process.env.FIREBASE_CONFIG?.google?.client_id,
    API_KEY: process.env.GOOGLE_API_KEY || process.env.FIREBASE_CONFIG?.google?.api_key,
  };
  
  // Log warning if credentials are missing (but don't expose what's missing)
  if (!credentials.CLIENT_ID || !credentials.API_KEY) {
    logger.warn("API credentials missing or incomplete");
  }

  response.json(credentials);
});
