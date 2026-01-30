# Component Guide

Documentation for React components in the application.

## Component Hierarchy

```
App
├── ThemeProvider
│   └── GraphProvider
│       └── SelectionProvider
│           └── ErrorBoundary
│               └── AppContent
│                   ├── TitleBar
│                   │   └── ThemeToggle
│                   ├── Sidebar
│                   │   ├── SearchInput
│                   │   ├── GraphStats
│                   │   ├── CategoryLegend
│                   │   └── PropertyPanel
│                   │       ├── NodeListItem
│                   │       └── NodePropertiesModal
│                   ├── GraphCanvas
│                   └── LayoutSettingsModal
```

---

## Layout Components

### AppLayout

Main application layout using CSS Grid.

**Location**: `src/renderer/components/Layout/AppLayout.tsx`

**Structure**:
```
┌─────────────────────────────────────┐
│            TitleBar                 │
├───────────┬─────────────────────────┤
│           │                         │
│  Sidebar  │      GraphCanvas        │
│  (280px)  │        (flex)           │
│           │                         │
└───────────┴─────────────────────────┘
```

**Props**: None (uses context)

---

### TitleBar

Displays file name and theme toggle.

**Location**: `src/renderer/components/Layout/TitleBar.tsx`

**Features**:
- Shows current file name or "No file loaded"
- Contains ThemeToggle button
- Fixed height (40px)

**Context**: `useGraph()` for filePath

---

### ThemeToggle

Button to switch between light and dark themes.

**Location**: `src/renderer/components/Layout/ThemeToggle.tsx`

**Features**:
- Sun/moon icon based on current theme
- Toggles theme on click
- Applies via data-theme attribute on html

**Context**: `useTheme()` for theme state

---

## Sidebar Components

### Sidebar

Container for all sidebar sections.

**Location**: `src/renderer/components/Sidebar/Sidebar.tsx`

**Sections**:
1. SearchInput
2. GraphStats
3. CategoryLegend
4. PropertyPanel

**Props**: None

---

### SearchInput

Search box for filtering nodes.

**Location**: `src/renderer/components/Sidebar/SearchInput.tsx`

**Features**:
- Debounced input (150ms)
- Shows matching node count
- Displays clickable results list
- Clears on escape key

**Props**:
```typescript
interface SearchInputProps {
  nodes: Node[];
  onNodeSelect: (id: string) => void;
}
```

**State**:
- `query`: Current search text
- `results`: Filtered nodes

---

### GraphStats

Displays graph statistics.

**Location**: `src/renderer/components/Sidebar/GraphStats.tsx`

**Displays**:
- Total node count
- Total edge count
- Invalid edge count (if any)
- Current file name

**Context**: `useGraph()` for stats

---

### CategoryLegend

Category list with visibility toggles.

**Location**: `src/renderer/components/Sidebar/CategoryLegend.tsx`

**Features**:
- Lists all categories from nodes
- Color swatch for each category
- Eye/eye-off icon for visibility toggle
- Node count per category
- "Show All" / "Hide All" buttons

**Context**: `useGraph()` for hiddenCategories

---

### PropertyPanel

Shows details of selected node/edge.

**Location**: `src/renderer/components/Sidebar/PropertyPanel.tsx`

**Features**:
- Displays selected node properties
- Lists connected nodes
- Shows edge properties when edge selected
- "Show All Properties" button for modal
- Multi-select support

**Context**:
- `useGraph()` for graphData, graphIndex
- `useSelection()` for selection state

---

### NodeListItem

Reusable component for node display.

**Location**: `src/renderer/components/Sidebar/NodeListItem.tsx`

**Features**:
- Color swatch from category
- Node label
- Hover state
- Click handler

**Props**:
```typescript
interface NodeListItemProps {
  node: Node;
  categoryColor: string;
  onClick: () => void;
  isSelected?: boolean;
}
```

---

### NodePropertiesModal

Modal showing all node properties.

**Location**: `src/renderer/components/Sidebar/NodePropertiesModal.tsx`

**Features**:
- Displays all properties as key-value pairs
- Close on Escape key
- Close on backdrop click
- Scrollable content

