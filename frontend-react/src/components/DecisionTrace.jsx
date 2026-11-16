import React from 'react';

export default function DecisionTrace({ decision, context, metrics }) {
  if (!decision || !context || !metrics) {
    return (
      <div className="p-5 border border-slate-200 rounded-xl max-w-[350px] font-sans bg-white shadow-sm">
        <p className="text-sm text-slate-500 italic">No trace available</p>
      </div>
    );
  }

  const { fatigue, confusion, low_learning } = context;
  const { action, strategy, confidence } = decision;
  const { reward } = metrics;

  const activeContexts = [];
  if (fatigue) activeContexts.push({ label: 'Fatigue', type: 'fatigue' });
  if (confusion) activeContexts.push({ label: 'Confusion', type: 'confusion' });
  if (low_learning) activeContexts.push({ label: 'Low Learning', type: 'low_learning' });

  const getTagStyle = (type) => {
    if (type === "fatigue") return "bg-amber-100 text-amber-700";
    if (type === "confusion") return "bg-red-100 text-red-700";
    if (type === "low_learning") return "bg-purple-100 text-purple-700";
    return "bg-slate-100 text-slate-600";
  };

  const baseConfidence = 0.65; // Fixed placeholder estimate
  const rlBoost = (reward * 0.2).toFixed(2);

  return (
    <div className="p-5 border border-slate-200 rounded-xl max-w-[350px] font-sans bg-white shadow-sm">
      <h2 className="text-xl m-0 mb-4 pb-2 border-b-2 border-slate-100">🧠 Decision Trace</h2>
      
      <p className="text-xs text-slate-500 mb-4">
        Primary Agent: Accessibility
      </p>

      <div className="bg-slate-50 p-3 rounded-lg">
        <h3 className="text-[13px] m-0 mb-2 text-slate-600 uppercase tracking-wide">1. Context</h3>
        <div className="flex gap-2 flex-wrap">
          {activeContexts.length > 0 ? activeContexts.map((ctx, i) => (
            <span key={i} className={`px-2 py-1 rounded text-xs font-bold ${getTagStyle(ctx.type)}`}>
              [{ctx.label}]
            </span>
          )) : <span className="text-sm text-slate-500 italic">No critical signals detected</span>}
        </div>
      </div>

      <div className="text-center text-slate-400 text-xs my-1">↓</div>

      <div className="bg-slate-50 p-3 rounded-lg">
        <h3 className="text-[13px] m-0 mb-2 text-slate-600 uppercase tracking-wide">2. Decision</h3>
        <div className="flex justify-between text-sm my-1">
          <strong>Action:</strong> <span>{action}</span>
        </div>
        <div className="flex justify-between text-sm my-1">
          <strong>Strategy:</strong> <span>{strategy}</span>
        </div>
      </div>

      <div className="text-center text-slate-400 text-xs my-1">↓</div>

      <div className="bg-slate-50 p-3 rounded-lg">
        <h3 className="text-[13px] m-0 mb-2 text-slate-600 uppercase tracking-wide">3. Confidence Breakdown</h3>
        <div className="flex justify-between text-sm my-1">
          <span>Base Confidence (Rule-Based):</span> <span>{baseConfidence}</span>
        </div>
        <div className="flex justify-between text-sm my-1">
          <span>Reinforcement Boost:</span> <span className="text-green-700 font-bold">+{rlBoost}</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 mb-2">
          Reinforcement boost based on past successful outcomes.
        </p>
        <div className="flex justify-between text-sm font-bold mt-2 pt-2 border-t border-dashed border-slate-300">
          <span>Final Decision Confidence:</span> 
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded">{Number(confidence).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
