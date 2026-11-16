import React, { useMemo } from 'react';

const formatPercent = (value) => `${Math.round((value ?? 0) * 100)}%`;
const formatDelta = (value) => {
  const numericValue = Number(value ?? 0);
  const sign = numericValue > 0 ? '+' : '';
  return `${sign}${Math.round(numericValue * 100)}%`;
};
const formatReward = (value) => Number(value ?? 0).toFixed(2);

const DecisionPanel = ({ decision, metrics }) => {
  const signature = useMemo(
    () =>
      JSON.stringify({
        action: decision?.action ?? '',
        confidence: decision?.confidence ?? 0,
        intensity: decision?.intensity ?? 0,
        strategy: decision?.strategy ?? '',
        reason: decision?.reason ?? '',
      }),
    [decision],
  );

  return (
    <article
      key={signature}
      className="rounded-2xl border border-blue-200 bg-white p-5 shadow-[0_0_0_4px_rgba(59,130,246,0.08)] transition-all duration-500 motion-safe:animate-[pulse_0.9s_ease-out_1]"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Live Decision
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">
            {decision.action}
          </h2>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
          {formatPercent(decision.confidence)}
        </span>
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Intensity
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-800">
            {decision.intensity}
          </dd>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Strategy
          </dt>
          <dd className="mt-1 text-base font-semibold capitalize text-slate-800">
            {decision.strategy}
          </dd>
        </div>
      </dl>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Reason
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{decision.reason}</p>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Result of Last Action
        </p>
        <div className="mt-3 grid gap-2 text-sm font-semibold sm:grid-cols-3">
          <span className={Number(metrics?.engagementDelta ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-700'}>
            {formatDelta(metrics?.engagementDelta)} Engagement
          </span>
          <span className={Number(metrics?.quizDelta ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-700'}>
            {formatDelta(metrics?.quizDelta)} Quiz
          </span>
          <span className="text-slate-700">Reward: {formatReward(metrics?.reward)}</span>
        </div>
      </div>
    </article>
  );
};

export default DecisionPanel;
