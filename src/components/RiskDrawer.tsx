import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldAlert, FileText, Activity, BrainCircuit, ChevronRight, Gavel, UserCheck, AlertTriangle, ClipboardList } from 'lucide-react';
import { RiskNodeData, RiskStatus } from '../types';
import { cn, formatNumber } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_TREND } from '../mockData';

interface RiskDrawerProps {
  node: RiskNodeData | null;
  isOpen: boolean;
  onClose: () => void;
}

type IndicatorTab = 'penalty' | 'audit' | 'risk' | 'rcsa';

interface IndicatorConfig {
  key: IndicatorTab;
  label: string;
  icon: React.ReactNode;
  count: number;
  amount?: number;
  amountLabel?: string;
}

export const RiskDrawer: React.FC<RiskDrawerProps> = ({ node, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<IndicatorTab>('penalty');

  // Escape key to close drawer
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset active tab when node changes
  React.useEffect(() => {
    if (node) {
      const configs = getIndicatorConfigs(node);
      const firstWithData = configs.find(c => c.count > 0);
      setActiveTab(firstWithData?.key ?? 'penalty');
    }
  }, [node?.id]);

  const trendData = node ? MOCK_TREND[node.id] || [] : [];

  const indicatorConfigs = useMemo(() => node ? getIndicatorConfigs(node) : [], [node]);

  const activeConfig = indicatorConfigs.find(c => c.key === activeTab);
  const hasData = activeConfig && activeConfig.count > 0;

  return (
    <AnimatePresence>
      {isOpen && node && (
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
            className="fixed top-0 right-0 h-full w-full md:w-[700px] lg:w-[900px] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b flex items-center justify-between shrink-0 bg-white z-10">
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
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="关闭抽屉"
                role="button"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
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

              {/* Indicator Summary Cards */}
              <section>
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  风险指标底表
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {indicatorConfigs.map(config => (
                    <button
                      key={config.key}
                      onClick={() => config.count > 0 && setActiveTab(config.key)}
                      disabled={config.count === 0}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        activeTab === config.key
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : config.count > 0
                            ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                            : "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {config.icon}
                        <span className={cn(
                          "text-xs font-bold uppercase tracking-tight",
                          activeTab === config.key ? "text-blue-600" : "text-slate-500"
                        )}>
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className={cn(
                          "text-2xl font-bold",
                          activeTab === config.key ? "text-blue-700" : "text-slate-700"
                        )}>
                          {config.count}
                        </span>
                        <span className="text-xs text-slate-400">条</span>
                      </div>
                      {config.amount !== undefined && (
                        <div className="text-xs text-slate-500 mt-1">
                          {config.amountLabel}: ¥{formatNumber(config.amount)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Detail Table */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeConfig?.label}明细
                  </h3>
                  <span className="text-xs text-slate-400">
                    共 {activeConfig?.count ?? 0} 条记录
                  </span>
                </div>

                {!hasData ? (
                  <div className="p-8 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">暂无数据</p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                      {activeTab === 'penalty' && <PenaltyTable data={node.regulatoryPenalties ?? []} />}
                      {activeTab === 'audit' && <AuditTable data={node.auditAccountabilities ?? []} />}
                      {activeTab === 'risk' && <RiskEventTable data={node.operationalRiskEvents ?? []} />}
                      {activeTab === 'rcsa' && <RCSADefectTable data={node.rcsaDefectsDetail ?? []} />}
                    </div>
                  </div>
                )}
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

            </div>

            {/* Action Footer */}
            <div className="shrink-0 p-6 border-t border-slate-100 bg-white">
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

// Helper: build indicator configs from node data
function getIndicatorConfigs(node: RiskNodeData): IndicatorConfig[] {
  const penalties = node.regulatoryPenalties ?? [];
  const audits = node.auditAccountabilities ?? [];
  const risks = node.operationalRiskEvents ?? [];
  const rcsas = node.rcsaDefectsDetail ?? [];

  return [
    {
      key: 'penalty',
      label: '监管处罚',
      icon: <Gavel className="w-4 h-4 text-amber-600" />,
      count: penalties.length,
      amount: penalties.reduce((sum, p) => sum + p.amount, 0),
      amountLabel: '处罚金额',
    },
    {
      key: 'audit',
      label: '稽核问责',
      icon: <UserCheck className="w-4 h-4 text-purple-600" />,
      count: audits.length,
      amount: audits.reduce((sum, a) => sum + a.lossAmount, 0),
      amountLabel: '损失金额',
    },
    {
      key: 'risk',
      label: '操作风险事件',
      icon: <AlertTriangle className="w-4 h-4 text-orange-600" />,
      count: risks.length,
      amount: risks.reduce((sum, r) => sum + r.finalLossAmount, 0),
      amountLabel: '最终损失',
    },
    {
      key: 'rcsa',
      label: 'RCSA 缺陷',
      icon: <ClipboardList className="w-4 h-4 text-teal-600" />,
      count: rcsas.length,
    },
  ];
}

// ===== Detail Table Components =====

function PenaltyTable({ data }: { data: import('../types').RegulatoryPenalty[] }) {
  return (
    <table className="w-full text-xs">
      <thead className="bg-slate-50 sticky top-0">
        <tr>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">处罚文书号</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">通知书日期</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">发布单位</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">被处罚对象</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap min-w-[200px]">处罚事由</th>
          <th className="px-3 py-2 text-right font-bold text-slate-500 whitespace-nowrap">处罚金额</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className={i % 2 === 1 ? 'bg-slate-50/50' : ''}>
            <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{row.documentNo}</td>
            <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.noticeDate}</td>
            <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.issuer}</td>
            <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.target}</td>
            <td className="px-3 py-2 text-slate-600 min-w-[200px]">{row.reason}</td>
            <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">¥{formatNumber(row.amount)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AuditTable({ data }: { data: import('../types').AuditAccountability[] }) {
  return (
    <table className="w-full text-xs">
      <thead className="bg-slate-50 sticky top-0">
        <tr>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">事件编码</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">事件名称</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap min-w-[200px]">事件描述</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">发生日期</th>
          <th className="px-3 py-2 text-right font-bold text-slate-500 whitespace-nowrap">损失金额</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">亮牌</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap min-w-[150px]">问责人员</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className={i % 2 === 1 ? 'bg-slate-50/50' : ''}>
            <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{row.eventCode}</td>
            <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{row.eventName}</td>
            <td className="px-3 py-2 text-slate-600 min-w-[200px]">{row.description}</td>
            <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.eventDate}</td>
            <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">¥{formatNumber(row.lossAmount)}</td>
            <td className="px-3 py-2 whitespace-nowrap">
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold",
                row.warningLevel === '红牌' ? "bg-red-100 text-red-700" :
                row.warningLevel === '黄牌' ? "bg-amber-100 text-amber-700" :
                "bg-green-100 text-green-700"
              )}>
                {row.warningLevel}
              </span>
            </td>
            <td className="px-3 py-2 text-slate-600 min-w-[150px]">{row.accountablePerson}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RiskEventTable({ data }: { data: import('../types').OperationalRiskEvent[] }) {
  return (
    <table className="w-full text-xs">
      <thead className="bg-slate-50 sticky top-0">
        <tr>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">事件编码</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">事件名称</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap min-w-[180px]">事件描述</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">发生日期</th>
          <th className="px-3 py-2 text-right font-bold text-slate-500 whitespace-nowrap">损失金额</th>
          <th className="px-3 py-2 text-right font-bold text-slate-500 whitespace-nowrap">回收金额</th>
          <th className="px-3 py-2 text-right font-bold text-slate-500 whitespace-nowrap">最终损失</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">事件等级</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">发生部门</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className={i % 2 === 1 ? 'bg-slate-50/50' : ''}>
            <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{row.eventCode}</td>
            <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{row.eventName}</td>
            <td className="px-3 py-2 text-slate-600 min-w-[180px]">{row.description}</td>
            <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.eventDate}</td>
            <td className="px-3 py-2 text-right font-mono text-slate-800">¥{formatNumber(row.lossAmount)}</td>
            <td className="px-3 py-2 text-right font-mono text-slate-800">¥{formatNumber(row.recoveryAmount)}</td>
            <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">¥{formatNumber(row.finalLossAmount)}</td>
            <td className="px-3 py-2 whitespace-nowrap">
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold",
                row.eventLevel === '重大' ? "bg-red-100 text-red-700" :
                row.eventLevel === '较大' ? "bg-amber-100 text-amber-700" :
                row.eventLevel === '关注' ? "bg-blue-100 text-blue-700" :
                "bg-green-100 text-green-700"
              )}>
                {row.eventLevel}
              </span>
            </td>
            <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.department}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function RCSADefectTable({ data }: { data: import('../types').RCSADefectDetail[] }) {
  return (
    <table className="w-full text-xs">
      <thead className="bg-slate-50 sticky top-0">
        <tr>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">缺陷编码</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">缺陷名称</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap min-w-[180px]">缺陷描述</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">缺陷等级</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">缺陷类型</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">是否整改</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap min-w-[200px]">整改计划描述</th>
          <th className="px-3 py-2 text-left font-bold text-slate-500 whitespace-nowrap">整改状态</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i} className={i % 2 === 1 ? 'bg-slate-50/50' : ''}>
            <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{row.defectCode}</td>
            <td className="px-3 py-2 text-slate-700 whitespace-nowrap">{row.defectName}</td>
            <td className="px-3 py-2 text-slate-600 min-w-[180px]">{row.description}</td>
            <td className="px-3 py-2 whitespace-nowrap">
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold",
                row.defectLevel === '重大' ? "bg-red-100 text-red-700" :
                row.defectLevel === '较大' ? "bg-amber-100 text-amber-700" :
                "bg-green-100 text-green-700"
              )}>
                {row.defectLevel}
              </span>
            </td>
            <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{row.defectType}</td>
            <td className="px-3 py-2 whitespace-nowrap">
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold",
                row.isRectified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              )}>
                {row.isRectified ? '是' : '否'}
              </span>
            </td>
            <td className="px-3 py-2 text-slate-600 min-w-[200px]">{row.rectificationPlan}</td>
            <td className="px-3 py-2 whitespace-nowrap">
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold",
                row.rectificationStatus === '已完成' ? "bg-green-100 text-green-700" :
                row.rectificationStatus === '整改中' ? "bg-blue-100 text-blue-700" :
                "bg-slate-100 text-slate-600"
              )}>
                {row.rectificationStatus}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
