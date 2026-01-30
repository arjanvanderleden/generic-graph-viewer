# Code Patterns

Conventions and patterns used throughout the codebase.

## TypeScript Patterns

### Strict Types

All code uses TypeScript strict mode. No implicit `any`.

```typescript
// ❌ Bad: Implicit any
function processData(data) {
  return data.items;
}

// ✅ Good: Explicit types
function processData(data: GraphData): Node[] {
  return data.nodes;
}
```

### Union Types for Actions

```typescript
// Define all possible actions
type GraphAction =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: LoadedGraph }
  | { type: 'LOAD_ERROR'; payload: string }
  | { type: 'SET_FORCE_PARAMS'; payload: Partial<ForceParams> };
```

### Discriminated Unions

```typescript
// Use type field for discrimination
interface SelectionState {
  type: 'node' | 'edge' | null;
  ids: string[];
}

// Type guard
if (selection.type === 'node') {
  // TypeScript knows ids are node IDs
}
```

### Type-Only Imports

```typescript
// Separate type imports
import type { Node, Edge, GraphData } from '../types/graph';

// Value imports
import { buildGraphIndex, getNodeById } from '../utils/graphValidation';
```

---

## React Patterns

### Functional Components

All components are functional with hooks.

```typescript
interface ComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: ComponentProps) {
  return (
    <div className="my-component">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
}
```

### Context + Reducer

State management uses Context with useReducer.

```typescript
// In context file
const [state, dispatch] = useReducer(myReducer, initialState);

// In component
const { state, dispatch } = useMyContext();
dispatch(actions.doSomething(payload));
```

### Action Creators

Wrap action creation in typed functions.

```typescript
// ❌ Bad: Inline action
dispatch({ type: 'SET_VALUE', payload: value });

// ✅ Good: Action creator
export const actions = {
  setValue: (value: string): MyAction => ({
    type: 'SET_VALUE',
    payload: value
  })
};

dispatch(actions.setValue(value));
```

### Memoization

Use useMemo for expensive computations.

```typescript
const filteredNodes = useMemo(() => {
  return nodes.filter(node =>
    node.label.toLowerCase().includes(search.toLowerCase())
  );
}, [nodes, search]);
```

### Callback Stability

Use useCallback for handlers passed to children.

```typescript
const handleClick = useCallback((id: string) => {
  dispatch(actions.selectNode(id));
}, [dispatch]);

return <ChildComponent onClick={handleClick} />;
```

---

## D3 Integration Patterns

### Refs for Simulation Data

D3 data lives in refs to avoid re-renders.

```typescript
// ❌ Bad: State causes re-render on every tick
const [nodes, setNodes] = useState<D3Node[]>([]);

// ✅ Good: Refs don't trigger re-renders
const nodesRef = useRef<D3Node[]>([]);
const linksRef = useRef<D3Link[]>([]);
```

### Manual Re-render Trigger

Force re-render only when needed.

```typescript
const [, forceRender] = useReducer(x => x + 1, 0);

// In simulation tick callback
simulation.on('tick', () => {
  // Update refs
  // Call forceRender() to update UI
});
```

### Simulation Cleanup

Always stop simulation on unmount.

```typescript
useEffect(() => {
  const simulation = d3.forceSimulation()
    // ... configure forces

  return () => {
    simulation.stop();
  };
}, []);
```

### Animation Frame Batching

Use requestAnimationFrame for smooth rendering.

```typescript
const rafRef = useRef<number>(0);

const scheduleRender = useCallback(() => {
  cancelAnimationFrame(rafRef.current);
  rafRef.current = requestAnimationFrame(() => {
    forceRender();
  });
}, []);

// Cleanup
useEffect(() => {
  return () => cancelAnimationFrame(rafRef.current);
}, []);
```

---

## IPC Patterns

### Handler Registration

Use refs to keep handlers current.

