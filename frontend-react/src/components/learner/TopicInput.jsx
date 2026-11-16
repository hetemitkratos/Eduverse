import React, { useState } from 'react';
import { generateTopic } from '../../services/api';

const TopicInput = ({ onTopicGenerated }) => {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    const cleanTopic = topic.trim();
    if (cleanTopic.length < 3) {
      setError('Topic must be at least 3 characters.');
      return;
    }
    if (cleanTopic.length > 50) {
      setError('Topic is too long (max 50 chars).');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setStatusMessage('Generating structured content using local AI model...');
    
    // Simulate generation phases for better UX
    const phase2 = setTimeout(() => setStatusMessage('Validating dataset...'), 15000);
    const phase3 = setTimeout(() => setStatusMessage('Preparing learning modules...'), 30000);

    try {
      await generateTopic(cleanTopic);
      setTopic('');
      if (onTopicGenerated) onTopicGenerated();
    } catch (err) {
      setError(err.message || 'Generation failed — retrying...');
    } finally {
      clearTimeout(phase2);
      clearTimeout(phase3);
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">AI Topic Generator</h3>
          <p className="mt-1 text-sm text-slate-500">Enter any concept to generate a fully adaptive curriculum using Gemma.</p>
        </div>
      </div>

      <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Thermodynamics, Neural Networks..."
          disabled={isGenerating}
          className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400 transition-colors"
        />
        <button
          type="submit"
          disabled={isGenerating || topic.trim().length < 3}
          className="whitespace-nowrap rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center min-w-[160px]"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Generating...
            </span>
          ) : (
            'Generate Content'
          )}
        </button>
      </form>
      {isGenerating && statusMessage && (
        <p className="mt-4 text-sm text-indigo-600 font-medium animate-pulse">
          {statusMessage}
        </p>
      )}
      {error && (
        <div className="mt-4 rounded-xl bg-red-50 p-4 border border-red-100 text-sm text-red-600 flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};

export default TopicInput;
