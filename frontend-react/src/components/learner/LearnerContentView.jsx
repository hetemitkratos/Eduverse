import React, { useEffect, useRef, useState } from 'react';

/* ─── Mode badge ─────────────────────────────────────────────────────── */
const MODE_CONFIG = {
  'Text Mode':   { color: 'bg-slate-100 text-slate-700',     icon: '📄' },
  'Audio Mode':  { color: 'bg-purple-100 text-purple-700',   icon: '🎧' },
  'Visual Mode': { color: 'bg-teal-100 text-teal-700',       icon: '🖼️' },
  'Hybrid Mode': { color: 'bg-orange-100 text-orange-700',   icon: '🔀' },
};

const ModeBadge = ({ mode }) => {
  const cfg = MODE_CONFIG[mode] ?? MODE_CONFIG['Text Mode'];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.color}`}>
      <span>{cfg.icon}</span>
      {mode}
    </span>
  );
};

/* ─── Chunked content renderer ────────────────────────────────────────── */
const ChunkedContent = ({ chunks }) => (
  <ol className="space-y-3 list-none m-0 p-0">
    {chunks.map((chunk, i) => (
      <li key={i} className="flex gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
          {i + 1}
        </span>
        <p className="text-[15px] leading-relaxed text-slate-700">{chunk}</p>
      </li>
    ))}
  </ol>
);

/* ─── Visual content renderer ─────────────────────────────────────────── */
const VisualContent = ({ content }) => (
  <div className="space-y-4">
    {content?.text && (
      <p className="text-[15px] leading-relaxed text-slate-700">{content.text}</p>
    )}
    {content?.diagram && (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="font-mono text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">{content.diagram}</p>
      </div>
    )}
  </div>
);

/* ─── Interaction buttons ─────────────────────────────────────────────── */
const BUTTONS = [
  { id: 'understood', label: '✅ I understood this', sub: 'Mark progress', type: 'progress', eventType: 'pause', eventValue: 0.05 },
  { id: 'confused',   label: '🔁 Read it again',     sub: 'Revisit content', type: 'revisit', eventType: 'revisit', eventValue: 1 },
  { id: 'pause',      label: '⏸ Need a break',      sub: 'Pause signal', type: 'pause', eventType: 'pause', eventValue: 0.8 },
];

/* ─── Main component ─────────────────────────────────────────────────── */
const LearnerContentView = ({
  content,
  topic,
  interactionCount,
  progress,
  isAdapting,
  adaptationToast,
  disabled,
  onInteract,
  onContinueToQuiz,
}) => {
  const contentRef = useRef(null);
  const [prevMode, setPrevMode] = useState(null);
  const [modeChanged, setModeChanged] = useState(false);

  const mode = content?.mode ?? 'Text Mode';
  const body = content?.body;
  const title = content?.title ?? topic?.title ?? 'Learning Content';

  // Detect mode changes for highlight animation
  useEffect(() => {
    if (prevMode && prevMode !== mode) {
      setModeChanged(true);
      setTimeout(() => setModeChanged(false), 2000);
    }
    setPrevMode(mode);
  }, [mode]);

  // Scroll to top when content changes
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [body]);

  const canProceed = progress >= 60;

  return (
    <div className="space-y-5">
      {/* Progress + Step label */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-widest text-indigo-500">Step 2 of 3 — Learn</span>
          <span>{progress}% explored</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Adaptation toast */}
      <div
        className={`overflow-hidden rounded-2xl border transition-all duration-500 ${
          adaptationToast
            ? 'max-h-20 border-indigo-200 bg-indigo-50 opacity-100'
            : 'max-h-0 border-transparent opacity-0'
        }`}
      >
        <div className="flex items-center gap-2 px-4 py-3">
          <span className="text-base">🧠</span>
          <p className="text-sm font-medium text-indigo-700">
            We've adjusted how this content is delivered to better suit your learning.
          </p>
        </div>
      </div>

      {/* Content card */}
      <div
        className={`rounded-3xl border bg-white shadow-sm transition-all duration-300 ${
          modeChanged ? 'ring-2 ring-indigo-300' : 'border-slate-200'
        }`}
      >
        {/* Card header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {topic?.description ?? 'Adaptive learning content'}
            </p>
          </div>
          <div className="shrink-0 pt-0.5">
            <ModeBadge mode={mode} />
          </div>
        </div>

        {/* Thinking overlay */}
        {isAdapting && (
          <div className="flex items-center gap-3 border-b border-indigo-100 bg-indigo-50 px-6 py-3">
            <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            <p className="text-xs font-medium text-indigo-600">Adaptive engine is analyzing your progress…</p>
          </div>
        )}

        {/* Content body */}
        <div ref={contentRef} className="max-h-[440px] overflow-y-auto px-6 py-5">
          {!body ? (
            <p className="text-sm text-slate-400 italic">Loading content…</p>
          ) : Array.isArray(body) ? (
            <ChunkedContent chunks={body} />
          ) : typeof body === 'object' && body !== null ? (
            <VisualContent content={body} />
          ) : (
            <p className="text-[15px] leading-relaxed text-slate-700 whitespace-pre-wrap">{body}</p>
          )}
        </div>
      </div>

      {/* Interaction buttons */}
      <div className="grid grid-cols-3 gap-3">
        {BUTTONS.map((btn) => (
          <button
            key={btn.id}
            type="button"
            disabled={disabled || isAdapting}
            onClick={() => onInteract({ eventType: btn.eventType, eventValue: btn.eventValue })}
            className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-sm font-semibold text-slate-800">{btn.label}</span>
            <span className="text-xs text-slate-400">{btn.sub}</span>
          </button>
        ))}
      </div>

      {/* Interaction counter hint */}
      {interactionCount > 0 && !canProceed && (
        <p className="text-center text-xs text-slate-400">
          Interact a bit more to unlock the quiz — <span className="font-medium">{interactionCount} interaction{interactionCount !== 1 ? 's' : ''}</span> logged so far.
        </p>
      )}

      {/* Proceed to quiz */}
      {canProceed && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={onContinueToQuiz}
            disabled={isAdapting}
            className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:shadow-indigo-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Take the Quiz
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default LearnerContentView;
