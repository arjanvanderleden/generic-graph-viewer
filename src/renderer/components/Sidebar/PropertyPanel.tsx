import { useMemo, useState } from 'react';
import { useGraph } from '../../context/GraphContext';
import { useSelection, selectionActions } from '../../context/SelectionContext';
import { getNodeById, parseEdgeId, getEdgeByIds, getConnectedNodes } from '../../utils/graphValidation';
import { NodePropertiesModal } from './NodePropertiesModal';
import { NodeListItem } from './NodeListItem';
import { DocumentIcon } from '../Icons';
import type { Node, Edge } from '../../types/graph';
import './PropertyPanel.css';

// Type-safe selection result
type SelectedNodes = { type: 'node'; data: Node[] };
type SelectedEdge = { type: 'edge'; data: Edge[] };
type SelectedElements = SelectedNodes | SelectedEdge;

function isNodeSelection(sel: SelectedElements): sel is SelectedNodes {
  return sel.type === 'node';
}

function isEdgeSelection(sel: SelectedElements): sel is SelectedEdge {
  return sel.type === 'edge';
}

export function PropertyPanel() {
  const { state: graphState } = useGraph();
  const { selection, dispatch } = useSelection();
  const [propertiesModalNode, setPropertiesModalNode] = useState<Node | null>(null);

  const selectedElements = useMemo(() => {
    if (!graphState.graphData || !selection.type || selection.ids.length === 0) {
      return null;
    }

    const index = graphState.graphIndex ?? undefined;

    if (selection.type === 'node') {
      const nodes: Node[] = [];
      for (const id of selection.ids) {
        const node = getNodeById(graphState.graphData, id, index);
        if (node) nodes.push(node);
      }
      return nodes.length > 0 ? { type: 'node' as const, data: nodes } : null;
    }

    if (selection.type === 'edge') {
      // Edge selection is single
      const edgeId = selection.ids[0];
      const parsed = parseEdgeId(edgeId);
      if (!parsed) return null;

      const edge = getEdgeByIds(
        graphState.graphData,
        parsed.sourceId,
        parsed.targetId,
        index
      );
      return edge ? { type: 'edge' as const, data: [edge] } : null;
    }

    return null;
  }, [graphState.graphData, graphState.graphIndex, selection]);

  // Get connected nodes for single node selection
  const connectedNodes = useMemo(() => {
    if (!graphState.graphData || !selectedElements) return [];
    if (!isNodeSelection(selectedElements) || selectedElements.data.length !== 1) return [];

    const node = selectedElements.data[0];
    return getConnectedNodes(graphState.graphData, node.id);
  }, [graphState.graphData, selectedElements]);

  const handleNodeSelect = (nodeId: string) => {
    dispatch(selectionActions.selectNode(nodeId));
  };

  const handleShowProperties = (node: Node) => {
    setPropertiesModalNode(node);
  };

  if (!selectedElements) {
    return (
      <div className="property-panel">
        <p className="property-panel__empty">
          Click a node or edge to view properties
        </p>
      </div>
    );
  }

  if (isEdgeSelection(selectedElements)) {
    const edge = selectedElements.data[0];
    return (
      <div className="property-panel">
        <div className="property-panel__header">
          <span className="property-panel__type">Edge</span>
        </div>
        <pre className="property-panel__json">
          <code>{JSON.stringify(edge, null, 2)}</code>
        </pre>
      </div>
    );
  }

  // At this point, selectedElements is SelectedNodes
  const isMultiple = selectedElements.data.length > 1;

  // Single node selected - show connected nodes
  if (!isMultiple) {
    const node = selectedElements.data[0];
    return (
      <div className="property-panel">
        <div className="property-panel__header">
          <span className="property-panel__type">Node</span>
          <span className="property-panel__id">{node.id}</span>
        </div>

        <div className="property-panel__node-info">
          <div className="property-panel__node-name-row">
            <span className="property-panel__node-name">{node.name}</span>
            {node.properties && (
              <button
                className="property-panel__properties-btn"
                onClick={() => setPropertiesModalNode(node)}
                title="View properties"
                aria-label="View properties"
              >
                <DocumentIcon />
              </button>
            )}
          </div>
          {node.categories && node.categories.length > 0 && (
            <div className="property-panel__node-categories">
              {node.categories.join(', ')}
            </div>
          )}
        </div>

        <div className="property-panel__connections">
          <div className="property-panel__connections-header">
            Connected nodes ({connectedNodes.length})
          </div>
          {connectedNodes.length === 0 ? (
            <p className="property-panel__no-connections">No connections</p>
          ) : (
            <ul className="property-panel__node-list">
              {connectedNodes.map((connectedNode) => (
                <NodeListItem
                  key={connectedNode.id}
                  node={connectedNode}
                  onSelect={handleNodeSelect}
                  onShowProperties={handleShowProperties}
                />
              ))}
            </ul>
          )}
        </div>

        {propertiesModalNode && (
          <NodePropertiesModal
            node={propertiesModalNode}
            isOpen={true}
            onClose={() => setPropertiesModalNode(null)}
          />
        )}
      </div>
    );
  }

  // Multiple nodes selected - show clickable list
  return (
    <div className="property-panel">
      <div className="property-panel__header">
        <span className="property-panel__type">
          {selectedElements.data.length} Nodes
        </span>
      </div>

      <ul className="property-panel__node-list">
        {selectedElements.data.map((node) => (
          <NodeListItem
            key={node.id}
            node={node}
            onSelect={handleNodeSelect}
            onShowProperties={handleShowProperties}
          />
        ))}
      </ul>

      {propertiesModalNode && (
        <NodePropertiesModal
          node={propertiesModalNode}
          isOpen={true}
          onClose={() => setPropertiesModalNode(null)}
        />
      )}
    </div>
  );
}
