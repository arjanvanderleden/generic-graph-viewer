import { useEffect, useCallback, useState } from 'react';
import type { Node } from '../../types/graph';
import './NodePropertiesModal.css';

interface NodePropertiesModalProps {
  node: Node;
  isOpen: boolean;
  onClose: () => void;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      className="node-properties-modal__copy-btn"
      onClick={handleCopy}
      title={`Copy ${label}`}
      aria-label={`Copy ${label}`}
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20,6 9,17 4,12" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
        </svg>
      )}
    </button>
  );
}

export function NodePropertiesModal({ node, isOpen, onClose }: NodePropertiesModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="node-properties-modal__backdrop" onClick={handleBackdropClick}>
      <div className="node-properties-modal">
        <div className="node-properties-modal__header">
          <div className="node-properties-modal__titles">
            <div className="node-properties-modal__title-row">
              <h2 className="node-properties-modal__title">{node.name}</h2>
              <CopyButton text={node.name} label="name" />
            </div>
            <div className="node-properties-modal__subtitle-row">
              <span className="node-properties-modal__subtitle">{node.id}</span>
              <CopyButton text={node.id} label="ID" />
            </div>
          </div>
          <button className="node-properties-modal__close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="node-properties-modal__content">
          {node.properties ? (
            <pre className="node-properties-modal__json">
              <code>{JSON.stringify(node.properties, null, 2)}</code>
            </pre>
          ) : (
            <p className="node-properties-modal__empty">No properties available</p>
          )}
        </div>
      </div>
    </div>
  );
}
