import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { RiskNodeData, ContagionPath } from '../types';
import { MOCK_NODES, MOCK_PATHS, MOCK_TREND } from '../mockData';
import {
  loadCSV,
  toRegulatoryPenalties,
  toAuditAccountabilities,
  toOperationalRiskEvents,
  toRCSADefects,
} from '../lib/csvLoader';

interface DataContextValue {
  nodes: RiskNodeData[];
  paths: ContagionPath[];
  trends: Record<string, any[]>;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

const DataContext = createContext<DataContextValue>({
  nodes: MOCK_NODES,
  paths: MOCK_PATHS,
  trends: MOCK_TREND,
  isLoading: false,
  error: null,
  refresh: () => {},
});

export const useRiskData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<RiskNodeData[]>(MOCK_NODES);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [penaltyRows, auditRows, riskRows, rcsaRows] = await Promise.all([
        loadCSV('/data/regulatory-penalties.csv'),
        loadCSV('/data/audit-accountabilities.csv'),
        loadCSV('/data/operational-risk-events.csv'),
        loadCSV('/data/rcsa-defects.csv'),
      ]);

      // Group raw CSV rows by nodeId before type conversion
      const penaltyMap = groupByRows(penaltyRows, 'nodeId');
      const auditMap = groupByRows(auditRows, 'nodeId');
      const riskMap = groupByRows(riskRows, 'nodeId');
      const rcsaMap = groupByRows(rcsaRows, 'nodeId');

      const enrichedNodes = MOCK_NODES.map(node => ({
        ...node,
        regulatoryPenalties: toRegulatoryPenalties(penaltyMap[node.id] || []),
        auditAccountabilities: toAuditAccountabilities(auditMap[node.id] || []),
        operationalRiskEvents: toOperationalRiskEvents(riskMap[node.id] || []),
        rcsaDefectsDetail: toRCSADefects(rcsaMap[node.id] || []),
      }));

      setNodes(enrichedNodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      // Fallback to base mock data (already in state)
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <DataContext.Provider
      value={{
        nodes,
        paths: MOCK_PATHS,
        trends: MOCK_TREND,
        isLoading,
        error,
        refresh: loadData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

function groupByRows(arr: Record<string, string>[], key: string): Record<string, Record<string, string>[]> {
  return arr.reduce((acc, item) => {
    const k = item[key];
    if (!k) return acc;
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, Record<string, string>[]>);
}
