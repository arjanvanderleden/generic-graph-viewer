import { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useGraph } from '../../context/GraphContext';
import { useSelection, selectionActions, getEdgeId } from '../../context/SelectionContext';
import { useForceGraph } from './useForceGraph';
import { extractCategories, createCategoryColorMap, getNodeColor, isNodeHidden } from '../../utils/categoryColors';
import {
  NODE_RADIUS,
  NODE_LABEL_MAX_LENGTH,
  ZOOM_SCALE_EXTENT,
  ZOOM_PADDING,
  ZOOM_MAX_SCALE,
  ZOOM_ANIMATION_DURATION
} from '../../config/constants';
import type { D3Node, D3Link, CategoryColorMap } from '../../types/graph';
import './GraphCanvas.css';

// Helper to escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GraphCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const { state: graphState } = useGraph();
  const { selection, dispatch: selectionDispatch } = useSelection();

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Compute category color map from graph data
  const categoryColorMap: CategoryColorMap = useMemo(() => {
    if (!graphState.graphData) return new Map();
    const categories = extractCategories(graphState.graphData.nodes);
    return createCategoryColorMap(categories);
  }, [graphState.graphData]);

  // Update dimensions on resize
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateDimensions = () => {
      setDimensions({
        width: container.clientWidth,
        height: container.clientHeight
      });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, []);

  // Force simulation
  const { nodes, links, isStable } = useForceGraph(graphState.graphData, {
    width: dimensions.width,
    height: dimensions.height,
    radialLayout: graphState.radialLayout,
    forceParams: graphState.forceParams
  });

  // Initialize D3 zoom behavior
  useEffect(() => {
    const svg = svgRef.current;
    const g = gRef.current;
    if (!svg || !g) return;

    const svgSelection = d3.select(svg);
    const gSelection = d3.select(g);

    // Create zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent(ZOOM_SCALE_EXTENT)
      .on('zoom', (event) => {
        gSelection.attr('transform', event.transform.toString());
      });

    // Apply zoom to SVG
    svgSelection.call(zoom);

    // Disable double-click zoom
    svgSelection.on('dblclick.zoom', null);

    zoomBehaviorRef.current = zoom;

    return () => {
      svgSelection.on('.zoom', null);
    };
  }, [graphState.graphData]);

  // Helper function to zoom to a set of nodes
  const zoomToNodes = useCallback((targetNodes: D3Node[], animated = true) => {
    const svg = svgRef.current;
    const zoom = zoomBehaviorRef.current;
    if (!svg || !zoom || targetNodes.length === 0) return;

    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const padding = ZOOM_PADDING;

    const xExtent = d3.extent(targetNodes, (d) => d.x) as [number, number];
    const yExtent = d3.extent(targetNodes, (d) => d.y) as [number, number];

    if (xExtent[0] == null || yExtent[0] == null) return;

    const boundsWidth = Math.max(xExtent[1] - xExtent[0], 1);
    const boundsHeight = Math.max(yExtent[1] - yExtent[0], 1);

    const scale = Math.min(
      (width - padding * 2) / boundsWidth,
      (height - padding * 2) / boundsHeight,
      ZOOM_MAX_SCALE
    );

    const centerX = (xExtent[0] + xExtent[1]) / 2;
    const centerY = (yExtent[0] + yExtent[1]) / 2;

    const transform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(scale)
      .translate(-centerX, -centerY);

    if (animated) {
      d3.select(svg)
        .transition()
        .duration(ZOOM_ANIMATION_DURATION)
        .call(zoom.transform, transform);
    } else {
      d3.select(svg).call(zoom.transform, transform);
    }
  }, []);

  // Zoom to fit when simulation stabilizes
  useEffect(() => {
    if (!isStable || nodes.length === 0) return;
    zoomToNodes(nodes, true);
  }, [isStable, nodes, zoomToNodes]);

  // Listen for zoom to fit command
  useEffect(() => {
    const cleanup = window.electronAPI.onZoomToFit(() => {
      zoomToNodes(nodes, true);
    });
    return cleanup;
  }, [nodes, zoomToNodes]);

  // Listen for zoom to selection command
  useEffect(() => {
    const cleanup = window.electronAPI.onZoomToSelection(() => {
      if (selection.type !== 'node' || selection.ids.length === 0) return;
      const selectedNodes = nodes.filter((n) => selection.ids.includes(n.id));
      if (selectedNodes.length > 0) {
        zoomToNodes(selectedNodes, true);
      }
    });
    return cleanup;
  }, [nodes, selection, zoomToNodes]);

  // Export as PNG - captures current view exactly as shown
  const exportAsPng = useCallback(async () => {
    const svg = svgRef.current;
    if (!svg) return;

    const width = dimensions.width;
    const height = dimensions.height;

    // Clone SVG and inline styles
    const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
    clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    // Get computed styles and inline them
    const computedStyle = getComputedStyle(document.documentElement);
    const bgColor = computedStyle.getPropertyValue('--background').trim() || '#ffffff';
    const edgeColor = computedStyle.getPropertyValue('--edge-color').trim() || '#999999';
    const edgeSelected = computedStyle.getPropertyValue('--edge-selected').trim() || '#000000';
    const nodeSelected = computedStyle.getPropertyValue('--node-selected').trim() || '#ffff00';
    const nodeLabelBg = computedStyle.getPropertyValue('--node-label-bg').trim() || '#ffffff';
    const nodeLabelBorder = computedStyle.getPropertyValue('--node-label-border').trim() || '#cccccc';
    const nodeLabelText = computedStyle.getPropertyValue('--node-label-text').trim() || '#000000';

    // Add background
    const bgRect = clonedSvg.querySelector('rect');
    if (bgRect) {
      bgRect.setAttribute('fill', bgColor);
    }

    // Inline styles for edges
    clonedSvg.querySelectorAll('.graph-canvas__edge').forEach((edge) => {
      const el = edge as SVGLineElement;
      const isSelected = el.classList.contains('graph-canvas__edge--selected');
      const isConnected = el.classList.contains('graph-canvas__edge--connected');
      el.setAttribute('stroke', isSelected || isConnected ? edgeSelected : edgeColor);
      el.setAttribute('stroke-width', isSelected || isConnected ? '6' : '2');
    });

    // Inline styles for nodes
    clonedSvg.querySelectorAll('.graph-canvas__node').forEach((node) => {
      const el = node as SVGGElement;
      const isSelected = el.classList.contains('graph-canvas__node--selected');
      const circle = el.querySelector('circle');
      const labelBg = el.querySelector('.graph-canvas__node-label-bg');
      const text = el.querySelector('text');

      if (circle) {
        circle.setAttribute('stroke', isSelected ? nodeSelected : 'transparent');
        circle.setAttribute('stroke-width', isSelected ? '6' : '4');
      }
      if (labelBg) {
        labelBg.setAttribute('fill', nodeLabelBg);
        labelBg.setAttribute('stroke', nodeLabelBorder);
        labelBg.setAttribute('stroke-width', '1');
      }
      if (text) {
        text.setAttribute('fill', nodeLabelText);
        text.setAttribute('font-size', '11px');
        text.setAttribute('font-weight', '500');
        text.setAttribute('font-family', 'system-ui, -apple-system, sans-serif');
      }
    });

    // Serialize SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create canvas and draw
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(svgUrl);

      const dataUrl = canvas.toDataURL('image/png');
      const fileName = graphState.filePath
        ? graphState.filePath.split('/').pop()?.replace(/\.[^.]+$/, '') + '.png'
        : 'graph.png';

      await window.electronAPI.savePng(dataUrl, fileName);
    };
    img.src = svgUrl;
  }, [dimensions, graphState.filePath]);

  // Export as SVG - clean export with all nodes visible, no selection
  const exportAsSvg = useCallback(async () => {
    if (nodes.length === 0) return;

    // Calculate bounds of all nodes (including node radius)
    const xExtent = d3.extent(nodes, (d) => d.x) as [number, number];
    const yExtent = d3.extent(nodes, (d) => d.y) as [number, number];

    if (xExtent[0] == null || yExtent[0] == null) return;

    // Content bounds with node radius
    const minX = xExtent[0] - NODE_RADIUS;
    const maxX = xExtent[1] + NODE_RADIUS;
    const minY = yExtent[0] - NODE_RADIUS;
    const maxY = yExtent[1] + NODE_RADIUS;

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;

    // Add 5% margin
    const margin = 0.05;
    const marginX = contentWidth * margin;
    const marginY = contentHeight * margin;

    // ViewBox includes the margin
    const viewBoxX = minX - marginX;
    const viewBoxY = minY - marginY;
    const viewBoxWidth = contentWidth + marginX * 2;
    const viewBoxHeight = contentHeight + marginY * 2;

    // Scale to reasonable screen dimensions (max 1920x1080, maintain aspect ratio)
    const maxWidth = 1920;
    const maxHeight = 1080;
    const aspectRatio = viewBoxWidth / viewBoxHeight;

    let svgWidth: number;
    let svgHeight: number;

    if (aspectRatio > maxWidth / maxHeight) {
      // Width-constrained
      svgWidth = Math.min(viewBoxWidth, maxWidth);
      svgHeight = svgWidth / aspectRatio;
    } else {
      // Height-constrained
      svgHeight = Math.min(viewBoxHeight, maxHeight);
      svgWidth = svgHeight * aspectRatio;
    }

    // Get computed styles
    const computedStyle = getComputedStyle(document.documentElement);
    const edgeColor = computedStyle.getPropertyValue('--edge-color').trim() || '#999999';
    const nodeLabelBg = computedStyle.getPropertyValue('--node-label-bg').trim() || '#ffffff';
    const nodeLabelBorder = computedStyle.getPropertyValue('--node-label-border').trim() || '#cccccc';
    const nodeLabelText = computedStyle.getPropertyValue('--node-label-text').trim() || '#000000';

    // Build SVG string (no background)
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(svgWidth)}" height="${Math.round(svgHeight)}" viewBox="${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}">
  <g class="edges">
`;

    // Add edges
    for (const link of links) {
      const coords = getLinkCoords(link);
      if (!coords) continue;
      svgContent += `    <line x1="${coords.x1}" y1="${coords.y1}" x2="${coords.x2}" y2="${coords.y2}" stroke="${edgeColor}" stroke-width="2"/>\n`;
    }

    svgContent += `  </g>
  <g class="nodes">
`;

    // Add nodes
    for (const node of nodes) {
      const x = node.x ?? 0;
      const y = node.y ?? 0;
      const fillColor = getNodeColor(node, categoryColorMap);
      const displayName = node.name.length > NODE_LABEL_MAX_LENGTH
        ? node.name.slice(0, NODE_LABEL_MAX_LENGTH) + '...'
        : node.name;
      const textWidth = displayName.length * 6.5 + 8;
      const textHeight = 16;

      svgContent += `    <g transform="translate(${x}, ${y})">
      <circle r="${NODE_RADIUS}" fill="${fillColor}" stroke="transparent" stroke-width="4"/>
      <rect x="${-textWidth / 2}" y="${-textHeight / 2}" width="${textWidth}" height="${textHeight}" fill="${nodeLabelBg}" stroke="${nodeLabelBorder}" stroke-width="1" rx="3" ry="3"/>
      <text dy="0.35em" text-anchor="middle" fill="${nodeLabelText}" font-size="11px" font-weight="500" font-family="system-ui, -apple-system, sans-serif">${escapeXml(displayName)}</text>
    </g>
`;
    }

    svgContent += `  </g>
</svg>`;

    const fileName = graphState.filePath
      ? graphState.filePath.split('/').pop()?.replace(/\.[^.]+$/, '') + '.svg'
      : 'graph.svg';

    await window.electronAPI.saveSvg(svgContent, fileName);
  }, [nodes, links, categoryColorMap, graphState.filePath]);

  // Listen for export commands
  useEffect(() => {
    const cleanupPng = window.electronAPI.onExportPng(() => {
      exportAsPng();
    });
    const cleanupSvg = window.electronAPI.onExportSvg(() => {
      exportAsSvg();
    });
    return () => {
      cleanupPng();
      cleanupSvg();
    };
  }, [exportAsPng, exportAsSvg]);

  // Handle node click with Cmd/Ctrl for multi-select
  const handleNodeClick = useCallback(
    (e: React.MouseEvent, node: D3Node) => {
      e.stopPropagation();

      if (e.metaKey || e.ctrlKey) {
        // Toggle node in selection
        selectionDispatch(selectionActions.toggleNode(node.id));
      } else {
        // Replace selection with single node
        selectionDispatch(selectionActions.selectNode(node.id));
      }
    },
    [selectionDispatch]
  );

  // Handle edge click
  const handleEdgeClick = useCallback(
    (e: React.MouseEvent, link: D3Link) => {
      e.stopPropagation();
      const sourceId =
        typeof link.source === 'string' ? link.source : link.source.id;
      const targetId =
        typeof link.target === 'string' ? link.target : link.target.id;
      const edgeId = getEdgeId(sourceId, targetId);
      selectionDispatch(selectionActions.selectEdge(edgeId));
    },
    [selectionDispatch]
  );

  // Handle background click (clear selection)
  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget || (e.target as Element).tagName === 'rect') {
        selectionDispatch(selectionActions.clearSelection());
      }
    },
    [selectionDispatch]
  );

  // Check if node is selected (multi-select aware)
  const isNodeSelected = (nodeId: string) =>
    selection.type === 'node' && selection.ids.includes(nodeId);

  // Check if edge is selected
  const isEdgeSelected = (link: D3Link) => {
    if (selection.type !== 'edge') return false;
    const sourceId =
      typeof link.source === 'string' ? link.source : link.source.id;
    const targetId =
      typeof link.target === 'string' ? link.target : link.target.id;
    return selection.ids.includes(getEdgeId(sourceId, targetId));
  };

  // Check if edge is connected to a selected node
  const isEdgeConnectedToSelection = (link: D3Link) => {
    if (selection.type !== 'node' || selection.ids.length === 0) return false;
    const sourceId =
      typeof link.source === 'string' ? link.source : link.source.id;
    const targetId =
      typeof link.target === 'string' ? link.target : link.target.id;
    return selection.ids.includes(sourceId) || selection.ids.includes(targetId);
  };

  // Check if edge should be hidden (either endpoint is hidden)
  const isEdgeHidden = (link: D3Link) => {
    if (graphState.hiddenCategories.size === 0) return false;
    const sourceNode = typeof link.source === 'string' ? null : link.source;
    const targetNode = typeof link.target === 'string' ? null : link.target;
    if (!sourceNode || !targetNode) return false;
    return isNodeHidden(sourceNode, graphState.hiddenCategories) ||
           isNodeHidden(targetNode, graphState.hiddenCategories);
  };

  // Get link coordinates
  const getLinkCoords = (link: D3Link) => {
    const source = typeof link.source === 'string' ? null : link.source;
    const target = typeof link.target === 'string' ? null : link.target;

    if (!source || !target) return null;

    return {
      x1: source.x ?? 0,
      y1: source.y ?? 0,
      x2: target.x ?? 0,
      y2: target.y ?? 0
    };
  };

  // Show empty state when no graph loaded
  if (!graphState.graphData) {
    return (
      <div className="graph-canvas" ref={containerRef}>
        <div className="graph-canvas__empty">
          <p>No graph loaded</p>
          <p className="graph-canvas__hint">
            Use File &gt; Open or Cmd+O to load a graph
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="graph-canvas" ref={containerRef}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        onClick={handleBackgroundClick}
      >
        {/* Background rect - needed for pan/zoom on empty areas */}
        <rect
          width={dimensions.width}
          height={dimensions.height}
          fill="transparent"
          style={{ cursor: 'grab' }}
        />
        <g ref={gRef}>
          {/* Edges */}
          <g className="graph-canvas__edges">
            {links.map((link) => {
              const sourceId = typeof link.source === 'string' ? link.source : link.source.id;
              const targetId = typeof link.target === 'string' ? link.target : link.target.id;
              const linkKey = `${sourceId}->${targetId}`;

              const coords = getLinkCoords(link);
              if (!coords) return null;

              const selected = isEdgeSelected(link);
              const connected = isEdgeConnectedToSelection(link);
              const hidden = isEdgeHidden(link);

              return (
                <line
                  key={linkKey}
                  x1={coords.x1}
                  y1={coords.y1}
                  x2={coords.x2}
                  y2={coords.y2}
                  className={`graph-canvas__edge ${selected ? 'graph-canvas__edge--selected' : ''} ${connected ? 'graph-canvas__edge--connected' : ''}`}
                  style={{ opacity: hidden ? 0 : undefined }}
                  onClick={(e) => handleEdgeClick(e, link)}
                />
              );
            })}
          </g>

          {/* Nodes */}
          <g className="graph-canvas__nodes">
            {nodes.map((node) => {
              const selected = isNodeSelected(node.id);
              const fillColor = getNodeColor(node, categoryColorMap);
              const hidden = isNodeHidden(node, graphState.hiddenCategories);

              const displayName = node.name.length > NODE_LABEL_MAX_LENGTH
                ? node.name.slice(0, NODE_LABEL_MAX_LENGTH) + '...'
                : node.name;
              const textWidth = displayName.length * 6.5 + 8; // Approximate width
              const textHeight = 16;

              return (
                <g
                  key={node.id}
                  className={`graph-canvas__node ${selected ? 'graph-canvas__node--selected' : ''}`}
                  transform={`translate(${node.x ?? 0}, ${node.y ?? 0})`}
                  style={{ opacity: hidden ? 0 : undefined }}
                  onClick={(e) => handleNodeClick(e, node)}
                >
                  <circle r={NODE_RADIUS} style={{ fill: fillColor }} />
                  <rect
                    className="graph-canvas__node-label-bg"
                    x={-textWidth / 2}
                    y={-textHeight / 2}
                    width={textWidth}
                    height={textHeight}
                  />
                  <text dy="0.35em" textAnchor="middle">
                    {displayName}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Loading indicator */}
      {graphState.isLoading && (
        <div className="graph-canvas__loading">
          <div className="graph-canvas__loading-spinner" />
          <span>Loading graph...</span>
        </div>
      )}
    </div>
  );
}
