import { useEffect, useCallback } from 'react';
import { useGraph, graphActions } from '../../context/GraphContext';
import './LayoutSettingsModal.css';

interface LayoutSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LayoutSettingsModal({ isOpen, onClose }: LayoutSettingsModalProps) {
  const { state, dispatch } = useGraph();
  const { forceParams } = state;

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

  const handleLinkDistanceChange = (value: number) => {
    dispatch(graphActions.setForceParams({ linkDistance: value }));
  };

  const handleChargeChange = (value: number) => {
    dispatch(graphActions.setForceParams({ chargeStrength: value }));
  };

  const handleCollisionChange = (value: number) => {
    dispatch(graphActions.setForceParams({ collisionRadius: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="layout-modal__backdrop" onClick={handleBackdropClick}>
      <div className="layout-modal">
        <div className="layout-modal__header">
          <h2 className="layout-modal__title">Layout Settings</h2>
          <button className="layout-modal__close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>

        <div className="layout-modal__content">
          <div className="layout-modal__row">
            <label className="layout-modal__label">
              Link Distance
              <span className="layout-modal__value">{forceParams.linkDistance}</span>
            </label>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={forceParams.linkDistance}
              onChange={(e) => handleLinkDistanceChange(Number(e.target.value))}
              className="layout-modal__slider"
            />
          </div>

          <div className="layout-modal__row">
            <label className="layout-modal__label">
              Repulsion
              <span className="layout-modal__value">{Math.abs(forceParams.chargeStrength)}</span>
            </label>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={Math.abs(forceParams.chargeStrength)}
              onChange={(e) => handleChargeChange(-Number(e.target.value))}
              className="layout-modal__slider"
            />
          </div>

          <div className="layout-modal__row">
            <label className="layout-modal__label">
              Node Size
              <span className="layout-modal__value">{forceParams.collisionRadius}</span>
            </label>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={forceParams.collisionRadius}
              onChange={(e) => handleCollisionChange(Number(e.target.value))}
              className="layout-modal__slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
