import React, { useEffect, useEffectEvent, useRef, useState } from 'react';

const VoicePlayer = ({ text, audioUrl, mode }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const stopPlayback = () => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const playPlayback = () => {
    stopPlayback();

    if (audioUrl) {
      // Reuse a single audio instance to avoid overlapping playback.
      if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.onended = () => setIsPlaying(false);
      }
      audioRef.current.src = audioUrl;
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      return;
    }

    if (!text?.trim()) return;

    // Always cancel queued speech before starting a new utterance.
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  const syncPlayback = useEffectEvent(() => {
    stopPlayback();
    if (mode === 'audio') {
      playPlayback();
    }
  });

  useEffect(() => {
    // Stop immediately on content change and auto-restart for audio mode.
    syncPlayback();
    return () => {
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [mode, text, audioUrl]);

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={playPlayback}
        className="rounded-md bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100"
      >
        ▶ Play
      </button>
      <button
        type="button"
        onClick={stopPlayback}
        className="rounded-md bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
      >
        ⏹ Stop
      </button>
      {isPlaying && <span className="text-sm font-medium text-emerald-600">Speaking...</span>}
    </div>
  );
};

export default VoicePlayer;
