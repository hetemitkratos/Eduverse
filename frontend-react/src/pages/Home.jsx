import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ContentComparison from '../components/ContentComparison';
import ContentViewer from '../components/ContentViewer';
import Controls from '../components/Controls';
import ContextPanel from '../components/ContextPanel';
import DecisionPanel from '../components/DecisionPanel';
import ImpactCard from '../components/ImpactCard';
import LearnerActions from '../components/LearnerActions';
import QuizPanel from '../components/QuizPanel';
import SimulationLog from '../components/SimulationLog';
import SystemStateModal from '../components/SystemStateModal';
import ThinkingIndicator from '../components/ThinkingIndicator';
import Timeline from '../components/Timeline';
import DecisionFlow from '../components/DecisionFlow';
import LearningPanel from '../components/LearningPanel';
import SystemMemory from '../components/SystemMemory';
import QuizImpact from '../components/QuizImpact';
import Charts from '../components/Charts';
import DecisionTrace from '../components/DecisionTrace';
import ConceptGraphPanel from '../components/ConceptGraphPanel';
import EvaluationPanel from '../components/EvaluationPanel';
import {
  DEMO_TOPIC,
  getSessionLiveSnapshot,
  getSessionQuiz,
  getSessionState,
  getTopicContent,
  sendInteraction,
  startSession,
  submitSessionQuiz,
  triggerEvaluation,
} from '../services/api';

/* ─── Constants ────────────────────────────────────────────────────────── */

const EMPTY_DECISION = {
  action: 'maintain',
  confidence: 0,
  intensity: 0,
  strategy: 'demo',
  reason: 'Click Run Demo to start the photosynthesis simulation.',
};

const EMPTY_CONTEXT = {
  fatigue: false,
  confusion: false,
  learning: 'high',
  low_learning: false,
  phase: 'early',
  mode: 'text',
};

const EMPTY_METRICS = {
  engagementDelta: 0,
  quizDelta: 0,
  reward: 0,
  engagement: 0,
  quiz_score: 0,
};

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

/* ─── Simulation Script ────────────────────────────────────────────────── */

