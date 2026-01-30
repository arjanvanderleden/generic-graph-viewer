import Store from 'electron-store';

interface StoreSchema {
  recentFiles: string[];
}

const MAX_RECENT_FILES = 10;

export class RecentFilesStore {
  private store: Store<StoreSchema>;

  constructor() {
    this.store = new Store<StoreSchema>({
      name: 'generic-graph-view',
      defaults: {
        recentFiles: []
      }
    });
  }

  getRecentFiles(): string[] {
    return this.store.get('recentFiles', []);
  }

  addRecentFile(filePath: string): void {
    const recentFiles = this.getRecentFiles();

    // Remove if already exists (to move to top)
    const filtered = recentFiles.filter((f) => f !== filePath);

    // Add to beginning
    filtered.unshift(filePath);

    // Limit to max
    const limited = filtered.slice(0, MAX_RECENT_FILES);

    this.store.set('recentFiles', limited);
  }

  clearRecentFiles(): void {
    this.store.set('recentFiles', []);
  }
}
