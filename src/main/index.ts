import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { createMenu } from './menu';
import { RecentFilesStore } from './store';

let mainWindow: BrowserWindow | null = null;
const recentFilesStore = new RecentFilesStore();

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    icon: join(__dirname, '../../build/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    titleBarStyle: 'hiddenInset',
    show: false
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create application menu
  createMenu(mainWindow, recentFilesStore);

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5199');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'));
  }
}

// IPC Handlers
ipcMain.handle('file:open-dialog', async () => {
  if (!mainWindow) return null;

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  try {
    const content = await readFile(filePath, 'utf-8');
    recentFilesStore.addRecentFile(filePath);
    // Update menu with new recent files
    createMenu(mainWindow!, recentFilesStore);
    return { filePath, content };
  } catch (error) {
    return { error: `Failed to read file: ${error}` };
  }
});

ipcMain.handle('file:open-path', async (_event, filePath: string) => {
  try {
    const content = await readFile(filePath, 'utf-8');
    recentFilesStore.addRecentFile(filePath);
    createMenu(mainWindow!, recentFilesStore);
    return { filePath, content };
  } catch (error) {
    return { error: `Failed to read file: ${error}` };
  }
});

ipcMain.handle('file:get-recent', () => {
  return recentFilesStore.getRecentFiles();
});

ipcMain.handle('file:clear-recent', () => {
  recentFilesStore.clearRecentFiles();
  createMenu(mainWindow!, recentFilesStore);
  return true;
});

ipcMain.handle('file:save-png', async (_event, data: string, defaultName: string) => {
  if (!mainWindow) return { success: false, error: 'No window' };

  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [{ name: 'PNG Image', extensions: ['png'] }]
  });

  if (result.canceled || !result.filePath) {
    return { success: false, canceled: true };
  }

  try {
    // Data is base64 encoded PNG
    const buffer = Buffer.from(data.replace(/^data:image\/png;base64,/, ''), 'base64');
    await writeFile(result.filePath, buffer);
    return { success: true, filePath: result.filePath };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

ipcMain.handle('file:save-svg', async (_event, data: string, defaultName: string) => {
  if (!mainWindow) return { success: false, error: 'No window' };

  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [{ name: 'SVG Image', extensions: ['svg'] }]
  });

  if (result.canceled || !result.filePath) {
    return { success: false, canceled: true };
  }

  try {
    await writeFile(result.filePath, data, 'utf-8');
    return { success: true, filePath: result.filePath };
  } catch (error) {
    return { success: false, error: String(error) };
  }
});

// App lifecycle
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