const SIMULATION_STEPS = [
  /* ─── Phase 1: Establish Baseline ─────────────────────────────── */
  {
    id: 'start',
    type: 'start',
    title: '🎬 Phase 1 — Session Begins',
    detail: 'Starting a new photosynthesis learning session. Content loads in default text mode.',
    run: async ({ sessionId }) => ({ sessionId }),
  },
  {
    id: 'load-content',
    type: 'content',
    title: 'Content Loaded (Text Mode)',
    detail: 'The learner sees the photosynthesis lesson as rich, detailed text. This is the default delivery format.',
    delayBefore: 4000,
    run: async ({ sessionId, api }) => {
      const snapshot = await api.getSnapshot(sessionId);
      return { snapshot, applyContent: true };
    },
  },
  {
    id: 'baseline-1',
    type: 'interaction',
    title: 'Learner Reads Normally',
    detail: 'A normal reading interaction is logged. No fatigue or confusion yet — the system stays in text mode.',
    delayBefore: 4000,
    run: async ({ sessionId, api }) => {
      await api.interact(sessionId, 'pause', 0.15);
      return {};
    },
  },

  /* ─── Phase 2: Build Fatigue → Trigger Audio Mode ─────────────── */
  {
    id: 'fatigue-header',
    type: 'info',
    title: '🎬 Phase 2 — Fatigue Builds Up',
    detail: 'The learner starts showing signs of fatigue: long pauses, slower reading speed. The system will detect this.',
    delayBefore: 5000,
    run: async () => ({}),
  },
  {
    id: 'fatigue-1',
    type: 'interaction',
    title: 'Pause Spike Detected (0.55)',
    detail: 'Learner pauses mid-reading. Pause rate begins rising. The context engine starts tracking the fatigue signal.',
    delayBefore: 3500,
    run: async ({ sessionId, api }) => {
      await api.interact(sessionId, 'pause', 0.55);
      return {};
    },
  },
  {
    id: 'fatigue-2',
    type: 'interaction',
    title: 'Heavy Pause (0.70)',
    detail: 'Another significant pause. The weighted average pause rate is climbing past the 0.4 fatigue threshold.',
    delayBefore: 3500,
    run: async ({ sessionId, api }) => {
      await api.interact(sessionId, 'pause', 0.70);
      return {};
    },
  },
  {
    id: 'fatigue-3',
    type: 'interaction',
    title: 'Sustained Fatigue (0.80)',
    detail: 'Third consecutive heavy pause. The engagement trend is now clearly decreasing.',
    delayBefore: 3500,
    run: async ({ sessionId, api }) => {
      await api.interact(sessionId, 'pause', 0.80);
      return {};
    },
  },
  {
    id: 'adapt-audio',
    type: 'adaptation',
    title: '🧠 Engine Decision: Switch to Audio',
    detail: 'The Accessibility Agent detects fatigue=true, confusion=false. Rule: "fatigue without confusion → switch_to_audio". Expecting content delivery to change to AUDIO MODE.',
    delayBefore: 4000,
    run: async ({ sessionId, api }) => {
      await api.evaluate(sessionId);
      const snapshot = await api.getSnapshot(sessionId);
      return { snapshot, applyContent: true };
    },
  },

  /* ─── Phase 3: Build Confusion → Trigger Visual Mode ──────────── */
  {
    id: 'confusion-header',
    type: 'info',
    title: '🎬 Phase 3 — Confusion Emerges',
    detail: 'Now the learner revisits content sections — a strong indicator of conceptual confusion. The system will pivot to visual delivery.',
    delayBefore: 5000,
    run: async () => ({}),
  },
  {
    id: 'reset-fatigue',
    type: 'interaction',
    title: 'Fatigue Subsides',
    detail: 'Learner\'s reading pace normalizes — a series of low-pause interactions to bring pause_rate below the threshold.',
    delayBefore: 3500,
    run: async ({ sessionId, api }) => {
      // Push low pauses to bring the weighted average down below 0.4
      await api.interact(sessionId, 'pause', 0.05);
      await api.interact(sessionId, 'pause', 0.05);
      await api.interact(sessionId, 'pause', 0.05);
      return {};
    },
  },
  {
    id: 'confusion-1',
    type: 'interaction',
    title: 'First Revisit (Confusion Signal)',
    detail: 'Learner jumps back to re-read earlier material. Revisit count: 1. Threshold is 2.',
    delayBefore: 3500,
    run: async ({ sessionId, api }) => {
      await api.interact(sessionId, 'revisit', 1);
      return {};
    },
  },
  {
    id: 'confusion-2',
    type: 'interaction',
    title: 'Second Revisit — Threshold Crossed',
    detail: 'Learner revisits again. Revisit count reaches 2 — the confusion threshold is now breached.',
    delayBefore: 3500,
    run: async ({ sessionId, api }) => {
      await api.interact(sessionId, 'revisit', 1);
      return {};
    },
  },
  {
    id: 'adapt-visual',
    type: 'adaptation',
    title: '🧠 Engine Decision: Switch to Visual',
    detail: 'The Accessibility Agent detects confusion=true, fatigue=false. Rule: "confusion without fatigue → switch_to_visual". Expecting content to change to VISUAL MODE with diagrams.',
    delayBefore: 4000,
    run: async ({ sessionId, api }) => {
      await api.evaluate(sessionId);
      const snapshot = await api.getSnapshot(sessionId);
      return { snapshot, applyContent: true };
    },
  },

  /* ─── Phase 4: Quiz Failure → Simplification ──────────────────── */
  {
    id: 'quiz-header',
    type: 'info',
    title: '🎬 Phase 4 — Quiz Assessment',
    detail: 'A quiz is auto-submitted with deliberate wrong answers. Low scores trigger the system\'s strongest adaptation: forced simplification.',
    delayBefore: 5000,
    run: async () => ({}),
  },
  {
    id: 'quiz-auto',
    type: 'quiz',
    title: '📝 Quiz Submitted (Deliberate Failures)',
    detail: 'Submitting quiz with wrong answers. The system will detect low_quiz_score and override all agents with simplify_chunk.',
    delayBefore: 4000,
    run: async ({ sessionId, api }) => {
      const quizData = await api.getQuiz(sessionId);
      if (!quizData?.questions?.length) {
        return { quizData: null, quizResult: null };
      }
      const wrongAnswers = quizData.questions.map((q) => {
        const correct = q.options?.find?.((o) => o === (q.correct ?? q.answer));
        const wrong = q.options?.find?.((o) => o !== correct);
        return wrong ?? q.options?.[0] ?? '';
      });
      const result = await api.submitQuiz(sessionId, wrongAnswers);
      return { quizData, quizResult: result, quizAnswers: wrongAnswers };
    },
  },
  {
    id: 'adapt-simplify',
    type: 'adaptation',
    title: '🧠 Engine Decision: Simplify & Chunk',
    detail: 'Quiz failure detected (low_quiz_score=true). The system_enforcer overrides all agents and forces simplify_chunk at max intensity. No cooldown can block this.',
    delayBefore: 4000,
    run: async ({ sessionId, api }) => {
      await api.evaluate(sessionId);
      const snapshot = await api.getSnapshot(sessionId);
      return { snapshot, applyContent: true };
    },
  },

  /* ─── Phase 5: Wrap Up ────────────────────────────────────────── */
  {
    id: 'complete',
    type: 'complete',
    title: '✅ Demo Complete',
    detail: 'The full adaptive loop has been demonstrated: Text → Audio (fatigue) → Visual (confusion) → Simplified (quiz failure). Use manual interactions and quiz to explore further.',
    delayBefore: 3000,
    run: async () => ({}),
  },
];

