import React, { useMemo } from 'react';

const ACTION_MAP = {
  simplify: 'simplified the content',
  simplify_chunk: 'simplified the content',
  chunk: 'broke content into smaller steps',
  reduce_pace: 'broke content into smaller steps',
  switch_to_audio: 'switched to audio mode',
  switch_to_visual: 'used visual explanations',
};

const generateExplanation = (decision, context) => {
  const reasons = [];

  // Map context flags to deterministic learner-facing reason phrases.
  if (context?.fatigue) reasons.push('you showed signs of fatigue');
  if (context?.confusion) reasons.push('you revisited content multiple times');
  if (context?.low_learning) reasons.push('your quiz performance dropped');

  const actionPhrase =
    ACTION_MAP[decision?.action] ??
    ACTION_MAP[String(decision?.action || '').split(',')[0]] ??
    'adjusted the content';

  if (!reasons.length) {
    return 'The system adjusted content to maintain optimal learning flow.';
  }

  return `The system ${actionPhrase} because ${reasons.join(' and ')}.`;
};

const formatPercent = (value) => `${Math.round((value ?? 0) * 100)}%`;

const ExplanationPanel = ({ decision, context }) => {
  const explanation = useMemo(
    () => generateExplanation(decision, context),
    [decision, context],
  );

  const signature = useMemo(
    () =>
      JSON.stringify({
        action: decision?.action ?? '',
        confidence: decision?.confidence ?? 0,
        strategy: decision?.strategy ?? '',
        fatigue: context?.fatigue ?? false,
        confusion: context?.confusion ?? false,
        low_learning: context?.low_learning ?? false,
      }),
    [decision, context],
  );

  return (
    <section
      key={signature}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-500 motion-safe:animate-[fadeIn_0.4s_ease-out]"
    >
      <p className="text-lg font-bold text-slate-900">🧠 Why this change?</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{explanation}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Confidence
          </p>
          <p className="mt-1 text-base font-semibold text-slate-800">
            {formatPercent(decision?.confidence)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Strategy
          </p>
          <p className="mt-1 text-base font-semibold capitalize text-slate-800">
            {decision?.strategy ?? 'Unknown'}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ExplanationPanel;
