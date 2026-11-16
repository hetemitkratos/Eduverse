import React, { useEffect, useState } from 'react';
import { getActionMetrics } from '../services/api';

const SystemMemory = ({ timeline, decision }) => {
  const [metrics, setMetrics] = useState([]);
  
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getActionMetrics();
        setMetrics(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to fetch action metrics:', e);
      }
    };
    
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!timeline || timeline.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">💾</span>
          <h2 className="text-lg font-bold text-slate-900">System Memory</h2>
        </div>
        <div className="flex items-center justify-center py-6 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
          <p className="text-sm text-slate-400 italic">No adaptation history yet...</p>
        </div>
      </section>
    );
  }

  const totalAdaptations = timeline ? timeline.length : 0;
  
  // Most frequent action based on timeline
  const mostUsedFromTimeline = timeline?.length
    ? Object.entries(
        timeline.reduce((acc, item) => {
          const key = item.action || "unknown";
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1])[0]?.[0]
    : null;

  // Best Mode: find the modality-related action with the highest reward
  const modeMetrics = metrics.filter(m => 
    m.action_name && (m.action_name.includes('audio') || m.action_name.includes('visual') || m.action_name.includes('text'))
  );
  
  const bestModeMetric = modeMetrics.length > 0 
    ? modeMetrics.reduce((best, current) => 
        (Number(current.avg_reward || 0) > Number(best?.avg_reward || 0)) ? current : best
      , modeMetrics[0])
    : null;
  
  const formatName = (name) => {
    if (!name) return 'N/A';
    return name.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const bestModeName = bestModeMetric 
    ? formatName(bestModeMetric.action_name).replace('Switch To ', '') 
    : 'Text (Default)';

  const currentStrategy = decision?.strategy || 'Balanced';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">💾</span>
        <h2 className="text-lg font-bold text-slate-900">System Memory</h2>
      </div>

      <p className="text-xs text-slate-500 mb-3">
        The system tracks past adaptations and learns which strategies work best over time.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Total Adaptations</p>
          <p className="text-slate-900 font-bold text-lg leading-none">{totalAdaptations}</p>
        </div>
        
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Most Used</p>
          <p className="text-slate-900 font-bold text-sm leading-tight truncate">
            {mostUsedFromTimeline ? formatName(mostUsedFromTimeline) : 'N/A'}
          </p>
        </div>
        
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Best Mode</p>
          <p className="text-emerald-700 font-bold text-sm leading-tight truncate">
            {bestModeName}
          </p>
          <p className="text-[10px] text-emerald-500 mt-1">Based on highest reward</p>
        </div>
        
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Strategy</p>
          <p className="text-indigo-700 font-bold text-xs uppercase tracking-wide leading-tight truncate mt-1">
            {currentStrategy}
          </p>
          <p className="text-[10px] text-indigo-500 mt-1">Adaptive policy</p>
        </div>
      </div>
    </section>
  );
};

export default SystemMemory;
