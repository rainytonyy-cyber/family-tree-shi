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
  const padding = 120;
  void bounds;

  useEffect(() => {
    setViewState(prev => ({ ...prev, direction }));
  }, [direction]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    setViewState(prev => ({
      ...prev,
      zoom: Math.max(0.3, Math.min(2.5, prev.zoom * delta))
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

    const visit = (node: TreeNode, depth: number = 0) => {
      node.children.forEach((child) => {
        const startX = node.x + NODE_WIDTH / 2;
        const startY = node.y + NODE_HEIGHT;
        const endX = child.x + NODE_WIDTH / 2;
        const endY = child.y;

        // 水墨渐变色 - 随深度变化
        const opacity = Math.max(0.3, 1 - depth * 0.15);
        const strokeWidth = Math.max(1.5, 2.5 - depth * 0.3);

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
              stroke={`rgba(26, 26, 46, ${opacity})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-opacity duration-300"
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
              stroke={`rgba(26, 26, 46, ${opacity})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-opacity duration-300"
            />
          );
        }

        visit(child, depth + 1);
      });
    };

    laidOutRoots.forEach(visit);
    return connections;
  };

  const renderNodes = () => {
    const nodes: React.ReactNode[] = [];

    const visit = (node: TreeNode, depth: number = 0) => {
      const isSelected = node.person.id === selectedId;
      const isHighlighted = highlightedIds.includes(node.person.id);
      const isMale = node.person.gender === 'male';

      // 根据性别和状态选择颜色
      let fillColor = '#ffffff';
      let strokeColor = '#d5d5e5';
      let textColor = '#2d2d44';
      let subtextColor = '#6b6b8a';

      if (isSelected) {
        fillColor = isMale ? '#1a1a2e' : '#2d8a6e';
        strokeColor = isMale ? '#404060' : '#3a9d80';
        textColor = '#faf8f5';
        subtextColor = '#d5d5e5';
      } else if (isHighlighted) {
        fillColor = '#fffbeb';
        strokeColor = '#c9a84c';
        textColor = '#1a1a2e';
        subtextColor = '#6b6b8a';
      } else {
        fillColor = '#ffffff';
        strokeColor = isMale ? '#b0b0c8' : '#b5e5d5';
        textColor = '#2d2d44';
        subtextColor = '#6b6b8a';
      }

      // 节点阴影
      const shadowFilter = isSelected 
        ? 'drop-shadow(0 4px 12px rgba(26, 26, 46, 0.15))' 
        : 'drop-shadow(0 2px 4px rgba(26, 26, 46, 0.05))';

      nodes.push(
        <g
          key={node.person.id}
          transform={`translate(${node.x}, ${node.y})`}
          onClick={() => onSelectPerson(node.person.id)}
          className="node-hover"
          style={{ cursor: 'pointer', filter: shadowFilter }}
        >
          {/* 节点背景 */}
          <rect
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            rx="12"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={isSelected ? 2.5 : 1.5}
            className="transition-all duration-200"
          />
          
          {/* 性别指示条 */}
          <rect
            x="0"
            y="12"
            width="3"
            height={NODE_HEIGHT - 24}
            rx="1.5"
            fill={isMale ? '#4a90d9' : '#e8689a'}
            opacity={isSelected ? 0.9 : 0.6}
          />

          {/* 姓名 */}
          <text
            x={NODE_WIDTH / 2}
            y={32}
            textAnchor="middle"
            fill={textColor}
            fontSize="15"
            fontWeight="600"
            style={{ fontFamily: "'Noto Serif SC', serif" }}
          >
            {node.person.name}
          </text>
          
          {/* 信息行 */}
          <text
            x={NODE_WIDTH / 2}
            y={52}
            textAnchor="middle"
            fill={subtextColor}
            fontSize="11"
            style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
          >
            {node.person.gender === 'male' ? '♂' : node.person.gender === 'female' ? '♀' : '⚪'}
            {node.person.birthDate ? `  ${node.person.birthDate}` : ''}
          </text>

          {/* 职业标签 */}
          {node.person.occupation && (
            <g transform={`translate(${NODE_WIDTH / 2 - 20}, 58)`}>
              <rect
                width="40"
                height="14"
                rx="7"
                fill={isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(26, 26, 46, 0.05)'}
              />
              <text
                x="20"
                y="10"
                textAnchor="middle"
                fill={isSelected ? subtextColor : '#8b8ba8'}
                fontSize="9"
              >
                {node.person.occupation}
              </text>
            </g>
          )}

          {/* 选中指示器 */}
          {isSelected && (
            <circle
              cx={NODE_WIDTH - 8}
              cy="8"
              r="4"
              fill="#c9a84c"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          )}
        </g>
      );

      node.children.forEach(child => visit(child, depth + 1));
    };

    laidOutRoots.forEach(visit);
    return nodes;
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-hidden relative ink-wash-bg"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* 控制按钮 */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setViewState(prev => ({ ...prev, zoom: Math.min(2.5, prev.zoom * 1.15) }))}
          className="
            w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg shadow-ink-900/10
            border border-ink-200 text-ink-600 text-lg font-medium
            hover:bg-white hover:border-jade-400 hover:text-jade-600
            transition-all duration-200
            flex items-center justify-center
          "
        >
          +
        </button>
        <button
          onClick={() => setViewState(prev => ({ ...prev, zoom: Math.max(0.3, prev.zoom / 1.15) }))}
          className="
            w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg shadow-ink-900/10
            border border-ink-200 text-ink-600 text-lg font-medium
            hover:bg-white hover:border-jade-400 hover:text-jade-600
            transition-all duration-200
            flex items-center justify-center
          "
        >
          −
        </button>
        <button
          onClick={() => setViewState({ zoom: 1, panX: 0, panY: 0, direction })}
          className="
            w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg shadow-ink-900/10
            border border-ink-200 text-ink-500 text-xs
            hover:bg-white hover:border-jade-400 hover:text-jade-600
            transition-all duration-200
            flex items-center justify-center
          "
        >
          ↺
        </button>
      </div>

      {/* 缩放指示器 */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="
          px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg
          border border-ink-200 text-xs text-ink-500
          shadow-sm
        ">
          {Math.round(viewState.zoom * 100)}%
        </div>
      </div>

      {/* SVG 树状图 */}
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
        {/* 背景网格 */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(26, 26, 46, 0.03)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        <g
          transform={`translate(${viewState.panX + padding}, ${viewState.panY + padding}) scale(${viewState.zoom})`}
          className="transition-transform duration-100"
        >
          {renderConnections()}
          {renderNodes()}
        </g>
      </svg>
    </div>
  );
}
