# Features

Complete documentation of all Generic Graph View features.

## Table of Contents

- [Graph Visualization](#graph-visualization)
- [Force-Directed Layout](#force-directed-layout)
- [Radial Layout](#radial-layout)
- [Node Selection](#node-selection)
- [Category Management](#category-management)
- [Search](#search)
- [Properties Inspection](#properties-inspection)
- [Navigation](#navigation)
- [File Management](#file-management)
- [Export](#export)
- [Theming](#theming)

---

## Graph Visualization

![Knowledge Graph Example](../images/knowledge-graph.png)

### Automatic Layout

When you load a graph, the application automatically positions nodes using a force-directed simulation. The simulation considers:

- **Repulsion** - Nodes push away from each other
- **Attraction** - Connected nodes pull toward each other
- **Collision** - Nodes avoid overlapping
- **Centering** - Graph stays centered in the viewport

The simulation runs until it stabilizes (nodes stop moving significantly), then automatically zooms to fit all nodes.

### Deterministic Positioning

The initial node positions are determined by a seeded random number generator based on each node's ID. This means:

- **Same data = Same layout** - Reloading the same file produces the same initial positions
- **Reproducible** - The layout is reproducible across sessions
- **Stable** - Small changes to data result in small changes to layout

### Visual Encoding

| Element | Encoding |
|---------|----------|
| Node color | Category (first) or custom color |
| Node size | Fixed (radius: 35px) |
| Node label | Node name (truncated) |
| Edge thickness | Normal (2px) or selected (6px) |
| Edge color | Gray (normal) or highlight (selected) |

---

## Force-Directed Layout

The default layout algorithm uses D3's force simulation with configurable parameters.

### Layout Settings Modal

Access via **View > Layout Settings** or **Cmd+L**

#### Parameters

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| Link Distance | 50-500 | 150 | Target distance between connected nodes |
| Charge Strength | -1000 to -50 | -400 | Repulsion force between nodes (more negative = stronger) |
| Collision Radius | 20-100 | 45 | Minimum distance between node centers |

### Adjusting the Layout

1. Open Layout Settings (Cmd+L)
2. Adjust sliders
3. Watch the graph update in real-time
4. The simulation gently reheats to apply changes
5. Close the modal when satisfied

**Tips:**
- **Dense graphs** - Increase charge strength (more negative) and link distance
- **Sparse graphs** - Decrease charge strength and link distance
- **Overlapping labels** - Increase collision radius
- **Tighter clusters** - Decrease link distance

---

## Radial Layout

For hierarchical data, radial layout arranges nodes in concentric rings based on their `level` property.

### Enabling Radial Layout

- **View > Radial Layout** - Toggle checkbox
- The layout switches immediately

### How It Works

Nodes are positioned in rings:
- **Level 0** - Center of the graph
- **Level 1** - First ring
- **Level 2** - Second ring
- **Level N** - Nth ring
- **No level** - Outermost ring

### Best Practices

1. Assign level 0 to root/central nodes
2. Use sequential levels for parent-child relationships
3. Leave level undefined for leaf nodes
4. Ensure your data has the `level` property defined

**Example:**
```json
{
  "nodes": [
    { "id": "root", "name": "Root", "level": 0 },
    { "id": "child-a", "name": "Child A", "level": 1 },
    { "id": "child-b", "name": "Child B", "level": 1 },
    { "id": "leaf-1", "name": "Leaf 1", "level": 2 }
  ]
}
```

---

## Node Selection

![Selection Example](../images/selection.png)

### Single Selection

Click on a node to select it:
- The node gets a highlighted border
- Connected edges are highlighted
- Properties panel shows node details
- Connected nodes are listed

### Multi-Selection

Hold **Cmd** (Mac) or **Ctrl** (Windows/Linux) while clicking:
- Toggle nodes in/out of selection
- All selected nodes are highlighted
- Properties panel shows list of selected nodes

### Selection from Categories

In the Categories panel:
- **Click** - Select all nodes in category (replaces selection)
- **Shift+Click** - Add category nodes to selection
- **Cmd/Ctrl+Click** - Remove category nodes from selection

### Selection from Search

When you search for nodes:
- All matching nodes are automatically selected
- The selection updates as you type (debounced)

### Clearing Selection

- Click on the canvas background
- Or search and then clear the search field

---

## Category Management

![Category Visibility](../images/social-graph-hidden-categories.png)

Categories provide organization, filtering, and visual distinction.

### Category Colors

Categories are automatically assigned colors from the ColorBrewer Set3 palette (12 colors). Colors cycle if you have more than 12 categories.

### Visibility Control

Toggle category visibility using the eye icon:
- **Visible (open eye)** - Nodes are shown
- **Hidden (crossed eye)** - Nodes are invisible (opacity 0)

The image above shows several categories hidden (eye-off icon next to designer, intern, manager, senior). Notice how the graph appears less dense with fewer visible nodes.

**Important:** Nodes with multiple categories are hidden if ANY category is hidden.

### Bulk Visibility

Use the **Hide All** / **Show All** button to toggle all categories at once.

### Category Selection

Click on a category name to select all its nodes:

| Action | Result |
|--------|--------|
| Click | Select only these nodes |
| Shift+Click | Add to current selection |
| Cmd/Ctrl+Click | Remove from current selection |

---

## Search

The search feature helps find nodes in large graphs.

### Search Behavior

- Searches **node ID**, **name**, and **categories**
- Case-insensitive
- Partial matching (substring)
- Debounced (150ms delay)

### Search Results

- Match count displayed below search box
- Matching nodes automatically selected
- Graph view doesn't change (use Zoom to Selection to focus)

### Clearing Search

Click the × button or delete all text. This:
- Clears the match count
- Does NOT clear the selection

---

## Properties Inspection

### Node Properties

When a node is selected, the Properties panel shows its details (visible in the selection.png image):

- **Node type badge** - "NODE" indicator
- **Node name** - The node's label
- **Categories** - Listed below the name
- **Connected nodes** - Clickable list of neighbors

When a node has a `properties` field, a document icon button appears. Click it to open the Properties Modal:

**Modal features:**
- Node name (with copy button)
- Node ID (with copy button)
- Full JSON of properties (with copy button)
- Click outside or × to close

### Edge Properties

When an edge is selected, its full JSON is displayed in the Properties panel:

```json
{
  "sourceId": "node-a",
  "targetId": "node-b",
  "properties": {
    "weight": 0.75,
    "type": "dependency"
  }
}
```

### Connected Nodes

The Properties panel shows nodes connected to the current selection:

- Each connected node is clickable
- Click to navigate to that node
- Shows node name and first category
- Properties button for quick access

---

## Navigation

### Pan and Zoom

| Action | Method |
|--------|--------|
| Pan | Click and drag background |
| Zoom in | Scroll up / Pinch out |
| Zoom out | Scroll down / Pinch in |
| Zoom to fit | Cmd+0 |
| Zoom to selection | Cmd+1 |

### Zoom to Fit

Press **Cmd+0** (or View > Zoom to Fit) to:
- Fit all visible nodes in the viewport
- Add padding around the edges
- Animate the transition (500ms)

### Zoom to Selection

Press **Cmd+1** (or View > Zoom to Selection) to:
- Fit selected nodes in the viewport
- Add padding around the selection
- Useful after searching or selecting a category

---

## File Management

### Opening Files

- **Cmd+O** - Open file dialog
- **File > Open** - Open file dialog
- **File > Open Recent** - Open from recent files list

### Recent Files

The application remembers recently opened files:
- Up to 10 recent files stored
- Access via File > Open Recent
- Clear Recent option to reset the list

### Reloading

Press **Cmd+R** to reload:
- If a file is open: Reloads the current file
- If no file is open: Opens the most recent file

Useful for:
- Refreshing after external edits
- Resetting the layout
- Re-reading updated data

---

## Export

Export your visualization as images.

### Export as PNG

**File > Export as PNG** or **Cmd+Shift+E**

**Characteristics:**
- Captures exactly what you see
- Includes current zoom/pan state
- Preserves selection highlighting
- Respects hidden categories
- Image size matches canvas dimensions
- Inlines all styles for accuracy

**Use cases:**
- Screenshots for documentation
- Sharing current view with others
- Capturing specific selections

### Export as SVG

**File > Export as SVG** or **Cmd+Shift+S**

**Characteristics:**
- Exports complete graph
- All nodes visible (ignores hidden categories)
- No selection styling
- Sized to fit all nodes with 5% margin
- Scaled to reasonable dimensions (max 1920×1080)
- Clean, standalone SVG file

**Use cases:**
- High-quality graphics for presentations
- Further editing in vector software
- Print-ready output
- Archiving the complete graph

---

## Theming

### Dark Theme

The default theme (shown in all screenshots) with:
- Dark background (#1a1a2e)
- Light text
- Yellow selection highlights (#FFFF00)
- Optimized for low-light environments

### Light Theme

Alternative theme with:
- Light background (#ffffff)
- Dark text
- Black selection highlights
- Better for bright environments and printing

### Switching Themes

Click the sun/moon icon in the title bar to toggle between themes.

The theme preference is applied immediately and affects:
- Canvas background
- Node label colors
- Edge colors
- Sidebar styling
- Selection highlights
