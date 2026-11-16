import React, { useEffect, useState } from 'react';

const DEMO_STATES = [
  {
    decision: { action: 'simplify_chunk', confidence: 0.82, intensity: 0.7, strategy: 'balanced', reason: 'Fatigue increased.' },
    context: { fatigue: true, confusion: false, low_learning: true, phase: 'mid', mode: 'text' },
    metrics: { engagement: 0.62, quiz_score: 0.44, reward: 0.18 },
  },
  {
    decision: { action: 'switch_to_visual', confidence: 0.88, intensity: 0.64, strategy: 'balanced', reason: 'Confusion remained high.' },
    context: { fatigue: false, confusion: true, low_learning: true, phase: 'mid', mode: 'visual' },
    metrics: { engagement: 0.71, quiz_score: 0.56, reward: 0.24 },
  },
  {
    decision: { action: 'switch_to_audio', confidence: 0.85, intensity: 0.6, strategy: 'conservative', reason: 'Late-session fatigue detected.' },
    context: { fatigue: true, confusion: false, low_learning: false, phase: 'late', mode: 'audio' },
    metrics: { engagement: 0.76, quiz_score: 0.68, reward: 0.27 },
  },
];

const DemoController = ({ onUpdate }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setIndex((current) => {
        const next = (current + 1) % DEMO_STATES.length;
        onUpdate?.(DEMO_STATES[next]);
        return next;
      });
    }, 2500);

    return () => window.clearInterval(intervalId);
  }, [isRunning, onUpdate]);

  const handleRunDemo = () => {
    onUpdate?.(DEMO_STATES[index]);
    setIsRunning(true);
  };

  return (
    <button
      type="button"
      onClick={handleRunDemo}
      className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
    >
      🚀 Run Demo
    </button>
  );
};

export default DemoController;
