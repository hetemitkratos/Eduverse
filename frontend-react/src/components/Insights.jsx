import React, { useEffect, useState } from 'react';
import { getDashboardInsights } from '../services/api';

const formatConfidence = (value) => `${Math.round((value ?? 0) * 100)}%`;

const Insights = () => {
  const [insights, setInsights] = useState([]);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadInsights = async () => {
      setStatus('loading');
      setErrorMessage('');

      try {
        const nextInsights = await getDashboardInsights();

        if (!isActive) {
          return;
        }

        setInsights(nextInsights);
        setStatus('success');
      } catch (error) {
        if (!isActive) {
          return;
        }

        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load insights.');
      }
    };

    loadInsights();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
          Insights
        </p>
        <h2 className="mt-2 text-lg font-bold text-slate-900">
          Dashboard intelligence feed
        </h2>
      </div>

      {status === 'loading' && (
        <div className="space-y-3">
          {[0, 1].map((item) => (
            <div key={item} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {status === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-semibold text-red-700">Insights unavailable</p>
          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      {status === 'success' && insights.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">No insights returned yet.</p>
        </div>
      )}

      {status === 'success' && insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight) => (
            <article key={insight.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm leading-6 text-slate-700">{insight.text}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                  Confidence {formatConfidence(insight.confidence)}
                </span>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-600">
                  Sample Size {insight.sampleSize ?? 'N/A'}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default Insights;
