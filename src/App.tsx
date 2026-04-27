/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TopHeader } from './components/TopHeader';
import { ContagionMap } from './components/ContagionMap';
import { RiskDrawer } from './components/RiskDrawer';
import { DataProvider, useRiskData } from './context/DataContext';
import { RiskNodeData, RiskStatus } from './types';
import { AlertCircle, BrainCircuit, Activity } from 'lucide-react';

function AppContent() {
  const [selectedNode, setSelectedNode] = useState<RiskNodeData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { isLoading } = useRiskData();

  const handleNodeClick = (node: RiskNodeData) => {
    setSelectedNode(node);
    if (node.level === 4) {
      setIsDrawerOpen(true);
    }
  };

  // Compute alert counts from actual node data
  const { nodes } = useRiskData();
  const alertCount = nodes.filter(n => n.status === RiskStatus.ALERT).length;
  const warningCount = nodes.filter(n => n.status === RiskStatus.WARNING).length;

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-100">
      <TopHeader />

      <main className="flex-1 relative bg-slate-50/30 overflow-hidden">
        {/* Banner with stats summary */}
        <div className="bg-white border-b border-slate-200 px-10 py-4 flex items-center justify-between shadow-sm" role="region" aria-label="风险统计">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-risk-red animate-pulse shadow-sm shadow-risk-red/50" />
              <div className="flex flex-col">
                <span className="text-[9px] bento-header opacity-60">High Risk Alerts</span>
                <span className="text-sm font-bold text-slate-900 tracking-tight" aria-live="polite">
                  {String(alertCount).padStart(2, '0')} <span className="text-[10px] text-slate-400 font-medium">Nodes</span>
                </span>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-100" />
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-risk-orange shadow-sm shadow-risk-orange/50" />
              <div className="flex flex-col">
                <span className="text-[9px] bento-header opacity-60">Active Warnings</span>
                <span className="text-sm font-bold text-slate-900 tracking-tight" aria-live="polite">
                  {String(warningCount).padStart(2, '0')} <span className="text-[10px] text-slate-400 font-medium">Nodes</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-indigo-50/50 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm transition-all hover:bg-indigo-50">
              <BrainCircuit className="w-4 h-4 text-indigo-600" />
              <div className="flex flex-col">
                <span className="text-[9px] bento-header text-indigo-600">AI Contagion Prob.</span>
                <span className="text-xs font-black text-indigo-900 uppercase">12% Systemic Risk (Low)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-sm text-slate-500">加载数据中...</span>
            </div>
          </div>
        )}

        <ContagionMap
          onNodeClick={handleNodeClick}
          selectedNodeId={selectedNode?.id}
        />
      </main>

      <RiskDrawer
        node={selectedNode}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Global CSS for scrollbars */}
      <style>{`
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #CBD5E1;
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
