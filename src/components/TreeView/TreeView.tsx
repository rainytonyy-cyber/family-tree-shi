import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { TreeNode, TreeDirection, ViewState } from '../../types';
import { NODE_WIDTH, NODE_HEIGHT, SPOUSE_NODE_WIDTH, SPOUSE_NODE_HEIGHT, layoutTree, getTreeBounds } from '../../utils/treeLayout';

interface TreeViewProps {
  roots: TreeNode[];
  direction: TreeDirection;
  selectedId?: string;
  highlightedIds: string[];
  onSelectPerson: (id: string) => void;
  showSpouses: boolean;
  showDaughters: boolean;
  showSonsInLaw: boolean;
  showCousins: boolean;
}

export function TreeView({ roots, direction, selectedId, highlightedIds, onSelectPerson, showSpouses, showDaughters, showSonsInLaw, showCousins }: TreeViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewState, setViewState] = useState<ViewState>({
    zoom: 1,
    panX: 0,
    panY: 0,
    direction,
    showSpouses,
    showDaughters,
    showSonsInLaw,
    showCousins
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const laidOutRoots = layoutTree([...roots], direction);
  const bounds = getTreeBounds(laidOutRoots);
  const padding = 150;
  void bounds;

  useEffect(() => {
    setViewState(prev => ({ ...prev, direction, showSpouses, showDaughters, showSonsInLaw, showCousins }));
  }, [direction, showSpouses, showDaughters, showSonsInLaw, showCousins]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    setViewState(prev => ({
      ...prev,
      zoom: Math.max(0.2, Math.min(2, prev.zoom * delta))
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
      // 绘制到子代的连线
      node.children.forEach((child) => {
        const startX = node.x + NODE_WIDTH / 2;
        const startY = node.y + NODE_HEIGHT;
        const endX = child.x + NODE_WIDTH / 2;
        const endY = child.y;

        // 水墨渐变色 - 随深度变化
        const opacity = Math.max(0.3, 1 - depth * 0.1);
        const strokeWidth = Math.max(1.5, 2.5 - depth * 0.2);

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

      // 绘制到配偶的连线（如果显示配偶）
      if (showSpouses && node.spouses && node.spouses.length > 0) {
        node.spouses.forEach((spouse, index) => {
          const startX = node.x + NODE_WIDTH;
          const startY = node.y + NODE_HEIGHT / 2;
          const endX = node.x + NODE_WIDTH + 20 + index * (SPOUSE_NODE_WIDTH + 20);
          const endY = node.y + NODE_HEIGHT / 2;

          connections.push(
            <path
              key={`${node.person.id}-${spouse.id}-spouse`}
              d={`M ${startX} ${startY} L ${endX} ${endY}`}
              fill="none"
              stroke="rgba(201, 168, 76, 0.6)"
              strokeWidth="2"
              strokeDasharray="4,4"
              strokeLinecap="round"
            />
          );
        });
      }

      // 绘制到女儿的连线（如果显示女儿）
      if (showDaughters && node.daughters && node.daughters.length > 0) {
        node.daughters.forEach((daughter, index) => {
          const startX = node.x + NODE_WIDTH / 2;
          const startY = node.y + NODE_HEIGHT;
          const endX = node.x + index * (SPOUSE_NODE_WIDTH + 15) + SPOUSE_NODE_WIDTH / 2;
          const endY = node.y + NODE_HEIGHT + 15;

          connections.push(
            <path
              key={`${node.person.id}-${daughter.id}-daughter`}
              d={`M ${startX} ${startY} C ${startX} ${startY + 10}, ${endX} ${endY - 10}, ${endX} ${endY}`}
              fill="none"
              stroke="rgba(232, 104, 154, 0.6)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          );
        });
      }

      // 绘制女儿和女婿之间的连线（如果显示女儿和女婿）
      if (showDaughters && showSonsInLaw && node.daughters && node.sonsInLaw) {
        node.daughters.forEach((daughter, daughterIndex) => {
          const daughterX = node.x + daughterIndex * (SPOUSE_NODE_WIDTH + 15);
          const daughterY = node.y + NODE_HEIGHT + 15;
          
          // 找到这个女儿的配偶
          const daughterSpouses = (daughter.spouseIds || [])
            .map(id => node.sonsInLaw?.find(s => s.id === id))
            .filter(Boolean);
          
          daughterSpouses.forEach((spouse) => {
            if (spouse) {
              const spouseX = daughterX + SPOUSE_NODE_WIDTH + 10;
              const spouseY = daughterY;
              
              connections.push(
                <path
                  key={`${daughter.id}-${spouse.id}-son-in-law`}
                  d={`M ${daughterX + SPOUSE_NODE_WIDTH} ${daughterY + (SPOUSE_NODE_HEIGHT - 10) / 2} L ${spouseX} ${spouseY + (SPOUSE_NODE_HEIGHT - 10) / 2}`}
                  fill="none"
                  stroke="rgba(99, 102, 241, 0.6)"
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  strokeLinecap="round"
                />
              );
            }
          });
        });
      }
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

      // 主节点
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

          {/* 辈分标识 */}
          <rect
            x="8"
            y="8"
            width="24"
            height="16"
            rx="8"
            fill={isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(26, 26, 46, 0.05)'}
          />
          <text
            x="20"
            y="19"
            textAnchor="middle"
            fill={isSelected ? subtextColor : '#8b8ba8'}
            fontSize="9"
            fontWeight="600"
          >
            {node.generation || '?'}
          </text>

          {/* 姓名 */}
          <text
            x={NODE_WIDTH / 2 + 10}
            y={38}
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
            x={NODE_WIDTH / 2 + 10}
            y={58}
            textAnchor="middle"
            fill={subtextColor}
            fontSize="11"
            style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
          >
            {node.person.birthDate ? `${node.person.birthDate}` : ''}
          </text>

          {/* 职业标签 */}
          {node.person.occupation && (
            <g transform={`translate(${NODE_WIDTH / 2 - 10}, 64)`}>
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

          {/* 配偶连接指示器 */}
          {showSpouses && node.spouses && node.spouses.length > 0 && (
            <g>
              <circle
                cx={NODE_WIDTH}
                cy={NODE_HEIGHT / 2}
                r="4"
                fill="#c9a84c"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          )}
        </g>
      );

      // 配偶节点（如果显示）
      if (showSpouses && node.spouses && node.spouses.length > 0) {
        node.spouses.forEach((spouse, index) => {
          const spouseIsSelected = spouse.id === selectedId;
          const spouseIsHighlighted = highlightedIds.includes(spouse.id);
          const spouseIsMale = spouse.gender === 'male';

          let spouseFillColor = '#ffffff';
          let spouseStrokeColor = '#d5d5e5';
          let spouseTextColor = '#2d2d44';
          let spouseSubtextColor = '#6b6b8a';

          if (spouseIsSelected) {
            spouseFillColor = spouseIsMale ? '#1a1a2e' : '#2d8a6e';
            spouseStrokeColor = spouseIsMale ? '#404060' : '#3a9d80';
            spouseTextColor = '#faf8f5';
            spouseSubtextColor = '#d5d5e5';
          } else if (spouseIsHighlighted) {
            spouseFillColor = '#fffbeb';
            spouseStrokeColor = '#c9a84c';
            spouseTextColor = '#1a1a2e';
            spouseSubtextColor = '#6b6b8a';
          } else {
            spouseFillColor = '#faf8f5';
            spouseStrokeColor = '#e0c87a';
            spouseTextColor = '#2d2d44';
            spouseSubtextColor = '#6b6b8a';
          }

          const spouseShadowFilter = spouseIsSelected 
            ? 'drop-shadow(0 4px 12px rgba(26, 26, 46, 0.15))' 
            : 'drop-shadow(0 2px 4px rgba(26, 26, 46, 0.05))';

          const spouseX = node.x + NODE_WIDTH + 20 + index * (SPOUSE_NODE_WIDTH + 20);

          nodes.push(
            <g
              key={spouse.id}
              transform={`translate(${spouseX}, ${node.y + 10})`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPerson(spouse.id);
              }}
              className="node-hover"
              style={{ cursor: 'pointer', filter: spouseShadowFilter }}
            >
              {/* 配偶节点背景 */}
              <rect
                width={SPOUSE_NODE_WIDTH}
                height={SPOUSE_NODE_HEIGHT}
                rx="10"
                fill={spouseFillColor}
                stroke={spouseStrokeColor}
                strokeWidth={spouseIsSelected ? 2.5 : 1.5}
                strokeDasharray={spouseIsSelected ? 'none' : '4,2'}
                className="transition-all duration-200"
              />
              
              {/* 性别指示条 */}
              <rect
                x="0"
                y="10"
                width="3"
                height={SPOUSE_NODE_HEIGHT - 20}
                rx="1.5"
                fill={spouseIsMale ? '#4a90d9' : '#e8689a'}
                opacity={spouseIsSelected ? 0.9 : 0.6}
              />

              {/* 配偶标签 */}
              <rect
                x="8"
                y="6"
                width="28"
                height="14"
                rx="7"
                fill="rgba(201, 168, 76, 0.2)"
              />
              <text
                x="22"
                y="16"
                textAnchor="middle"
                fill="#c9a84c"
                fontSize="8"
                fontWeight="600"
              >
                配偶
              </text>

              {/* 配偶姓名 */}
              <text
                x={SPOUSE_NODE_WIDTH / 2 + 5}
                y={40}
                textAnchor="middle"
                fill={spouseTextColor}
                fontSize="13"
                fontWeight="500"
                style={{ fontFamily: "'Noto Serif SC', serif" }}
              >
                {spouse.name}
              </text>
              
              {/* 配偶信息 */}
              <text
                x={SPOUSE_NODE_WIDTH / 2 + 5}
                y={56}
                textAnchor="middle"
                fill={spouseSubtextColor}
                fontSize="10"
                style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
              >
                {spouse.birthDate ? `${spouse.birthDate}` : ''}
              </text>

              {/* 选中指示器 */}
              {spouseIsSelected && (
                <circle
                  cx={SPOUSE_NODE_WIDTH - 6}
                  cy="6"
                  r="3"
                  fill="#c9a84c"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              )}
            </g>
          );
        });
      }

      // 女儿节点（如果显示）
      if (showDaughters && node.daughters && node.daughters.length > 0) {
        node.daughters.forEach((daughter, index) => {
          const daughterIsSelected = daughter.id === selectedId;
          const daughterIsHighlighted = highlightedIds.includes(daughter.id);
          
          let daughterFillColor = '#ffffff';
          let daughterStrokeColor = '#e8b4c8';
          let daughterTextColor = '#2d2d44';
          let daughterSubtextColor = '#6b6b8a';

          if (daughterIsSelected) {
            daughterFillColor = '#2d8a6e';
            daughterStrokeColor = '#3a9d80';
            daughterTextColor = '#faf8f5';
            daughterSubtextColor = '#d5d5e5';
          } else if (daughterIsHighlighted) {
            daughterFillColor = '#fffbeb';
            daughterStrokeColor = '#c9a84c';
            daughterTextColor = '#1a1a2e';
            daughterSubtextColor = '#6b6b8a';
          } else {
            daughterFillColor = '#fdf2f8';
            daughterStrokeColor = '#e8b4c8';
            daughterTextColor = '#2d2d44';
            daughterSubtextColor = '#6b6b8a';
          }

          const daughterShadowFilter = daughterIsSelected 
            ? 'drop-shadow(0 4px 12px rgba(26, 26, 46, 0.15))' 
            : 'drop-shadow(0 2px 4px rgba(26, 26, 46, 0.05))';

          // 计算女儿节点位置（在主节点下方）
          const daughterX = node.x + index * (SPOUSE_NODE_WIDTH + 15);
          const daughterY = node.y + NODE_HEIGHT + 15;

          nodes.push(
            <g
              key={daughter.id}
              transform={`translate(${daughterX}, ${daughterY})`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPerson(daughter.id);
              }}
              className="node-hover"
              style={{ cursor: 'pointer', filter: daughterShadowFilter }}
            >
              {/* 女儿节点背景 */}
              <rect
                width={SPOUSE_NODE_WIDTH}
                height={SPOUSE_NODE_HEIGHT - 10}
                rx="10"
                fill={daughterFillColor}
                stroke={daughterStrokeColor}
                strokeWidth={daughterIsSelected ? 2.5 : 1.5}
                className="transition-all duration-200"
              />
              
              {/* 性别指示条 */}
              <rect
                x="0"
                y="8"
                width="3"
                height={SPOUSE_NODE_HEIGHT - 26}
                rx="1.5"
                fill="#e8689a"
                opacity={daughterIsSelected ? 0.9 : 0.6}
              />

              {/* 女儿标签 */}
              <rect
                x="8"
                y="4"
                width="28"
                height="14"
                rx="7"
                fill="rgba(232, 104, 154, 0.2)"
              />
              <text
                x="22"
                y="14"
                textAnchor="middle"
                fill="#e8689a"
                fontSize="8"
                fontWeight="600"
              >
                女儿
              </text>

              {/* 女儿姓名 */}
              <text
                x={SPOUSE_NODE_WIDTH / 2 + 5}
                y={36}
                textAnchor="middle"
                fill={daughterTextColor}
                fontSize="13"
                fontWeight="500"
                style={{ fontFamily: "'Noto Serif SC', serif" }}
              >
                {daughter.name}
              </text>
              
              {/* 女儿信息 */}
              <text
                x={SPOUSE_NODE_WIDTH / 2 + 5}
                y={50}
                textAnchor="middle"
                fill={daughterSubtextColor}
                fontSize="10"
                style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
              >
                {daughter.birthDate ? `${daughter.birthDate}` : ''}
              </text>

              {/* 选中指示器 */}
              {daughterIsSelected && (
                <circle
                  cx={SPOUSE_NODE_WIDTH - 6}
                  cy="6"
                  r="3"
                  fill="#c9a84c"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              )}
            </g>
          );
        });
      }

      // 女婿节点（如果显示）
      if (showDaughters && showSonsInLaw && node.sonsInLaw && node.sonsInLaw.length > 0) {
        node.sonsInLaw.forEach((sonInLaw, index) => {
          const sonInLawIsSelected = sonInLaw.id === selectedId;
          const sonInLawIsHighlighted = highlightedIds.includes(sonInLaw.id);
          
          let sonInLawFillColor = '#ffffff';
          let sonInLawStrokeColor = '#a5b4fc';
          let sonInLawTextColor = '#2d2d44';
          let sonInLawSubtextColor = '#6b6b8a';

          if (sonInLawIsSelected) {
            sonInLawFillColor = '#2d8a6e';
            sonInLawStrokeColor = '#3a9d80';
            sonInLawTextColor = '#faf8f5';
            sonInLawSubtextColor = '#d5d5e5';
          } else if (sonInLawIsHighlighted) {
            sonInLawFillColor = '#fffbeb';
            sonInLawStrokeColor = '#c9a84c';
            sonInLawTextColor = '#1a1a2e';
            sonInLawSubtextColor = '#6b6b8a';
          } else {
            sonInLawFillColor = '#eef2ff';
            sonInLawStrokeColor = '#a5b4fc';
            sonInLawTextColor = '#2d2d44';
            sonInLawSubtextColor = '#6b6b8a';
          }

          const sonInLawShadowFilter = sonInLawIsSelected 
            ? 'drop-shadow(0 4px 12px rgba(26, 26, 46, 0.15))' 
            : 'drop-shadow(0 2px 4px rgba(26, 26, 46, 0.05))';

          // 计算女婿节点位置（在女儿节点右侧）
          const daughtersCount = node.daughters?.length || 0;
          const sonInLawX = node.x + (daughtersCount + index) * (SPOUSE_NODE_WIDTH + 15);
          const sonInLawY = node.y + NODE_HEIGHT + 15;

          nodes.push(
            <g
              key={sonInLaw.id}
              transform={`translate(${sonInLawX}, ${sonInLawY})`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPerson(sonInLaw.id);
              }}
              className="node-hover"
              style={{ cursor: 'pointer', filter: sonInLawShadowFilter }}
            >
              {/* 女婿节点背景 */}
              <rect
                width={SPOUSE_NODE_WIDTH}
                height={SPOUSE_NODE_HEIGHT - 10}
                rx="10"
                fill={sonInLawFillColor}
                stroke={sonInLawStrokeColor}
                strokeWidth={sonInLawIsSelected ? 2.5 : 1.5}
                className="transition-all duration-200"
              />
              
              {/* 性别指示条 */}
              <rect
                x="0"
                y="8"
                width="3"
                height={SPOUSE_NODE_HEIGHT - 26}
                rx="1.5"
                fill="#4a90d9"
                opacity={sonInLawIsSelected ? 0.9 : 0.6}
              />

              {/* 女婿标签 */}
              <rect
                x="8"
                y="4"
                width="28"
                height="14"
                rx="7"
                fill="rgba(99, 102, 241, 0.2)"
              />
              <text
                x="22"
                y="14"
                textAnchor="middle"
                fill="#6366f1"
                fontSize="8"
                fontWeight="600"
              >
                女婿
              </text>

              {/* 女婿姓名 */}
              <text
                x={SPOUSE_NODE_WIDTH / 2 + 5}
                y={36}
                textAnchor="middle"
                fill={sonInLawTextColor}
                fontSize="13"
                fontWeight="500"
                style={{ fontFamily: "'Noto Serif SC', serif" }}
              >
                {sonInLaw.name}
              </text>
              
              {/* 女婿信息 */}
              <text
                x={SPOUSE_NODE_WIDTH / 2 + 5}
                y={50}
                textAnchor="middle"
                fill={sonInLawSubtextColor}
                fontSize="10"
                style={{ fontFamily: "'Noto Sans SC', sans-serif" }}
              >
                {sonInLaw.birthDate ? `${sonInLaw.birthDate}` : ''}
              </text>

              {/* 选中指示器 */}
              {sonInLawIsSelected && (
                <circle
                  cx={SPOUSE_NODE_WIDTH - 6}
                  cy="6"
                  r="3"
                  fill="#c9a84c"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              )}
            </g>
          );
        });
      }

      node.children.forEach(child => visit(child, depth + 1));
    };

    laidOutRoots.forEach(visit);
    return nodes;
  };

  // 渲染辈分分隔线
  const renderGenerationLines = () => {
    const lines: React.ReactNode[] = [];
    const generations = new Set<number>();
    
    const collectGenerations = (node: TreeNode) => {
      generations.add(node.generation || 1);
      node.children.forEach(collectGenerations);
    };
    
    laidOutRoots.forEach(collectGenerations);
    
    // 这里可以根据需要添加辈分分隔线
    // 暂时返回空数组
    return lines;
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
          onClick={() => setViewState(prev => ({ ...prev, zoom: Math.min(2, prev.zoom * 1.15) }))}
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
          onClick={() => setViewState(prev => ({ ...prev, zoom: Math.max(0.2, prev.zoom / 1.15) }))}
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
          onClick={() => setViewState({ zoom: 1, panX: 0, panY: 0, direction, showSpouses, showDaughters, showSonsInLaw, showCousins })}
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

      {/* 辈分图例 */}
      <div className="absolute top-4 left-4 z-10">
        <div className="
          px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg
          border border-ink-200 text-xs text-ink-600
          shadow-sm
        ">
          <div className="font-semibold mb-1" style={{ fontFamily: 'var(--font-display)' }}>辈分</div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="w-4 h-3 bg-blue-100 border border-blue-300 rounded"></span>
              <span>男性</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-3 bg-rose-100 border border-rose-300 rounded"></span>
              <span>女性</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-3 bg-gold-100 border border-gold-300 rounded border-dashed"></span>
              <span>配偶</span>
            </div>
          </div>
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
          {renderGenerationLines()}
          {renderConnections()}
          {renderNodes()}
        </g>
      </svg>
    </div>
  );
}
