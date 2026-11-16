import React, { useEffect, useRef } from 'react';

/* ─── Animated score ring ─────────────────────────────────────────────── */
const ScoreRing = ({ score }) => {
  const pct = Math.round((score ?? 0) * 100);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const color =
    pct >= 80 ? '#10b981'   // emerald
    : pct >= 50 ? '#f59e0b' // amber
    : '#ef4444';             // red

  const label =
    pct >= 80 ? 'Excellent'
    : pct >= 60 ? 'Good'
    : pct >= 40 ? 'Keep Practising'
    : 'Review Needed';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="64" cy="64" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1.2s ease-out, stroke 0.4s' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-slate-900" style={{ color }}>{pct}%</span>
          <span className="text-xs font-medium text-slate-500 mt-0.5">Score</span>
        </div>
      </div>
      <p className="text-base font-bold" style={{ color }}>{label}</p>
    </div>
  );
};

/* ─── Stat card ───────────────────────────────────────────────────────── */
const StatCard = ({ label, value, hint, color = 'indigo' }) => {
  const colorMap = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    violet: 'bg-violet-50 text-violet-700 border-violet-100',
  };
  return (
    <div className={`rounded-2xl border px-5 py-4 ${colorMap[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
      {hint && <p className="mt-0.5 text-xs opacity-70">{hint}</p>}
    </div>
  );
};

/* ─── Adaptation timeline item ────────────────────────────────────────── */
const ACTION_LABELS = {
  switch_to_audio:  { emoji: '🎧', label: 'Switched to Audio',   reason: 'You showed signs of fatigue (frequent pauses).' },
  switch_to_visual: { emoji: '🖼️', label: 'Switched to Visual',  reason: 'You revisited content multiple times (confusion signal).' },
  simplify_chunk:   { emoji: '📋', label: 'Simplified Content',   reason: 'Your quiz performance indicated knowledge gaps.' },
  reduce_pace:      { emoji: '🐢', label: 'Reduced Pace',         reason: 'Overall engagement was dropping.' },
  maintain:         { emoji: '✅', label: 'Maintained Delivery',  reason: 'Your engagement was strong — no change needed.' },
  default:          { emoji: '📄', label: 'Default Delivery',     reason: 'Session began with standard text content.' },
};

const AdaptationItem = ({ action, index }) => {
  const cfg = ACTION_LABELS[action] ?? ACTION_LABELS.default;
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-base">
          {cfg.emoji}
        </div>
        {index > 0 && <div className="mt-1 h-full w-0.5 bg-indigo-100" />}
      </div>
      <div className="pb-4">
        <p className="text-sm font-semibold text-slate-800">{cfg.label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{cfg.reason}</p>
      </div>
    </div>
  );
};

/* ─── Weak concepts ───────────────────────────────────────────────────── */
const WeakConceptBadge = ({ concept }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700">
    <span>⚡</span>
    {String(concept).replace(/_/g, ' ')}
  </span>
);

/* ─── Main component ─────────────────────────────────────────────────── */
const SessionResults = ({ quizResult, report, adaptationHistory, weakConcepts, topicTitle, onTryAgain, onNewTopic }) => {
  const score = quizResult?.score ?? 0;
  const nextDiff = quizResult?.difficulty_next ?? 'easy';
  const feedback = quizResult?.feedback ?? '';
  const engagement = report?.engagement_score ?? null;
  const effectiveness = report?.learning_effectiveness ?? null;

  // Deduplicate adaptation history, strip trailing 'maintain'
  const cleanHistory = [...new Set(adaptationHistory)]
    .filter((a, i, arr) => !(a === 'maintain' && i === arr.length - 1 && arr.length > 1));

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">Session Complete</p>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{topicTitle}</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">{feedback}</p>
      </div>

      {/* Score ring + stats */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 space-y-6">
        <ScoreRing score={score} />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Quiz Score" value={`${Math.round(score * 100)}%`} hint={`Next: ${nextDiff}`} color="indigo" />
          {engagement !== null && (
            <StatCard label="Engagement" value={`${Math.round(engagement * 100)}%`} hint="Interaction quality" color="emerald" />
          )}
          {effectiveness !== null && (
            <StatCard label="Effectiveness" value={`${Math.round(effectiveness * 100)}%`} hint="Combined score" color="violet" />
          )}
        </div>
      </div>

      {/* Adaptation timeline */}
      {cleanHistory.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-5">How the engine adapted for you</h3>
          <div className="space-y-0">
            {[...cleanHistory].reverse().map((action, i) => (
              <AdaptationItem key={`${action}-${i}`} action={action} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Weak concepts */}
      {weakConcepts?.length > 0 && (
        <div className="rounded-3xl border border-rose-100 bg-rose-50 p-6">
          <h3 className="text-sm font-bold text-rose-800 mb-3">Concepts to revisit</h3>
          <div className="flex flex-wrap gap-2">
            {weakConcepts.map((c) => (
              <WeakConceptBadge key={c} concept={c} />
            ))}
          </div>
          <p className="mt-3 text-xs text-rose-600">Try the topic again — the engine will focus on these areas.</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onTryAgain}
          className="w-full sm:w-auto rounded-2xl border border-indigo-200 bg-indigo-50 px-6 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
        >
          🔄 Try Again
        </button>
        <button
          type="button"
          onClick={onNewTopic}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-indigo-300"
        >
          Choose New Topic →
        </button>
      </div>
    </div>
  );
};

export default SessionResults;