```typescript
// Keep handler ref updated
const handlerRef = useRef(handler);
useEffect(() => {
  handlerRef.current = handler;
}, [handler]);

// Register listener once
useEffect(() => {
  const cleanup = window.electronAPI.onEvent(() => {
    handlerRef.current(); // Always calls current handler
  });
  return cleanup;
}, []); // Empty deps - register once
```

### Async IPC Calls

IPC handlers return Promises.

```typescript
// In main process
ipcMain.handle('file:open', async () => {
  const result = await dialog.showOpenDialog({ ... });
  return result;
});

// In renderer
const result = await window.electronAPI.openFileDialog();
```

### Error Handling

Return structured results from IPC.

```typescript
// In main process
ipcMain.handle('file:read', async (event, path) => {
  try {
    const content = await fs.readFile(path, 'utf-8');
    return { success: true, data: content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});
```

---

## CSS Patterns

### CSS Variables

Use variables for theming.

```css
/* Define in index.css */
:root {
  --background: #ffffff;
  --text: #1a1a2e;
  --primary: #4A90D9;
}

[data-theme="dark"] {
  --background: #1a1a2e;
  --text: #e8e8e8;
}

/* Use in component CSS */
.my-component {
  background: var(--background);
  color: var(--text);
}
```

### Scoped Class Names

Prefix classes with component name.

```css
/* GraphStats.css */
.graph-stats { }
.graph-stats-header { }
.graph-stats-value { }

/* CategoryLegend.css */
.category-legend { }
.category-legend-item { }
```

### No Inline Styles

Styles go in CSS files.

```typescript
// ❌ Bad: Inline styles
<div style={{ color: 'red', padding: '10px' }}>

// ✅ Good: CSS class
<div className="error-message">
```

Exception: Dynamic values from data.

```typescript
// OK: Color from data
<circle fill={node.color} />
```

---

## Index Pattern (O(1) Lookups)

Build indexes for large collections.

```typescript
// Build index once
export function buildGraphIndex(graphData: GraphData): GraphIndex {
  const nodeById = new Map<string, Node>();
  const edgeByKey = new Map<string, Edge>();

  for (const node of graphData.nodes) {
    nodeById.set(node.id, node);
  }

  for (const edge of graphData.edges) {
    const key = `${edge.sourceId}|${edge.targetId}`;
    edgeByKey.set(key, edge);
  }

  return { nodeById, edgeByKey };
}

// Use for lookups
function getNodeById(id: string, index: GraphIndex): Node | undefined {
  return index.nodeById.get(id);
}
```

---

## Error Handling Patterns

### Validation Results

Return structured validation results.

```typescript
interface ValidationResult<T> {
  success: true;
  data: T;
} | {
  success: false;
  error: { message: string; details?: unknown };
}

function validateGraphData(data: unknown): ValidationResult<LoadedGraph> {
  if (!data || typeof data !== 'object') {
    return { success: false, error: { message: 'Invalid data format' } };
  }
  // ... validation logic
  return { success: true, data: validatedData };
}
```

### Error Boundaries

Wrap components in error boundaries.

```typescript
class ErrorBoundary extends React.Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

---

## Constants Pattern

Centralize magic numbers.

```typescript
// config/constants.ts
export const NODE_RADIUS = 35;
export const SEARCH_DEBOUNCE_MS = 150;
export const ZOOM_SCALE_EXTENT: [number, number] = [0.1, 10];

export const FORCE_DEFAULTS = {
  linkDistance: 150,
  chargeStrength: -400,
  collisionRadius: 45
};
```

Use throughout codebase:

```typescript
import { NODE_RADIUS, FORCE_DEFAULTS } from '../config/constants';
```

---

## File Organization Pattern

### Component Files

Each component has its own CSS file.

```
ComponentName/
  ComponentName.tsx    # Component logic
  ComponentName.css    # Component styles
```

Or in same directory:

```
Sidebar/
  Sidebar.tsx
  Sidebar.css
  GraphStats.tsx
  GraphStats.css
```

### Imports Order

```typescript
// 1. React and external libraries
import { useState, useEffect, useMemo } from 'react';
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
