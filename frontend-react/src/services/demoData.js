const demoSnapshots = [
  {
    decision: {
      action: 'simplify_chunk',
      confidence: 0.82,
      intensity: 0.7,
      strategy: 'balanced',
      reason: 'Fatigue and confusion indicators increased during the current session.',
    },
    content: {
      mode: 'Text Mode',
      topic: 'Adaptive Tracking',
      title: 'What is Adaptive Learning?',
      body: [
        'Adaptive learning systems personalize pacing and content using deterministic learner signals.',
        'EduVerse monitors pauses, revisits, and quiz outcomes to choose the next best content move.',
      ],
    },
    context: {
      fatigue: true,
      confusion: false,
      learning: 'low',
      phase: 'mid',
      mode: 'text',
    },
    metrics: {
      engagementDelta: 0.18,
      quizDelta: -0.06,
      reward: 0.24,
    },
    point: {
      time: '09:15',
      engagement: 0.78,
      quizScore: 0.61,
    },
    timelineEvent: {
      action: 'maintain',
      timestamp: '09:15',
      reward: -0.02,
      reason:
        'The system held the current mode to observe whether engagement gains remained consistent.',
      context: {
        fatigue: 'low',
        confusion: 'low',
        phase: 'mid',
        mode: 'text',
      },
    },
  },
  {
    decision: {
      action: 'switch_to_visual',
      confidence: 0.88,
      intensity: 0.64,
      strategy: 'balanced',
      reason: 'Revisit behavior suggests conceptual blockage, so the system is emphasizing visual support.',
    },
    content: {
      mode: 'Visual Mode',
      topic: 'Adaptive Tracking',
      title: 'Visualizing Learner Signals',
      body: [
        'The platform compares pause rate, revisit count, and quiz trends to detect where a learner needs help.',
        'Visual diagrams reduce abstraction when learners revisit the same concept repeatedly.',
      ],
    },
    context: {
      fatigue: false,
      confusion: true,
      learning: 'low',
      phase: 'mid',
      mode: 'visual',
    },
    metrics: {
      engagementDelta: 0.11,
      quizDelta: 0.04,
      reward: 0.19,
    },
    point: {
      time: '09:18',
      engagement: 0.81,
      quizScore: 0.65,
    },
    timelineEvent: {
      action: 'switch_to_visual',
      timestamp: '09:18',
      reward: 0.19,
      reason:
        'Visual reinforcement was selected after confusion indicators stayed elevated across recent interactions.',
      context: {
        fatigue: 'low',
        confusion: 'high',
        phase: 'mid',
        mode: 'text',
      },
    },
  },
  {
    decision: {
      action: 'reduce_pace',
      confidence: 0.9,
      intensity: 0.58,
      strategy: 'conservative',
      reason: 'The learner is improving, but slowing the pace preserves engagement while quiz confidence stabilizes.',
    },
    content: {
      mode: 'Chunked Text',
      topic: 'Adaptive Tracking',
      title: 'Step-by-Step Adaptation Logic',
      body: [
        'Chunked delivery breaks the concept into smaller, easier-to-scan units.',
        'This helps the learner absorb the same material with less cognitive strain.',
      ],
    },
    context: {
      fatigue: true,
      confusion: false,
      learning: 'high',
      phase: 'late',
      mode: 'text',
    },
    metrics: {
      engagementDelta: 0.09,
      quizDelta: 0.08,
      reward: 0.27,
    },
    point: {
      time: '09:21',
      engagement: 0.84,
      quizScore: 0.73,
    },
    timelineEvent: {
      action: 'reduce_pace',
      timestamp: '09:21',
      reward: 0.27,
      reason:
        'The strategy shifted to a slower cadence to preserve the current engagement gains.',
      context: {
        fatigue: 'high',
        confusion: 'low',
        phase: 'late',
        mode: 'visual',
      },
    },
  },
  {
    decision: {
      action: 'switch_to_audio',
      confidence: 0.85,
      intensity: 0.62,
      strategy: 'balanced',
      reason: 'Fatigue increased late in the session, so the system switched to audio support to lower reading load.',
    },
    content: {
      mode: 'Audio Mode',
      topic: 'Adaptive Tracking',
      title: 'Listening Through the Concept',
      body: [
        'Audio delivery reduces visual strain when fatigue rises near the end of a session.',
        'The same concept is preserved while the mode adapts to the learner state.',
      ],
    },
    context: {
      fatigue: true,
      confusion: false,
      learning: 'high',
      phase: 'late',
      mode: 'audio',
    },
    metrics: {
      engagementDelta: 0.05,
      quizDelta: 0.02,
      reward: 0.14,
    },
    point: {
      time: '09:24',
      engagement: 0.8,
      quizScore: 0.75,
    },
    timelineEvent: {
      action: 'switch_to_audio',
      timestamp: '09:24',
      reward: 0.14,
      reason:
        'Audio support was selected to reduce friction while keeping the learner in the same topic progression.',
      context: {
        fatigue: 'high',
        confusion: 'low',
        phase: 'late',
        mode: 'text',
      },
    },
  },
];

export const DEMO_SNAPSHOT_COUNT = demoSnapshots.length;

export const getDemoSnapshot = (index) => demoSnapshots[index % demoSnapshots.length];

export const getInitialSeries = () => [
  { time: '09:00', engagement: 0.42, quizScore: 0.34 },
  { time: '09:03', engagement: 0.5, quizScore: 0.34 },
  { time: '09:06', engagement: 0.58, quizScore: 0.4 },
  { time: '09:09', engagement: 0.63, quizScore: 0.4 },
  { time: '09:12', engagement: 0.71, quizScore: 0.52 },
  demoSnapshots[0].point,
];

export const getInitialTimeline = () => [
  {
    id: 't1',
    action: 'switch_to_visual',
    timestamp: '09:03',
    reward: 0.08,
    reason:
      'Confusion signals rose after repeated revisits, so the system promoted visual reinforcement.',
    context: {
      fatigue: 'low',
      confusion: 'high',
      phase: 'early',
      mode: 'text',
    },
  },
  {
    id: 't2',
    action: 'simplify_chunk',
    timestamp: '09:09',
    reward: 0.12,
    reason:
      'The current strategy reduced complexity to stabilize engagement while preserving pacing.',
    context: {
      fatigue: 'high',
      confusion: 'high',
      phase: 'mid',
      mode: 'visual',
    },
  },
  {
    id: 't3',
    action: demoSnapshots[0].timelineEvent.action,
    timestamp: demoSnapshots[0].timelineEvent.timestamp,
    reward: demoSnapshots[0].timelineEvent.reward,
    reason: demoSnapshots[0].timelineEvent.reason,
    context: demoSnapshots[0].timelineEvent.context,
  },
];
