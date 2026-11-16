import React, { useMemo } from 'react';

const ConfidenceBar = ({ decision }) => {
  const confidence = useMemo(
    () => Math.max(0, Math.min(100, Math.round((decision?.confidence ?? 0) * 100))),
    [decision],
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Confidence
        </p>
        <span className="text-sm font-bold text-slate-800">{confidence}%</span>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${confidence}%` }}
        />
      </div>
    </section>
  );
};

export default ConfidenceBar;
