import { schemeSet3 } from 'd3-scale-chromatic';
import { DEFAULT_NODE_COLOR } from '../config/constants';
import type { Node, CategoryColorMap } from '../types/graph';

// ColorBrewer Set3 palette - 12 distinct colors for categories
const PALETTE = schemeSet3;

// Regex patterns for valid color formats
const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
const RGBA_COLOR_REGEX = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/;

/**
 * Validates if a string is a valid CSS color (hex or rgba)
 */
export function isValidColor(color: string): boolean {
  return HEX_COLOR_REGEX.test(color) || RGBA_COLOR_REGEX.test(color);
}

/**
 * Extracts unique categories from nodes (supports categories array)
 */
export function extractCategories(nodes: Node[]): string[] {
  const categories = new Set<string>();

  for (const node of nodes) {
    if (node.categories && Array.isArray(node.categories)) {
      for (const category of node.categories) {
        if (category) {
          categories.add(category);
        }
      }
    }
  }

  return Array.from(categories).sort();
}

/**
 * Creates a mapping from category to color using ColorBrewer Set3
 */
export function createCategoryColorMap(categories: string[]): CategoryColorMap {
  const colorMap = new Map<string, string>();

  categories.forEach((category, index) => {
    colorMap.set(category, PALETTE[index % PALETTE.length]);
  });

  return colorMap;
}

/**
 * Gets the color for a node based on its color property or first category
 */
export function getNodeColor(
  node: Node,
  categoryColorMap: CategoryColorMap
): string {
  // First priority: explicit color property if valid
  if (node.color && isValidColor(node.color)) {
    return node.color;
  }

  // Second priority: first category's color
  if (node.categories && node.categories.length > 0) {
    const firstCategory = node.categories[0];
    return categoryColorMap.get(firstCategory) ?? DEFAULT_NODE_COLOR;
  }

  return DEFAULT_NODE_COLOR;
}

/**
 * Counts nodes per category (a node with multiple categories counts for each)
 */
export function getCategoryCounts(nodes: Node[]): Map<string, number> {
  const counts = new Map<string, number>();
  let uncategorizedCount = 0;

  for (const node of nodes) {
    if (node.categories && node.categories.length > 0) {
      for (const category of node.categories) {
        counts.set(category, (counts.get(category) ?? 0) + 1);
      }
    } else {
      uncategorizedCount++;
    }
  }

  if (uncategorizedCount > 0) {
    counts.set('(uncategorized)', uncategorizedCount);
  }

  return counts;
}

/**
 * Checks if a node has any of the specified categories
 */
export function nodeHasCategory(node: Node, category: string): boolean {
  if (!node.categories || node.categories.length === 0) {
    return category === '(uncategorized)';
  }
  return node.categories.includes(category);
}

/**
 * Checks if a node should be hidden based on hidden categories
 */
export function isNodeHidden(node: Node, hiddenCategories: Set<string>): boolean {
  if (hiddenCategories.size === 0) return false;

  // Uncategorized nodes
  if (!node.categories || node.categories.length === 0) {
    return hiddenCategories.has('(uncategorized)');
  }

  // Node is hidden if ANY of its categories is hidden
  return node.categories.some((cat) => hiddenCategories.has(cat));
}
