# Getting Started

This guide will help you get up and running with Generic Graph View.

## Installation

### From Release (Recommended)

1. Download the latest release from the releases page
2. Choose the appropriate version for your platform:
   - **macOS**: `Generic-Graph-View-x.x.x-universal.dmg` (works on Intel and Apple Silicon)
   - **Windows**: `Generic-Graph-View-x.x.x-setup.exe`
   - **Linux**: `Generic-Graph-View-x.x.x.AppImage`
3. Install following your platform's standard process

### From Source (Development)

```bash
# Clone the repository
git clone <repository-url>
cd generic-graph-view

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Your First Graph

### Opening a Graph File

1. Launch Generic Graph View
2. Use **File > Open** or press **Cmd+O** (Mac) / **Ctrl+O** (Windows/Linux)
3. Select a JSON file containing your graph data
4. The graph will render automatically with a force-directed layout

### Using Sample Data

The application includes sample graphs in the `test-data/` folder:

| File | Description | Nodes | Edges |
|------|-------------|-------|-------|
| `software-architecture.json` | Microservices architecture | 48 | 78 |
| `social-network.json` | Users and groups | 169 | 939 |
| `package-dependencies.json` | npm dependency tree | 91 | 130 |
| `knowledge-graph.json` | Computer science concepts | 123 | 149 |

### Creating Your Own Graph

Create a JSON file with the following structure:

```json
{
  "nodes": [
    { "id": "node1", "name": "First Node" },
    { "id": "node2", "name": "Second Node" }
  ],
  "edges": [
    { "sourceId": "node1", "targetId": "node2" }
  ]
}
```

See [File Format](./file-format.md) for the complete specification.

## Basic Navigation

### Panning and Zooming

- **Pan**: Click and drag on the background
- **Zoom**: Use mouse wheel or trackpad scroll
- **Zoom to Fit**: Press **Cmd+0** to fit all nodes in view
- **Zoom to Selection**: Press **Cmd+1** to zoom to selected nodes

### Selecting Nodes

- **Single Select**: Click on a node
- **Multi-Select**: Cmd/Ctrl+Click to toggle nodes in selection
- **Clear Selection**: Click on the background

### Viewing Node Details

When a node is selected, the Properties panel in the sidebar shows:
- Node ID and name
- Categories (if defined)
- Connected nodes (clickable to navigate)
- Properties button (if the node has additional properties)

## Interface Overview

![Main Interface](./images/main-interface.png)

The interface consists of:

1. **Title Bar** - Shows the current file name and theme toggle
2. **Graph Canvas** - The main visualization area
3. **Sidebar** - Contains search, statistics, categories, and properties panels

## Next Steps

- Learn about the [File Format](./file-format.md) to structure your data
- Explore all [Features](./features.md) available
- Review [Keyboard Shortcuts](./keyboard-shortcuts.md) for efficient navigation
