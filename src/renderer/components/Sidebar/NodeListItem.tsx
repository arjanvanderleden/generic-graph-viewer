import { DocumentIcon } from '../Icons';
import type { Node } from '../../types/graph';
import './NodeListItem.css';

interface NodeListItemProps {
  node: Node;
  onSelect: (nodeId: string) => void;
  onShowProperties: (node: Node) => void;
}

export function NodeListItem({ node, onSelect, onShowProperties }: NodeListItemProps) {
  return (
    <li className="node-list-item">
      <button
        className="node-list-item__select"
        onClick={() => onSelect(node.id)}
        title={node.id}
      >
        <span className="node-list-item__name">{node.name}</span>
        {node.categories && node.categories.length > 0 && (
          <span className="node-list-item__category">
            {node.categories[0]}
            {node.categories.length > 1 && ` +${node.categories.length - 1}`}
          </span>
        )}
      </button>
      <button
        className="node-list-item__props-btn"
        onClick={(e) => {
          e.stopPropagation();
          onShowProperties(node);
        }}
        disabled={!node.properties}
        title={node.properties ? 'View properties' : 'No properties'}
        aria-label="View properties"
      >
        <DocumentIcon size={12} />
      </button>
    </li>
  );
}
