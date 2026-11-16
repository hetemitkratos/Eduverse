import React from 'react';

const DecisionFlow = ({ context, decision, metrics }) => {
  if (!context || !decision || !metrics) return null;

  // 1. Map Context
  const contextSentences = [];
  if (context.fatigue) contextSentences.push("showed signs of fatigue");
  if (context.confusion) contextSentences.push("revisited content multiple times");
  if (context.low_learning) contextSentences.push("experienced a drop in quiz performance");

  const contextText =
    contextSentences.length === 0
      ? "You interacted normally."
      : "You " +
        (contextSentences.length === 1
          ? contextSentences[0]
          : contextSentences.slice(0, -1).join(", ") +
            " and " +
            contextSentences.slice(-1)) +
        ".";

  // 2. Map Decision
  const actionText = (decision.action || "maintain").replace(/_/g, " ");
  const decisionText = `The system responded by ${actionText}.`;

  const strategyText = decision.strategy
    ? `Strategy: ${decision.strategy}`
    : "";

  // 3. Map Impact
  const delta = Number(metrics.engagementDelta || 0);
  let impactText = "Result: engagement remained stable.";
  let impactClass = "text-slate-700";

  if (delta > 0) {
    impactText = `Result: engagement increased by ${(delta * 100).toFixed(0)}%.`;
    impactClass = "text-emerald-700 font-semibold";
  } else if (delta < 0) {
    impactText = `Result: engagement decreased by ${(Math.abs(delta) * 100).toFixed(0)}%.`;
    impactClass = "text-red-700 font-semibold";
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🧠</span>
        <h2 className="text-lg font-bold text-slate-900">What just happened:</h2>
      </div>
      <div className="space-y-2 text-sm text-slate-700">
        <p>{contextText}</p>
        <p>{decisionText}</p>
        <p className={impactClass}>{impactText}</p>
        {strategyText && (
          <p className="text-xs text-slate-500 uppercase tracking-wide mt-1">{strategyText}</p>
        )}
      </div>
    </section>
  );
};

export default DecisionFlow;
