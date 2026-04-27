import React from 'react';
import { motion } from 'motion/react';
import { RiskStatus, NodeTier, type RiskNodeData } from '../types';
import { cn, formatNumber } from '../lib/utils';
import { AlertCircle, AlertTriangle, CheckCircle2, MoreHorizontal, ChevronRight, ChevronDown } from 'lucide-react';

interface RiskNodeProps {
  data: RiskNodeData;
  onClick: (node: RiskNodeData) => void;
  isActive?: boolean;
  isExpanded?: boolean;
  onToggle?: (id: string) => void;
}

const statusConfig = {
  [RiskStatus.ALERT]: {
    color: 'bg-risk-red',
    icon: <AlertCircle className="w-4 h-4 text-white" />,
    borderColor: 'border-risk-red',
    lightColor: 'rgba(238, 52, 52, 0.1)',
  },
  [RiskStatus.WARNING]: {
    color: 'bg-risk-orange',
    icon: <AlertTriangle className="w-4 h-4 text-white" />,
    borderColor: 'border-risk-orange',
    lightColor: 'rgba(255, 176, 0, 0.1)',
  },
  [RiskStatus.NORMAL]: {
    color: 'bg-risk-green',
    icon: <CheckCircle2 className="w-4 h-4 text-white" />,
    borderColor: 'border-risk-green',
    lightColor: 'rgba(46, 204, 113, 0.1)',
  },
};

export const RiskNode: React.FC<RiskNodeProps> = ({ data, onClick, isActive, isExpanded, onToggle }) => {
  const config = statusConfig[data.status];
  const isAlert = data.status === RiskStatus.ALERT;
  const isL4 = data.level === 4;
  const hasChildren = data.children && data.children.length > 0;

  const handleContainerClick = (e: React.MouseEvent) => {
    // If it's a toggle target (L0-L3 with children), toggle it
    if (!isL4 && hasChildren && onToggle) {
      onToggle(data.id);
    }
    // Always trigger standard click (for highlighting/selecting)
    onClick(data);
  };

  if (!isL4) {
    // Simpler card for higher levels (L0-L3)
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -1 }}
        onClick={handleContainerClick}
        className={cn(
          "relative w-52 p-3 bg-white border border-slate-200 rounded-xl shadow-sm cursor-pointer transition-all flex items-center gap-3",
          isActive && "ring-2 ring-blue-500/20 border-blue-400 shadow-md",
          "hover:border-slate-300"
        )}
      >
        <div className={cn("w-3 h-3 rounded-full shrink-0", config.color, isAlert && "animate-pulse")} />
        <div className="flex-1 min-w-0">
          <div className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mb-0.5">Level {data.level}</div>
          <h3 className="font-bold text-slate-700 text-[13px] truncate" title={data.label}>
            {data.label}
          </h3>
        </div>
        {hasChildren && (
          <div className="text-slate-400">
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </div>
        )}
      </motion.div>
    );
  }

  // Detailed Card for L4 (Data Micro-card)
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => onClick(data)}
      className={cn(
        "relative w-72 p-5 bento-card bento-card-hover cursor-pointer",
        isAlert && "animate-breathe border-risk-red shadow-lg shadow-risk-red/5",
        isActive && "ring-4 ring-offset-2 ring-blue-500/20 border-blue-400"
      )}
    >
      {/* Status indicator */}
      <div className={cn(
        "absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md",
        config.color
      )}>
        {config.icon}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="bento-header">
            {data.tier}
          </span>
          {data.isAIPredicted && (
            <span className="px-2 py-0.5 text-[9px] bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full font-black uppercase">
              AI PREDICTED {data.contagionProbability}%
            </span>
          )}
        </div>

        <h3 className="font-bold text-slate-800 text-sm leading-tight h-10 line-clamp-2" title={data.label}>
          {data.label}
        </h3>

        {/* Detailed Metrics Table style within the Bento Card */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-x-4 gap-y-3">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">LDC 损失</span>
            <span className={cn(
              "text-xs font-mono font-bold font-black",
              data.ldcAmount > 1000000 ? "text-risk-red" : "text-slate-800"
            )}>
              ¥{formatNumber(data.ldcAmount)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">健康分</span>
            <span className={cn(
              "text-xs font-mono font-bold",
              data.healthScore < 60 ? "text-risk-red" : "text-slate-800"
            )}>
              {data.healthScore}%
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">RCSA 缺陷</span>
            <span className="text-xs font-mono font-bold text-slate-800">
              {data.rcsaDefects} <span className="text-[9px] font-normal text-slate-400">个</span>
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">持续时长</span>
            <span className="text-xs font-mono font-bold text-slate-800">
              {data.duration}
            </span>
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 opacity-20">
        <MoreHorizontal className="w-4 h-4" />
      </div>
    </motion.div>
  );
};
