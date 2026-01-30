# Architecture Overview

This document describes the high-level architecture of Generic Graph View.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Electron Application                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐    IPC     ┌─────────────────────────────────┐ │
│  │   Main Process  │◄──────────►│        Renderer Process         │ │
│  │                 │            │                                  │ │
│  │  - File System  │            │  ┌─────────────────────────────┐│ │
│  │  - Native Menu  │            │  │      React Application      ││ │
│  │  - Dialogs      │            │  │                             ││ │
│  │  - App Lifecycle│            │  │  ┌───────┐ ┌─────────────┐ ││ │
│  │                 │            │  │  │Context│ │  Components │ ││ │
│  └─────────────────┘            │  │  │ Layer │ │    Layer    │ ││ │
│          │                      │  │  └───────┘ └─────────────┘ ││ │
│          │                      │  │       │           │        ││ │
│  ┌───────▼─────────┐            │  │  ┌────▼───────────▼──────┐ ││ │
│  │  Preload Script │            │  │  │    D3 Visualization   │ ││ │
│  │                 │            │  │  └───────────────────────┘ ││ │
│  │  - Context      │            │  └─────────────────────────────┘│ │
│  │    Bridge       │            │                                  │ │
│  │  - IPC API      │            └─────────────────────────────────┘ │
│  └─────────────────┘                                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Process Model

### Main Process (`src/main/`)

The main process handles:
- **File System Access** - Reading graph JSON files
- **Native Dialogs** - Open/save file dialogs
- **Application Menu** - Menu bar with keyboard shortcuts
- **Window Management** - Creating and managing BrowserWindow
- **Recent Files** - Persisting recent file history

**Key Files:**
- `index.ts` - Application entry, IPC handlers, window creation
- `menu.ts` - Menu template and event dispatch
- `store.ts` - Recent files persistence

### Preload Script (`src/preload/`)

The preload script bridges main and renderer:
- **Context Bridge** - Exposes safe APIs to renderer
- **IPC Abstraction** - Wraps ipcRenderer methods
- **Type Definitions** - TypeScript types for the API

**Key Files:**
- `index.ts` - API definition and exposure

### Renderer Process (`src/renderer/`)

The renderer process contains the React application:
- **React Components** - UI layer
- **Context Providers** - State management
- **D3 Integration** - Force simulation and rendering
- **Hooks** - Reusable logic

## Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   JSON File  │────►│ Main Process │────►│   Renderer   │
└──────────────┘     └──────────────┘     └──────────────┘
                            │                     │
                      Read file via          Parse & validate
                      IPC handler            via hook
                            │                     │
                            ▼                     ▼
                     ┌──────────────┐     ┌──────────────┐
                     │  File Dialog │     │ GraphContext │
                     └──────────────┘     └──────────────┘
                                                 │
                                          Store graph data
                                          & build index
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │useForceGraph │
                                          └──────────────┘
                                                 │
                                          D3 simulation
                                          computes positions
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │ GraphCanvas  │
                                          └──────────────┘
                                                 │
                                          Render SVG
                                          elements
```

## Layer Architecture

### 1. Context Layer

Manages global application state using React Context + Reducer pattern:

```
┌─────────────────────────────────────────────────────────┐
│                    ThemeProvider                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                  GraphProvider                     │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │              SelectionProvider               │  │  │
│  │  │                                              │  │  │
│  │  │            <App Components />                │  │  │
│  │  │                                              │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**Contexts:**
| Context | Purpose |
|---------|---------|
| `ThemeContext` | Light/dark theme state |
| `GraphContext` | Graph data, settings, visibility |
| `SelectionContext` | Node/edge selection state |

### 2. Component Layer

React components organized by function:

```
src/renderer/components/
├── Graph/           # Visualization
│   ├── GraphCanvas  # Main SVG rendering
│   └── useForceGraph # D3 simulation hook
├── Layout/          # App structure
│   ├── AppLayout    # Main layout grid
│   ├── TitleBar     # Window title
│   └── LayoutSettingsModal
├── Sidebar/         # Side panel
│   ├── Sidebar      # Container + sections
│   ├── SearchInput  # Search functionality
│   ├── GraphStats   # Statistics display
│   ├── CategoryLegend # Category controls
│   └── PropertyPanel # Selection details
└── Icons.tsx        # Reusable SVG icons
```

### 3. Utility Layer

Pure functions and helpers:

```
src/renderer/utils/
├── graphValidation.ts  # Parsing, validation, indexing
└── categoryColors.ts   # Color assignment, visibility
```

### 4. Configuration Layer

```
src/renderer/config/
└── constants.ts    # Magic numbers, defaults
```

## Key Design Decisions

### 1. Refs for D3 Performance

The D3 force simulation updates 60+ times per second. Using React state would cause excessive re-renders. Instead:

```typescript
// ❌ Bad: State causes re-render on every tick
const [nodes, setNodes] = useState<D3Node[]>([]);

// ✅ Good: Ref doesn't trigger re-renders
const nodesRef = useRef<D3Node[]>([]);

// Manual re-render only when needed
const [, forceRender] = useReducer(x => x + 1, 0);
```

### 2. Index Maps for O(1) Lookups

Large graphs need efficient node/edge lookups:

```typescript
interface GraphIndex {
  nodeById: Map<string, Node>;
  edgeByKey: Map<string, Edge>;
}
```

Built once on load, used throughout the application.

### 3. Action Creators Pattern

All state changes go through typed action creators:

```typescript
// Define actions
type GraphAction =
  | { type: 'LOAD_SUCCESS'; payload: LoadedGraph }
  | { type: 'SET_FORCE_PARAMS'; payload: Partial<ForceParams> };

// Use action creators
dispatch(graphActions.setForceParams({ linkDistance: 200 }));
```

### 4. IPC Handler Refs

IPC listeners use refs to avoid re-registration:

```typescript
// Handler refs stay current
const openFileRef = useRef(openFile);
useEffect(() => {
  openFileRef.current = openFile;
}, [openFile]);

// Listeners registered once
useEffect(() => {
  const cleanup = window.electronAPI.onOpenFile(() => {
    openFileRef.current(); // Always calls current handler
  });
  return cleanup;
}, []); // Empty deps
```

## Security Model

### Context Isolation

The renderer process cannot directly access Node.js APIs:

```typescript
// main/index.ts
webPreferences: {
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: false
}
```

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self';
               style-src 'self' 'unsafe-inline';
               img-src 'self' blob: data:">
```

### Preload API Surface

Only specific, safe APIs are exposed:

```typescript
const electronAPI = {
  openFileDialog: () => ipcRenderer.invoke('file:open-dialog'),
  savePng: (data, name) => ipcRenderer.invoke('file:save-png', data, name),
  onOpenFile: (callback) => { /* ... */ }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
```

## Performance Considerations

### Rendering Optimization

1. **RAF Batching** - Simulation ticks batched via requestAnimationFrame
2. **Stable Keys** - Edge keys include index to handle duplicates
3. **Graph Version Tracking** - Prevents stale data during transitions
4. **Category Visibility** - Hidden nodes use opacity:0 (stay in DOM)

### Memory Management

1. **Simulation Cleanup** - Stop and null simulation on unmount
2. **RAF Cleanup** - Cancel pending animation frames
3. **IPC Listener Cleanup** - Remove listeners on unmount
4. **Index Rebuilding** - Index rebuilt only on new graph load
