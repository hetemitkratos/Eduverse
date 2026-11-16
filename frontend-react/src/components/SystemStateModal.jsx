import React from 'react';
import { X } from 'lucide-react';

const Badge = ({ label, value, color = 'slate' }) => (
  <div className={`rounded-xl border border-${color}-200 bg-${color}-50 px-4 py-3`}>
    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className={`mt-1 text-sm font-bold text-${color}-800`}>
      {typeof value === 'number' ? value.toFixed(3) : String(value ?? '—')}
    </p>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-slate-500 border-b border-slate-200 pb-2">
      {title}
    </h3>
    {children}
  </div>
);

const ContextFlags = ({ context }) => {
  if (!context || Object.keys(context).length === 0) {
    return <p className="text-sm text-slate-400">No context computed yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(context).map(([key, val]) => {
        if (key === 'weak_concepts' && Array.isArray(val)) {
          return val.length > 0 ? (
            <span key={key} className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
              weak: {val.join(', ')}
            </span>
          ) : null;
        }
        const display = typeof val === 'boolean' ? (val ? '✓' : '✗') : String(val);
        const isActive = val === true || (typeof val === 'string' && val !== 'stable' && val !== 'default' && val !== 'text');
        return (
          <span
            key={key}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isActive ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {key}: {display}
          </span>
        );
      })}
    </div>
  );
};

const SystemStateModal = ({ isOpen, onClose, stateData }) => {
  if (!isOpen) return null;

  const state = stateData?.state;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative mx-4 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              System State Inspector
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Session {stateData?.session_id ?? '—'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!state ? (
            <p className="py-12 text-center text-sm text-slate-400">
              No state data available. Start a session first.
            </p>
          ) : (
            <>
              <Section title="Session Identity">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Badge label="Session ID" value={state.session_id} />
                  <Badge label="Strategy Mode" value={state.strategy_mode} />
                  <Badge label="Current Format" value={state.current_format} />
                  <Badge label="Interactions" value={state.interaction_count} />
                  <Badge label="Difficulty" value={state.difficulty_level} />
                </div>
              </Section>

              <Section title="Context Vector">
                <ContextFlags context={state.context} />
              </Section>

              <Section title="Engagement Signals">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Badge label="Pause Rate" value={state.pause_rate} color="amber" />
                  <Badge label="Revisit Count" value={state.revisit_count} color="amber" />
                  <Badge label="Idle Time" value={state.idle_time} color="amber" />
                  <Badge label="Prev Engagement" value={state.previous_engagement_score} color="blue" />
                </div>
                {state.recent_engagement_scores?.length > 0 && (
                  <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
                    <p className="text-[10px] font-semibold uppercase text-slate-400 mb-1">
                      Recent Engagement Scores ({state.recent_engagement_scores.length})
                    </p>
                    <div className="flex gap-1">
                      {state.recent_engagement_scores.map((s, i) => (
                        <div key={i} className="flex-1">
                          <div className="h-10 rounded bg-blue-200 relative">
                            <div
                              className="absolute bottom-0 left-0 right-0 rounded bg-blue-500"
                              style={{ height: `${Math.min(100, Math.round(s * 100))}%` }}
                            />
                          </div>
                          <p className="text-center text-[9px] mt-0.5 text-slate-400">{s.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Section>

              <Section title="Quiz State">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Badge label="Last Quiz Score" value={state.last_quiz_score} color="emerald" />
                  <Badge label="Prev Quiz Score" value={state.previous_quiz_score} color="emerald" />
                  <Badge label="Difficulty" value={state.difficulty_level} color="emerald" />
                </div>
                {state.weak_concepts?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {state.weak_concepts.map((c) => (
                      <span key={c} className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        ⚠ {c}
                      </span>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Reinforcement Learning">
                <div className="grid grid-cols-2 gap-3">
                  <Badge label="Baseline Engagement" value={state.baseline_engagement_score} color="violet" />
                  <Badge label="Recent Rewards" value={state.recent_rewards?.length ?? 0} color="violet" />
                </div>
                {state.recent_rewards?.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {state.recent_rewards.map((r, i) => (
                      <span key={i} className="rounded bg-violet-100 px-2 py-1 text-xs font-mono text-violet-700">
                        r{i}: {r.toFixed(4)}
                      </span>
                    ))}
                  </div>
                )}
              </Section>

              <Section title="Recent Decisions">
                {state.recent_decisions?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {state.recent_decisions.map((d, i) => (
                      <span key={i} className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                        {d}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No decisions recorded yet.</p>
                )}
              </Section>

              <Section title="Context History">
                <div className="max-h-[160px] overflow-y-auto rounded-xl bg-slate-50 border border-slate-100 p-3">
                  {state.context_history?.length > 0 ? (
                    state.context_history.map((ctx, i) => (
                      <div key={i} className="mb-2 text-[11px] font-mono text-slate-600 border-b border-slate-100 pb-1 last:border-0">
                        <span className="text-slate-400">[{i}]</span>{' '}
                        {Object.entries(ctx)
                          .filter(([, v]) => v === true || (typeof v === 'string' && v !== 'stable' && v !== 'default'))
                          .map(([k, v]) => `${k}=${String(v)}`)
                          .join(', ') || 'default context'}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">Empty.</p>
                  )}
                </div>
              </Section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemStateModal;
