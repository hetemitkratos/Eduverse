import React from 'react';

const QuizPanel = ({
  disabled,
  isLoading,
  quiz,
  answers,
  onAnswerChange,
  onSubmit,
  result,
}) => {
  if (!quiz) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Topic Quiz
        </p>
        <p className="mt-3 text-sm text-slate-500">
          Start a live session to load the current quiz for this topic.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Topic Quiz
          </p>
          <h2 className="mt-2 text-lg font-bold text-slate-900">{quiz.topic}</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
          {quiz.difficulty ?? 'mixed'}
        </span>
      </div>

      <div className="space-y-4">
        {quiz.questions.map((question, index) => (
          <div key={`${question.question}-${index}`} className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-800">{question.question}</p>
            <div className="mt-3 grid gap-2">
              {question.options.map((option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  <input
                    type="radio"
                    name={`quiz-${index}`}
                    value={option}
                    checked={answers[index] === option}
                    onChange={() => onAnswerChange(index, option)}
                    disabled={disabled || isLoading}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || isLoading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? 'Submitting...' : 'Submit Quiz'}
        </button>

        {result ? (
          <p className="text-sm text-slate-600">
            Score: <span className="font-semibold text-slate-800">{Math.round((result.score ?? 0) * 100)}%</span>
            {' '}| Next difficulty: <span className="font-semibold text-slate-800">{result.difficulty_next}</span>
          </p>
        ) : null}
      </div>
    </section>
  );
};

export default QuizPanel;
