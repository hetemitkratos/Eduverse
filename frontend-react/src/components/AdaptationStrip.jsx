import React, { useMemo } from 'react';

const formatAction = (value) =>
  String(value ?? 'maintain')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const AdaptationStrip = ({ timeline }) => {
  const actions = useMemo(
    () => (Array.isArray(timeline) ? timeline.slice(0, 5).map((item) => formatAction(item.action)) : []),
    [timeline],
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        Adaptation History
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700">
        {actions.length > 0 ? (
          actions.map((action, index) => (
            <React.Fragment key={`${action}-${index}`}>
              <span className="rounded-full bg-slate-100 px-3 py-1">{action}</span>
              {index < actions.length - 1 && <span className="text-slate-400">→</span>}
            </React.Fragment>
          ))
        ) : (
          <span className="text-slate-500">No adaptations yet.</span>
        )}
      </div>
    </section>
  );
};

export default AdaptationStrip;
