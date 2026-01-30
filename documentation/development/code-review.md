# Code Review Checklist

Guidelines for reviewing code changes in Generic Graph View.

## Quick Checklist

```markdown
## Pre-merge Checklist

### Build
- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] App starts with `npm run dev`

### Code Quality
- [ ] No `any` types
- [ ] Explicit return types on public functions
- [ ] Action creators used (not inline dispatch objects)
- [ ] Refs used for D3 data (not state)
- [ ] Constants in config/constants.ts
- [ ] CSS in separate files (not inline)

### Patterns
- [ ] Follows existing file structure
- [ ] Uses context hooks correctly
- [ ] IPC follows handler ref pattern
- [ ] Error handling implemented

### Security
- [ ] No Node.js APIs in renderer
- [ ] User input validated
- [ ] File paths sanitized

### Documentation
- [ ] Complex logic has comments
- [ ] Public functions have JSDoc
- [ ] README updated if needed
```

---

## Detailed Review Guidelines

### TypeScript

#### Type Safety

```typescript
// ❌ Avoid
function process(data: any) { ... }
const items: any[] = [];
(value as any).property

// ✅ Prefer
function process(data: GraphData): ProcessResult { ... }
const items: Node[] = [];
if (isNode(value)) { value.property }
```

#### Explicit Return Types

```typescript
// ❌ Public function without return type
export function calculateStats(graph) {
  return { nodes: graph.nodes.length };
}

// ✅ Explicit return type
export function calculateStats(graph: GraphData): GraphStats {
  return { nodeCount: graph.nodes.length, edgeCount: graph.edges.length };
}
```

---

### React Patterns

#### Context Usage

```typescript
// ❌ Direct dispatch with object
dispatch({ type: 'SET_VALUE', payload: value });

// ✅ Use action creator
dispatch(actions.setValue(value));
```

#### Effect Dependencies

```typescript
// ❌ Missing dependencies
useEffect(() => {
  doSomething(value);
}, []);

// ✅ Correct dependencies
useEffect(() => {
  doSomething(value);
}, [value]);
```

#### Memoization

```typescript
// ❌ Expensive computation on every render
const filtered = nodes.filter(n => n.category === category);

// ✅ Memoized
const filtered = useMemo(
  () => nodes.filter(n => n.category === category),
  [nodes, category]
);
```

---

### D3 Integration

#### Refs for Performance

```typescript
// ❌ State causes re-renders on every tick
const [nodes, setNodes] = useState<D3Node[]>([]);
simulation.on('tick', () => setNodes([...nodes]));

// ✅ Refs avoid re-renders
const nodesRef = useRef<D3Node[]>([]);
simulation.on('tick', () => {
  // Update ref, batch re-render
});
```

#### Cleanup

```typescript
// ❌ No cleanup
useEffect(() => {
  const simulation = d3.forceSimulation();
  // ...
}, []);

// ✅ Proper cleanup
useEffect(() => {
  const simulation = d3.forceSimulation();
  // ...
  return () => simulation.stop();
}, []);
```

---

### IPC Handling

#### Handler Pattern

```typescript
// ❌ Handler recreated on every render
useEffect(() => {
  return window.electronAPI.onEvent(handleEvent);
}, [handleEvent]); // Re-registers on every change

// ✅ Ref pattern
const handlerRef = useRef(handleEvent);
useEffect(() => {
  handlerRef.current = handleEvent;
}, [handleEvent]);

useEffect(() => {
  return window.electronAPI.onEvent(() => handlerRef.current());
}, []); // Registers once
```

---

### CSS

#### Theme Support

```css
/* ❌ Hard-coded colors */
.component {
  background: #ffffff;
  color: #000000;
}

/* ✅ CSS variables for themes */
.component {
  background: var(--background);
  color: var(--text);
}
```

#### Scoped Classes

```css
/* ❌ Generic class names */
.header { }
.title { }
.button { }

/* ✅ Scoped to component */
.graph-stats-header { }
.graph-stats-title { }
.graph-stats-button { }
```

---

### Security

#### Renderer Isolation

```typescript
// ❌ Never use in renderer
import fs from 'fs';
import { exec } from 'child_process';

// ✅ Use IPC through preload
await window.electronAPI.readFile(path);
```

#### Input Validation

```typescript
// ❌ No validation
function loadGraph(data: unknown) {
  const graph = data as GraphData;
  return graph;
}

// ✅ Validate input
function loadGraph(data: unknown): ValidationResult<GraphData> {
  if (!isValidGraphData(data)) {
    return { success: false, error: { message: 'Invalid format' } };
  }
  return { success: true, data };
}
```

---

### Error Handling

#### Structured Results

```typescript
// ❌ Throwing errors
function load(path: string) {
  throw new Error('Failed');
}

// ✅ Return results
function load(path: string): LoadResult {
  return { success: false, error: { message: 'Failed' } };
}
```

#### User-Friendly Messages

```typescript
// ❌ Technical errors exposed
error: JSON.parse(content)  // "Unexpected token..."

// ✅ User-friendly
error: { message: 'Invalid graph file format' }
```

---

### Performance

#### Avoid Unnecessary Renders

```typescript
// ❌ New object on every render
return <Child config={{ option: true }} />;

// ✅ Memoized or stable
const config = useMemo(() => ({ option: true }), []);
return <Child config={config} />;
```

#### Large List Keys

```typescript
// ❌ Index as key (problematic for dynamic lists)
{items.map((item, i) => <Item key={i} />)}

// ✅ Stable ID as key
{items.map(item => <Item key={item.id} />)}
```

---

## Review Questions

### Architecture

- Does this change fit the existing architecture?
- Is state managed in the appropriate context?
- Are component responsibilities clear?

### Maintainability

- Would another developer understand this code?
- Are there opportunities to reuse existing utilities?
- Is the code more complex than necessary?

### Testing

- Are edge cases handled?
- Could this break existing functionality?
- Are new features testable?

### User Experience

- Does this maintain UI consistency?
- Are loading states handled?
- Are errors communicated clearly?

---

## Common Issues to Watch For

1. **IPC listener accumulation** - Ensure cleanup functions are called
2. **Stale closure in effects** - Check dependency arrays
3. **Missing key prop** - Verify list rendering uses stable keys
4. **Type assertions** - Question `as Type` usage
5. **Inline styles** - Should be in CSS files
6. **Magic numbers** - Should be in constants.ts
7. **Console.log statements** - Remove before merge
8. **TODO comments** - Track or resolve before merge