**Props**:
```typescript
interface NodePropertiesModalProps {
  node: Node;
  onClose: () => void;
}
```

---

## Graph Components

### GraphCanvas

Main SVG visualization of the graph.

**Location**: `src/renderer/components/Graph/GraphCanvas.tsx`

**Features**:
- SVG rendering of nodes and edges
- D3 force simulation via useForceGraph hook
- Zoom and pan via D3 zoom
- Node selection (click, Cmd+click for multi)
- Edge selection
- Node dragging
- Category visibility filtering
- PNG/SVG export functions

**Context**:
- `useGraph()` for graphData, forceParams, hiddenCategories
- `useSelection()` for selection state

**Key State**:
- `dimensions`: Canvas width/height from container
- `transform`: Current zoom/pan transform

**Important Functions**:
- `exportAsPng()`: Captures current view as PNG
- `exportAsSvg()`: Generates clean SVG export

---

### useForceGraph

Custom hook managing D3 force simulation.

**Location**: `src/renderer/components/Graph/useForceGraph.ts`

**Input**:
```typescript
interface UseForceGraphOptions {
  graphData: GraphData | null;
  width: number;
  height: number;
  forceParams: ForceParams;
  radialLayout: boolean;
}
```

**Output**:
```typescript
interface UseForceGraphResult {
  nodes: D3Node[];
  links: D3Link[];
  isStable: boolean;
}
```

**Features**:
- Manages force simulation lifecycle
- Uses refs to prevent re-renders on tick
- Supports radial and force-directed layouts
- Handles node dragging
- Returns current positions for rendering

---

## Modal Components

### LayoutSettingsModal

Modal for adjusting force simulation parameters.

**Location**: `src/renderer/components/Layout/LayoutSettingsModal.tsx`

**Features**:
- Slider for link distance
- Slider for charge strength
- Slider for collision radius
- Reset to defaults button
- Real-time updates

**Context**: `useGraph()` for forceParams

---

## Utility Components

### ErrorBoundary

React error boundary for crash recovery.

**Location**: `src/renderer/components/ErrorBoundary.tsx`

**Features**:
- Catches JavaScript errors in child tree
- Displays error message
- Prevents full app crash
- Shows reload option

---

### Icons

SVG icon components for consistent iconography.

**Location**: `src/renderer/components/Icons.tsx`

**Available Icons**:
- `EyeIcon` - Visibility on
- `EyeOffIcon` - Visibility off
- `SearchIcon` - Search action
- `DocumentIcon` - File/document

**Props**:
```typescript
interface IconProps {
  className?: string;
  size?: number;
}
```

---

## Component Patterns

### Using Contexts

```typescript
import { useGraph, graphActions } from '../../context/GraphContext';
import { useSelection, selectionActions } from '../../context/SelectionContext';

function MyComponent() {
  const { state: graphState, dispatch: graphDispatch } = useGraph();
  const { selection, dispatch: selectionDispatch } = useSelection();

  const handleAction = () => {
    graphDispatch(graphActions.setForceParams({ linkDistance: 200 }));
    selectionDispatch(selectionActions.clearSelection());
  };
}
```

### Component with CSS

```typescript
// MyComponent.tsx
import './MyComponent.css';

export function MyComponent() {
  return (
    <div className="my-component">
      <h2 className="my-component-title">Title</h2>
    </div>
  );
}
```

```css
/* MyComponent.css */
.my-component {
  padding: var(--spacing-md);
  background: var(--surface);
}

.my-component-title {
  color: var(--text);
  font-size: var(--font-size-lg);
}
```

### Modal Pattern

```typescript
function MyModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        {children}
      </div>
    </div>
  );
}
```

### List with Selection

```typescript
function NodeList({ nodes, selectedIds, onSelect }) {
  return (
    <ul className="node-list">
      {nodes.map(node => (
        <li
          key={node.id}
          className={selectedIds.includes(node.id) ? 'selected' : ''}
          onClick={() => onSelect(node.id)}
        >
          {node.label}
        </li>
      ))}
    </ul>
  );
}
```
