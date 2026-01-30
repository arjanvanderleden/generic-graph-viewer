# File Format Specification

Generic Graph View uses JSON files to define graph data. This document describes the complete schema.

## Basic Structure

```json
{
  "nodes": [...],
  "edges": [...]
}
```

Both `nodes` and `edges` are required arrays.

## Node Schema

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the node |
| `name` | string | Display name shown on the node |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `categories` | string[] | Array of category names for filtering and coloring |
| `color` | string | Custom color override (hex `#RRGGBB` or `rgba()`) |
| `level` | number | Hierarchy level for radial layout (0 = center) |
| `properties` | object | Additional properties displayed in the properties modal |

### Node Examples

**Minimal node:**
```json
{
  "id": "user-1",
  "name": "John Doe"
}
```

**Node with categories:**
```json
{
  "id": "service-api",
  "name": "API Gateway",
  "categories": ["service", "infrastructure"]
}
```

**Node with custom color:**
```json
{
  "id": "critical-node",
  "name": "Critical System",
  "color": "#FF0000"
}
```

**Node with hierarchy level (for radial layout):**
```json
{
  "id": "root",
  "name": "Root Node",
  "level": 0
}
```

**Node with properties:**
```json
{
  "id": "user-123",
  "name": "Jane Smith",
  "categories": ["user", "admin"],
  "properties": {
    "email": "jane@example.com",
    "role": "Administrator",
    "joinDate": "2023-01-15",
    "permissions": ["read", "write", "delete"]
  }
}
```

## Edge Schema

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `sourceId` | string | ID of the source node |
| `targetId` | string | ID of the target node |

### Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `properties` | object | Additional edge properties (displayed when edge is selected) |

### Edge Examples

**Basic edge:**
```json
{
  "sourceId": "node-a",
  "targetId": "node-b"
}
```

**Edge with properties:**
```json
{
  "sourceId": "user-1",
  "targetId": "user-2",
  "properties": {
    "relationship": "friend",
    "since": "2022-06-01",
    "strength": 0.85
  }
}
```

## Complete Example

```json
{
  "nodes": [
    {
      "id": "api-gateway",
      "name": "API Gateway",
      "categories": ["infrastructure", "entry-point"],
      "level": 0,
      "properties": {
        "version": "2.1.0",
        "port": 8080,
        "rateLimit": "1000/min"
      }
    },
    {
      "id": "user-service",
      "name": "User Service",
      "categories": ["service", "core"],
      "level": 1
    },
    {
      "id": "auth-service",
      "name": "Auth Service",
      "categories": ["service", "security"],
      "level": 1
    },
    {
      "id": "user-db",
      "name": "User Database",
      "categories": ["database", "postgresql"],
      "level": 2,
      "color": "#4A90D9"
    },
    {
      "id": "cache",
      "name": "Redis Cache",
      "categories": ["cache"],
      "level": 2,
      "color": "#DC382D"
    }
  ],
  "edges": [
    { "sourceId": "api-gateway", "targetId": "user-service" },
    { "sourceId": "api-gateway", "targetId": "auth-service" },
    { "sourceId": "user-service", "targetId": "user-db" },
    { "sourceId": "user-service", "targetId": "cache" },
    { "sourceId": "auth-service", "targetId": "user-db" },
    { "sourceId": "auth-service", "targetId": "cache" }
  ]
}
```

## Categories

Categories serve multiple purposes:

1. **Coloring** - Nodes are colored based on their first category using the ColorBrewer Set3 palette
2. **Filtering** - Categories can be hidden/shown via the sidebar
3. **Selection** - Click a category to select all nodes in that category
4. **Display** - Categories are shown in the properties panel

### Multiple Categories

Nodes can belong to multiple categories:

```json
{
  "id": "fraud-detection",
  "name": "Fraud Detection",
  "categories": ["service", "security", "ml"]
}
```

- The **first category** determines the node's color (unless `color` is specified)
- A node is **hidden** if ANY of its categories is hidden
- All categories are displayed in the properties panel

### Uncategorized Nodes

Nodes without categories are grouped as "(uncategorized)" in the legend and use the default node color.

## Hierarchy Levels (Radial Layout)

The `level` field controls node placement in radial layout mode:

| Level | Position |
|-------|----------|
| 0 | Center of the graph |
| 1 | First ring from center |
| 2 | Second ring from center |
| ... | Outer rings |
| undefined | Outermost ring |

```json
{
  "nodes": [
    { "id": "root", "name": "Root", "level": 0 },
    { "id": "child1", "name": "Child 1", "level": 1 },
    { "id": "child2", "name": "Child 2", "level": 1 },
    { "id": "grandchild", "name": "Grandchild", "level": 2 }
  ]
}
```

## Custom Colors

Override automatic category coloring with the `color` field:

**Supported formats:**
- Hex: `#RGB`, `#RRGGBB`, `#RRGGBBAA`
- RGBA: `rgba(255, 0, 0, 0.5)`

```json
{
  "id": "warning-node",
  "name": "Warning",
  "color": "#FFA500"
}
```

**Color priority:**
1. Node's `color` field (if valid)
2. First category's color from palette
3. Default node color (`#4A90D9`)

## Validation

The application validates graph files on load:

### Required Validations
- `nodes` must be an array
- `edges` must be an array
- Each node must have a non-empty string `id`
- Each node must have a string `name`
- Each edge must have non-empty string `sourceId` and `targetId`
- Node IDs must be unique

### Warnings (non-fatal)
- Edges referencing non-existent nodes are displayed in the Statistics panel
- These edges are filtered out during visualization

## Best Practices

1. **Use meaningful IDs** - IDs should be stable identifiers, not display names
2. **Keep names concise** - Long names are truncated in the visualization (15 characters)
3. **Use consistent categories** - Establish a category taxonomy for your domain
4. **Add properties for detail** - Use the `properties` field for extended information
5. **Define levels for hierarchy** - If your data has natural hierarchy, use `level` for better radial layouts
