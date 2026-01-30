# API Reference

Reference documentation for internal APIs, hooks, and utilities.

## Electron IPC API

### ElectronAPI Interface

Exposed via preload script at `window.electronAPI`.

```typescript
interface ElectronAPI {
  // File operations
  openFileDialog: () => Promise<{ success: true; data: string; filePath: string } | { success: false; cancelled?: boolean }>;
  savePng: (dataUrl: string, suggestedName: string) => Promise<{ success: boolean }>;
  saveSvg: (content: string, suggestedName: string) => Promise<{ success: boolean }>;

  // Event listeners (return cleanup function)
  onOpenFile: (callback: () => void) => () => void;
  onExportPng: (callback: () => void) => () => void;
  onExportSvg: (callback: () => void) => () => void;
}
```

### File Operations

#### openFileDialog

Opens native file dialog for JSON selection.

```typescript
const result = await window.electronAPI.openFileDialog();

if (result.success) {
  const content = result.data;      // File contents as string
  const path = result.filePath;     // Full file path
} else if (result.cancelled) {
  // User cancelled
}
```

#### savePng

Saves PNG image to user-selected location.

```typescript
const dataUrl = canvas.toDataURL('image/png');
const result = await window.electronAPI.savePng(dataUrl, 'graph.png');
```

#### saveSvg

Saves SVG content to user-selected location.

```typescript
const svgContent = '<svg>...</svg>';
const result = await window.electronAPI.saveSvg(svgContent, 'graph.svg');
```

### Event Listeners

#### Pattern

All listeners return a cleanup function.

```typescript
// Register
const cleanup = window.electronAPI.onOpenFile(() => {
  handleOpenFile();
});

// Cleanup (in useEffect return)
return cleanup;
```

---

## Context APIs

### GraphContext

State management for graph data and settings.

#### State Interface

```typescript
interface GraphState {
  graphData: GraphData | null;
  graphIndex: GraphIndex | null;
  stats: GraphStats | null;
  filePath: string | null;
  isLoading: boolean;
  error: string | null;
  radialLayout: boolean;
  forceParams: ForceParams;
  hiddenCategories: Set<string>;
}
```

#### Hook Usage

```typescript
import { useGraph, graphActions } from '../context/GraphContext';

function MyComponent() {
  const { state, dispatch } = useGraph();

  // Read state
  const nodes = state.graphData?.nodes ?? [];
  const isLoading = state.isLoading;

  // Dispatch actions
  dispatch(graphActions.setForceParams({ linkDistance: 200 }));
}
```

#### Actions

| Action | Payload | Purpose |
|--------|---------|---------|
| `loadStart` | - | Set loading state |
| `loadSuccess` | `LoadedGraph` | Store graph and index |
| `loadError` | `string` | Store error message |
| `clearGraph` | - | Reset to initial state |
| `setRadialLayout` | `boolean` | Toggle layout mode |
| `setForceParams` | `Partial<ForceParams>` | Update simulation |
| `toggleCategoryVisibility` | `string` | Toggle single category |
| `setHiddenCategories` | `Set<string>` | Set all hidden |

---

### SelectionContext

State management for user selection.

#### State Interface

```typescript
interface SelectionState {
  type: 'node' | 'edge' | null;
  ids: string[];
}
```

#### Hook Usage

```typescript
import { useSelection, selectionActions } from '../context/SelectionContext';

function MyComponent() {
  const { selection, dispatch } = useSelection();

  // Check selection
  const hasSelection = selection.type !== null;
  const isSelected = (id: string) =>
    selection.type === 'node' && selection.ids.includes(id);

  // Dispatch actions
  dispatch(selectionActions.selectNode('node-1'));
}
```

#### Actions

| Action | Payload | Purpose |
|--------|---------|---------|
| `selectNode` | `string` | Select single node |
| `selectNodes` | `string[]` | Select multiple nodes |
| `addNodes` | `string[]` | Add to selection |
| `removeNodes` | `string[]` | Remove from selection |
| `toggleNode` | `string` | Toggle in selection |
| `selectEdge` | `string` | Select edge |
| `clearSelection` | - | Clear all |

---

### ThemeContext

State management for theme.

#### Hook Usage

```typescript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
```

---

## Custom Hooks

### useForceGraph

Manages D3 force simulation.

