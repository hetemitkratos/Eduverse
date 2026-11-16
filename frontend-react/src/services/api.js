const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
export const DEMO_TOPIC = { id: 'photosynthesis', label: 'Photosynthesis' };
export const TOPIC_OPTIONS = [DEMO_TOPIC];

const fetchJson = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    throw new Error(`Request failed for ${path}.`);
  }

  return response.json();
};

const formatTitle = (value) =>
  String(value ?? 'maintain')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const looksLikeImagePath = (value) =>
  typeof value === 'string' &&
  /(\.(png|jpe?g|gif|webp|svg))$/i.test(value);

const formatTimestamp = (value) => {
  if (!value) {
    return 'Unknown';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const normalizeInsight = (insight, index) => ({
  id: insight.id ?? `${index}-${insight.message ?? insight.text ?? 'insight'}`,
  text: insight.message ?? insight.text ?? 'Insight unavailable.',
  confidence: Number(insight.confidence ?? 0),
  sampleSize: insight.sample_size ?? insight.sampleSize ?? null,
});

const inferMode = (content) => {
  const rawMode = content?.mode ?? content?.type ?? 'text';
  return formatTitle(rawMode);
};

const normalizeContentBody = (content) => {
  const body = content?.content ?? content?.data;

  if (Array.isArray(body)) {
    return body;
  }

  if (body && typeof body === 'object') {
    if (typeof body.text === 'string' && body.text.trim()) {
      return body.text;
    }
    return Object.entries(body).map(([key, value]) => `${formatTitle(key)}: ${value || 'Unavailable'}`);
  }

  if (content?.type === 'audio' && body) {
    return [`Audio asset: ${body}`];
  }

  if (content?.type === 'visual' && body) {
    return [`Visual asset: ${body}`];
  }

  return body || 'No content available yet.';
};

const normalizeTopicContent = (payload, fallbackTopic) => ({
  mode:
    payload?.mode === 'visual'
      ? 'Visual Mode'
      : payload?.variant === 'audio'
        ? 'Audio Mode'
        : 'Text Mode',
  topic: payload?.topic ?? fallbackTopic,
  title: payload?.topic ?? fallbackTopic,
  body:
    Array.isArray(payload?.content) || typeof payload?.content === 'string'
      ? payload.content
      : payload?.content?.text
        ? payload.content.text
        : 'No content available yet.',
  imageUrl:
    payload?.mode === 'visual' && looksLikeImagePath(payload?.content?.diagram)
      ? payload.content.diagram
      : undefined,
  diagramText:
    payload?.mode === 'visual' && payload?.content?.diagram && !looksLikeImagePath(payload?.content?.diagram)
      ? payload.content.diagram
      : undefined,
  audioUrl: payload?.variant === 'audio' && typeof payload?.content === 'string' ? payload.content : undefined,
});

const postJson = (path, body) =>
  fetchJson(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

const deriveContext = (contextKey, mode, adaptationCount) => {
  const key = String(contextKey ?? 'default');

  return {
    fatigue: key.includes('fatigue'),
    confusion: key.includes('confusion'),
    learning: key.includes('low_quiz') ? 'low' : 'high',
    phase: adaptationCount >= 5 ? 'late' : adaptationCount >= 2 ? 'mid' : 'early',
    mode: String(mode ?? 'text').toLowerCase(),
  };
};

const buildTimelineReason = (item) => {
  const parts = [];

  if (item.agent) {
    parts.push(`Agent: ${item.agent}`);
  }

  if (item.context_key) {
    parts.push(`Context: ${item.context_key}`);
  }

  return parts.length > 0 ? parts.join(' | ') : 'Live timeline update from backend.';
};

export const getDashboardInsights = async () => {
  const payload = await fetchJson('/api/dashboard/insights');
  const insights = Array.isArray(payload.insights) ? payload.insights : [];

  return insights.map(normalizeInsight);
};

export const getActionMetrics = async () => {
  const payload = await fetchJson('/api/dashboard/actions').catch(() => null);
  return payload?.actions ?? payload ?? [];
};

export const getTopics = async () => {
  const payload = await fetchJson('/api/topics');
  return Array.isArray(payload.topics) ? payload.topics : [];
};

export const generateTopic = async (topic) => {
  const payload = await postJson('/api/content/generate', { topic });
  if (payload.error) throw new Error(payload.error);
  return payload;
};

export const getSessionReport = async (sessionId) => {
  const log = await fetchJson(`/api/session/${sessionId}/report`).catch(() => null);
  return log;
};

export const startSession = async ({ learnerId, topicId, abGroup = 'A', strategyMode = 'balanced' }) =>
  postJson('/api/session/start', {
    learner_id: learnerId,
    topic_id: topicId,
    ab_group: abGroup,
    strategy_mode: strategyMode,
  });

export const sendInteraction = async ({ sessionId, eventType, eventValue }) =>
  postJson('/api/interaction/', {
    session_id: sessionId,
    event_type: eventType,
    event_value: eventValue,
  });

export const triggerEvaluation = async (sessionId) =>
  postJson(`/api/session/${sessionId}/evaluate_async`, {});

export const getTopicContent = async (topicId, variant = 'default') => {
  const payload = await fetchJson(
    `/api/content?topic=${encodeURIComponent(topicId)}&variant=${encodeURIComponent(variant)}`,
  );

  return normalizeTopicContent(payload, topicId);
};

export const getSessionQuiz = async (sessionId) =>
  fetchJson(`/api/session/${sessionId}/quiz/`);

export const submitSessionQuiz = async (sessionId, answers) =>
  postJson(`/api/session/${sessionId}/quiz/submit`, { answers });

export const getSessionState = async (sessionId) =>
  fetchJson(`/api/session/${sessionId}/system-state`);

export const getSessionLiveSnapshot = async (sessionId) => {
  const [adaptation, dashboard, report] = await Promise.all([
    fetchJson(`/api/session/${sessionId}/adaptation`),
    fetchJson(`/api/session/${sessionId}/dashboard`),
    fetchJson(`/api/session/${sessionId}/report`).catch(() => null),
  ]);

  const decisionPayload = adaptation?.decision;
  const action =
    typeof decisionPayload === 'string'
      ? decisionPayload
      : decisionPayload?.action ?? 'maintain';
  const intensity =
    typeof decisionPayload === 'string'
      ? 0
      : Number(decisionPayload?.intensity ?? 0);

  const engagement = Number(report?.engagement_score ?? dashboard?.engagement_score ?? 0);
  const quizScore = Number(report?.quiz_score ?? dashboard?.quiz_score ?? 0);
  const reward = Number(adaptation?.reward_influence ?? report?.adaptation_success ?? 0);
  const contentType = adaptation?.content?.type ?? 'text';
  const variant = adaptation?.content?.variant ?? adaptation?.content?.mode ?? adaptation?.content?.type ?? 'default';
  const adaptationCount = Number(dashboard?.number_of_adaptations ?? 0);
  const latestTimelineItem =
    Array.isArray(dashboard?.adaptations) && dashboard.adaptations.length > 0
      ? dashboard.adaptations[dashboard.adaptations.length - 1]
      : null;

  const timeline = Array.isArray(dashboard?.adaptations)
    ? [...dashboard.adaptations]
        .reverse()
        .map((item, index) => ({
          id: `${item.timestamp ?? index}-${item.decision}-${index}`,
          action: item.decision ?? 'maintain',
          timestamp: formatTimestamp(item.timestamp),
          reward: index === 0 ? reward : 0,
          reason: buildTimelineReason(item),
          context: deriveContext(
            item.context_key,
            item.decision?.includes('audio')
              ? 'audio'
              : item.decision?.includes('visual')
                ? 'visual'
                : contentType,
            adaptationCount,
          ),
        }))
    : [];

  // Build audio URL: if content type is audio and data is a URL string
  const rawAudioData = adaptation?.content?.data ?? adaptation?.content?.content;
  const audioUrl =
    contentType === 'audio' && typeof rawAudioData === 'string' && rawAudioData.startsWith('http')
      ? rawAudioData
      : undefined;

  return {
    decision: {
      action,
      confidence: Number(adaptation?.confidence ?? 0),
      intensity,
      strategy: adaptation?.content?.variant ?? 'live',
      reason: adaptation?.reason ?? 'Live backend update',
      reinforcement_applied: adaptation?.reinforcement_applied ?? false,
      reward_influence: adaptation?.reward_influence ?? 0,
    },
    content: {
      mode:
        contentType === 'visual'
          ? 'Visual Mode'
          : contentType === 'audio'
            ? 'Audio Mode'
            : contentType === 'hybrid'
              ? 'Hybrid Mode'
              : inferMode(adaptation?.content),
      topic: adaptation?.content?.topic ?? `Session ${sessionId}`,
      title: adaptation?.content?.topic ?? `Session ${sessionId}`,
      body: normalizeContentBody(adaptation?.content),
      imageUrl:
        contentType === 'visual' && looksLikeImagePath(adaptation?.content?.content?.diagram)
          ? adaptation.content.content.diagram
          : contentType === 'visual' && looksLikeImagePath(adaptation?.content?.data?.diagram)
            ? adaptation.content.data.diagram
            : undefined,
      diagramText:
        contentType === 'visual' && adaptation?.content?.content?.diagram && !looksLikeImagePath(adaptation?.content?.content?.diagram)
          ? adaptation.content.content.diagram
          : contentType === 'visual' && adaptation?.content?.data?.diagram && !looksLikeImagePath(adaptation?.content?.data?.diagram)
            ? adaptation.content.data.diagram
            : contentType === 'visual' && adaptation?.content?.data?.text
              ? adaptation.content.data.text
              : undefined,
      audioUrl,
      variant: typeof variant === 'string' ? variant : 'default',
    },
    context: deriveContext(latestTimelineItem?.context_key, contentType, adaptationCount),
    scores: {
      engagement,
      quizScore,
      reward,
    },
    seriesPoint: {
      time: formatTimestamp(report?.timestamp ?? latestTimelineItem?.timestamp ?? new Date().toISOString()),
      engagement,
      quizScore,
    },
    timeline,
  };
};
