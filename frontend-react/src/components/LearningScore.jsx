import React, { useMemo } from 'react';

const LearningScore = ({ metrics }) => {
  const score = useMemo(() => {
    const engagement = Number(metrics?.engagement ?? 0);
    const quizScore = Number(metrics?.quiz_score ?? 0);
    return Math.round((0.5 * engagement + 0.5 * quizScore) * 100);
  }, [metrics]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        Learning Score
      </p>
      <p className="mt-2 text-lg font-bold text-slate-900">
        🎯 Learning Score: {score} / 100
      </p>
    </section>
  );
};

export default LearningScore;
