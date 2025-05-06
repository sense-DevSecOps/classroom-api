# Google Classroom API Tool - Firebase Deployment

This tool provides an interface to the Google Classroom API. It's configured to be deployed on Firebase Hosting with Firebase Cloud Functions.

## Project Structure

```
classroom-api/
├── public/                  # Static files for Firebase hosting
│   ├── index.html           # Main application (Google Classroom Tool)
│   └── classroom-mock.html  # Mock classroom file
├── functions/               # Firebase Cloud Functions
│   ├── index.js             # Functions implementation (API credentials)
│   └── package.json         # Functions dependencies
├── firebase.json            # Firebase configuration
├── .firebaserc              # Firebase project settings
└── package.json             # Root project dependencies
```

## Deployment Instructions

### Prerequisites

1. Install Firebase CLI globally:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Create a new Firebase project in the [Firebase Console](https://console.firebase.google.com/)

### Step 1: Update Project Configuration

Update the `.firebaserc` file with your Firebase project ID:
```json
{
  "projects": {
    "default": "YOUR-PROJECT-ID"
  }
}
```

### Step 2: Configure API Credentials

For security, you should store your Google API credentials as environment variables in Firebase:

```
firebase functions:config:set google.client_id="YOUR_CLIENT_ID" google.api_key="YOUR_API_KEY"
```

Then update the functions/index.js file to use these configurations:
```javascript
const credentials = {
  CLIENT_ID: functions.config().google.client_id,
  API_KEY: functions.config().google.api_key
};
```

### Step 3: Install Dependencies

Install dependencies for both the root project and functions:
```
npm install
cd functions
npm install
cd ..
```

### Step 4: Deploy to Firebase

Deploy both hosting and functions:
```
firebase deploy
```

Or deploy individually:
```
firebase deploy --only hosting
firebase deploy --only functions
```

### Step 5: Configure Google Cloud Project

1. Go to your [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Google Classroom API
3. Configure OAuth consent screen
4. Create an OAuth client ID for a web application
5. Add your Firebase hosting URL to the authorized JavaScript origins

## Local Development

Run the Firebase emulators for local testing:
```
firebase emulators:start
```

## Important Security Notes

1. Never commit API keys or Client IDs to your repository
2. Use Firebase environment configuration to store sensitive data
3. Set up proper authentication for your Cloud Functions
4. Configure CORS appropriately for production use
