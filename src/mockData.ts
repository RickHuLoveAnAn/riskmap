// MOCK_TREND is kept for chart data (health score history)
// Nodes and paths are now loaded from CSV files in public/data/

export const MOCK_TREND: Record<string, any[]> = {
  'L5-001': [
    { date: '04-21', score: 95 },
    { date: '04-22', score: 92 },
    { date: '04-23', score: 90 },
    { date: '04-24', score: 85 },
    { date: '04-25', score: 50 },
    { date: '04-26', score: 45 },
  ],
  'L5-003': [
    { date: '04-21', score: 98 },
    { date: '04-22', score: 96 },
    { date: '04-23', score: 92 },
    { date: '04-24', score: 88 },
    { date: '04-25', score: 75 },
    { date: '04-26', score: 72 },
  ]
};
