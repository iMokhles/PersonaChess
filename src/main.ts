/**
 * Electron Main Process
 * PersonaChess application entry point
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { DEFAULT_FEATURE_OPTIONS, FeatureOptions, mergeFeatureOptions } from './engine/featureOptions';
import { createDebugLogger } from './shared/debug';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const FEATURE_OPTIONS_PATH = () => path.join(app.getPath('userData'), 'feature-options.json');
const logger = createDebugLogger('main');

function readMirroredFeatureOptions(): FeatureOptions {
  try {
    const saved = fs.readFileSync(FEATURE_OPTIONS_PATH(), 'utf8');
    return mergeFeatureOptions(JSON.parse(saved));
  } catch {
    return { ...DEFAULT_FEATURE_OPTIONS };
  }
}

function shouldOpenDevTools(options: FeatureOptions): boolean {
  const isDevelopment = Boolean(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  return isDevelopment && !app.isPackaged && !options.securityDevToolsOnly;
}

function persistMirroredFeatureOptions(options: FeatureOptions): void {
  try {
    if (!options.persistEngineConfig) {
      fs.rmSync(FEATURE_OPTIONS_PATH(), { force: true });
      return;
    }

    fs.writeFileSync(FEATURE_OPTIONS_PATH(), JSON.stringify(options, null, 2), 'utf8');
  } catch (error) {
    logger.error('Failed to persist feature options mirror:', error);
  }
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 600,
    title: 'PersonaChess',
    backgroundColor: '#0d1117',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      devTools: !app.isPackaged,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const isDevUrl = MAIN_WINDOW_VITE_DEV_SERVER_URL && url.startsWith(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    const isFileUrl = url.startsWith('file://');

    if (!isDevUrl && !isFileUrl) {
      event.preventDefault();
    }
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (shouldOpenDevTools(readMirroredFeatureOptions())) {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', createWindow);

app.on('web-contents-created', (_event, contents) => {
  contents.session.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create a window when the dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('feature-options:sync', (_event, partialOptions: FeatureOptions) => {
  const options = mergeFeatureOptions(partialOptions);
  persistMirroredFeatureOptions(options);
});
