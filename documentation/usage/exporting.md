# Exporting Graphs

Generic Graph View supports exporting your visualizations as PNG and SVG images.

## Export Options

| Format | Shortcut | Best For |
|--------|----------|----------|
| PNG | Cmd+Shift+E | Screenshots, sharing current view |
| SVG | Cmd+Shift+S | Print, editing, complete graph archive |

---

## Export as PNG

### How to Export

1. Arrange your graph as desired (zoom, pan, select)
2. Press **Cmd+Shift+E** or use **File > Export as PNG**
3. Choose a save location and filename
4. Click Save

### What Gets Exported

The PNG export captures exactly what you see on screen:

| Aspect | Behavior |
|--------|----------|
| **Zoom/Pan** | Current view preserved |
| **Selection** | Yellow highlights included |
| **Hidden nodes** | Not visible (opacity 0) |
| **Theme** | Current theme colors used |
| **Size** | Matches canvas dimensions |

### Use Cases

- **Documentation** - Capture specific views for reports
- **Collaboration** - Share current state with teammates
- **Presentations** - Screenshot specific selections
- **Quick sharing** - Export for chat/email

### Tips

1. **Zoom to fit** (Cmd+0) before exporting for a complete view
2. **Select relevant nodes** to highlight them in the export
3. **Hide categories** to focus on specific parts of the graph
4. **Use light theme** for better print results

---

## Export as SVG

### How to Export

1. Load your graph (arrangement doesn't matter)
2. Press **Cmd+Shift+S** or use **File > Export as SVG**
3. Choose a save location and filename
4. Click Save

### What Gets Exported

The SVG export creates a clean, complete graph:

| Aspect | Behavior |
|--------|----------|
| **All nodes** | Visible regardless of hidden categories |
| **Selection** | NOT included (clean export) |
| **Zoom/Pan** | Ignored (graph is sized to fit) |
| **Theme** | Current theme colors used |
| **Size** | Fit to content with 5% margin |
| **Dimensions** | Scaled to max 1920×1080 |

### SVG Structure

The exported SVG has a clean structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="1920" height="1080"
     viewBox="-100 -200 2000 1500">
  <g class="edges">
    <line x1="..." y1="..." x2="..." y2="..." stroke="#999" stroke-width="2"/>
    ...
  </g>
  <g class="nodes">
    <g transform="translate(100, 200)">
      <circle r="35" fill="#8dd3c7"/>
      <rect x="-40" y="-8" width="80" height="16" fill="#fff"/>
      <text>Node Name</text>
    </g>
    ...
  </g>
</svg>
```

### Use Cases

- **Vector editing** - Open in Illustrator, Figma, Inkscape
- **High-resolution print** - Scale to any size without quality loss
- **Presentations** - Embed in slides
- **Documentation** - Include in technical docs
- **Archiving** - Preserve complete graph state

### Tips

1. **Switch to light theme** before export for print-friendly colors
2. **SVG ignores selection** - useful for clean exports
3. **All nodes visible** - great for complete documentation
4. **Editable** - modify colors, labels, add annotations later

---

## Comparison

| Feature | PNG | SVG |
|---------|-----|-----|
| File format | Raster (pixels) | Vector (paths) |
| Scalability | Fixed resolution | Infinite scaling |
| File size | Larger | Smaller |
| Current view | Yes | No (fits all) |
| Selection highlight | Yes | No |
| Hidden nodes | Hidden | Visible |
| Editable | No | Yes |
| Best for | Screenshots | Print/Edit |

---

## Workflow Examples

### Example 1: Documentation Screenshot

1. Open your graph
2. Use search to find specific nodes
3. Press Cmd+1 to zoom to selection
4. Export as PNG (Cmd+Shift+E)
5. The export shows your focused view with highlights

### Example 2: Architecture Diagram for Print

1. Open your graph
2. Switch to light theme (click sun icon)
3. Export as SVG (Cmd+Shift+S)
4. Open in vector editor
5. Add annotations, adjust colors
6. Export to PDF for printing

### Example 3: Complete Graph Archive

1. Open your graph
2. Export as SVG (Cmd+Shift+S)
3. The SVG contains all nodes regardless of filters
4. Archive alongside your JSON source file

---

## Troubleshooting

### PNG Export Issues

**Problem:** Export appears blank
- **Solution:** Ensure the graph has loaded completely (wait for simulation to stabilize)

**Problem:** Colors look wrong
- **Solution:** The export uses current theme colors; switch themes if needed

### SVG Export Issues

**Problem:** Some nodes have negative coordinates
- **Fixed:** The SVG viewBox automatically adjusts to include all coordinates

**Problem:** File won't open in my editor
- **Solution:** The SVG uses standard W3C format; ensure your editor supports SVG 1.1

**Problem:** Text looks different
- **Solution:** The export uses system fonts; install the same fonts or convert text to paths
