import React, { useEffect, useMemo, useState } from 'react';

const EMPTY_CONTENT = {
  title: 'Photosynthesis',
  body: 'No content available yet.',
  mode: 'Text Mode',
  topic: 'Photosynthesis',
};

const normalizeText = (value) => {
  if (Array.isArray(value)) {
    return value.join(' ');
  }

  return value ?? '';
};

const getPreview = (value) => {
  const text = normalizeText(value).trim();
  if (!text) {
    return 'No content available.';
  }

  return text.length > 180 ? `${text.slice(0, 180)}...` : text;
};

const ContentComparison = ({ currentContent }) => {
  const safeCurrentContent = currentContent ?? EMPTY_CONTENT;
  const currentSignature = useMemo(() => JSON.stringify(safeCurrentContent), [safeCurrentContent]);
  const [snapshot, setSnapshot] = useState(() => ({
    previous: safeCurrentContent,
    current: safeCurrentContent,
    signature: currentSignature,
    version: 0,
  }));

  const previousContent = snapshot.current ?? EMPTY_CONTENT;
  const hasChanged = snapshot.signature !== currentSignature;

  useEffect(() => {
    if (snapshot.signature === currentSignature) {
      return;
    }

        const timeoutId = window.setTimeout(() => {
      setSnapshot((previousSnapshot) => ({
        previous: previousSnapshot.current,
        current: safeCurrentContent,
        signature: currentSignature,
        version: previousSnapshot.version + 1,
      }));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [safeCurrentContent, currentSignature, snapshot.signature]);

  const changedFields = {
    title: previousContent.title !== safeCurrentContent.title,
    body: normalizeText(previousContent.body) !== normalizeText(safeCurrentContent.body),
    mode: previousContent.mode !== safeCurrentContent.mode,
    topic: previousContent.topic !== safeCurrentContent.topic,
  };

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Content Comparison
          </p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Previous to current delivery
          </h2>
        </div>
        {hasChanged ? (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 motion-safe:animate-pulse">
            Updated
          </span>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Stable
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] lg:items-stretch">
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Previous Content
          </p>
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            {previousContent.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {getPreview(previousContent.body)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-white px-3 py-1 text-slate-600">
              {previousContent.mode}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-slate-600">
              {previousContent.topic}
            </span>
          </div>
        </article>

        <div className="hidden items-center justify-center lg:flex">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-blue-600 shadow-sm">
            →
          </div>
        </div>

        <article
          key={`${currentSignature}-${snapshot.version}`}
          className={`rounded-2xl border bg-blue-50/50 p-4 shadow-sm transition-all duration-500 ${
            hasChanged
              ? 'border-blue-300 shadow-[0_0_0_4px_rgba(59,130,246,0.10)] motion-safe:animate-[pulse_0.8s_ease-out_1]'
              : 'border-slate-200'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Current Content
          </p>
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            {safeCurrentContent.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {getPreview(safeCurrentContent.body)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span
              className={`rounded-full px-3 py-1 ${
                changedFields.mode
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-white text-slate-600'
              }`}
            >
              {safeCurrentContent.mode}
            </span>
            <span
              className={`rounded-full px-3 py-1 ${
                changedFields.topic
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-white text-slate-600'
              }`}
            >
              {safeCurrentContent.topic}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {changedFields.title && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Title changed
              </span>
            )}
            {changedFields.body && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Body changed
              </span>
            )}
            {!changedFields.title && !changedFields.body && !changedFields.mode && !changedFields.topic && (
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                No differences yet
              </span>
            )}
          </div>
        </article>
      </div>
    </section>
  );
};

export default ContentComparison;
