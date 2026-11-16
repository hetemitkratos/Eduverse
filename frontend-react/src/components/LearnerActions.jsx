import React from 'react';

const ACTIONS = [
  {
    id: 'pause',
    label: 'Pause Spike',
    description: 'Simulate fatigue building through slower reading.',
    payload: { eventType: 'pause', eventValue: 0.7 },
  },
  {
    id: 'revisit',
    label: 'Revisit Content',
    description: 'Simulate confusion by revisiting the same section.',
    payload: { eventType: 'revisit', eventValue: 1 },
  },
  {
    id: 'idle',
    label: 'Go Idle',
    description: 'Simulate disengagement with a long idle period.',
    payload: { eventType: 'idle', eventValue: 30 },
  },
];

const LearnerActions = ({ disabled, onTrigger }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        Live Interactions
      </p>
      <h2 className="mt-2 text-lg font-bold text-slate-900">Trigger learner behavior</h2>
    </div>

    <div className="grid gap-3">
      {ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled={disabled}
          onClick={() => onTrigger?.(action.payload)}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <p className="text-sm font-semibold text-slate-800">{action.label}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">{action.description}</p>
        </button>
      ))}
    </div>
  </section>
);

export default LearnerActions;
