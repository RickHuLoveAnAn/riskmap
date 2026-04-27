import React, { useRef, useEffect, useState } from 'react';
import { RiskNode } from './RiskNode';
import { RiskNodeData, ContagionPath, RiskStatus } from '../types';
import { useRiskData } from '../context/DataContext';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { Info, Search } from 'lucide-react';

interface ContagionMapProps {
  onNodeClick: (node: RiskNodeData) => void;
  selectedNodeId?: string;
  filteredNodeIds: Set<string>;
}

export const ContagionMap: React.FC<ContagionMapProps> = ({ onNodeClick, selectedNodeId, filteredNodeIds }) => {
  const { nodes, paths } = useRiskData();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number; leftX: number }>>({});
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['L1-001', 'L2-001', 'L3-001', 'L4-001']));

  const handleToggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Helper to check if a node is visible based on ancestor expansion and filters
  const isNodeVisible = (node: RiskNodeData): boolean => {
    // First check if node passes filter
    if (!filteredNodeIds.has(node.id)) return false;

    // Then check if ancestors are expanded (for non-L0 nodes)
    if (node.level === 0) return true;
    if (!node.parent) return false;

    const parent = nodes.find(n => n.id === node.parent);
    if (!parent) return false;

    return expandedIds.has(parent.id) && isNodeVisible(parent);
  };

  const visibleNodes = nodes.filter(isNodeVisible);

  // Arrange nodes by level
  const levels = Array.from({ length: 5 }).map((_, i) =>
    visibleNodes.filter(node => node.level === i)
  );

  const updatePositions = () => {
    const positions: Record<string, { x: number; y: number; leftX: number }> = {};
    visibleNodes.forEach(node => {
      const el = document.getElementById(`node-${node.id}`);
      if (el && contentRef.current) {
        const rect = el.getBoundingClientRect();
        const contentRect = contentRef.current.getBoundingClientRect();
        
        positions[node.id] = {
          x: rect.left - contentRect.left + rect.width, // Right center relative to content wrapper
          y: rect.top - contentRect.top + rect.height / 2, // Vertical center relative to content wrapper
          leftX: rect.left - contentRect.left // Left center relative to content wrapper
        };
      }
    });
    setNodePositions(positions);
  };

  // We need to trigger a re-render after mounting to get node positions for SVG lines
  useEffect(() => {
    updatePositions();
    
    // Create a ResizeObserver to watch for layout shifts
    const observer = new ResizeObserver(() => {
      updatePositions();
    });

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }
    
    // High-frequency updates during transitions (first 500ms)
    let animationFrame: number;
    const startTime = Date.now();
    const duration = 500;

    const animate = () => {
      updatePositions();
      if (Date.now() - startTime < duration) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);

    window.addEventListener('resize', updatePositions);
    return () => {
      window.removeEventListener('resize', updatePositions);
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [expandedIds, visibleNodes.length, filteredNodeIds]);

  const renderPath = (path: ContagionPath, index: number) => {
    // Only render path if both source and target are currently visible
    const sourceNode = nodes.find(n => n.id === path.source);
    const targetNode = nodes.find(n => n.id === path.target);
    if (!sourceNode || !targetNode || !isNodeVisible(sourceNode) || !isNodeVisible(targetNode)) return null;

    const start = nodePositions[path.source];
    const end = nodePositions[path.target];
    
    if (!start || !end) return null;

    const startX = start.x;
    const startY = start.y;
    const endX = (end as any).leftX;
    const endY = end.y;

    const midX = (startX + endX) / 2;

    // Bezier curve path
    const d = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

    return (
      <g key={`path-${path.source}-${path.target}-${index}`}>
        <path
          d={d}
          fill="none"
          stroke={path.isAI ? '#6366F1' : '#CBD5E1'}
          strokeWidth={path.isAI ? 2 : 1.5}
          strokeDasharray={path.isAI ? "5,5" : "0"}
          className={cn(path.isAI ? "animate-[pulse_2s_infinite]" : "")}
        />
        {path.isAI && (
          <foreignObject x={midX - 30} y={(startY + endY) / 2 - 10} width="60" height="20">
            <div className="flex items-center justify-center">
              <div className="px-1.5 py-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded shadow-sm">
                AI {path.probability}%
              </div>
            </div>
          </foreignObject>
        )}
        <title>{path.reason}</title>
      </g>
    );
  }

  // Draw lines for standard parent-child relations
  const renderTreeLines = () => {
    return visibleNodes.filter(n => n.parent).map((node, idx) => {
      const parent = nodePositions[node.parent!];
      const self = nodePositions[node.id];
      if (!parent || !self) return null;

      const sx = parent.x;
      const sy = parent.y;
      const ex = (self as any).leftX;
      const ey = self.y;
      const mx = (sx + ex) / 2;

      return (
        <path
          key={`tree-line-${node.id}`}
          d={`M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ey}, ${ex} ${ey}`}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="1.5"
        />
      );
    });
  }

  return (
    <div className="relative min-h-[calc(100vh-120px)] p-12 overflow-x-auto overflow-y-auto bg-slate-50/50" ref={containerRef}>
      {/* Content Wrapper to ensure SVG and Flow match size */}
      <div className="relative min-w-max min-h-full" ref={contentRef}>
        {/* Background SVG for lines - placed as a background layer of the content */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 0 }}>
          {renderTreeLines()}
          {paths.map((path, idx) => renderPath(path, idx))}
        </svg>

        <div className="flex gap-24 relative z-10">
          {visibleNodes.length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">未找到匹配的流程</p>
                <p className="text-slate-400 text-sm mt-1">尝试调整搜索条件或选择其他公司</p>
              </div>
            </div>
          ) : (
            levels.map((levelNodes, levelIdx) => (
              <div key={`level-${levelIdx}`} className="flex flex-col gap-8 pt-20">
                {/* Level Label */}
                <div className="absolute top-4 bento-header opacity-50">
                  Level {levelIdx} {levelIdx === 0 ? '成员公司' : levelIdx === 1 ? '一级流程框架' : levelIdx === 2 ? '二级流程框架' : levelIdx === 3 ? '主业务流程' : '子业务流程'}
                </div>

                {levelNodes.map(node => (
                  <div id={`node-${node.id}`} key={node.id}>
                    <RiskNode
                      data={node}
                      onClick={onNodeClick}
                      isActive={selectedNodeId === node.id}
                      isExpanded={expandedIds.has(node.id)}
                      onToggle={handleToggle}
                    />
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="fixed bottom-8 left-8 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200 shadow-xl flex gap-6 text-[11px] font-bold text-slate-500 z-30">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-slate-300" />
          <span>物理血缘 (确认)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 border-t-2 border-dashed border-indigo-500" />
          <span>AI 传染推演 (虚线)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-risk-red animate-pulse" />
          <span>呼吸灯: 熔断/极高危</span>
        </div>
      </div>
    </div>
  );
};
