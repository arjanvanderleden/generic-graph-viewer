# Troubleshooting Development Issues

Common development problems and their solutions.

## Build Issues

### TypeScript Compilation Errors

**Problem**: `npm run typecheck` fails with type errors.

**Solutions**:

1. Check for `any` types:
   ```bash
   grep -r "any" src/ --include="*.ts" --include="*.tsx"
   ```

2. Check for missing return types:
   ```typescript
   // ❌ Missing return type
   export function getData() { return data; }

   // ✅ With return type
   export function getData(): GraphData { return data; }
   ```

3. Verify imports:
   ```typescript
   // ❌ Wrong import
   import { Node } from './types';

   // ✅ Correct path
   import { Node } from '../types/graph';
   ```

---

### Module Not Found

**Problem**: `Cannot find module 'X'`

**Solutions**:

1. Reinstall dependencies:
   ```bash
   rm -rf node_modules
   npm install
   ```

2. Check for typos in import paths.

3. Verify file exists at the specified location.

4. For new files, restart TypeScript server in VS Code:
   - Cmd+Shift+P → "TypeScript: Restart TS Server"

---

### Hot Reload Not Working

**Problem**: Changes don't appear in running app.

**Solutions**:

1. Check Vite dev server is running (look for port 5199).

2. Check browser console for errors.

3. For CSS changes, check file is imported in component.

4. Hard refresh: Cmd+Shift+R

5. Restart dev server:
   ```bash
   # Stop with Ctrl+C
   npm run dev
   ```

---

## Runtime Issues

### IPC Not Working

**Problem**: `window.electronAPI.method()` returns undefined or errors.

**Diagnosis**:

1. Check preload script exports the method:
   ```typescript
   // src/preload/index.ts
   const electronAPI = {
     myMethod: () => ipcRenderer.invoke('channel:name')
   };
   ```

2. Check main process has handler:
   ```typescript
   // src/main/index.ts
   ipcMain.handle('channel:name', async () => { ... });
   ```

3. Check channel names match exactly.

4. Look for errors in main process terminal output.

---

### D3 Simulation Issues

**Problem**: Nodes don't move or behave strangely.

**Solutions**:

1. Check force configuration:
   ```typescript
   simulation
     .force('charge', d3.forceManyBody().strength(-400))
     .force('link', d3.forceLink(links).distance(150))
     .force('center', d3.forceCenter(width/2, height/2));
   ```

2. Verify nodes have valid positions:
   ```typescript
   console.log(nodes.map(n => ({ x: n.x, y: n.y })));
   ```

3. Check simulation is running:
   ```typescript
   console.log(simulation.alpha()); // Should be > 0 if running
   ```

4. Ensure simulation cleanup:
   ```typescript
   useEffect(() => {
     return () => simulation.stop();
   }, []);
   ```

---

### Stale Data After Graph Change

**Problem**: Old nodes/edges visible when loading new graph.

**Cause**: D3 refs contain old data while new graph loads.

**Solution**: Track current graph version:
```typescript
const currentGraphRef = useRef<GraphData | null>(null);

// In effect
currentGraphRef.current = graphData;

// In return
const isCurrentGraph = currentGraphRef.current === graphData;
return {
  nodes: isCurrentGraph ? nodesRef.current : [],
  links: isCurrentGraph ? linksRef.current : []
};
```

---

### Memory Leaks

**Problem**: App slows down over time.

**Diagnosis**:

1. Check for missing cleanup:
   ```typescript
   useEffect(() => {
     const listener = () => {};
     window.addEventListener('resize', listener);

     return () => {
       window.removeEventListener('resize', listener);
     };
   }, []);
   ```

2. Check IPC listener cleanup:
   ```typescript
   useEffect(() => {
     const cleanup = window.electronAPI.onEvent(handler);
     return cleanup;  // Must return cleanup function
   }, []);
   ```

3. Check animation frame cleanup:
   ```typescript
   const rafRef = useRef<number>(0);

   useEffect(() => {
     return () => cancelAnimationFrame(rafRef.current);
   }, []);
   ```

---

## React Issues

### Context Not Available

**Problem**: `useGraph must be used within GraphProvider`

**Cause**: Component outside provider hierarchy.

