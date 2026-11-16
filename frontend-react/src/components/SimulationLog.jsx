import React, { useEffect, useRef } from 'react';

const STEP_ICONS = {
  start: '🚀',
  interaction: '👆',
  adaptation: '🧠',
  quiz: '📝',
  evaluation: '📊',
  content: '📖',
  error: '❌',
  info: '💡',
  complete: '✅',
};

const STEP_COLORS = {
  start: 'border-blue-300 bg-blue-50',
  interaction: 'border-amber-300 bg-amber-50',
  adaptation: 'border-violet-300 bg-violet-50',
  quiz: 'border-emerald-300 bg-emerald-50',
  evaluation: 'border-cyan-300 bg-cyan-50',
  content: 'border-indigo-300 bg-indigo-50',
  error: 'border-red-300 bg-red-50',
  info: 'border-slate-300 bg-slate-50',
  complete: 'border-green-300 bg-green-50',
};

const SimulationLog = ({ entries = [], currentStep = 0, totalSteps = 0, isRunning = false }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries.length]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Simulation Log
          </p>
          {isRunning && totalSteps > 0 && (
            <p className="mt-1 text-xs text-slate-500">
              Step {currentStep} of {totalSteps}
            </p>
          )}
        </div>
        {isRunning && (
          <span className="flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-violet-500" />
            Running
          </span>
        )}
        {!isRunning && entries.length > 0 && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Complete
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        className="max-h-[320px] overflow-y-auto px-5 py-3 space-y-2 scroll-smooth"
      >
        {entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            Click Run Demo to start the simulation.
          </p>
        ) : (
          entries.map((entry, index) => (
            <div
              key={`${index}-${entry.type}`}
              className={`flex items-start gap-3 rounded-xl border px-4 py-3 transition-all duration-300 ${
                STEP_COLORS[entry.type] ?? STEP_COLORS.info
              } ${index === entries.length - 1 ? 'ring-2 ring-violet-200 ring-offset-1' : ''}`}
            >
              <span className="mt-0.5 text-base leading-none">
                {STEP_ICONS[entry.type] ?? '•'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">{entry.title}</p>
                {entry.detail && (
                  <p className="mt-1 text-xs leading-5 text-slate-600">{entry.detail}</p>
                )}
                <p className="mt-1 text-[10px] font-medium text-slate-400">{entry.time}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {isRunning && totalSteps > 0 && (
        <div className="px-5 pb-4 pt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-700"
              style={{ width: `${Math.round((currentStep / totalSteps) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default SimulationLog;
