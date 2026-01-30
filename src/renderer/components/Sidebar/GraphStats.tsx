import { useState } from 'react';
import { useGraph } from '../../context/GraphContext';
import './GraphStats.css';

export function GraphStats() {
  const { state } = useGraph();
  const { stats, filePath } = state;
  const [showInvalidEdges, setShowInvalidEdges] = useState(false);

  if (!stats) {
    return (
      <div className="graph-stats">
        <p className="graph-stats__empty">No graph loaded</p>
      </div>
    );
  }

  const fileName = filePath ? filePath.split('/').pop() : 'Unknown';
  const hasInvalidEdges = stats.invalidEdges.length > 0;

  return (
    <div className="graph-stats">
      <div className="graph-stats__file">
        <span className="graph-stats__label">File:</span>
        <span className="graph-stats__value" title={filePath ?? undefined}>
          {fileName}
        </span>
      </div>

      <div className="graph-stats__row">
        <span className="graph-stats__label">Nodes:</span>
        <span className="graph-stats__value">{stats.nodeCount}</span>
      </div>

      <div className="graph-stats__row">
        <span className="graph-stats__label">Edges:</span>
        <span className="graph-stats__value">{stats.edgeCount}</span>
      </div>

      <div className="graph-stats__row">
        <span className="graph-stats__label">Invalid Edges:</span>
        <span
          className={`graph-stats__value ${hasInvalidEdges ? 'graph-stats__value--error' : ''}`}
        >
          {stats.invalidEdges.length}
        </span>
      </div>

      {hasInvalidEdges && (
        <div className="graph-stats__invalid">
          <button
            className="graph-stats__toggle"
            onClick={() => setShowInvalidEdges(!showInvalidEdges)}
          >
            <span className="graph-stats__toggle-icon">
              {showInvalidEdges ? '▼' : '▶'}
            </span>
            <span>Show invalid edges</span>
          </button>

          {showInvalidEdges && (
            <ul className="graph-stats__invalid-list">
              {stats.invalidEdges.slice(0, 10).map((edge, i) => (
                <li key={i} className="graph-stats__invalid-item">
                  <span className="graph-stats__edge-id" title={edge.sourceId}>
                    {edge.sourceId}
                  </span>
                  <span className="graph-stats__edge-arrow">→</span>
                  <span className="graph-stats__edge-id" title={edge.targetId}>
                    {edge.targetId}
                  </span>
                </li>
              ))}
              {stats.invalidEdges.length > 10 && (
                <li className="graph-stats__invalid-more">
                  ...and {stats.invalidEdges.length - 10} more
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