/* ─── Component ────────────────────────────────────────────────────────── */

const Home = () => {
  /* State */
  const [learnerIdInput, setLearnerIdInput] = useState('photosynthesis-demo');
  const [activeSessionId, setActiveSessionId] = useState('');
  const [liveStatus, setLiveStatus] = useState('idle');
  const [liveMessage, setLiveMessage] = useState(
    'Click Run Demo to start an automated adaptive learning simulation.',
  );
  const [decision, setDecision] = useState(EMPTY_DECISION);
  const [currentContent, setCurrentContent] = useState(null);
  const [context, setContext] = useState(EMPTY_CONTEXT);
  const [metrics, setMetrics] = useState(EMPTY_METRICS);
  const [series, setSeries] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [adaptationHistory, setAdaptationHistory] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  /* Simulation state */
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simLog, setSimLog] = useState([]);
  const simAbortRef = useRef(false);

  /* System state modal */
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [systemState, setSystemState] = useState(null);

  /* Derived */
  const normalizedContext = useMemo(
    () => ({
      ...context,
      low_learning: context?.low_learning ?? context?.learning === 'low',
    }),
    [context],
  );

  /* ─── Helpers ──────────────────────────────────────────────────────── */

  const addLogEntry = useCallback((type, title, detail) => {
    setSimLog((prev) => [...prev, { type, title, detail, time: now() }]);
  }, []);

  const applySnapshot = useCallback((snapshot, msg) => {
    setCurrentContent(snapshot.content);
    setDecision(snapshot.decision);
    setContext(snapshot.context);
    setMetrics((prev) => ({
      engagementDelta: snapshot.scores.engagement - (prev.engagement ?? 0),
      quizDelta: snapshot.scores.quizScore - (prev.quiz_score ?? 0),
      reward: snapshot.scores.reward,
      engagement: snapshot.scores.engagement,
      quiz_score: snapshot.scores.quizScore,
    }));
    if (snapshot.seriesPoint) {
      setSeries((prev) => [...prev, snapshot.seriesPoint].slice(-20));
    }
    setTimeline(snapshot.timeline);
    setAdaptationHistory((prev) => {
      const next = [...prev, snapshot.decision.action];
      return next.slice(-10);
    });
    setLiveStatus('live');
    if (msg) setLiveMessage(msg);
  }, []);

  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ─── API wrapper object for simulation steps ───────────────────── */

  const makeApi = (sessionId) => ({
    interact: (sid, eventType, eventValue) =>
      sendInteraction({ sessionId: Number(sid), eventType, eventValue }),
    evaluate: (sid) => triggerEvaluation(sid),
    getSnapshot: (sid) => getSessionLiveSnapshot(sid),
    getQuiz: (sid) => getSessionQuiz(sid),
    submitQuiz: (sid, answers) => submitSessionQuiz(Number(sid), answers),
  });

  /* ─── Simulation Runner ─────────────────────────────────────────── */

  const runSimulation = async () => {
    simAbortRef.current = false;
    setIsSimulating(true);
    setSimStep(0);
    setSimLog([]);
    setQuizResult(null);
    setCurrentQuiz(null);
    setQuizAnswers([]);
    setDecision(EMPTY_DECISION);
    setContext(EMPTY_CONTEXT);
    setMetrics(EMPTY_METRICS);
    setSeries([]);
    setTimeline([]);
    setAdaptationHistory([]);
    setLiveStatus('loading');
    setLiveMessage('Starting simulation...');

    let sessionId = '';

    try {
      // 1. Start session
      const learnerId = learnerIdInput.trim() || `photo-${Date.now()}`;
      setLearnerIdInput(learnerId);

      const session = await startSession({ learnerId, topicId: DEMO_TOPIC.id, strategyMode: 'demo' });
      sessionId = String(session.session_id);
      setActiveSessionId(sessionId);

      // Load initial content preview
      const preview = await getTopicContent(DEMO_TOPIC.id, 'default');
      setCurrentContent(preview);

      // Load initial quiz
      const quizPayload = await getSessionQuiz(sessionId);
      if (quizPayload?.questions?.length) {
        setCurrentQuiz(quizPayload);
        setQuizAnswers(new Array(quizPayload.questions.length).fill(''));
      }

      const api = makeApi(sessionId);
      const totalSteps = SIMULATION_STEPS.length;

      // 2. Run each step
      for (let i = 0; i < totalSteps; i++) {
        if (simAbortRef.current) break;

        const step = SIMULATION_STEPS[i];
        setSimStep(i + 1);

        // Delay before this step
        if (step.delayBefore) {
          await delay(step.delayBefore);
        }
        if (simAbortRef.current) break;

        // Show thinking for adaptation steps
        if (step.type === 'adaptation') {
          setIsThinking(true);
        }

        // Add log entry
        addLogEntry(step.type, step.title, step.detail);
        setLiveMessage(step.title);

        try {
          // Execute step
          const result = await step.run({ sessionId, api });

          // Apply snapshot if returned
          if (result?.snapshot && result.applyContent) {
            applySnapshot(result.snapshot, `Applied: ${result.snapshot.decision.action}`);
            addLogEntry(
              'info',
              `Decision: ${result.snapshot.decision.action}`,
              `Confidence: ${(result.snapshot.decision.confidence * 100).toFixed(0)}% | Reason: ${result.snapshot.decision.reason}`,
            );
          }

          // Apply quiz results
          if (result?.quizResult) {
            setQuizResult(result.quizResult);
            if (result.quizData) {
              setCurrentQuiz(result.quizData);
              setQuizAnswers(result.quizAnswers || []);
            }
            addLogEntry(
              'quiz',
              `Quiz Score: ${Math.round((result.quizResult.score ?? 0) * 100)}%`,
              `Next difficulty: ${result.quizResult.difficulty_next} | ${result.quizResult.feedback}`,
            );
          }
        } catch (stepErr) {
          addLogEntry('error', `Step failed: ${step.title}`, stepErr?.message ?? 'Unknown error');
        }

        setIsThinking(false);
      }

      // Final state
      setLiveStatus('live');
      setLiveMessage('Simulation complete! Use manual interactions, quiz, or System State to explore further.');
    } catch (err) {
      setLiveStatus('error');
      setLiveMessage(err?.message ?? 'Simulation failed.');
      addLogEntry('error', 'Simulation failed', err?.message);
    } finally {
      setIsSimulating(false);
      setIsThinking(false);
    }
  };

  /* ─── Manual Interaction Handlers ───────────────────────────────── */

  const handleInteractionTrigger = async ({ eventType, eventValue }) => {
    if (!activeSessionId) {
      setLiveMessage('Run the demo first.');
      return;
    }


    setLiveStatus('loading');
    setLiveMessage(`Logging ${eventType} interaction...`);
    setIsThinking(true);

    try {
      await sendInteraction({ sessionId: Number(activeSessionId), eventType, eventValue });
      addLogEntry('interaction', `Manual: ${eventType}`, `Value: ${eventValue}`);
      await triggerEvaluation(activeSessionId);
      const snapshot = await getSessionLiveSnapshot(activeSessionId);
      applySnapshot(snapshot, `Decision after ${eventType}: ${snapshot.decision.action}`);
      addLogEntry('adaptation', `Decision: ${snapshot.decision.action}`, snapshot.decision.reason);
    } catch (err) {
      setLiveStatus('error');
      setLiveMessage(err?.message ?? 'Interaction failed.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuizAnswerChange = (index, option) => {
    setQuizAnswers((cur) => {
      const next = [...cur];
      next[index] = option;
      return next;
    });
  };

  const handleQuizSubmit = async () => {
    if (!activeSessionId || !currentQuiz) return;
    if (quizAnswers.some((a) => !a)) {
      setLiveMessage('Answer every quiz question before submitting.');
      return;
    }

    setIsSubmittingQuiz(true);
    setIsThinking(true);
    setLiveMessage('Submitting quiz...');

    try {
      const result = await submitSessionQuiz(Number(activeSessionId), quizAnswers);
      setQuizResult(result);
      addLogEntry('quiz', `Quiz submitted — Score: ${Math.round((result.score ?? 0) * 100)}%`, result.feedback);

      // Trigger evaluation and get new adaptation
      await triggerEvaluation(activeSessionId);
      const snapshot = await getSessionLiveSnapshot(activeSessionId);
      applySnapshot(snapshot, `Post-quiz decision: ${snapshot.decision.action}`);
      addLogEntry('adaptation', `Post-quiz: ${snapshot.decision.action}`, snapshot.decision.reason);

      // Reload quiz for next attempt
      const quizPayload = await getSessionQuiz(activeSessionId);
      if (quizPayload?.questions?.length) {
        setCurrentQuiz(quizPayload);
        setQuizAnswers(new Array(quizPayload.questions.length).fill(''));
      }
    } catch (err) {
      setLiveMessage(err?.message ?? 'Quiz submission failed.');
    } finally {
      setIsSubmittingQuiz(false);
      setIsThinking(false);
    }
  };

  const handleRefreshDecision = async () => {
    if (!activeSessionId) return;
    setIsThinking(true);
    setLiveMessage('Checking current decision...');
    try {
      const snapshot = await getSessionLiveSnapshot(activeSessionId);
      applySnapshot(snapshot, `Current decision: ${snapshot.decision.action}`);
    } catch (err) {
      setLiveMessage(err?.message ?? 'Failed to check decision.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleViewState = async () => {
    if (!activeSessionId) return;
    try {
      const data = await getSessionState(activeSessionId);
      setSystemState(data);
      setStateModalOpen(true);
    } catch {
      setLiveMessage('Failed to load system state.');
    }
  };

  const handleReset = () => {
    simAbortRef.current = true;
    setActiveSessionId('');
    setCurrentQuiz(null);
    setQuizAnswers([]);
    setQuizResult(null);
    setDecision(EMPTY_DECISION);
    setContext(EMPTY_CONTEXT);
    setMetrics(EMPTY_METRICS);
    setSeries([]);
    setTimeline([]);
    setAdaptationHistory([]);
    setSimLog([]);
    setIsSimulating(false);
    setSimStep(0);
    setLiveStatus('idle');
    setLiveMessage('Click Run Demo to start an automated adaptive learning simulation.');
    setCurrentContent(null);
  };

  /* ─── Initial content load ──────────────────────────────────────── */

  useEffect(() => {
    getTopicContent(DEMO_TOPIC.id, 'default').then(setCurrentContent).catch(() => {});
  }, []);

  /* ─── Render ────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1560px] flex-col px-4 py-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
                  Live
                </p>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                EduVerse — Adaptive Intelligence System
              </h1>
              <p className="mt-1 text-sm text-slate-600 font-medium">
                Real-time explainable adaptive learning
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Automated simulation + manual controls. Watch the engine adapt content delivery in real-time.
              </p>
            </div>

            <Controls
              learnerIdInput={learnerIdInput}
              setLearnerIdInput={setLearnerIdInput}
              activeSessionId={activeSessionId}
              liveStatus={liveStatus}
              isSimulating={isSimulating}
              simStep={simStep}
              simTotal={SIMULATION_STEPS.length}
              onRunDemo={runSimulation}
              onRefreshDecision={handleRefreshDecision}
              onReset={handleReset}
              onViewState={handleViewState}
            />
          </div>

          <div className={`mt-3 rounded-2xl border px-4 py-3 text-sm transition-colors duration-300 ${
            liveStatus === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : liveStatus === 'live'
                ? 'border-green-200 bg-green-50 text-green-700'
                : 'border-slate-200 bg-slate-50 text-slate-600'
          }`}>
            {liveMessage}
          </div>
        </header>

        {/* Learner-mode CTA */}
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-indigo-700">
            <span className="text-base">🎓</span>
            <span className="font-medium">Want to experience EduVerse as a learner?</span>
          </div>
          <a
            href="#/learn"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-indigo-700"
          >
            Learner Mode
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Main Content */}
        <main className="mt-4 grid flex-1 gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.9fr)]">
          {/* Left Column */}
          <div className="grid gap-4 xl:grid-rows-[minmax(420px,1fr)_auto_auto_auto]">
            {/* Content Viewer */}
            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <ContentViewer content={currentContent} />
            </section>

            {/* Learner Actions + Quiz */}
            <div className="grid gap-4 xl:grid-cols-2">
              <LearnerActions
                disabled={!activeSessionId || isSimulating}
                onTrigger={handleInteractionTrigger}
              />
              <QuizPanel
                disabled={!activeSessionId || isSimulating}
                isLoading={isSubmittingQuiz}
                quiz={currentQuiz}
                answers={quizAnswers}
                onAnswerChange={handleQuizAnswerChange}
                onSubmit={handleQuizSubmit}
                result={quizResult}
              />
            </div>

            <QuizImpact quiz={quizResult} context={normalizedContext} decision={decision} />

            {/* Content Comparison */}
            <ContentComparison currentContent={currentContent} />

            {/* Simulation Log */}
            <SimulationLog
              entries={simLog}
              currentStep={simStep}
              totalSteps={SIMULATION_STEPS.length}
              isRunning={isSimulating}
            />
          </div>

          {/* Right Sidebar */}
          <aside className="space-y-3">
            <ThinkingIndicator active={isThinking} />

            <DecisionFlow
              decision={decision}
              context={normalizedContext}
              metrics={metrics}
            />

            <DecisionTrace
              decision={decision}
              context={normalizedContext}
              metrics={metrics}
            />

            <DecisionPanel decision={decision} metrics={metrics} />

            <ContextPanel context={normalizedContext} />

            <ConceptGraphPanel conceptData={currentContent?.conceptData || quizResult?.conceptData} />

            <ImpactCard metrics={metrics} />

            <LearningPanel />

            <SystemMemory timeline={timeline} decision={decision} />

            <EvaluationPanel data={metrics} />

            <Charts series={series} />

            <Timeline key={timeline[0]?.id ?? 'timeline'} items={timeline} />
          </aside>
        </main>
      </div>

      {/* System State Modal */}
      <SystemStateModal
        isOpen={stateModalOpen}
        onClose={() => setStateModalOpen(false)}
        stateData={systemState}
      />
    </div>
  );
};

export default Home;
