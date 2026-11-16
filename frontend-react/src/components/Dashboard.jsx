import React from 'react';

const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wider">Telemetry & Intelligence</h2>
        <span className="flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Strategy</span>
          <span className="text-xl font-bold text-blue-600">Balanced</span>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">Confidence</span>
          <span className="text-xl font-bold text-slate-700">82%</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">Decision Matrix</h3>
        <div className="p-3 bg-slate-50 rounded-lg text-sm font-medium text-slate-600 font-mono">
          <span className="text-blue-500">&gt;</span> Action: <strong>Simplify + Audio</strong><br />
          <span className="text-blue-500">&gt;</span> Intensity: <span className="text-emerald-500">0.7</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 min-h-[200px] flex items-center justify-center">
        <span className="text-slate-400 text-sm">[ Charts Placeholder ]</span>
      </div>
      
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 min-h-[200px] flex items-center justify-center">
        <span className="text-slate-400 text-sm">[ Timeline Placeholder ]</span>
      </div>
      
    </div>
  );
};

export default Dashboard;
