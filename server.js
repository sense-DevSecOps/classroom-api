const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Load environment variables
require('dotenv').config();

// Use API credentials from environment variables
const API_CREDENTIALS = {
  CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  API_KEY: process.env.GOOGLE_API_KEY
};

// Validate credentials are present
if (!API_CREDENTIALS.CLIENT_ID || !API_CREDENTIALS.API_KEY) {
  console.error('ERROR: API credentials missing. Please set GOOGLE_CLIENT_ID and GOOGLE_API_KEY in your .env file.');
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle API credentials request
  if (pathname === '/api/credentials') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(API_CREDENTIALS));
    return;
  }

  // Serve static files from public directory
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
  const extname = path.extname(filePath);
  
  // Set content type based on file extension
  let contentType = 'text/html';
  switch (extname) {
    case '.js':
      contentType = 'text/javascript';
      break;
    case '.css':
      contentType = 'text/css';
      break;
    case '.json':
      contentType = 'application/json';
      break;
    case '.png':
      contentType = 'image/png';
      break;
    case '.jpg':
      contentType = 'image/jpg';
      break;
  }

  // Read file and serve
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

const PORT = process.env.PORT || 9000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('API credentials are loaded and will be provided securely.');
});
