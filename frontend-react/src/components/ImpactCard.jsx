import React from 'react';

const formatDelta = (value) => {
  const numericValue = Number(value ?? 0);
  const sign = numericValue > 0 ? '+' : '';

  return `${sign}${numericValue.toFixed(2)}`;
};

const getTone = (value) => {
  const numericValue = Number(value ?? 0);

  if (numericValue > 0) {
    return {
      card: 'border-emerald-200 bg-emerald-50/70',
      text: 'text-emerald-700',
      badge: 'bg-emerald-100 text-emerald-700',
    };
  }

  if (numericValue < 0) {
    return {
      card: 'border-red-200 bg-red-50/70',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-700',
    };
  }

  return {
    card: 'border-slate-200 bg-slate-50',
    text: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-600',
  };
};

const MetricTile = ({ label, value }) => {
  const tone = getTone(value);

  return (
    <div className={`rounded-xl border p-4 ${tone.card}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className={`text-lg font-bold ${tone.text}`}>{formatDelta(value)}</span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${tone.badge}`}>
          {Number(value ?? 0) > 0 ? 'Positive' : Number(value ?? 0) < 0 ? 'Negative' : 'Neutral'}
        </span>
      </div>
    </div>
  );
};

const ImpactCard = ({ metrics }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        Impact
      </p>
      <h2 className="mt-2 text-lg font-bold text-slate-900">
        Latest adaptation effect
      </h2>
    </div>

    <div className="grid gap-3">
      <MetricTile label="Engagement Delta" value={metrics.engagementDelta} />
      <MetricTile label="Quiz Delta" value={metrics.quizDelta} />
      <MetricTile label="Reward" value={metrics.reward} />
    </div>
  </section>
);

export default ImpactCard;
