import React from 'react';

const QuizImpact = ({ quiz, context, decision }) => {
  if (!quiz) {
    return (
      <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">📊</span>
          <h2 className="text-lg font-bold text-amber-900">Learning Feedback</h2>
        </div>
        <div className="flex items-center justify-center py-4 border-2 border-dashed border-amber-200/50 rounded-xl">
          <p className="text-sm text-amber-600/70 italic">Waiting for quiz results...</p>
        </div>
      </section>
    );
  }

  const score = Number(quiz.score || 0);
  const weakConcept = quiz.weak_concept || quiz.weakConcept;
  const actionText = (decision?.action || 'maintain').replace(/_/g, ' ');

  let message;
  let toneClass = "text-amber-800";

  if (score < 0.5) {
    message = weakConcept ? (
      <span>
        Low score detected in <strong className="font-semibold text-amber-900">"{weakConcept}"</strong>.
      </span>
    ) : (
      "Low performance detected."
    );
    toneClass = "text-red-700 font-semibold";
  } else if (score >= 0.8) {
    message = "Strong understanding detected.";
    toneClass = "text-emerald-700 font-semibold";
  } else {
    message = "Stable performance detected.";
  }

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">📊</span>
        <h2 className="text-lg font-bold text-amber-900">Learning Feedback</h2>
      </div>

      <p className="text-xs text-amber-600 mb-3">
        The system adjusts content difficulty based on learning performance.
      </p>

      <div className="space-y-2 text-sm text-amber-800">
        <p className={toneClass}>{message}</p>
        <p>The system responded by applying {actionText}.</p>
        
        <div className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-md w-fit mt-1">
          Score: {Math.round(score * 100)}%
        </div>
      </div>
    </section>
  );
};

export default QuizImpact;
