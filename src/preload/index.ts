import { contextBridge, ipcRenderer } from 'electron';

export interface FileOpenResult {
  filePath: string;
  content: string;
}

export interface FileOpenError {
  error: string;
}

export type FileOpenResponse = FileOpenResult | FileOpenError | null;

export interface FileSaveResult {
  success: boolean;
  filePath?: string;
  error?: string;
  canceled?: boolean;
}

export interface ElectronAPI {
  openFileDialog: () => Promise<FileOpenResponse>;
  openFilePath: (filePath: string) => Promise<FileOpenResponse>;
  getRecentFiles: () => Promise<string[]>;
  clearRecentFiles: () => Promise<boolean>;
  savePng: (data: string, defaultName: string) => Promise<FileSaveResult>;
  saveSvg: (data: string, defaultName: string) => Promise<FileSaveResult>;
  onOpenFile: (callback: () => void) => () => void;
  onOpenRecent: (callback: (filePath: string) => void) => () => void;
  onToggleRadial: (callback: (enabled: boolean) => void) => () => void;
  onOpenLayoutSettings: (callback: () => void) => () => void;
  onZoomToFit: (callback: () => void) => () => void;
  onZoomToSelection: (callback: () => void) => () => void;
  onReloadDocument: (callback: () => void) => () => void;
  onExportPng: (callback: () => void) => () => void;
  onExportSvg: (callback: () => void) => () => void;
}

const electronAPI: ElectronAPI = {
  openFileDialog: () => ipcRenderer.invoke('file:open-dialog'),
  openFilePath: (filePath: string) => ipcRenderer.invoke('file:open-path', filePath),
  getRecentFiles: () => ipcRenderer.invoke('file:get-recent'),
  clearRecentFiles: () => ipcRenderer.invoke('file:clear-recent'),
  savePng: (data: string, defaultName: string) => ipcRenderer.invoke('file:save-png', data, defaultName),
  saveSvg: (data: string, defaultName: string) => ipcRenderer.invoke('file:save-svg', data, defaultName),
  onOpenFile: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('menu:open-file', handler);
    return () => ipcRenderer.removeListener('menu:open-file', handler);
  },
  onOpenRecent: (callback: (filePath: string) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, filePath: string) =>
      callback(filePath);
    ipcRenderer.on('menu:open-recent', handler);
    return () => ipcRenderer.removeListener('menu:open-recent', handler);
  },
  onToggleRadial: (callback: (enabled: boolean) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, enabled: boolean) =>
      callback(enabled);
    ipcRenderer.on('menu:toggle-radial', handler);
    return () => ipcRenderer.removeListener('menu:toggle-radial', handler);
  },
  onOpenLayoutSettings: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('menu:open-layout-settings', handler);
    return () => ipcRenderer.removeListener('menu:open-layout-settings', handler);
  },
  onZoomToFit: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('menu:zoom-to-fit', handler);
    return () => ipcRenderer.removeListener('menu:zoom-to-fit', handler);
  },
  onZoomToSelection: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('menu:zoom-to-selection', handler);
    return () => ipcRenderer.removeListener('menu:zoom-to-selection', handler);
  },
  onReloadDocument: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('menu:reload-document', handler);
    return () => ipcRenderer.removeListener('menu:reload-document', handler);
  },
  onExportPng: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('menu:export-png', handler);
    return () => ipcRenderer.removeListener('menu:export-png', handler);
  },
  onExportSvg: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('menu:export-svg', handler);
    return () => ipcRenderer.removeListener('menu:export-svg', handler);
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for renderer process
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
