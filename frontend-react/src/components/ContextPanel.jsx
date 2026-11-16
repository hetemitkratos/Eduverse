import React from 'react';

const STATUS_STYLES = {
  high: 'bg-red-100 text-red-700',
  low: 'bg-emerald-100 text-emerald-700',
  neutral: 'bg-slate-100 text-slate-600',
};

const normalizeLevel = (value) => {
  if (typeof value === 'boolean') {
    return value ? 'high' : 'low';
  }

  if (typeof value === 'string') {
    return value.toLowerCase();
  }

  return 'neutral';
};

const formatLabel = (value) => {
  if (typeof value === 'boolean') {
    return value ? 'HIGH' : 'LOW';
  }

  if (typeof value === 'string') {
    return value.replace(/_/g, ' ').toUpperCase();
  }

  return 'N/A';
};

const ContextChip = ({ label, value }) => {
  const level = normalizeLevel(value);
  const styles = STATUS_STYLES[level] ?? STATUS_STYLES.neutral;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="mt-3">
        <span className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide ${styles}`}>
          {formatLabel(value)}
        </span>
      </div>
    </div>
  );
};

const ContextPanel = ({ context }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        Live Context
      </p>
      <h2 className="mt-2 text-lg font-bold text-slate-900">
        Session state signals
      </h2>
    </div>

    <div className="grid gap-3 sm:grid-cols-2">
      <ContextChip label="Fatigue" value={context.fatigue} />
      <ContextChip label="Confusion" value={context.confusion} />
      <ContextChip label="Learning" value={context.learning} />
      <ContextChip label="Session Phase" value={context.phase} />
      <ContextChip label="Mode" value={context.mode} />
    </div>
  </section>
);

export default ContextPanel;
