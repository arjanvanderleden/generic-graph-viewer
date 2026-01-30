# Troubleshooting

Solutions to common issues when using Generic Graph View.

## File Loading Issues

### "Invalid JSON file" Error

**Symptoms:** Error message when opening a file

**Causes:**
- File is not valid JSON (syntax error)
- File is not UTF-8 encoded

**Solutions:**
1. Validate your JSON at [jsonlint.com](https://jsonlint.com)
2. Check for:
   - Missing commas between items
   - Trailing commas after last item
   - Unquoted keys
   - Single quotes instead of double quotes
3. Ensure file is saved as UTF-8

### "Missing or invalid nodes array" Error

**Symptoms:** Error message about nodes

**Cause:** The JSON file doesn't have a `nodes` array at the root level

**Solution:** Ensure your file has the structure:
```json
{
  "nodes": [...],
  "edges": [...]
}
```

### "Node has invalid or missing id" Error

**Symptoms:** Error pointing to a specific node index

**Cause:** A node is missing its `id` field or it's empty

**Solution:** Every node must have a non-empty string `id`:
```json
{ "id": "my-node", "name": "My Node" }
```

### Invalid Edges Warning

**Symptoms:** Statistics panel shows "Invalid edges"

**Cause:** Edges reference nodes that don't exist

**Solution:**
- Check that `sourceId` and `targetId` match existing node IDs
- IDs are case-sensitive
- Invalid edges are shown in the expandable list

---

## Display Issues

### Graph Appears Empty

**Symptoms:** Canvas shows but no nodes visible

**Possible causes:**
1. All categories are hidden
2. Nodes have no position data yet
3. Graph is zoomed to wrong area

**Solutions:**
1. Check Categories panel - click "Show All"
2. Wait for simulation to stabilize
3. Press Cmd+0 to zoom to fit

### Nodes Overlapping

**Symptoms:** Nodes are stacked on top of each other

**Solutions:**
1. Open Layout Settings (Cmd+L)
2. Increase Collision Radius
3. Increase Charge Strength (more negative)
4. Wait for simulation to re-stabilize

### Graph is Too Spread Out

**Symptoms:** Nodes are far apart, hard to see connections

**Solutions:**
1. Open Layout Settings (Cmd+L)
2. Decrease Link Distance
3. Decrease Charge Strength (less negative)
4. Use Cmd+0 to zoom to fit

### Stale Edges After Loading New File

**Symptoms:** Old edges visible briefly when loading a new graph

**Solutions:**
- This should be fixed in the latest version
- If it persists, press Cmd+R to reload

### Labels Hard to Read

**Symptoms:** Text is cut off or hard to see

**Notes:**
- Labels are truncated to 15 characters by design
- Full name shown in Properties panel
- Use Properties modal for complete information

---

## Performance Issues

### Slow with Large Graphs

**Symptoms:** Sluggish performance with many nodes (500+)

**Solutions:**
1. Hide categories you don't need
2. Use search to focus on specific nodes
3. Adjust force parameters for faster stabilization:
   - Lower collision radius
   - Less extreme charge strength

### Animation is Choppy

**Symptoms:** Jerky movement during simulation

**Causes:**
- System resources constrained
- Very large graph

**Solutions:**
1. Close other applications
2. Wait for simulation to stabilize
3. Hide some categories to reduce rendered nodes

---

## Export Issues

### PNG Export is Blank

**Symptoms:** Exported PNG file is empty or just background

**Solutions:**
1. Ensure graph has finished loading
2. Wait for simulation to stabilize
3. Check that nodes aren't all hidden

### PNG Export Shows Wrong Colors

**Symptoms:** Colors don't match what you see

**Solution:**
- Export captures current theme
- Switch themes before export if needed

### SVG Won't Open

**Symptoms:** Vector editor can't open the SVG file

**Solutions:**
1. The SVG uses standard W3C SVG 1.1 format
2. Try opening in a different editor
3. Check if file was corrupted during save

### SVG Has Unexpected Viewbox

**Symptoms:** SVG appears cropped or mispositioned

**Note:** This should be fixed in the latest version. The viewBox now correctly includes all node coordinates including negative values.

---

## Selection Issues

### Can't Select Node

**Symptoms:** Clicking on a node doesn't select it

**Possible causes:**
1. Node is hidden (category hidden)
2. Clicking on edge instead of node
3. Node is behind another element

**Solutions:**
1. Show all categories
2. Click directly on the node circle
3. Zoom in for better precision

### Selection Persists After Loading New File

**Symptoms:** Old selection visible after opening new file

**Solution:** This should be fixed in the latest version. Selection is now cleared when loading a new graph.

---

## Keyboard Shortcuts Not Working

### Cmd+R Opens Browser Reload

**Note:** In development mode, Cmd+R is mapped to "Reload Document", not browser reload. Use Cmd+Shift+R for app reload.

### Shortcuts Don't Work in Modals

**Expected behavior:** When a modal is open, keyboard shortcuts are blocked. Close the modal first.

---

## Platform-Specific Issues

### macOS: Window Controls Missing

**Symptoms:** Traffic lights not visible

**Solution:** The window uses "hidden inset" title bar style. Traffic lights should appear in the title bar area.

### Windows: Menu Bar Missing

**Note:** The menu bar is integrated into the application window, not the system menu bar.

### Linux: Font Rendering Issues

**Solution:** Install system fonts or adjust font settings in your desktop environment.

---

## Getting Help

If you encounter an issue not covered here:

1. Check the [GitHub Issues](https://github.com/your-repo/issues) for existing reports
2. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Your platform (macOS/Windows/Linux)
   - Application version
   - Sample data (if applicable)

---

## Reporting Bugs

When reporting bugs, please include:

1. **Platform:** macOS Sonoma 14.2 / Windows 11 / Ubuntu 22.04
2. **Version:** Application version from About dialog
3. **Steps:** Exact steps to reproduce
4. **Expected:** What you expected to happen
5. **Actual:** What actually happened
6. **Data:** Minimal JSON that demonstrates the issue (if applicable)
7. **Screenshot:** If it's a visual bug
