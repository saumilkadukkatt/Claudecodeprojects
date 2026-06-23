import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { setupIpcHandlers } from './ipc';
import { DatabaseService } from './services/database.service';
import { SettingsService } from './services/settings.service';
import { logger } from '../shared/utils/logger';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 960,
    minWidth: 1200,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
    },
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 16 },
    backgroundColor: '#0f172a',
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Open external links in the default browser, not in Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function initialize() {
  try {
    logger.info('Initializing AI Browser Agent');

    await DatabaseService.getInstance().initialize();
    await SettingsService.getInstance().initialize();

    setupIpcHandlers(ipcMain);

    logger.info('Services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

app.whenReady().then(async () => {
  await initialize();
  await createWindow();

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  logger.info('Application shutting down');
  await DatabaseService.getInstance().close();
});

export { mainWindow };
