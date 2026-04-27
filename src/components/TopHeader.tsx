import React from 'react';
import { LayoutDashboard, Filter, Clock, Search, ShieldCheck, User } from 'lucide-react';

export const TopHeader: React.FC = () => {
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
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200 shadow-inner">
          <Search className="w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search processes..." 
            className="bg-transparent border-none outline-none text-xs font-bold w-48 placeholder:text-slate-400"
          />
        </div>

        <div className="h-8 w-px bg-slate-200 mx-1" />

        <div className="flex items-center gap-3 bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-all">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">平安银行</span>
          <Clock className="w-4 h-4 text-slate-400 ml-2" />
          <span className="text-xs font-bold text-slate-700">2026 Q2</span>
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
