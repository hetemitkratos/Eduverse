import React, { useEffect, useState } from 'react';
import { getTopics } from '../../services/api';
import TopicInput from './TopicInput';

/* ── Icon map ─────────────────────────────────────────────────────────── */
const ICONS = {
  leaf: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  ),
  zap: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
};

const DIFFICULTY_COLORS = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-rose-100 text-rose-700',
};

const CARD_ACCENTS = [
  'from-violet-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
];

/* ── Component ────────────────────────────────────────────────────────── */
const TopicPicker = ({ onSelect }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selecting, setSelecting] = useState(null);

  const fetchTopics = () => {
    setLoading(true);
    getTopics()
      .then(setTopics)
      .catch(() => setError('Could not load topics. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleSelect = async (topic) => {
    setSelecting(topic.id);
    try {
      await onSelect(topic);
    } finally {
      setSelecting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        <p className="text-sm text-slate-500">Loading topics…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm font-medium text-red-700">{error}</p>
        <p className="mt-2 text-xs text-red-500">Start the backend with: <code className="font-mono">uvicorn src.main:app --reload</code></p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-indigo-500">Step 1 of 3</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">What do you want to learn?</h2>
        <p className="mt-2 text-slate-500">Pick a topic. The engine will adapt the content in real-time to fit how you learn.</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {topics.map((topic, index) => {
          const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];
          const isLoading = selecting === topic.id;

          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => handleSelect(topic)}
              disabled={!!selecting}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500`}
            >
              {/* Accent bar */}
              <div className={`h-1.5 w-full bg-gradient-to-r ${accent}`} />

              <div className="flex flex-1 flex-col gap-4 p-6">
                {/* Icon */}
                <div className={`w-fit rounded-2xl bg-gradient-to-br ${accent} p-3 text-white shadow-sm`}>
                  {ICONS[topic.icon_key] ?? ICONS.book}
                </div>

                {/* Text */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      {topic.title}
                    </h3>
                    {topic.is_ai_generated && (
                      <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-indigo-600 border border-indigo-100 shadow-sm">
                        <span>⚡</span> AI Generated
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{topic.description}</p>
                  
                  {/* Concepts */}
                  {topic.concepts?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Key Concepts</p>
                      <div className="flex flex-wrap gap-1.5">
                        {topic.concepts.map(concept => (
                          <span key={concept} className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600 border border-slate-200">
                            {concept.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer meta */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${DIFFICULTY_COLORS[topic.difficulty] ?? 'bg-slate-100 text-slate-600'}`}>
                    {topic.difficulty}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{topic.estimated_minutes} min</span>
                    <span>·</span>
                    <span>{topic.quiz_count} questions</span>
                  </div>
                </div>
              </div>

              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/80">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <TopicInput onTopicGenerated={fetchTopics} />
    </div>
  );
};

export default TopicPicker;
