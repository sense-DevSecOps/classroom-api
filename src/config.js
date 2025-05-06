// Configuration for GitHub Pages deployment using GitHub Secrets
// This file will be automatically populated by the GitHub Actions workflow
// from the repository secrets

export const GOOGLE_API_CONFIG = {
  // These values will be replaced during the build process
  // DO NOT add real credentials here - use GitHub Secrets instead
  CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || "PLACEHOLDER_CLIENT_ID",
  API_KEY: process.env.REACT_APP_GOOGLE_API_KEY || "PLACEHOLDER_API_KEY"
};
