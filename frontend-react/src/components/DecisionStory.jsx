import React, { useMemo } from 'react';

const ACTION_PHRASES = {
  simplify: 'simplified the content',
  simplify_chunk: 'simplified the content and broke it into smaller steps',
  chunk: 'broke the content into smaller steps',
  switch_to_audio: 'switched the lesson to audio mode',
  switch_to_visual: 'used visual explanations',
  maintain: 'kept the current learning format',
};

const formatDelta = (value, label) => {
  const numericValue = Math.round(Number(value ?? 0) * 100);

  if (numericValue === 0) {
    return `${label} steady`;
  }

  return `${label} ${numericValue > 0 ? 'improved' : 'dropped'} by ${Math.abs(numericValue)}%`;
};

const buildStory = (decision, context, metrics) => {
  const reasons = [];

  if (context?.fatigue) reasons.push('fatigue');
  if (context?.confusion) reasons.push('confusion');
  if (context?.low_learning) reasons.push('low learning');

  const opening =
    reasons.length > 0
      ? `You showed signs of ${reasons.join(' and ')}.`
      : 'The system detected a shift in your learning flow.';
  const action = ACTION_PHRASES[decision?.action] ?? 'adjusted the learning experience';
  const impact = formatDelta(metrics?.engagementDelta, 'engagement');

  return `${opening} The system ${action}. This ${impact}.`;
};

const DecisionStory = ({ decision, context, metrics }) => {
  const story = useMemo(
    () => buildStory(decision, context, metrics),
    [context, decision, metrics],
  );

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-600">
        Decision Story
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-700">{story}</p>
    </section>
  );
};

export default DecisionStory;
