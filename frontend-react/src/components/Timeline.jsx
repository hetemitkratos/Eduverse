import React, { useState } from 'react';

const formatReward = (value) => {
  const numericValue = Number(value ?? 0);
  const sign = numericValue > 0 ? '+' : '';

  return `${sign}${numericValue.toFixed(2)}`;
};

const TimelineItem = ({ item, isExpanded, onToggle }) => (
  <article className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-300">
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-start justify-between gap-4 text-left"
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">{item.action}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
          {item.timestamp}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
            item.reward >= 0
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          Reward {formatReward(item.reward)}
        </span>
        <span className="text-sm font-semibold text-slate-400">
          {isExpanded ? '−' : '+'}
        </span>
      </div>
    </button>

    {isExpanded && (
      <div className="mt-4 grid gap-4 border-t border-slate-200 pt-4 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-xl bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Context
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(item.context).map(([key, value]) => (
              <span
                key={key}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {key}: {String(value)}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Reasoning
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{item.reason}</p>
        </div>
      </div>
    )}
  </article>
);

const Timeline = ({ items }) => {
  const [expandedId, setExpandedId] = useState(items[0]?.id ?? null);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Timeline
        </p>
        <h2 className="mt-2 text-lg font-bold text-slate-900">
          Decision history
        </h2>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <TimelineItem
            key={item.id}
            item={item}
            isExpanded={expandedId === item.id}
            onToggle={() =>
              setExpandedId((current) => (current === item.id ? null : item.id))
            }
          />
        ))}
      </div>
    </section>
  );
};

export default Timeline;
