# State Management

This document explains the state management architecture using React Context and reducers.

## Overview

The application uses three separate contexts for different concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      ThemeContext                            │
│  State: theme ('light' | 'dark')                            │
│  Scope: Visual appearance                                    │
├─────────────────────────────────────────────────────────────┤
│                      GraphContext                            │
│  State: graphData, settings, forceParams, hiddenCategories  │
│  Scope: Graph data and visualization settings               │
├─────────────────────────────────────────────────────────────┤
│                    SelectionContext                          │
│  State: selection type and IDs                              │
│  Scope: User selection state                                │
└─────────────────────────────────────────────────────────────┘
```

## Context Pattern

Each context follows this pattern:

```typescript
// 1. State Interface
interface MyState {
  data: SomeType | null;
  loading: boolean;
}

// 2. Action Types
type MyAction =
  | { type: 'ACTION_ONE'; payload: PayloadType }
  | { type: 'ACTION_TWO' };

// 3. Reducer
function myReducer(state: MyState, action: MyAction): MyState {
  switch (action.type) {
    case 'ACTION_ONE':
      return { ...state, data: action.payload };
    case 'ACTION_TWO':
      return { ...state, loading: true };
    default:
      return state;
  }
}

// 4. Context
const MyContext = createContext<{
  state: MyState;
  dispatch: Dispatch<MyAction>;
} | null>(null);

// 5. Provider
export function MyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(myReducer, initialState);
  return (
    <MyContext.Provider value={{ state, dispatch }}>
      {children}
    </MyContext.Provider>
  );
}

// 6. Hook
export function useMy() {
  const context = useContext(MyContext);
  if (!context) throw new Error('useMy must be used within MyProvider');
  return context;
}

// 7. Action Creators
export const myActions = {
  actionOne: (data: PayloadType): MyAction => ({
    type: 'ACTION_ONE',
    payload: data
  })
};
```

---

## GraphContext

### State

```typescript
interface GraphState {
  graphData: GraphData | null;      // The loaded graph
  graphIndex: GraphIndex | null;    // O(1) lookup index
  stats: GraphStats | null;         // Node/edge counts
  filePath: string | null;          // Current file path
  isLoading: boolean;               // Loading indicator
  error: string | null;             // Error message
  radialLayout: boolean;            // Layout mode
  forceParams: ForceParams;         // Simulation parameters
  hiddenCategories: Set<string>;    // Hidden category names
}
```

### Actions

| Action | Payload | Purpose |
|--------|---------|---------|
| `LOAD_START` | - | Set loading state |
| `LOAD_SUCCESS` | `LoadedGraph` | Store graph data and index |
| `LOAD_ERROR` | `string` | Store error message |
| `CLEAR_GRAPH` | - | Reset to initial state |
| `SET_RADIAL_LAYOUT` | `boolean` | Toggle layout mode |
| `SET_FORCE_PARAMS` | `Partial<ForceParams>` | Update simulation params |
| `TOGGLE_CATEGORY_VISIBILITY` | `string` | Toggle single category |
| `SET_HIDDEN_CATEGORIES` | `Set<string>` | Set all hidden categories |

### Usage

```typescript
import { useGraph, graphActions } from '../context/GraphContext';

function MyComponent() {
  const { state, dispatch } = useGraph();

  // Read state
  const nodeCount = state.graphData?.nodes.length ?? 0;
  const isRadial = state.radialLayout;

  // Dispatch actions
  const toggleRadial = () => {
    dispatch(graphActions.setRadialLayout(!isRadial));
  };

  const updateForce = () => {
    dispatch(graphActions.setForceParams({ linkDistance: 200 }));
  };
}
```

### Loading Flow

```typescript
// In useGraphLoader hook:

// 1. Start loading
dispatch(graphActions.loadStart());

// 2. Fetch and validate
const result = await window.electronAPI.openFileDialog();
const validation = validateGraphData(parsed);

