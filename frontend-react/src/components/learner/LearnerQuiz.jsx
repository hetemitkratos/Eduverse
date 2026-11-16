import React, { useState } from 'react';

/* ─── Dot progress indicator ──────────────────────────────────────────── */
const QuizDots = ({ total, current }) => (
  <div className="flex items-center gap-2">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-2 transition-all duration-300 rounded-full ${
          i < current
            ? 'w-5 bg-indigo-600'
            : i === current
            ? 'w-5 bg-indigo-300'
            : 'w-2 bg-slate-200'
        }`}
      />
    ))}
  </div>
);

/* ─── Main component ─────────────────────────────────────────────────── */
const LearnerQuiz = ({ quiz, isSubmitting, onSubmit }) => {
  const questions = quiz?.questions ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => new Array(questions.length).fill(''));
  const [showFeedback, setShowFeedback] = useState(false);

  if (!questions.length) {
    return (
      <div className="space-y-4 text-center py-12">
        <p className="text-slate-500 text-sm">No quiz questions found for this topic.</p>
      </div>
    );
  }

  const question = questions[currentIndex];
  const selectedAnswer = answers[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const allAnswered = answers.every((a) => a !== '');

  const handleSelect = (option) => {
    if (isSubmitting) return;
    const next = [...answers];
    next[currentIndex] = option;
    setAnswers(next);
    setShowFeedback(false);
  };

  const handleNext = () => {
    if (!selectedAnswer) {
      setShowFeedback(true);
      return;
    }
    if (isLast) return;
    setCurrentIndex((i) => i + 1);
    setShowFeedback(false);
  };

  const handleBack = () => {
    if (currentIndex === 0) return;
    setCurrentIndex((i) => i - 1);
    setShowFeedback(false);
  };

  const handleSubmit = () => {
    if (!allAnswered) {
      setShowFeedback(true);
      return;
    }
    onSubmit(answers);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">Step 3 of 3 — Quiz</p>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Question {currentIndex + 1} <span className="text-slate-400 font-normal">of {questions.length}</span>
          </h2>
          <QuizDots total={questions.length} current={currentIndex} />
        </div>
        {quiz?.difficulty && (
          <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 capitalize">
            {quiz.difficulty} difficulty
          </span>
        )}
      </div>

      {/* Question card */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
          <p className="text-base font-semibold leading-snug text-white">{question.question}</p>
        </div>

        <div className="p-5 space-y-3">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option;
            return (
              <button
                key={option}
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSelect(option)}
                className={`w-full rounded-2xl border px-4 py-3.5 text-left text-sm font-medium transition-all duration-150 ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-800 shadow-sm ring-1 ring-indigo-300'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700'
                } disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                    isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
                  }`}>
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback hint */}
      {showFeedback && (
        <p className="text-center text-sm text-rose-600 font-medium">
          Please select an answer before continuing.
        </p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentIndex === 0 || isSubmitting}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Back
        </button>

        <div className="flex items-center gap-3">
          {/* Jump dots — clickable */}
          {questions.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setCurrentIndex(i); setShowFeedback(false); }}
              disabled={isSubmitting}
              className={`h-2 rounded-full transition-all duration-200 ${
                i === currentIndex ? 'w-6 bg-indigo-600' : answers[i] ? 'w-3 bg-indigo-300' : 'w-2 bg-slate-200 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>

        {isLast ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !allAnswered}
            className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:shadow-indigo-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Submitting…
              </>
            ) : (
              <>Submit Answers ✓</>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="group flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Next
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default LearnerQuiz;
