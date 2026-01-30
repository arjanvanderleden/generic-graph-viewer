# Project Structure

Detailed breakdown of the project's file organization.

## Root Directory

```
generic-graph-view/
├── src/                    # Source code
│   ├── main/              # Electron main process
│   ├── preload/           # Preload scripts
│   └── renderer/          # React application
├── documentation/          # Project documentation
│   ├── usage/             # User documentation
│   └── development/       # Developer documentation
├── test-data/             # Sample graph files
├── build/                 # Build resources (icons)
├── dist/                  # Compiled renderer (Vite output)
├── dist-electron/         # Compiled Electron (main + preload)
├── release/               # Packaged applications
├── index.html             # Renderer entry HTML
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── electron.vite.config.ts # Electron-vite configuration
└── CLAUDE.md              # AI assistant context
```

## Source Directory Structure

### Main Process (`src/main/`)

```
src/main/
├── index.ts               # Application entry point
│                          # - Window creation
│                          # - IPC handlers
│                          # - App lifecycle
├── menu.ts                # Application menu
│                          # - Menu template
│                          # - Keyboard shortcuts
│                          # - Menu events → IPC
└── store.ts               # Persistent storage
                           # - Recent files list
                           # - electron-store wrapper
```

### Preload Script (`src/preload/`)

```
src/preload/
└── index.ts               # Context bridge
                           # - ElectronAPI interface
                           # - IPC method wrappers
                           # - Global type declaration
```

### Renderer Process (`src/renderer/`)

```
src/renderer/
├── main.tsx               # React entry point
├── App.tsx                # Root component
├── App.css                # App-level styles
├── index.css              # Global styles & CSS variables
│
├── components/            # React components
│   ├── Graph/            # Visualization components
│   │   ├── GraphCanvas.tsx    # SVG rendering
│   │   ├── GraphCanvas.css    # Canvas styles
│   │   └── useForceGraph.ts   # D3 simulation hook
│   │
│   ├── Layout/           # Structural components
│   │   ├── AppLayout.tsx      # Grid layout
│   │   ├── AppLayout.css
│   │   ├── TitleBar.tsx       # Window title
│   │   ├── TitleBar.css
│   │   ├── ThemeToggle.tsx    # Theme switch
│   │   ├── ThemeToggle.css
│   │   ├── LayoutSettingsModal.tsx  # Force params
│   │   └── LayoutSettingsModal.css
│   │
│   ├── Sidebar/          # Sidebar components
│   │   ├── Sidebar.tsx        # Container + sections
│   │   ├── Sidebar.css
│   │   ├── SearchInput.tsx    # Node search
│   │   ├── SearchInput.css
│   │   ├── GraphStats.tsx     # Statistics
│   │   ├── GraphStats.css
│   │   ├── CategoryLegend.tsx # Category controls
│   │   ├── CategoryLegend.css
│   │   ├── PropertyPanel.tsx  # Selection details
│   │   ├── PropertyPanel.css
│   │   ├── NodeListItem.tsx   # Reusable node item
│   │   ├── NodeListItem.css
│   │   ├── NodePropertiesModal.tsx  # Properties modal
│   │   └── NodePropertiesModal.css
│   │
│   ├── Icons.tsx          # SVG icon components
│   └── ErrorBoundary.tsx  # Error handling
│
├── context/               # State management
│   ├── GraphContext.tsx       # Graph data & settings
│   ├── SelectionContext.tsx   # Selection state
│   └── ThemeContext.tsx       # Theme state
│
├── hooks/                 # Custom hooks
│   └── useGraphLoader.ts      # File loading logic
│
├── utils/                 # Utility functions
│   ├── graphValidation.ts     # Parse, validate, index
│   └── categoryColors.ts      # Color assignment
│
├── config/                # Configuration
│   └── constants.ts           # Magic numbers
│
└── types/                 # Type definitions
    └── graph.ts               # Graph data types
```

## Module Boundaries

### Import Rules

