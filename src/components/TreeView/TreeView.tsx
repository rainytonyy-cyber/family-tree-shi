import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { TreeNode, TreeDirection, ViewState } from '../../types';
import { NODE_WIDTH, NODE_HEIGHT, layoutTree, getTreeBounds } from '../../utils/treeLayout';

interface TreeViewProps {
  roots: TreeNode[];
  direction: TreeDirection;
  selectedId?: string;
  highlightedIds: string[];
  onSelectPerson: (id: string) => void;
}

export function TreeView({ roots, direction, selectedId, highlightedIds, onSelectPerson }: TreeViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewState, setViewState] = useState<ViewState>({
    zoom: 1,
    panX: 0,
    panY: 0,
    direction
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const laidOutRoots = layoutTree([...roots], direction);
  const bounds = getTreeBounds(laidOutRoots);
  const padding = 100;
  void bounds;

  useEffect(() => {
    setViewState(prev => ({ ...prev, direction }));
  }, [direction]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewState(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(3, prev.zoom * delta))
    }));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - viewState.panX, y: e.clientY - viewState.panY });
    }
  }, [viewState.panX, viewState.panY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setViewState(prev => ({
        ...prev,
        panX: e.clientX - dragStart.x,
        panY: e.clientY - dragStart.y
      }));
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const renderConnections = () => {
    const connections: React.ReactNode[] = [];

    const visit = (node: TreeNode) => {
      node.children.forEach(child => {
        const startX = node.x + NODE_WIDTH / 2;
        const startY = node.y + NODE_HEIGHT;
        const endX = child.x + NODE_WIDTH / 2;
        const endY = child.y;

        if (direction === 'horizontal') {
          const midX = (startX + endX) / 2;
          connections.push(
            <path
              key={`${node.person.id}-${child.person.id}`}
              d={`M ${node.x + NODE_WIDTH} ${node.y + NODE_HEIGHT / 2}
                  C ${midX} ${node.y + NODE_HEIGHT / 2},
                    ${midX} ${child.y + NODE_HEIGHT / 2},
                    ${child.x} ${child.y + NODE_HEIGHT / 2}`}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
            />
          );
        } else {
          const midY = (startY + endY) / 2;
          connections.push(
            <path
              key={`${node.person.id}-${child.person.id}`}
              d={`M ${startX} ${startY}
                  C ${startX} ${midY},
                    ${endX} ${midY},
                    ${endX} ${endY}`}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
            />
          );
        }

        visit(child);
      });
    };

    laidOutRoots.forEach(visit);
    return connections;
  };

  const renderNodes = () => {
    const nodes: React.ReactNode[] = [];

    const visit = (node: TreeNode) => {
      const isSelected = node.person.id === selectedId;
      const isHighlighted = highlightedIds.includes(node.person.id);

      nodes.push(
        <g
          key={node.person.id}
          transform={`translate(${node.x}, ${node.y})`}
          onClick={() => onSelectPerson(node.person.id)}
          style={{ cursor: 'pointer' }}
        >
          <rect
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            rx="8"
            fill={isSelected ? '#3b82f6' : isHighlighted ? '#fbbf24' : '#ffffff'}
            stroke={isSelected ? '#1d4ed8' : isHighlighted ? '#f59e0b' : '#e2e8f0'}
            strokeWidth="2"
          />
          <text
            x={NODE_WIDTH / 2}
            y={30}
            textAnchor="middle"
            fill={isSelected ? '#ffffff' : '#1e293b'}
            fontSize="14"
            fontWeight="600"
          >
            {node.person.name}
          </text>
          <text
            x={NODE_WIDTH / 2}
            y={50}
            textAnchor="middle"
            fill={isSelected ? '#dbeafe' : '#64748b'}
            fontSize="11"
          >
            {node.person.gender === 'male' ? '男' : node.person.gender === 'female' ? '女' : '其他'}
            {node.person.birthDate ? ` · ${node.person.birthDate}` : ''}
          </text>
        </g>
      );

      node.children.forEach(visit);
    };

    laidOutRoots.forEach(visit);
    return nodes;
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden bg-gray-50 relative"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setViewState(prev => ({ ...prev, zoom: Math.min(3, prev.zoom * 1.2) }))}
          className="px-3 py-1 bg-white rounded shadow hover:bg-gray-100"
        >
          +
        </button>
        <button
          onClick={() => setViewState(prev => ({ ...prev, zoom: Math.max(0.1, prev.zoom / 1.2) }))}
          className="px-3 py-1 bg-white rounded shadow hover:bg-gray-100"
        >
          -
        </button>
        <button
          onClick={() => setViewState({ zoom: 1, panX: 0, panY: 0, direction })}
          className="px-3 py-1 bg-white rounded shadow hover:bg-gray-100"
        >
          重置
        </button>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g
          transform={`translate(${viewState.panX + padding}, ${viewState.panY + padding}) scale(${viewState.zoom})`}
        >
          {renderConnections()}
          {renderNodes()}
        </g>
      </svg>
    </div>
  );
}
