const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');

// Configuration
const BACKEND_HOST = process.env.BACKEND_HOST || '127.0.0.1';
const BACKEND_PORT = process.env.BACKEND_PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

let mainWindow;

function checkBackendHealth() {
  return new Promise((resolve) => {
    // Check our Node.js backend
    const req = http.request({
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: '/',
      method: 'GET',
      timeout: 2000
    }, (res) => {
      if (res.statusCode === 200) {
        console.log('[DEBUG] main.js: Node.js backend health check passed');
        resolve(true);
      } else {
        console.log(`[DEBUG] main.js: Node.js backend health check failed with status ${res.statusCode}`);
        resolve(false);
      }
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      resolve(false);
    });

    req.end();
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "BBSNS - Secure Notarization Desktop",
    webPreferences: {
      // SECURITY WARNING: nodeIntegration: true is a security risk.
      // It is currently enabled to support legacy functionality.
      // TODO: Phase 2 - Refactor to use preload scripts and contextIsolation: true
      nodeIntegration: true,
      contextIsolation: false, // SECURITY WARNING: Should be true in production
      webSecurity: false // Allow CORS for dev - TODO: Remove in production
    }
  });

  // CSP: Allow everything for development to fix font/backend blocks
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https: http: ws: wss:; font-src 'self' https: data:; img-src 'self' data: blob: https: http:;"
        ]
      }
    });
  });

  // Load the Vite development server URL
  mainWindow.loadURL(FRONTEND_URL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function waitForBackend() {
  console.log(`[DEBUG] main.js: Waiting for Node.js backend to be ready on port ${BACKEND_PORT}...`);
  let attempts = 0;
  const maxAttempts = 60; // 60 seconds total

  while (attempts < maxAttempts) {
    const isHealthy = await checkBackendHealth();
    if (isHealthy) {
      console.log('[DEBUG] main.js: Backend confirmed, creating window...');
      createMainWindow();
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }

  console.error(`[DEBUG] main.js: Node.js backend failed to respond on port ${BACKEND_PORT}. App may not function correctly.`);
  // We still create the window in dev mode so the user can see what's wrong, but warning is logged
  createMainWindow();
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    waitForBackend();
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
