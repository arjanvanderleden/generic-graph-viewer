import { useEffect, useRef, useState, useReducer } from 'react';
import * as d3 from 'd3';
import { FORCE_DEFAULTS, FORCE_RADIAL, SIMULATION_REHEAT_ALPHA } from '../../config/constants';
import type { GraphData, D3Node, D3Link } from '../../types/graph';

interface ForceGraphResult {
  nodes: D3Node[];
  links: D3Link[];
  isStable: boolean;
}

interface ForceParams {
  linkDistance: number;
  chargeStrength: number;
  collisionRadius: number;
}

interface UseForceGraphOptions {
  width: number;
  height: number;
  radialLayout?: boolean;
  forceParams?: ForceParams;
  onStabilized?: () => void;
}

/**
 * Simple hash function for strings (djb2)
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

/**
 * Seeded random number generator (mulberry32)
 * Returns a function that generates numbers between 0 and 1
 */
function seededRandom(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Custom hook for D3 force simulation
 * Optimized to avoid unnecessary re-renders during simulation
 */
const defaultForceParams: ForceParams = {
  linkDistance: FORCE_DEFAULTS.linkDistance,
  chargeStrength: FORCE_DEFAULTS.chargeStrength,
  collisionRadius: FORCE_DEFAULTS.collisionRadius
};

export function useForceGraph(
  graphData: GraphData | null,
  options: UseForceGraphOptions
): ForceGraphResult {
  const { width, height, radialLayout = false, forceParams = defaultForceParams, onStabilized } = options;

  // Refs to store mutable data without triggering re-renders
  const simulationRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null);
  const nodesRef = useRef<D3Node[]>([]);
  const linksRef = useRef<D3Link[]>([]);
  const rafIdRef = useRef<number>(0);
  const onStabilizedRef = useRef(onStabilized);
  const isRadialRef = useRef(radialLayout);

  // State for triggering re-renders
  const [isStable, setIsStable] = useState(false);
  const [, forceRender] = useReducer((x) => x + 1, 0);

  // Keep callback ref updated
  useEffect(() => {
    onStabilizedRef.current = onStabilized;
  }, [onStabilized]);

  // Track radial layout changes
  useEffect(() => {
    isRadialRef.current = radialLayout;
  }, [radialLayout]);

  // Effect 1: Initialize simulation when graph data or layout mode changes
  useEffect(() => {
    // Cancel any pending animation frame
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }

    // Stop existing simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
      simulationRef.current = null;
    }

    if (!graphData || graphData.nodes.length === 0) {
      nodesRef.current = [];
      linksRef.current = [];
      setIsStable(true);
      forceRender();
      return;
    }

    setIsStable(false);

    // Create D3 nodes with deterministic initial positions based on node ID
    const d3Nodes: D3Node[] = graphData.nodes.map((node) => {
      const rng = seededRandom(hashString(node.id));
      return {
        ...node,
        x: width / 2 + (rng() - 0.5) * 100,
        y: height / 2 + (rng() - 0.5) * 100
      };
    });

    // Build set of valid node IDs for filtering edges
    const nodeIds = new Set(graphData.nodes.map((n) => n.id));

    // Create D3 links, filtering out edges with missing nodes
    const d3Links: D3Link[] = graphData.edges
      .filter((edge) => nodeIds.has(edge.sourceId) && nodeIds.has(edge.targetId))
      .map((edge) => ({
        source: edge.sourceId,
        target: edge.targetId
      }));

    // Store in refs
    nodesRef.current = d3Nodes;
    linksRef.current = d3Links;

    // Calculate max level for radial layout (if enabled)
    let maxLevel = 0;
    if (radialLayout) {
      for (const node of graphData.nodes) {
        if (node.level !== undefined && node.level > maxLevel) {
          maxLevel = node.level;
        }
      }
      // Nodes without level get placed one ring beyond max
      maxLevel += 1;
    }

    // Calculate radius per level (use smaller dimension to fit)
    const maxRadius = Math.min(width, height) / 2 - 80;
    const radiusPerLevel = radialLayout && maxLevel > 0 ? maxRadius / maxLevel : 0;

    // Create simulation with configurable parameters
    const linkDist = radialLayout ? FORCE_RADIAL.linkDistance : forceParams.linkDistance;
    const charge = radialLayout ? FORCE_RADIAL.chargeStrength : forceParams.chargeStrength;
    const collision = radialLayout ? FORCE_RADIAL.collisionRadius : forceParams.collisionRadius;

    const simulation = d3
      .forceSimulation<D3Node>(d3Nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(d3Links)
          .id((d) => d.id)
          .distance(linkDist)
      )
      .force('charge', d3.forceManyBody().strength(charge))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(collision));

    // Add radial force if enabled
    if (radialLayout) {
      simulation.force(
        'radial',
        d3.forceRadial<D3Node>(
          (d) => {
            const level = d.level !== undefined ? d.level : maxLevel;
            return level * radiusPerLevel;
          },
          width / 2,
          height / 2
        ).strength(FORCE_RADIAL.radialStrength)
      );
    }

    // Use requestAnimationFrame to batch updates (max 60fps)
    simulation.on('tick', () => {
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = 0;
          forceRender();
        });
      }
    });

    // Handle simulation end
    simulation.on('end', () => {
      setIsStable(true);
      forceRender();
      onStabilizedRef.current?.();
    });

    simulationRef.current = simulation;

    // Initial render
    forceRender();

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = 0;
      }
      simulation.stop();
    };
  }, [graphData, width, height, radialLayout]); // Note: forceParams NOT included

  // Effect 2: Update force parameters WITHOUT restarting simulation
  useEffect(() => {
    const simulation = simulationRef.current;
    if (!simulation || isRadialRef.current) return; // Skip if radial (uses fixed params)

    // Update existing forces
    const linkForce = simulation.force('link') as d3.ForceLink<D3Node, D3Link> | undefined;
    const chargeForce = simulation.force('charge') as d3.ForceManyBody<D3Node> | undefined;
    const collisionForce = simulation.force('collision') as d3.ForceCollide<D3Node> | undefined;

    if (linkForce) {
      linkForce.distance(forceParams.linkDistance);
    }
    if (chargeForce) {
      chargeForce.strength(forceParams.chargeStrength);
    }
    if (collisionForce) {
      collisionForce.radius(forceParams.collisionRadius);
    }

    // Gently reheat simulation to apply changes (preserves positions)
    simulation.alpha(SIMULATION_REHEAT_ALPHA).restart();
    setIsStable(false);
  }, [forceParams]);

  return {
    nodes: nodesRef.current,
    links: linksRef.current,
    isStable
  };
}