// 3. Success or error
if (validation.success) {
  dispatch(graphActions.loadSuccess(validation.data, filePath));
} else {
  dispatch(graphActions.loadError(validation.error.message));
}
```

---

## SelectionContext

### State

```typescript
interface SelectionState {
  type: 'node' | 'edge' | null;  // What is selected
  ids: string[];                  // Selected IDs (supports multi)
}
```

### Actions

| Action | Payload | Purpose |
|--------|---------|---------|
| `SELECT_NODE` | `string` | Select single node |
| `SELECT_NODES` | `string[]` | Select multiple nodes |
| `ADD_NODES` | `string[]` | Add to selection |
| `REMOVE_NODES` | `string[]` | Remove from selection |
| `TOGGLE_NODE` | `string` | Toggle node in selection |
| `SELECT_EDGE` | `string` | Select single edge |
| `CLEAR_SELECTION` | - | Clear all selection |

### Usage

```typescript
import { useSelection, selectionActions } from '../context/SelectionContext';

function MyComponent() {
  const { selection, dispatch } = useSelection();

  // Check selection
  const hasSelection = selection.type !== null;
  const isNodeSelected = (id: string) =>
    selection.type === 'node' && selection.ids.includes(id);

  // Actions
  const selectNode = (id: string) => {
    dispatch(selectionActions.selectNode(id));
  };

  const toggleNode = (id: string) => {
    dispatch(selectionActions.toggleNode(id));
  };

  const clearSelection = () => {
    dispatch(selectionActions.clearSelection());
  };
}
```

### Multi-Select Pattern

```typescript
// In GraphCanvas:
const handleNodeClick = (e: MouseEvent, node: D3Node) => {
  if (e.metaKey || e.ctrlKey) {
    // Cmd/Ctrl+Click: Toggle in selection
    dispatch(selectionActions.toggleNode(node.id));
  } else {
    // Click: Replace selection
    dispatch(selectionActions.selectNode(node.id));
  }
};
```

---

## ThemeContext

### State

```typescript
type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}
```

### Usage

```typescript
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme}>
      Current: {theme}
    </button>
  );
}
```

### CSS Integration

Theme is applied via data attribute on document:

```typescript
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);
```

CSS uses attribute selector:

```css
:root {
  --background: #ffffff;
}

[data-theme="dark"] {
  --background: #1a1a2e;
}
```

---

## Cross-Context Communication

Sometimes actions in one context need to affect another. Handle this in components or hooks:

```typescript
// In useGraphLoader:
function useGraphLoader() {
  const { dispatch: graphDispatch } = useGraph();
  const { dispatch: selectionDispatch } = useSelection();

  // Clear selection when graph changes
  useEffect(() => {
    selectionDispatch(selectionActions.clearSelection());
  }, [state.graphData, selectionDispatch]);
}
```

---

## Performance Considerations

### Avoid Unnecessary Renders

Use `useMemo` for derived state:

```typescript
const selectedNodes = useMemo(() => {
  if (!graphData || selection.type !== 'node') return [];
  return selection.ids
    .map(id => getNodeById(graphData, id, index))
    .filter(Boolean);
}, [graphData, index, selection]);
```

### Stable Action Creators

Action creators are defined outside components, so they're stable:

```typescript
// ✅ Good: Stable reference
dispatch(graphActions.setForceParams(params));

// ❌ Bad: New object every render
dispatch({ type: 'SET_FORCE_PARAMS', payload: params });
```

### Refs for Non-Reactive Data

Use refs for data that shouldn't trigger re-renders:

```typescript
// D3 simulation state
const nodesRef = useRef<D3Node[]>([]);
const linksRef = useRef<D3Link[]>([]);

// Current callback (for IPC handlers)
const openFileRef = useRef(openFile);
```

---

## Testing State

### Mock Context

```typescript
const mockGraphState: GraphState = {
  graphData: { nodes: [], edges: [] },
  graphIndex: null,
  stats: { nodeCount: 0, edgeCount: 0, invalidEdges: [] },
  filePath: null,
  isLoading: false,
  error: null,
  radialLayout: false,
  forceParams: defaultForceParams,
  hiddenCategories: new Set()
};

const mockDispatch = vi.fn();

render(
  <GraphContext.Provider value={{ state: mockGraphState, dispatch: mockDispatch }}>
    <ComponentUnderTest />
  </GraphContext.Provider>
);
```

### Test Actions

```typescript
it('should select node', () => {
  const action = selectionActions.selectNode('node-1');
  expect(action).toEqual({
    type: 'SELECT_NODE',
    payload: 'node-1'
  });
});

it('should update state on select', () => {
  const state = selectionReducer(initialState, selectionActions.selectNode('node-1'));
  expect(state.type).toBe('node');
  expect(state.ids).toEqual(['node-1']);
});
```
