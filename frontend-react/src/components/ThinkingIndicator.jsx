import React, { useEffect, useState } from 'react';

const STEPS = ['🧠 Analyzing...', '⚙️ Evaluating...', '🎯 Adapting...'];

const ThinkingIndicator = ({ active }) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const reset = window.setTimeout(() => setStepIndex(0), 0);
    const first = window.setTimeout(() => setStepIndex(1), 600);
    const second = window.setTimeout(() => setStepIndex(2), 1200);

    return () => {
      window.clearTimeout(reset);
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [active]);

  if (!active) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4 shadow-sm transition-all duration-300 motion-safe:animate-[pulse_1.1s_ease-in-out_infinite]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-500">
        Adaptive Engine
      </p>
      <p className="mt-2 text-sm font-semibold text-blue-900">{STEPS[stepIndex]}</p>
    </section>
  );
};

export default ThinkingIndicator;
