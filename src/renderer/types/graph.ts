// Core graph data types

export interface Node {
  id: string;
  name: string;
  categories?: string[];
  color?: string;  // Optional: hex (#RRGGBB) or rgba() color override
  level?: number;  // Optional: 0 = center, 1+ = outer rings, undefined = outermost
  properties?: Record<string, unknown>;  // Optional: additional properties to display in modal
}

export interface Edge {
  sourceId: string;
  targetId: string;
  properties?: Record<string, unknown>;  // Optional: additional edge properties
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

// D3 simulation types with position data
export interface D3Node extends Node {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface D3Link {
  source: string | D3Node;
  target: string | D3Node;
  index?: number;
}

// Selection state
export type SelectionType = 'node' | 'edge' | null;

export interface SelectionState {
  type: SelectionType;
  ids: string[];  // Multiple selection support
}

// Category color mapping
export type CategoryColorMap = Map<string, string>;

// Graph index for O(1) lookups
export interface GraphIndex {
  nodeById: Map<string, Node>;
  edgeByKey: Map<string, Edge>; // key = "sourceId->targetId"
}

// Graph statistics
export interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  invalidEdges: Edge[];
}

// Validation result types
export interface ValidationError {
  message: string;
  field?: string;
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: ValidationError };

// File loading types
export interface LoadedGraph {
  filePath: string;
  data: GraphData;
  index: GraphIndex;
  stats: GraphStats;
}
