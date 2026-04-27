import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, FileText, Activity, BrainCircuit, ChevronRight } from 'lucide-react';
import { RiskNodeData, RiskStatus } from '../types';
import { cn, formatNumber } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_TREND } from '../mockData';

interface RiskDrawerProps {
  node: RiskNodeData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RiskDrawer: React.FC<RiskDrawerProps> = ({ node, isOpen, onClose }) => {
  if (!node) return null;

  const trendData = MOCK_TREND[node.id] || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[480px] bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  node.status === RiskStatus.ALERT ? "bg-risk-red/10" : 
                  node.status === RiskStatus.WARNING ? "bg-risk-orange/10" : "bg-risk-green/10"
                )}>
                  {node.status === RiskStatus.ALERT ? <ShieldAlert className="w-6 h-6 text-risk-red" /> : 
                   <Activity className="w-6 h-6 text-slate-400" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800">{node.label}</h2>
                  <span className="text-xs text-slate-400 uppercase tracking-widest">{node.tier} | {node.id}</span>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-8 pb-24">
              {/* Health Score and Status */}
              <section className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <span className="text-sm text-slate-500">实时健康分</span>
                    <div className="text-4xl font-mono font-bold text-slate-800">{node.healthScore}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-slate-500">状态持续时间</span>
                    <div className="text-lg font-bold text-slate-700">{node.duration}</div>
                  </div>
                </div>
                
                <div className="h-48 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke={node.status === RiskStatus.ALERT ? '#EE3434' : '#2ECC71'} 
                        strokeWidth={3} 
                        dot={{ fill: '#fff', strokeWidth: 2, r: 4 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>

              {/* Data Metrics Table */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  四维数据看板
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: '监管处罚', value: node.penaltyCount, unit: '笔' },
                    { label: '内部稽核', value: node.auditIssues, unit: '个' },
                    { label: 'LDC 损失', value: `¥${formatNumber(node.ldcAmount)}`, unit: '' },
                    { label: 'RCSA 缺陷', value: node.rcsaDefects, unit: '个' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                      <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                      <div className="text-lg font-bold text-slate-800">
                        {item.value} <span className="text-[10px] text-slate-400 font-normal">{item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* AI Explanation */}
              {node.aiExplanation && (
                <section>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-indigo-500" />
                    AI 推理逻辑与风险预测
                  </h3>
                  <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                      <BrainCircuit className="w-24 h-24 text-indigo-600" />
                    </div>
                    <p className="text-sm text-indigo-900 leading-relaxed relative z-10 font-medium">
                      {node.aiExplanation}
                    </p>
                  </div>
                </section>
              )}

              {/* Event Description (LDC/RCSA Detail) */}
              {node.description && (
                <section>
                  <h3 className="text-sm font-bold text-slate-900 mb-2">事件明细</h3>
                  <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl italic">
                    "{node.description}"
                  </p>
                </section>
              )}
            </div>

            {/* Action Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 flex gap-3">
              <button className="flex-1 bg-risk-red text-white py-3 rounded-xl font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2">
                一键下发督办任务
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
