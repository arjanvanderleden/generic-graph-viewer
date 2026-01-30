# Documentation Images

This folder contains screenshots for the user documentation.

## Available Images

The following images are available in `documentation/images/`:

| Image | Description | Shows |
|-------|-------------|-------|
| `knowledge-graph.png` | Dark theme with knowledge graph | Full interface, categories panel, selected node with highlighted edges |
| `selection.png` | Node selection with properties | Selected "vitest" node, Properties panel, connected nodes list |
| `social-graph.png` | Large social network | Dense graph visualization, all categories visible |
| `social-graph-hidden-categories.png` | Hidden categories | Same graph with some categories hidden (eye-off icons) |

## Usage in Documentation

Reference images from the parent images folder:

```markdown
![Main Interface](../images/knowledge-graph.png)
```

## Image Purposes

### Main Interface Demo
Use `knowledge-graph.png` - shows:
- Title bar with filename
- Graph canvas with visualization
- Sidebar with all sections
- Theme toggle (sun icon)

### Selection & Properties
Use `selection.png` - shows:
- Selected node (highlighted in yellow)
- Connected edges highlighted
- Properties panel with node details
- Connected nodes list

### Category Visibility
Use `social-graph-hidden-categories.png` - shows:
- Eye icons for visibility toggle
- Hidden categories (eye-off icon)
- Filtered graph view

### Large Graph
Use `social-graph.png` - shows:
- Dense network visualization
- Force-directed layout
- Category color coding

## Adding New Screenshots

To capture additional screenshots:

1. Run the application with sample data from `test-data/`
2. Use macOS screenshot (Cmd+Shift+4) or equivalent
3. Save to `documentation/images/`
4. Use descriptive filenames (lowercase, hyphens)
5. Recommended: PNG format, reasonable file size

### Suggested Additional Screenshots

For complete documentation, consider capturing:
- Light theme version
- Search results dropdown
- Layout settings modal
- Radial layout mode
- PNG/SVG export examples
