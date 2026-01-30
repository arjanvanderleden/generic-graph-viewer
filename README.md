# Generic Graph View

A desktop application for visualizing and exploring graph data. Load JSON files containing nodes and edges, and interactively explore relationships with force-directed or radial layouts.

![Graph Visualization](documentation/images/knowledge-graph.png)

## Features

- **Force-directed layout** - Automatic node positioning with configurable physics
- **Radial layout** - Hierarchical visualization based on node levels
- **Category filtering** - Show/hide nodes by category with color coding
- **Interactive selection** - Click nodes and edges to view properties
- **Search** - Find nodes by ID, name, or category
- **Export** - Save as PNG (current view) or SVG (complete graph)
- **Themes** - Light and dark mode support

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## File Format

Load JSON files with this structure:

```json
{
  "nodes": [
    { "id": "node-1", "label": "First Node", "category": "type-a" },
    { "id": "node-2", "label": "Second Node", "category": "type-b" }
  ],
  "edges": [
    { "sourceId": "node-1", "targetId": "node-2" }
  ]
}
```

See [File Format Documentation](documentation/usage/file-format.md) for complete specification.

## Sample Data

The `test-data/` folder contains example graphs:

| File | Nodes | Edges | Description |
|------|-------|-------|-------------|
| `software-architecture.json` | 48 | 78 | Microservices architecture |
| `social-network.json` | 169 | 939 | Organization social network |
| `package-dependencies.json` | 91 | 130 | NPM package dependencies |
| `knowledge-graph.json` | 123 | 149 | CS concepts knowledge graph |

## Documentation

### For Users

Complete user documentation in [`documentation/usage/`](documentation/usage/):

- [Getting Started](documentation/usage/getting-started.md) - First steps with the application
- [User Interface Guide](documentation/usage/user-interface.md) - UI components explained
- [Features](documentation/usage/features.md) - Complete feature documentation
- [Keyboard Shortcuts](documentation/usage/keyboard-shortcuts.md) - All shortcuts reference
- [File Format](documentation/usage/file-format.md) - JSON schema specification
- [Exporting](documentation/usage/exporting.md) - PNG and SVG export guide
- [Troubleshooting](documentation/usage/troubleshooting.md) - Common issues and solutions

### For Developers

Development documentation in [`documentation/development/`](documentation/development/):

- [Architecture Overview](documentation/development/architecture.md) - System design
- [Project Structure](documentation/development/project-structure.md) - File organization
- [State Management](documentation/development/state-management.md) - Context and reducers
- [Code Patterns](documentation/development/code-patterns.md) - Conventions and patterns
- [Component Guide](documentation/development/components.md) - React components
- [API Reference](documentation/development/api-reference.md) - Internal APIs

### For AI-Assisted Development

- [AI Engineering Guide](documentation/development/ai-engineering-guide.md) - Working with AI assistants
- [Prompt Patterns](documentation/development/prompt-patterns.md) - Effective prompts
- [AI Context Files](documentation/development/ai-context-files.md) - Using CLAUDE.md

## Technology Stack

| Layer | Technology |
|-------|------------|
| Desktop Runtime | Electron 28+ |
| Build Tool | electron-vite |
| UI Framework | React 18 |
| Language | TypeScript 5 (strict) |
| Visualization | D3.js 7 |
| Styling | CSS with CSS Variables |

## License

MIT
