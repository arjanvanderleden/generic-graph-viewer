import { Menu, BrowserWindow, app } from 'electron';
import { RecentFilesStore } from './store';
import { basename } from 'path';

let radialLayoutEnabled = false;

export function createMenu(
  mainWindow: BrowserWindow,
  recentFilesStore: RecentFilesStore
): void {
  const recentFiles = recentFilesStore.getRecentFiles();

  const recentFilesSubmenu: Electron.MenuItemConstructorOptions[] =
    recentFiles.length > 0
      ? [
          ...recentFiles.map((filePath) => ({
            label: basename(filePath),
            click: () => {
              mainWindow.webContents.send('menu:open-recent', filePath);
            }
          })),
          { type: 'separator' as const },
          {
            label: 'Clear Recent',
            click: () => {
              recentFilesStore.clearRecentFiles();
              createMenu(mainWindow, recentFilesStore);
            }
          }
        ]
      : [{ label: 'No Recent Files', enabled: false }];

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'Open...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            mainWindow.webContents.send('menu:open-file');
          }
        },
        {
          label: 'Open Recent',
          submenu: recentFilesSubmenu
        },
        { type: 'separator' },
        {
          label: 'Reload Document',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.webContents.send('menu:reload-document');
          }
        },
        { type: 'separator' },
        {
          label: 'Export as PNG...',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => {
            mainWindow.webContents.send('menu:export-png');
          }
        },
        {
          label: 'Export as SVG...',
          accelerator: 'CmdOrCtrl+Shift+S',
          click: () => {
            mainWindow.webContents.send('menu:export-svg');
          }
        },
        { type: 'separator' },
        { role: 'close' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Layout Settings...',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            mainWindow.webContents.send('menu:open-layout-settings');
          }
        },
        {
          label: 'Radial Layout',
          type: 'checkbox',
          checked: radialLayoutEnabled,
          click: (menuItem) => {
            radialLayoutEnabled = menuItem.checked;
            mainWindow.webContents.send('menu:toggle-radial', radialLayoutEnabled);
          }
        },
        { type: 'separator' },
        {
          label: 'Zoom to Fit',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow.webContents.send('menu:zoom-to-fit');
          }
        },
        {
          label: 'Zoom to Selection',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            mainWindow.webContents.send('menu:zoom-to-selection');
          }
        },
        { type: 'separator' },
        {
          label: 'Reload App',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow.webContents.reload();
          }
        },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
