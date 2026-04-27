export enum RiskStatus {
  ALERT = 'Alert',
  WARNING = 'Warning',
  NORMAL = 'Normal',
}

export enum NodeTier {
  TIER1 = 'Tier 1',
  TIER2 = 'Tier 2',
  TIER3 = 'Tier 3',
}

export interface RiskNodeData {
  id: string;
  label: string;
  level: number;
  status: RiskStatus;
  tier: NodeTier;
  children?: string[]; // IDs of children
  parent?: string;
  
  // KRI Metrics (for L4 mainly, but aggregated for others)
  ldcAmount: number;
  rcsaDefects: number;
  auditIssues: number;
  penaltyCount: number;
  
  description?: string;
  healthScore: number;
  duration: string; // How long in this state
  
  // For AI Contagion
  isAIPredicted?: boolean;
  contagionProbability?: number;
  aiExplanation?: string;
}

export interface ContagionPath {
  source: string;
  target: string;
  isAI: boolean;
  probability?: number;
  reason?: string;
}

export interface HealthTrend {
  date: string;
  score: number;
}
