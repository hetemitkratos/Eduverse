import React from 'react';

const STATUS_ITEMS = [
  '🟢 System Active',
  '🧠 Adaptive Engine Running',
  '📊 Learning Mode ON',
];

const SystemStatus = () => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
      System Status
    </p>

    <div className="mt-4 space-y-3">
      {STATUS_ITEMS.map((item) => (
        <div
          key={item}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
        >
          {item}
        </div>
      ))}
    </div>
  </section>
);

export default SystemStatus;
