import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Filter, Clock, Search, ShieldCheck, User, ChevronDown, X } from 'lucide-react';
import { RiskNodeData } from '../types';
import { cn } from '../lib/utils';

interface TopHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCompany: string | null;
  onCompanyChange: (companyId: string | null) => void;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  companies: RiskNodeData[];
}

const PERIODS = ['2026 Q2', '2026 Q1', '2025 Q4', '2025 Q3'];

export const TopHeader: React.FC<TopHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCompany,
  onCompanyChange,
  selectedPeriod,
  onPeriodChange,
  companies,
}) => {
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const companyRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) {
        setIsCompanyOpen(false);
      }
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) {
        setIsPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedCompanyName = selectedCompany
    ? companies.find(c => c.id === selectedCompany)?.label || '全部公司'
    : '全部公司';

  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 z-40">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight text-xl">
              Operation Risk <span className="text-blue-600">Contagion Map</span>
            </h1>
            <p className="text-[10px] bento-header -mt-0.5 opacity-60">Ping An Group Risk Radar V1.0</p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button className="px-5 py-2 bg-white shadow-sm rounded-lg text-xs font-bold text-slate-800 flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-blue-500" />
            DASHBOARD
          </button>
          <button className="px-5 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold tracking-wider">
            REPORTS
          </button>
          <button className="px-5 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold tracking-wider">
            AI RULES
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Input */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl text-slate-500 border border-slate-200 shadow-inner focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search className="w-4 h-4" />
          <input
            type="text"
            placeholder="搜索流程..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-transparent border-none outline-none text-xs font-bold w-48 placeholder:text-slate-400"
            aria-label="搜索流程"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="hover:bg-slate-200 rounded-full p-0.5 transition-colors"
              aria-label="清除搜索"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 mx-1" />

        {/* Company Filter Dropdown */}
        <div ref={companyRef} className="relative">
          <button
            onClick={() => setIsCompanyOpen(!isCompanyOpen)}
            className="flex items-center gap-3 bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md transition-all min-w-[120px]"
            aria-expanded={isCompanyOpen}
            aria-haspopup="listbox"
          >
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">{selectedCompanyName}</span>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isCompanyOpen && "rotate-180")} />
          </button>

          {isCompanyOpen && (
            <div
              className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50"
              role="listbox"
            >
              <button
                onClick={() => {
                  onCompanyChange(null);
                  setIsCompanyOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 transition-colors",
                  selectedCompany === null ? "text-blue-600 bg-blue-50" : "text-slate-700"
                )}
                role="option"
                aria-selected={selectedCompany === null}
              >
                全部公司
              </button>
              {companies.map(company => (
                <button
                  key={company.id}
                  onClick={() => {
                    onCompanyChange(company.id);
                    setIsCompanyOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-between",
                    selectedCompany === company.id ? "text-blue-600 bg-blue-50" : "text-slate-700"
                  )}
                  role="option"
                  aria-selected={selectedCompany === company.id}
                >
                  <span>{company.label}</span>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    company.status === 'Alert' ? "bg-risk-red" :
                    company.status === 'Warning' ? "bg-risk-orange" : "bg-risk-green"
                  )} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Period Filter Dropdown */}
        <div ref={periodRef} className="relative">
          <button
            onClick={() => setIsPeriodOpen(!isPeriodOpen)}
            className="flex items-center gap-3 bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md transition-all"
            aria-expanded={isPeriodOpen}
            aria-haspopup="listbox"
          >
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">{selectedPeriod}</span>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isPeriodOpen && "rotate-180")} />
          </button>

          {isPeriodOpen && (
            <div
              className="absolute top-full left-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50"
              role="listbox"
            >
              {PERIODS.map(period => (
                <button
                  key={period}
                  onClick={() => {
                    onPeriodChange(period);
                    setIsPeriodOpen(false);
                  }}
                  className={cn(
                    "w-full px-4 py-2 text-left text-xs font-bold hover:bg-slate-50 transition-colors",
                    selectedPeriod === period ? "text-blue-600 bg-blue-50" : "text-slate-700"
                  )}
                  role="option"
                  aria-selected={selectedPeriod === period}
                >
                  {period}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-2">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-800">CCO 专家</div>
            <div className="text-[10px] text-slate-400 font-medium tracking-tighter">集团风险管理部</div>
          </div>
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm ring-1 ring-slate-100">
            <User className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
};