```typescript
interface UseForceGraphOptions {
  graphData: GraphData | null;
  width: number;
  height: number;
  forceParams: ForceParams;
  radialLayout: boolean;
}

interface UseForceGraphResult {
  nodes: D3Node[];
  links: D3Link[];
  isStable: boolean;
}

const { nodes, links, isStable } = useForceGraph({
  graphData,
  width: 800,
  height: 600,
  forceParams: { linkDistance: 150, chargeStrength: -400 },
  radialLayout: false
});
```

### useGraphLoader

Handles file loading and IPC events.

```typescript
// Returns loading function
const openFile = useGraphLoader();

// Trigger file open
await openFile();
```

---

## Utility Functions

### graphValidation.ts

#### validateGraphData

Validates and parses graph JSON.

```typescript
function validateGraphData(data: unknown): ValidationResult<LoadedGraph>

// Usage
const result = validateGraphData(JSON.parse(content));
if (result.success) {
  const { graphData, stats } = result.data;
}
```

#### buildGraphIndex

Creates O(1) lookup maps.

```typescript
function buildGraphIndex(graphData: GraphData): GraphIndex

// Usage
const index = buildGraphIndex(graphData);
const node = index.nodeById.get('node-id');
```

#### getNodeById

Retrieves node by ID.

```typescript
function getNodeById(
  graphData: GraphData,
  id: string,
  index?: GraphIndex
): Node | undefined

// With index (O(1))
const node = getNodeById(graphData, 'node-1', index);

// Without index (O(n))
const node = getNodeById(graphData, 'node-1');
```

#### getEdgeByIds

Retrieves edge by source/target IDs.

```typescript
function getEdgeByIds(
  graphData: GraphData,
  sourceId: string,
  targetId: string,
  index?: GraphIndex
): Edge | undefined
```

#### createEdgeId

Creates consistent edge identifier.

```typescript
function createEdgeId(sourceId: string, targetId: string): string

// Usage
const id = createEdgeId('a', 'b'); // 'a|b'
```

---

### categoryColors.ts

#### getCategoryColor

Assigns consistent color to category.

```typescript
function getCategoryColor(category: string | undefined): string

// Usage
const color = getCategoryColor('Type A'); // '#4A90D9'
const defaultColor = getCategoryColor(undefined); // DEFAULT_NODE_COLOR
```

#### getCategoryColorMap

Creates color map for all categories.

```typescript
function getCategoryColorMap(nodes: Node[]): Map<string, string>

// Usage
const colorMap = getCategoryColorMap(nodes);
const color = colorMap.get('Type A');
```

---

## Type Definitions

### Graph Types

```typescript
// Node in the graph
interface Node {
  id: string;
  label: string;
  category?: string;
  properties?: Record<string, unknown>;
}

// Edge connecting nodes
interface Edge {
  sourceId: string;
  targetId: string;
  properties?: Record<string, unknown>;
}

// Complete graph data
interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

// Lookup index
interface GraphIndex {
  nodeById: Map<string, Node>;
  edgeByKey: Map<string, Edge>;
}

// Statistics
interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  invalidEdges: InvalidEdge[];
}
```

### D3 Types

```typescript
// Node with D3 simulation properties
interface D3Node extends Node {
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
}

// Link with D3 simulation properties
interface D3Link {
  source: D3Node | string;
  target: D3Node | string;
  index?: number;
}
```

### Configuration Types

```typescript
// Force simulation parameters
interface ForceParams {
  linkDistance: number;
  chargeStrength: number;
  collisionRadius: number;
}

// Default values
const FORCE_DEFAULTS: ForceParams = {
  linkDistance: 150,
  chargeStrength: -400,
  collisionRadius: 45
};
```

---

## Constants

```typescript
// config/constants.ts

// Rendering
export const NODE_RADIUS = 35;
export const ZOOM_SCALE_EXTENT: [number, number] = [0.1, 10];

// Interaction
export const SEARCH_DEBOUNCE_MS = 150;

// Forces
export const FORCE_DEFAULTS = {
  linkDistance: 150,
  chargeStrength: -400,
  collisionRadius: 45
};

// Colors
export const DEFAULT_NODE_COLOR = '#4A90D9';

// Internal
export const EDGE_ID_DELIMITER = '|';
```
