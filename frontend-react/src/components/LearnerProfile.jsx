import React, { useMemo } from 'react';

const getProfile = (context, metrics) => {
  // Deterministic learner profile mapping for demo readability.
  if (context?.fatigue && context?.low_learning) {
    return {
      type: 'Struggling Learner',
      description: 'The learner may need lighter pacing and more guided support right now.',
    };
  }

  if (Number(metrics?.engagement ?? 0) >= 0.75) {
    return {
      type: 'Fast Learner',
      description: 'The learner is engaging well and can likely handle steady progression.',
    };
  }

  return {
    type: 'Balanced Learner',
    description: 'The learner is progressing steadily with a moderate level of support.',
  };
};

const LearnerProfile = ({ context, metrics }) => {
  const profile = useMemo(() => getProfile(context, metrics), [context, metrics]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        Learner Profile
      </p>
      <h2 className="mt-2 text-lg font-bold text-slate-900">{profile.type}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{profile.description}</p>
    </section>
  );
};

export default LearnerProfile;