```
┌─────────────────────────────────────────────────────────────┐
│                      main process                            │
│   Can import: Node.js, Electron main APIs                   │
│   Cannot import: renderer code                              │
└─────────────────────────────────────────────────────────────┘
                           │
                    (IPC only)
                           │
┌─────────────────────────────────────────────────────────────┐
│                     preload script                           │
│   Can import: Electron contextBridge, ipcRenderer           │
│   Cannot import: main code, renderer code, Node.js fs/etc   │
└─────────────────────────────────────────────────────────────┘
                           │
                  (contextBridge)
                           │
┌─────────────────────────────────────────────────────────────┐
│                    renderer process                          │
│   Can import: React, D3, own modules                        │
│   Cannot import: Electron, Node.js, main/preload            │
│   Access to: window.electronAPI (exposed via preload)       │
└─────────────────────────────────────────────────────────────┘
```

### Internal Import Order

Within the renderer, follow this import order:

```typescript
// 1. React and external libraries
import { useState, useEffect } from 'react';
import * as d3 from 'd3';

// 2. Contexts
import { useGraph } from '../../context/GraphContext';

// 3. Components
import { NodeListItem } from './NodeListItem';

// 4. Utilities
import { getNodeById } from '../../utils/graphValidation';

// 5. Constants
import { NODE_RADIUS } from '../../config/constants';

// 6. Types
import type { Node, Edge } from '../../types/graph';

// 7. Styles
import './ComponentName.css';
```

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Component | PascalCase | `GraphCanvas.tsx` |
| Hook | camelCase with `use` | `useForceGraph.ts` |
| Utility | camelCase | `graphValidation.ts` |
| Context | PascalCase with `Context` | `GraphContext.tsx` |
| Types | camelCase | `graph.ts` |
| CSS | Same as component | `GraphCanvas.css` |
| Constants | camelCase | `constants.ts` |

## Configuration Files

```
Root Configuration:
├── package.json           # NPM configuration
│                          # - dependencies
│                          # - scripts
│                          # - electron-builder config
│
├── tsconfig.json          # TypeScript config
│                          # - strict mode enabled
│                          # - path aliases
│                          # - target ES2020
│
├── tsconfig.node.json     # Node-specific TS config
│                          # - for config files
│
├── electron.vite.config.ts # Build configuration
│                          # - main/preload/renderer
│                          # - dev server port
│
└── .gitignore             # Git ignore rules
```

## Build Outputs

### Development
```
dist-electron/
├── main/
│   └── index.js           # Compiled main process
└── preload/
    └── index.js           # Compiled preload script

dist/
├── index.html             # Renderer HTML
└── assets/
    ├── index-*.js         # Bundled React app
    └── index-*.css        # Bundled styles
```

### Production
```
release/
└── {version}/
    ├── mac-universal/     # macOS universal build
    ├── win-unpacked/      # Windows unpacked
    └── linux-unpacked/    # Linux unpacked
```

## Adding New Features

### New Component Checklist

1. Create component file: `src/renderer/components/{Category}/{Name}.tsx`
2. Create styles: `src/renderer/components/{Category}/{Name}.css`
3. Import styles in component
4. Export from component (named export preferred)
5. Add to parent component or route

### New Context Checklist

1. Create context file: `src/renderer/context/{Name}Context.tsx`
2. Define state interface
3. Define action types
4. Create reducer
5. Create context and provider
6. Create hook (`use{Name}`)
7. Export action creators
8. Wrap app in provider (App.tsx)

### New IPC Handler Checklist

1. Add handler in `src/main/index.ts`:
   ```typescript
   ipcMain.handle('channel:action', async (event, ...args) => {
     // Implementation
   });
   ```
2. Add type and method in `src/preload/index.ts`:
   ```typescript
   interface ElectronAPI {
     newMethod: (arg: Type) => Promise<Result>;
   }

   const electronAPI = {
     newMethod: (arg) => ipcRenderer.invoke('channel:action', arg)
   };
   ```
3. Use in renderer:
   ```typescript
   const result = await window.electronAPI.newMethod(arg);
   ```
