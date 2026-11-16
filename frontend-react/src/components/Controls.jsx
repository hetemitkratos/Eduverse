import React from 'react';
import { Play, RefreshCcw, RotateCcw, Database } from 'lucide-react';

const Controls = ({
  learnerIdInput,
  setLearnerIdInput,
  activeSessionId,
  liveStatus,
  isSimulating,
  simStep,
  simTotal,
  onRunDemo,
  onRefreshDecision,
  onReset,
  onViewState,
}) => {
  const statusLabel = activeSessionId
    ? `Session ${activeSessionId}`
    : 'Demo Not Started';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="rounded-full bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
        Topic: Photosynthesis
      </span>

      <input
        type="text"
        value={learnerIdInput}
        onChange={(event) => setLearnerIdInput(event.target.value)}
        placeholder="Learner ID"
        className="w-40 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-blue-500"
      />

      <button
        type="button"
        onClick={onRunDemo}
        disabled={isSimulating}
        className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Play size={16} />
        <span>{isSimulating ? `Simulating ${simStep}/${simTotal}` : 'Run Demo'}</span>
      </button>

      <button
        type="button"
        onClick={onRefreshDecision}
        disabled={!activeSessionId || isSimulating}
        className="flex items-center gap-2 rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <RefreshCcw size={16} />
        <span>Check Decision</span>
      </button>

      <button
        type="button"
        onClick={onViewState}
        disabled={!activeSessionId}
        className="flex items-center gap-2 rounded-md bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Database size={16} />
        <span>System State</span>
      </button>

      <button
        type="button"
        onClick={onReset}
        disabled={isSimulating}
        className="flex items-center gap-2 rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
      >
        <RotateCcw size={16} />
        <span>Reset</span>
      </button>

      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
          liveStatus === 'error'
            ? 'bg-red-100 text-red-700'
            : liveStatus === 'loading'
              ? 'bg-amber-100 text-amber-700'
              : liveStatus === 'live'
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-600'
        }`}
      >
        {statusLabel}
      </span>
    </div>
  );
};

export default Controls;
