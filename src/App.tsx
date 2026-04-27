/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { TopHeader } from './components/TopHeader';
import { ContagionMap } from './components/ContagionMap';
import { RiskDrawer } from './components/RiskDrawer';
import { DataProvider, useRiskData } from './context/DataContext';
import { RiskNodeData, RiskStatus } from './types';
import { AlertCircle, BrainCircuit, Activity } from 'lucide-react';

function AppContent() {
  const [selectedNode, setSelectedNode] = useState<RiskNodeData | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('2026 Q2');

  const { isLoading, nodes } = useRiskData();

  const handleNodeClick = (node: RiskNodeData) => {
    setSelectedNode(node);
    if (node.level === 4) {
      setIsDrawerOpen(true);
    }
  };

  // Compute alert counts from actual node data
  const alertCount = useMemo(() =>
    nodes.filter(n => n.status === RiskStatus.ALERT).length, [nodes]);
  const warningCount = useMemo(() =>
    nodes.filter(n => n.status === RiskStatus.WARNING).length, [nodes]);

  // Filter nodes based on search and company selection
  const filteredNodeIds = useMemo(() => {
    let filtered = nodes.map(n => n.id);

    // Filter by company (L0 nodes)
    if (selectedCompany) {
      const companyNode = nodes.find(n => n.id === selectedCompany);
      if (companyNode && companyNode.children) {
        // Get all descendant IDs
        const getDescendants = (nodeId: string): string[] => {
          const node = nodes.find(n => n.id === nodeId);
          if (!node) return [];
          const descendants = [nodeId];
          if (node.children) {
            node.children.forEach(childId => {
              descendants.push(...getDescendants(childId));
            });
          }
          return descendants;
        };
        filtered = getDescendants(selectedCompany);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(id => {
        const node = nodes.find(n => n.id === id);
        return node && node.label.toLowerCase().includes(query);
      });
    }

    return new Set(filtered);
  }, [nodes, selectedCompany, searchQuery]);

  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-100">
      <TopHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        companies={nodes.filter(n => n.level === 0)}
      />

      <main className="flex-1 relative bg-slate-50/30 overflow-hidden">
        {/* Banner with stats summary */}
        <div className="bg-white border-b border-slate-200 px-10 py-4 flex items-center justify-between shadow-sm" role="region" aria-label="风险统计">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-risk-red animate-pulse shadow-sm shadow-risk-red/50" />
              <div className="flex flex-col">
                <span className="text-[9px] bento-header opacity-60">高风险告警</span>
                <span className="text-sm font-bold text-slate-900 tracking-tight" aria-live="polite">
                  {String(alertCount).padStart(2, '0')} <span className="text-[10px] text-slate-400 font-medium">个节点</span>
                </span>
              </div>
            </div>
            <div className="h-6 w-px bg-slate-100" />
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-risk-orange shadow-sm shadow-risk-orange/50" />
              <div className="flex flex-col">
                <span className="text-[9px] bento-header opacity-60">活跃预警</span>
                <span className="text-sm font-bold text-slate-900 tracking-tight" aria-live="polite">
                  {String(warningCount).padStart(2, '0')} <span className="text-[10px] text-slate-400 font-medium">个节点</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-indigo-50/50 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm transition-all hover:bg-indigo-50">
              <BrainCircuit className="w-4 h-4 text-indigo-600" />
              <div className="flex flex-col">
                <span className="text-[9px] bento-header text-indigo-600">AI 传染概率</span>
                <span className="text-xs font-black text-indigo-900 uppercase">12% 系统性风险 (低)</span>
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
          filteredNodeIds={filteredNodeIds}
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
