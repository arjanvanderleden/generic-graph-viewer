// Graph rendering constants
export const NODE_RADIUS = 35;
export const NODE_LABEL_MAX_LENGTH = 15;

// Search debounce
export const SEARCH_DEBOUNCE_MS = 150;

// Force simulation
export const FORCE_DEFAULTS = {
  linkDistance: 150,
  chargeStrength: -400,
  collisionRadius: 45
} as const;

export const FORCE_RADIAL = {
  linkDistance: 400,
  chargeStrength: -1000,
  collisionRadius: 80,
  radialStrength: 0.8
} as const;

export const SIMULATION_REHEAT_ALPHA = 0.3;

// Zoom behavior
export const ZOOM_SCALE_EXTENT: [number, number] = [0.1, 10];
export const ZOOM_PADDING = 80;
export const ZOOM_MAX_SCALE = 2;
export const ZOOM_ANIMATION_DURATION = 500;

// Colors (fallbacks when CSS variables unavailable)
export const DEFAULT_NODE_COLOR = '#4A90D9';
