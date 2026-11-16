import React, { useCallback, useRef, useState } from 'react';
import TopicPicker from '../components/learner/TopicPicker';
import LearnerContentView from '../components/learner/LearnerContentView';
import LearnerQuiz from '../components/learner/LearnerQuiz';
import SessionResults from '../components/learner/SessionResults';
import {
  startSession,
  getTopicContent,
  getSessionQuiz,
  getSessionLiveSnapshot,
  getSessionState,
  sendInteraction,
  triggerEvaluation,
  submitSessionQuiz,
  getSessionReport,
} from '../services/api';

/* ─── Step constants ──────────────────────────────────────────────────── */
const STEPS = {
  TOPIC_SELECT: 'topic_select',
  LEARNING: 'learning',
  QUIZ: 'quiz',
  RESULTS: 'results',
};

/* ─── Progress formula ────────────────────────────────────────────────── */
// Progress grows with each interaction, capped at 95 until quiz is ready
const calcProgress = (count) => Math.min(95, Math.round(count * 15));

/* ─── Component ───────────────────────────────────────────────────────── */
const LearnPage = () => {
  /* Step state */
  const [step, setStep] = useState(STEPS.TOPIC_SELECT);

  /* Session data */
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [content, setContent] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [report, setReport] = useState(null);
  const [adaptationHistory, setAdaptationHistory] = useState([]);
  const [weakConcepts, setWeakConcepts] = useState([]);

  /* UI state */
  const [interactionCount, setInteractionCount] = useState(0);
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptationToast, setAdaptationToast] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const prevActionRef = useRef(null);
  const toastTimerRef = useRef(null);

  /* ─── Helpers ──────────────────────────────────────────────────────── */

  const showToast = useCallback(() => {
    setAdaptationToast(true);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setAdaptationToast(false), 4000);
  }, []);

  const refreshSnapshot = useCallback(async (sid) => {
    const snapshot = await getSessionLiveSnapshot(sid);
    const newAction = snapshot?.decision?.action;

    // Only fire toast + update if action actually changed
    if (newAction && newAction !== 'maintain' && newAction !== prevActionRef.current) {
      prevActionRef.current = newAction;
      showToast();
      setAdaptationHistory((prev) => {
        const next = [...prev, newAction];
        return next.slice(-10);
      });
    }

    if (snapshot?.content) {
      setContent(snapshot.content);
    }
  }, [showToast]);

  /* ─── Topic Select → Learning ─────────────────────────────────────── */

  const handleTopicSelect = async (topic) => {
    setStatusMsg('Starting your session…');
    setSelectedTopic(topic);
    setAdaptationHistory([]);
    setWeakConcepts([]);
    prevActionRef.current = null;

    // Generate a stable learner ID scoped to this topic
    const learnerId = `learner-${topic.id}-${Date.now()}`;

    const session = await startSession({
      learnerId,
      topicId: topic.id,
      abGroup: 'A',
      strategyMode: 'balanced',
    });
    const sid = String(session.session_id);
    setSessionId(sid);

    // Load initial content
    const initialContent = await getTopicContent(topic.id, 'default');
    setContent(initialContent);

    // Load quiz
    const quizData = await getSessionQuiz(sid);
    setQuiz(quizData?.questions?.length ? quizData : null);

    setInteractionCount(0);
    setStatusMsg('');
    setStep(STEPS.LEARNING);
  };

  /* ─── Interaction handler ─────────────────────────────────────────── */

  const handleInteract = useCallback(async ({ eventType, eventValue }) => {
    if (!sessionId || isAdapting) return;
    setIsAdapting(true);

    try {
      await sendInteraction({ sessionId: Number(sessionId), eventType, eventValue });
      const newCount = interactionCount + 1;
      setInteractionCount(newCount);

      // Trigger evaluation + refresh snapshot every 2nd interaction
      if (newCount % 2 === 0) {
        await triggerEvaluation(sessionId);
        await refreshSnapshot(sessionId);

        // Reload quiz in case difficulty changed
        const quizData = await getSessionQuiz(sessionId);
        if (quizData?.questions?.length) setQuiz(quizData);
      }
    } catch {
      // Silent fail — don't block the learner
    } finally {
      setIsAdapting(false);
    }
  }, [sessionId, interactionCount, isAdapting, refreshSnapshot]);

  /* ─── Go to quiz ──────────────────────────────────────────────────── */

  const handleContinueToQuiz = useCallback(async () => {
    // Final evaluation before quiz
    setIsAdapting(true);
    try {
      await triggerEvaluation(sessionId);
      await refreshSnapshot(sessionId);
      const quizData = await getSessionQuiz(sessionId);
      if (quizData?.questions?.length) setQuiz(quizData);
    } catch {
      // proceed even if this fails
    } finally {
      setIsAdapting(false);
    }
    setStep(STEPS.QUIZ);
  }, [sessionId, refreshSnapshot]);

  /* ─── Quiz submit ─────────────────────────────────────────────────── */

  const handleQuizSubmit = useCallback(async (answers) => {
    if (!sessionId) return;
    setIsSubmittingQuiz(true);
    try {
      const result = await submitSessionQuiz(Number(sessionId), answers);
      setQuizResult(result);

      // Fire evaluation to get final report
      await triggerEvaluation(sessionId);
      const evalReport = await getSessionReport(sessionId);
      setReport(evalReport);

      // Final snapshot for adaptation history
      await refreshSnapshot(sessionId);

      // Extract weak concepts from in-memory state via system-state endpoint
      try {
        const sysState = await getSessionState(sessionId);
        const wc = sysState?.state?.weak_concepts ?? [];
        setWeakConcepts(wc);
      } catch { /* ok */ }

      setStep(STEPS.RESULTS);
    } catch (err) {
      setStatusMsg('Quiz submission failed. Please try again.');
    } finally {
      setIsSubmittingQuiz(false);
    }
  }, [sessionId, refreshSnapshot]);

  /* ─── Try Again ───────────────────────────────────────────────────── */

  const handleTryAgain = useCallback(async () => {
    if (!selectedTopic || !sessionId) {
      setStep(STEPS.TOPIC_SELECT);
      return;
    }
    setQuizResult(null);
    setReport(null);
    setInteractionCount(0);
    setAdaptationToast(false);

    // Reload content + quiz for same session
    setIsAdapting(true);
    try {
      const snap = await getSessionLiveSnapshot(sessionId);
      if (snap?.content) setContent(snap.content);
      const quizData = await getSessionQuiz(sessionId);
      if (quizData?.questions?.length) setQuiz(quizData);
    } catch { /* proceed */ } finally {
      setIsAdapting(false);
    }
    setStep(STEPS.LEARNING);
  }, [selectedTopic, sessionId]);

  /* ─── New Topic ───────────────────────────────────────────────────── */

  const handleNewTopic = useCallback(() => {
    setStep(STEPS.TOPIC_SELECT);
    setSelectedTopic(null);
    setSessionId(null);
    setContent(null);
    setQuiz(null);
    setQuizResult(null);
    setReport(null);
    setAdaptationHistory([]);
    setWeakConcepts([]);
    setInteractionCount(0);
    prevActionRef.current = null;
  }, []);

  /* ─── Progress ────────────────────────────────────────────────────── */
  const progress = calcProgress(interactionCount);

  /* ─── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="font-bold text-slate-900">EduVerse</span>
            <span className="hidden h-4 w-px bg-slate-200 sm:block" />
            <span className="hidden text-sm text-slate-400 sm:block">Adaptive Learning</span>
          </div>

          <div className="flex items-center gap-3">
            {statusMsg && (
              <span className="hidden text-xs text-slate-500 sm:block">{statusMsg}</span>
            )}
            <a
              href="#/"
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              Researcher View →
            </a>
          </div>
        </div>
      </header>

      {/* Breadcrumb strip */}
      {step !== STEPS.TOPIC_SELECT && selectedTopic && (
        <div className="border-b border-slate-100 bg-white/60">
          <div className="mx-auto flex h-10 max-w-5xl items-center gap-2 px-4 sm:px-6 text-xs text-slate-400">
            <button
              type="button"
              onClick={handleNewTopic}
              className="hover:text-indigo-600 transition-colors font-medium"
            >
              Topics
            </button>
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-medium text-slate-600">{selectedTopic.title}</span>
            {step === STEPS.QUIZ && (
              <>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-medium text-indigo-600">Quiz</span>
              </>
            )}
            {step === STEPS.RESULTS && (
              <>
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="font-medium text-emerald-600">Results</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

        {/* Session ID badge (debugging helper) */}
        {sessionId && step !== STEPS.TOPIC_SELECT && (
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-0.5 font-mono text-xs text-slate-400">
              Session #{sessionId}
            </span>
          </div>
        )}

        {step === STEPS.TOPIC_SELECT && (
          <TopicPicker onSelect={handleTopicSelect} />
        )}

        {step === STEPS.LEARNING && (
          <LearnerContentView
            content={content}
            topic={selectedTopic}
            interactionCount={interactionCount}
            progress={progress}
            isAdapting={isAdapting}
            adaptationToast={adaptationToast}
            disabled={isAdapting}
            onInteract={handleInteract}
            onContinueToQuiz={handleContinueToQuiz}
          />
        )}

        {step === STEPS.QUIZ && (
          <LearnerQuiz
            quiz={quiz}
            isSubmitting={isSubmittingQuiz}
            onSubmit={handleQuizSubmit}
          />
        )}

        {step === STEPS.RESULTS && (
          <SessionResults
            quizResult={quizResult}
            report={report}
            adaptationHistory={adaptationHistory}
            weakConcepts={weakConcepts}
            topicTitle={selectedTopic?.title ?? 'Session'}
            onTryAgain={handleTryAgain}
            onNewTopic={handleNewTopic}
          />
        )}
      </main>
    </div>
  );
};

export default LearnPage;
