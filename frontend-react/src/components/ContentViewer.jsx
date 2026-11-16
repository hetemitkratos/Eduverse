import React, { useEffect, useMemo, useState } from 'react';
import VoicePlayer from './VoicePlayer';
import { Volume2, Eye, FileText } from 'lucide-react';

const renderBody = (body) => {
  if (Array.isArray(body)) {
    return body.map((item, i) => <p key={`${i}-${String(item).slice(0, 20)}`}>{item}</p>);
  }

  return <p>{body}</p>;
};

const getVoiceMode = (mode) => {
  const normalized = String(mode ?? 'text').toLowerCase();

  if (normalized.includes('audio')) return 'audio';
  if (normalized.includes('visual')) return 'visual';
  return 'text';
};

const getVoiceText = (title, body) => {
  const contentText = Array.isArray(body) ? body.join(' ') : body;
  return [title, contentText].filter(Boolean).join('. ');
};

const DEFAULT_CONTENT = {
  mode: 'Text Mode',
  topic: 'Photosynthesis',
  title: 'Photosynthesis',
  body:
    'Photosynthesis is the process by which plants use light energy to make glucose from carbon dioxide and water.',
  audioUrl: undefined,
  imageUrl: undefined,
  diagramText: undefined,
};

const MODE_CONFIGS = {
  audio: { icon: Volume2, accentBg: 'bg-purple-100', accentText: 'text-purple-700', borderColor: 'border-purple-200', glowColor: 'shadow-purple-100' },
  visual: { icon: Eye, accentBg: 'bg-teal-100', accentText: 'text-teal-700', borderColor: 'border-teal-200', glowColor: 'shadow-teal-100' },
  text: { icon: FileText, accentBg: 'bg-blue-100', accentText: 'text-blue-700', borderColor: 'border-blue-200', glowColor: 'shadow-blue-100' },
};

const getModeKey = (mode) => {
  const normalized = String(mode ?? 'text').toLowerCase();
  if (normalized.includes('audio')) return 'audio';
  if (normalized.includes('visual')) return 'visual';
  return 'text';
};

const ContentViewer = ({ content }) => {
  const activeContent = useMemo(() => content ?? DEFAULT_CONTENT, [content]);
  const contentSignature = useMemo(() => JSON.stringify(activeContent), [activeContent]);
  const [displayContent, setDisplayContent] = useState(activeContent);
  const displaySignature = useMemo(() => JSON.stringify(displayContent), [displayContent]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [modeJustChanged, setModeJustChanged] = useState(false);

  const modeKey = getModeKey(displayContent.mode);
  const config = MODE_CONFIGS[modeKey];
  const Icon = config.icon;

  useEffect(() => {
    if (contentSignature === displaySignature) {
      return undefined;
    }

    const prevMode = getModeKey(displayContent.mode);
    const nextMode = getModeKey(activeContent.mode);
    const modeChanged = prevMode !== nextMode;

    const startId = window.setTimeout(() => setIsTransitioning(true), 0);
    const timeoutId = window.setTimeout(() => {
      setDisplayContent(activeContent);
      if (modeChanged) {
        setModeJustChanged(true);
      }
    }, 320);
    const clearId = window.setTimeout(() => setIsTransitioning(false), 640);

    return () => {
      window.clearTimeout(startId);
      window.clearTimeout(timeoutId);
      window.clearTimeout(clearId);
      setIsTransitioning(false);
    };
  }, [activeContent, contentSignature, displaySignature]);

  useEffect(() => {
    if (modeJustChanged) {
      const t = window.setTimeout(() => setModeJustChanged(false), 2000);
      return () => window.clearTimeout(t);
    }
  }, [modeJustChanged]);

  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-500 ${config.accentBg} ${config.accentText} ${
              modeJustChanged ? 'ring-2 ring-offset-2 ring-violet-400 scale-110' : ''
            }`}
          >
            <Icon size={14} />
            {displayContent.mode}
          </span>
          {modeJustChanged && (
            <span className="animate-bounce rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-600">
              MODE CHANGED
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          <span className="text-sm font-medium tracking-wide text-slate-500">
            Topic: {displayContent.topic}
          </span>
          <VoicePlayer
            text={getVoiceText(displayContent.title, displayContent.body)}
            audioUrl={displayContent.audioUrl}
            mode={getVoiceMode(displayContent.mode)}
          />
        </div>
      </div>
      
      <div className={`flex-1 rounded-xl p-6 sm:p-10 border shadow-lg transition-all duration-500 relative ${config.borderColor} ${config.glowColor} bg-white`}>
        {isTransitioning && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-[2px]">
            <span className={`rounded-full px-5 py-2.5 text-sm font-bold ${config.accentBg} ${config.accentText} animate-pulse`}>
              Adapting Content...
            </span>
          </div>
        )}

        <div
          className={`transition-opacity duration-300 ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <h2 className="mb-6 text-3xl font-bold text-slate-800 font-serif">
            {displayContent.title}
          </h2>

          {/* Audio mode: prominent player banner */}
          {modeKey === 'audio' && (
            <div className="mb-6 flex items-center gap-4 rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-200">
                <Volume2 size={24} className="text-purple-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-purple-800">Audio Mode Active</p>
                <p className="text-xs text-purple-600 mt-0.5">
                  Content is being delivered through audio. Use the player above to listen.
                </p>
              </div>
            </div>
          )}

          {/* Visual mode: prominent diagram area */}
          {modeKey === 'visual' && (displayContent.diagramText || displayContent.imageUrl) && (
            <div className="mb-6 rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Eye size={16} className="text-teal-700" />
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
                  Visual Diagram
                </p>
              </div>
              {displayContent.imageUrl ? (
                <img
                  src={displayContent.imageUrl}
                  alt={`${displayContent.title} visual`}
                  className="h-auto w-full rounded-xl object-cover border border-teal-100"
                />
              ) : displayContent.diagramText ? (
                <div className="rounded-xl bg-white/70 p-4 text-sm leading-7 text-slate-700 whitespace-pre-line">
                  {displayContent.diagramText}
                </div>
              ) : null}
            </div>
          )}

          <div className="prose prose-slate max-w-none prose-lg text-slate-600 leading-relaxed">
            {renderBody(displayContent.body)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentViewer;