**Solution**: Ensure component is wrapped:
```typescript
// App.tsx
<GraphProvider>
  <SelectionProvider>
    <YourComponent />  {/* Has access to both contexts */}
  </SelectionProvider>
</GraphProvider>
```

---

### Infinite Re-renders

**Problem**: Component keeps re-rendering.

**Diagnosis**:

1. Check effect dependencies:
   ```typescript
   // ❌ Object created every render
   useEffect(() => {}, [{ key: 'value' }]);

   // ✅ Stable reference
   const config = useMemo(() => ({ key: 'value' }), []);
   useEffect(() => {}, [config]);
   ```

2. Check for state updates in render:
   ```typescript
   // ❌ Updates during render
   function Component() {
     const [count, setCount] = useState(0);
     setCount(1);  // Infinite loop!
   }

   // ✅ Update in effect or handler
   function Component() {
     const [count, setCount] = useState(0);
     useEffect(() => {
       setCount(1);
     }, []);
   }
   ```

3. Add logging to identify:
   ```typescript
   console.log('Component rendering', { prop1, prop2 });
   ```

---

### Missing Updates

**Problem**: State changes but UI doesn't update.

**Causes**:

1. Mutating state instead of creating new:
   ```typescript
   // ❌ Mutation
   state.items.push(item);
   return state;

   // ✅ New object
   return { ...state, items: [...state.items, item] };
   ```

2. Using refs when state needed:
   ```typescript
   // Refs don't trigger re-renders
   const dataRef = useRef([]);
   dataRef.current.push(item);  // No re-render

   // State triggers re-renders
   const [data, setData] = useState([]);
   setData([...data, item]);  // Re-renders
   ```

---

## Styling Issues

### Theme Not Applied

**Problem**: Colors wrong in dark/light mode.

**Solutions**:

1. Check CSS uses variables:
   ```css
   /* ❌ Hard-coded */
   color: #000000;

   /* ✅ Variable */
   color: var(--text);
   ```

2. Check data-theme is set:
   ```typescript
   document.documentElement.getAttribute('data-theme')
   ```

3. Check variable defined for both themes:
   ```css
   :root { --text: #1a1a2e; }
   [data-theme="dark"] { --text: #e8e8e8; }
   ```

---

### CSS Not Loading

**Problem**: Styles not applied to component.

**Solutions**:

1. Check import at end of component file:
   ```typescript
   import './MyComponent.css';
   ```

2. Check class names match:
   ```css
   /* CSS */
   .my-component { }
   ```
   ```tsx
   // Component
   <div className="my-component">
   ```

3. Check for typos in class names.

---

## Export Issues

### PNG Export Fails

**Problem**: "Refused to load blob image"

**Solution**: Check Content Security Policy in index.html:
```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self';
               style-src 'self' 'unsafe-inline';
               img-src 'self' blob: data:">
```

---

### SVG Export Wrong Size

**Problem**: SVG viewBox doesn't match content.

**Solution**: Calculate bounds from actual node positions:
```typescript
const minX = Math.min(...nodes.map(n => n.x));
const minY = Math.min(...nodes.map(n => n.y));
const maxX = Math.max(...nodes.map(n => n.x));
const maxY = Math.max(...nodes.map(n => n.y));

const viewBox = `${minX - margin} ${minY - margin} ${width} ${height}`;
```

---

## Debugging Tips

### Enable Source Maps

Already configured in electron-vite. Check:
- Browser DevTools → Sources → Shows TypeScript files
- Error stack traces show TypeScript line numbers

### Add Breakpoints

1. In VS Code: Click line number gutter
2. In DevTools: Click line number in Sources tab
3. Add `debugger;` statement in code

### Log State Changes

```typescript
useEffect(() => {
  console.log('State changed:', state);
}, [state]);
```

### Inspect D3 Simulation

```typescript
console.log('Simulation:', {
  alpha: simulation.alpha(),
  nodes: simulation.nodes().length,
  running: simulation.alpha() > simulation.alphaMin()
});
```

### Profile Rendering

1. Open React DevTools
2. Go to Profiler tab
3. Click Record
4. Perform action
5. Stop recording
6. Analyze component render times
