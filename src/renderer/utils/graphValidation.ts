import type {
  GraphData,
  GraphStats,
  GraphIndex,
  Edge,
  Node,
  ValidationResult
} from '../types/graph';

// Edge ID delimiter - using arrow which is unlikely in node IDs
// but still human-readable for debugging
const EDGE_ID_DELIMITER = '->';

/**
 * Validates that the provided data conforms to GraphData structure
 */
export function validateGraphData(
  data: unknown
): ValidationResult<GraphData> {
  if (!data || typeof data !== 'object') {
    return {
      success: false,
      error: { message: 'Data must be an object' }
    };
  }

  const obj = data as Record<string, unknown>;

  // Check nodes array
  if (!Array.isArray(obj.nodes)) {
    return {
      success: false,
      error: { message: 'Missing or invalid "nodes" array', field: 'nodes' }
    };
  }

  // Check edges array
  if (!Array.isArray(obj.edges)) {
    return {
      success: false,
      error: { message: 'Missing or invalid "edges" array', field: 'edges' }
    };
  }

  // Validate each node
  for (let i = 0; i < obj.nodes.length; i++) {
    const node = obj.nodes[i] as Record<string, unknown>;
    if (!node || typeof node !== 'object') {
      return {
        success: false,
        error: { message: `Node at index ${i} is not an object`, field: 'nodes' }
      };
    }
    if (typeof node.id !== 'string' || node.id.trim() === '') {
      return {
        success: false,
        error: {
          message: `Node at index ${i} has invalid or missing "id"`,
          field: 'nodes'
        }
      };
    }
    if (typeof node.name !== 'string') {
      return {
        success: false,
        error: {
          message: `Node at index ${i} has invalid or missing "name"`,
          field: 'nodes'
        }
      };
    }
  }

  // Check for duplicate node IDs
  const nodeIds = new Set<string>();
  for (const node of obj.nodes as Node[]) {
    if (nodeIds.has(node.id)) {
      return {
        success: false,
        error: { message: `Duplicate node ID: "${node.id}"`, field: 'nodes' }
      };
    }
    nodeIds.add(node.id);
  }

  // Validate each edge
  for (let i = 0; i < obj.edges.length; i++) {
    const edge = obj.edges[i] as Record<string, unknown>;
    if (!edge || typeof edge !== 'object') {
      return {
        success: false,
        error: { message: `Edge at index ${i} is not an object`, field: 'edges' }
      };
    }
    if (typeof edge.sourceId !== 'string' || edge.sourceId.trim() === '') {
      return {
        success: false,
        error: {
          message: `Edge at index ${i} has invalid or missing "sourceId"`,
          field: 'edges'
        }
      };
    }
    if (typeof edge.targetId !== 'string' || edge.targetId.trim() === '') {
      return {
        success: false,
        error: {
          message: `Edge at index ${i} has invalid or missing "targetId"`,
          field: 'edges'
        }
      };
    }
  }

  return {
    success: true,
    data: {
      nodes: obj.nodes as Node[],
      edges: obj.edges as Edge[]
    }
  };
}

/**
 * Finds edges that reference non-existent nodes
 */
export function findInvalidEdges(graphData: GraphData): Edge[] {
  const nodeIds = new Set(graphData.nodes.map((n) => n.id));

  return graphData.edges.filter(
    (edge) => !nodeIds.has(edge.sourceId) || !nodeIds.has(edge.targetId)
  );
}

/**
 * Calculates statistics for a graph
 */
export function calculateStats(graphData: GraphData): GraphStats {
  return {
    nodeCount: graphData.nodes.length,
    edgeCount: graphData.edges.length,
    invalidEdges: findInvalidEdges(graphData)
  };
}

/**
 * Builds an index for O(1) lookups
 */
export function buildGraphIndex(graphData: GraphData): GraphIndex {
  const nodeById = new Map<string, Node>();
  const edgeByKey = new Map<string, Edge>();

  for (const node of graphData.nodes) {
    nodeById.set(node.id, node);
  }

  for (const edge of graphData.edges) {
    const key = `${edge.sourceId}${EDGE_ID_DELIMITER}${edge.targetId}`;
    edgeByKey.set(key, edge);
  }

  return { nodeById, edgeByKey };
}

/**
 * Gets a node by ID - O(1) with index, O(n) without
 */
export function getNodeById(
  graphData: GraphData,
  id: string,
  index?: GraphIndex
): Node | undefined {
  if (index) {
    return index.nodeById.get(id);
  }
  return graphData.nodes.find((n) => n.id === id);
}

/**
 * Gets an edge by source and target IDs - O(1) with index, O(n) without
 */
export function getEdgeByIds(
  graphData: GraphData,
  sourceId: string,
  targetId: string,
  index?: GraphIndex
): Edge | undefined {
  if (index) {
    const key = `${sourceId}${EDGE_ID_DELIMITER}${targetId}`;
    return index.edgeByKey.get(key);
  }
  return graphData.edges.find(
    (e) => e.sourceId === sourceId && e.targetId === targetId
  );
}

/**
 * Creates an edge ID from source and target
 */
export function createEdgeId(sourceId: string, targetId: string): string {
  return `${sourceId}${EDGE_ID_DELIMITER}${targetId}`;
}

/**
 * Parses an edge ID back to source and target
 * Note: This assumes node IDs don't contain the delimiter
 */
export function parseEdgeId(edgeId: string): { sourceId: string; targetId: string } | null {
  const delimiterIndex = edgeId.indexOf(EDGE_ID_DELIMITER);
  if (delimiterIndex === -1) return null;
  return {
    sourceId: edgeId.slice(0, delimiterIndex),
    targetId: edgeId.slice(delimiterIndex + EDGE_ID_DELIMITER.length)
  };
}

/**
 * Gets all nodes connected to a given node ID
 */
export function getConnectedNodes(
  graphData: GraphData,
  nodeId: string
): Node[] {
  const connectedIds = new Set<string>();

  for (const edge of graphData.edges) {
    if (edge.sourceId === nodeId) {
      connectedIds.add(edge.targetId);
    } else if (edge.targetId === nodeId) {
      connectedIds.add(edge.sourceId);
    }
  }

  return graphData.nodes.filter((node) => connectedIds.has(node.id));
}
