import React, { useEffect, useState } from 'react';
import { getActionMetrics } from '../services/api';

const LearningPanel = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getActionMetrics();
        const dataArray = Array.isArray(data) ? data : [];
        setMetrics(dataArray);
      } catch (error) {
        console.error('Failed to fetch action metrics:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000); // Poll to keep live
    return () => clearInterval(interval);
  }, []);

  if (loading || !metrics || metrics.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🧠</span>
          <h2 className="text-lg font-bold text-slate-900">System Learning</h2>
        </div>
        <div className="flex items-center justify-center py-6 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50">
          <p className="text-sm text-slate-400 italic">System initializing learning metrics...</p>
        </div>
      </section>
    );
  }

  const formatAction = (name) => {
    return (name || 'Unknown')
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const bestAction = metrics.reduce((best, current) => {
    const currentReward = Number(current.avg_reward || 0);
    const bestReward = Number(best.avg_reward || 0);
    return currentReward > bestReward ? current : best;
  }, metrics[0]);

  const sortedMetrics = [...metrics].sort(
    (a, b) => (b.avg_reward || 0) - (a.avg_reward || 0)
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">🧠</span>
        <h2 className="text-lg font-bold text-slate-900">System Learning</h2>
      </div>
      
      <p className="text-xs text-slate-500 mb-3">
        The system tracks which adaptations improve learning and prioritizes them over time.
      </p>
      
      <div className="flex flex-col gap-3">
        {sortedMetrics.map((metric, idx) => {
          const successRate = metric.total_attempts > 0 
            ? Math.round((metric.success_count / metric.total_attempts) * 100) 
            : 0;
            
          const isBest = bestAction && metric.action_name === bestAction.action_name && Number(metric.avg_reward || 0) > 0;
          
          const reward = Number(metric.avg_reward || 0);
          const trendColor =
            reward > 0.5 ? "text-emerald-600" :
            reward < 0.3 ? "text-red-500" :
            "text-slate-500";
            
          return (
            <div 
              key={idx} 
              className={`flex items-center justify-between p-3 rounded-xl border ${
                isBest ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-100 bg-slate-50'
              }`}
            >
              <div>
                <p className={`font-semibold ${isBest ? 'text-emerald-800' : 'text-slate-700'}`}>
                  {formatAction(metric.action_name)}
                  {isBest && <span className="ml-2 text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wide">Best</span>}
                </p>
                <p className={`text-xs mt-1 font-medium ${trendColor}`}>
                  Avg Reward: {reward.toFixed(2)}
                </p>
                {metric.total_attempts < 5 && (
                  <p className="text-[10px] text-amber-500 mt-1">
                    Limited data
                  </p>
                )}
              </div>
              
              <div className={`text-sm font-bold ${isBest ? 'text-emerald-700' : 'text-slate-600'}`}>
                {successRate}% success
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LearningPanel;
