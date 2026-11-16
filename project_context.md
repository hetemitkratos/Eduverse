# EduVerse Adaptive Learning Platform - Project Context

## 1. Overview

EduVerse is a deterministic adaptive learning platform built as a modular monolith.
Its core promise is that adaptation is explainable, reproducible, and not dependent on black-box generative AI.

The project currently contains:

- a FastAPI backend with session, interaction, adaptation, evaluation, quiz, and dashboard routes
- a React/Vite frontend that serves as the main adaptive demo and reviewer-facing interface
- a legacy vanilla JavaScript dashboard retained as an older telemetry implementation

The current state of the project is:

- frontend-demo strong
- architecturally rich
- partially connected to live backend data
- still backend-incomplete for full production deployment

This means EduVerse is already effective for demos, architecture reviews, and product storytelling, but still needs backend hardening and end-to-end product completion before it can be considered production-ready.

---

## 2. Product Concept

EduVerse monitors learner behavior and chooses deterministic interventions in real time.
The system is designed to answer questions like:

- Is the learner showing fatigue?
- Is the learner confused or repeatedly revisiting content?
- Is quiz performance trending down?
- Should pacing be slowed?
- Should the modality shift from text to audio or visual support?

EduVerse does not generate arbitrary content with AI.
Instead, it maps decisions onto predefined content variants, such as:

- default text
- simplified text
- chunked text
- step-by-step text
- audio mode
- visual mode
- hybrid presentation variants

This makes each change easier to justify, log, and analyze.

---

## 3. Architectural Summary

### 3.1 Backend

Primary stack:

- FastAPI
- SQLAlchemy
- PostgreSQL by default through `DATABASE_URL`
- in-memory runtime session state

Main backend entrypoint:

- `eduverse-backend/src/main.py`

Major backend areas:

- `src/api/routes`
  - HTTP entrypoints
- `src/core`
  - request models, context generation, strategy profiles
- `src/db`
  - SQLAlchemy models and database connection
- `src/modules`
  - adaptive logic, session state services, interaction tracking, evaluation, quizzes, reinforcement metrics, content mapping

### 3.2 Frontend

Primary stack:

- React 19
- Vite
- Tailwind CSS
- Recharts
- browser speech APIs and `HTMLAudioElement`

Main frontend entrypoints:

- `frontend-react/src/pages/Home.jsx`
- `frontend-react/src/services/api.js`
- `frontend-react/src/services/demoData.js`

The React frontend is the main product surface now.
It combines learner-facing content presentation with reviewer-facing interpretability and telemetry panels.

### 3.3 Legacy Frontend

The older dashboard remains under:

- `frontend/`

It uses plain JavaScript and Chart.js.
It is no longer the primary interface, but it remains useful as a reference implementation and fallback telemetry view.

---

## 4. Backend Architecture in Detail

### 4.1 API Surface

Current backend routes include the following major areas.

#### Session

- `POST /api/session/start`
  - creates a learner session

#### Interaction

- `POST /api/interaction/`
  - logs learner interactions and updates in-memory runtime state

#### Adaptation

- `GET /api/session/{session_id}/adaptation`
  - returns the current adaptation decision plus mapped content payload

#### Evaluation

- `POST /api/session/{session_id}/evaluate_async`
  - queues evaluation processing
- `GET /api/session/{session_id}/report`
  - returns the latest session evaluation report
- `GET /api/session/dashboard`
  - returns summary-style metrics

#### Quiz

- `GET /api/session/{session_id}/quiz/`
  - returns quiz content for the current difficulty level
- `POST /api/session/{session_id}/quiz/submit`
  - scores answers and updates difficulty deterministically

#### Dashboard / Telemetry

- `GET /api/dashboard/overview`
  - aggregate platform metrics
- `GET /api/session/{session_id}/dashboard`
  - session-level telemetry and adaptation history
- `GET /api/session/{session_id}/details`
  - raw interaction and decision detail
- `GET /api/dashboard/ab-test`
  - group comparison metrics
- `GET /api/dashboard/actions`
  - action-level reinforcement statistics
- `GET /api/dashboard/insights`
  - derived insights from RL-style metrics
- `GET /api/dashboard/export/csv`
  - CSV export endpoint

### 4.2 Data Model Inventory

Primary SQLAlchemy models include:

- `Learner`
  - external learner identity
- `Session`
  - topic, learner linkage, strategy, experiment group
- `InteractionLog`
  - interaction event stream
- `DecisionLog`
  - action, confidence, content type, context key, responsible agent
- `EvaluationLog`
  - engagement, completion, success, quiz score, learning effectiveness
- `QuizAttempt`
  - submitted quiz answers, score, difficulty, weak concept
- `ActionMetrics`
  - reward and success history by action/context
- `ModalityMetrics`
  - performance by content modality

### 4.3 Runtime Session State

The backend maintains an in-memory `SessionState` object for live adaptation.
This state currently tracks things like:

- interaction count
- pause behavior
- revisit behavior
- idle time
- prior engagement score
- quiz score history
- current difficulty
- weak concepts
- recent contexts
- recent engagement values
- recent rewards
- recent decisions
- last adaptation time

This state powers the deterministic adaptation loop, but it is not yet persistent across process restarts.

### 4.4 Adaptive Pipeline

The backend adaptive sequence is:

1. load session state
2. derive learner context from current interaction and quiz signals
3. load strategy profile
4. score pace and engagement through an engagement agent
5. score fatigue, confusion, modality, and accessibility signals through an accessibility-focused layer
6. resolve competing actions through an orchestrator
7. apply cooldown, oscillation prevention, and fallback logic
8. apply bounded reinforcement influence if appropriate
9. log the chosen action
10. map the action to a content payload

### 4.5 Deterministic Logic Patterns

The current backend emphasizes:

- bounded engagement formulas
- threshold-based context classification
- explicit strategy profiles:
  - aggressive
  - balanced
  - conservative
- deterministic modality switching:
  - fatigue -> audio support
  - confusion -> visual support
- targeted simplification or chunking for weaker performance states
- fallback to maintain/default behavior under low-confidence conditions

### 4.6 Reinforcement Layer

EduVerse includes an RL-style but still deterministic reinforcement layer.
It does not perform unconstrained model learning.

It currently:

- tracks attempts per action/context
- tracks success counts
- stores average reward
- uses a bounded confidence boost pattern such as:
  - `avg_reward * 0.2`

This keeps the system adaptive but still auditable.

### 4.7 Quiz Logic

Quiz behavior is rule-based and deterministic.

Current difficulty rules:

- score < `0.5` -> `easy`
- score >= `0.8`
  - `easy` -> `medium`
  - otherwise -> `hard`

Quiz outcomes influence:

- weak concept tracking
- context state
- evaluation metrics
- simplification / fallback adaptation behavior

---

## 5. Frontend Architecture in Detail

### 5.1 Main Page Layout

Main page:

- `frontend-react/src/pages/Home.jsx`

Current page structure is a three-zone layout.

#### Top Area

- EduVerse identity / title
- one-click demo controller
- controls for live mode and demo mode
- session ID input
- status banner for live/demo messaging

#### Left Area

- main learning content viewer
- previous vs current content comparison

#### Right Area

- thinking indicator
- predictive signal banner
- decision story
- decision panel
- explanation panel
- confidence and learning score cards
- context and impact cards
- learner profile
- adaptation history strip
- system status HUD
- charts
- insights
- timeline

### 5.2 Frontend State Model

`Home.jsx` currently manages these primary states:

- `decision`
- `currentContent`
- `context`
- `metrics`
- `series`
- `timeline`
- `isThinking`
- `isDemoMode`
- `demoIndex`
- `liveStatus`
- `liveMessage`
- `sessionIdInput`
- `activeSessionId`

Supporting refs include:

- `updateTimeoutRef`
  - tracks the active scheduled UI update
- `updateVersionRef`
  - prevents stale delayed updates from winning
- `lastLiveScoresRef`
  - tracks prior live engagement and quiz scores for delta calculation

### 5.3 Frontend Data Sources

The frontend runs in two major operating modes plus one auxiliary trigger path.

#### Live Mode

Live mode uses `frontend-react/src/services/api.js`.

It fetches:

- `/api/session/{id}/adaptation`
- `/api/session/{id}/dashboard`
- `/api/session/{id}/report`
- `/api/dashboard/insights`

The frontend polls live session data every 5 seconds when a session ID is active and demo mode is off.

#### Demo Mode

Demo mode uses deterministic snapshots from:

- `frontend-react/src/services/demoData.js`

It simulates adaptive changes every 2.5 seconds and updates:

- decision
- content
- context
- metrics
- chart points
- timeline

#### Demo Controller

`DemoController.jsx` provides a one-click `Run Demo` path that injects demo states without requiring the main demo toggle.
It is useful for quickly triggering a narrative flow during presentations.

### 5.4 Performance Design

The React demo has already been optimized in a few meaningful ways:

- `Charts`, `Insights`, and `Timeline` are lazy-loaded
- charting is code-split out of the main bundle
- update application uses `startTransition`
- repeated timer orchestration is centralized in `Home.jsx`
- `useEffectEvent` is used for stable timer-driven update callbacks

---

## 6. Live Data Normalization Strategy

The backend does not expose a perfect one-to-one UI payload for every frontend panel.
To avoid backend changes, the frontend derives a normalized shape.

Key normalization patterns in `frontend-react/src/services/api.js`:

- decision action is normalized whether the backend returns a string or object
- content mode is inferred from `content.type` or `content.mode`
- content bodies are normalized into displayable text arrays
- audio content produces `audioUrl` when the backend content type is audio
- learner context is inferred from `context_key`, mode, and adaptation count
- session phase is derived from number of adaptations:
  - early
  - mid
  - late
- live timeline entries are reversed and normalized into UI-friendly items
- live metrics deltas are derived on the frontend by comparing the latest backend scores to the prior poll

This is how the React app remains compatible with current backend APIs without requesting backend schema changes.

---

## 7. Frontend Feature Inventory

This section reflects the current implemented React feature set.

### 7.1 Learning Surface

#### `ContentViewer.jsx`

Purpose:

- renders the currently active learning content

Features:

- displays title, topic, mode, and content body
- supports text, visual, and audio-oriented content
- integrates `VoicePlayer`
- fades between old and new content
- briefly shows an `Adapting...` overlay when content changes

#### `ContentComparison.jsx`

Purpose:

- explains what changed between the prior and current content state

Features:

- stores prior content state
- renders previous vs current
- highlights changed fields
- visually supports the adaptive narrative during demos

#### `VoicePlayer.jsx`

Purpose:

- provides demo-ready playback of learning content

Features:

- uses `speechSynthesis` when no audio URL exists
- uses `HTMLAudioElement` when an audio URL exists
- cancels previous playback before new playback starts
- stops on content change
- auto-plays when the mode is audio
- avoids overlapping playback
- cleans up on unmount

### 7.2 Decision, Explanation, and Narrative Layer

#### `ThinkingIndicator.jsx`

Purpose:

- makes adaptive updates feel intentional

Features:

- shows a short sequence:
  - analyzing
  - evaluating
  - adapting
- visible only while `isThinking` is true

#### Predictive Signal Banner

Purpose:

- surfaces an early warning before an adaptive change lands

Implementation:

- rendered directly in `Home.jsx`

Behavior:

- computes `engagementTrend` from the recent chart series
- if the trend is decreasing and `isThinking` is true, shows:
  - `⚠️ Engagement dropping detected`

#### `DecisionStory.jsx`

Purpose:

- gives a short deterministic narrative that combines context, action, and impact

Features:

- maps fatigue, confusion, and low-learning state into plain-language story text
- maps action into a human-readable intervention phrase
- includes impact language using engagement delta
- keeps the story to a short 2 to 3 sentence block

#### `DecisionPanel.jsx`

Purpose:

- displays the core machine decision in structured form

Current fields:

- action
- confidence
- intensity
- strategy
- reason

Additional linked impact section:

- result of last action
- engagement delta
- quiz delta
- reward

Features:

- subtle highlight animation when decision changes

#### `ExplanationPanel.jsx`

Purpose:

- translates the current decision and context into deterministic natural language

Features:

- integrated into `Home.jsx`
- maps:
  - fatigue -> "you showed signs of fatigue"
  - confusion -> "you revisited content multiple times"
  - low learning -> "your quiz performance dropped"
- includes:
  - confidence
  - strategy
- uses a fallback explanation when no context flags are active

### 7.3 Context and Learner Modeling Layer

#### `ContextPanel.jsx`

Purpose:

- surfaces normalized learner state

Displays:

- fatigue
- confusion
- learning / low-learning signal
- session phase
- mode

Features:

- uses colored chips for quick scanning

#### `LearnerProfile.jsx`

Purpose:

- classifies the learner into a simple deterministic persona

Current profiles:

- struggling learner
- fast learner
- balanced learner

Logic:

- `fatigue && low_learning` -> struggling learner
- high engagement -> fast learner
- otherwise -> balanced learner

#### `SystemStatus.jsx`

Purpose:

- provides a stable system-health HUD for the demo

Displays:

- system active
- adaptive engine running
- learning mode on

### 7.4 Metrics and Telemetry Layer

#### `ImpactCard.jsx`

Displays:

- engagement delta
- quiz delta
- reward

Features:

- positive values show green
- negative values show red

#### `ConfidenceBar.jsx`

Displays:

- decision confidence as a percentage
- a visual progress bar

#### `LearningScore.jsx`

Displays:

- `0.5 * engagement + 0.5 * quiz_score`

Format:

- `Learning Score: XX / 100`

#### `AdaptationStrip.jsx`

Displays:

- the last 5 actions in condensed sequence form

Purpose:

- quickly shows recent intervention history

#### `Charts.jsx`

Uses:

- Recharts

Displays:

- engagement over time
- quiz score over time

#### `Insights.jsx`

Uses:

- `/api/dashboard/insights`

Displays:

- insight text
- confidence
- sample size when available

#### `Timeline.jsx`

Displays:

- action
- timestamp
- reward
- expandable details with reasoning and context

Purpose:

- gives a readable history of system actions

### 7.5 Control Layer

#### `Controls.jsx`

Purpose:

- manages live-mode interaction

Features:

- session ID input
- demo mode toggle
- load action
- reset action
- live/demo state label

#### `DemoController.jsx`

Purpose:

- lets the presenter trigger a one-click demo sequence

Behavior:

- pushes mock decision, context, and metrics updates
- uses the same central thinking/update orchestration as the rest of the app

---

## 8. Demo Data Model

The local demo system in `frontend-react/src/services/demoData.js` currently provides a deterministic mini-storyline.

It contains snapshots covering actions such as:

- `simplify_chunk`
- `switch_to_visual`
- `reduce_pace`
- `switch_to_audio`

Each snapshot includes:

- `decision`
- `content`
- `context`
- `metrics`
- a chart `point`
- a `timelineEvent`

This gives the app enough data to simulate a convincing adaptive-learning session even when the backend is unavailable.

---

## 9. Frontend Update Flow

### 9.1 Unified Thinking Flow

The main demo behavior now uses a unified scheduling pattern.

Current behavior:

1. an incoming update arrives from demo mode, demo controller, or live polling
2. any previously scheduled delayed update is cancelled
3. `updateVersionRef` increments so stale updates cannot commit later
4. `isThinking` becomes `true`
5. the UI waits 1000ms
6. the latest valid update commits inside `startTransition`
7. `decision`, `content`, `context`, `metrics`, `series`, and `timeline` are updated
8. `isThinking` becomes `false`

This creates a smooth sequence:

- thinking
- decision
- content
- metrics

It also prevents overlapping delayed updates from producing inconsistent UI state.

### 9.2 Demo Mode Flow

Current demo mode flow:

1. user enables Demo Mode
2. an interval runs every 2.5 seconds
3. the app advances through deterministic snapshots
4. each snapshot is pushed through the unified thinking flow
5. panels update together after the thinking delay

### 9.3 One-Click Demo Flow

Current one-click demo flow:

1. user clicks `Run Demo`
2. `DemoController` emits a mock update
3. `Home.jsx` routes the update through the same thinking scheduler
4. the right rail, content area, charts, and timeline update in sync

### 9.4 Live Polling Flow

Current live flow:

1. user enters a session ID
2. user leaves Demo Mode off
3. `Home.jsx` calls `getSessionLiveSnapshot(sessionId)`
4. `api.js` fetches:
   - adaptation
   - dashboard
   - report
5. data is normalized into frontend decision, content, context, scores, series point, and timeline shapes
6. deltas are computed using `lastLiveScoresRef`
7. the result is passed through the same unified thinking flow
8. polling repeats every 5 seconds

---

## 10. Current Demo Story

The current demo experience tells a stronger story than the earlier frontend versions.

### 10.1 The System Appears to Think Before Acting

Users see:

- a thinking sequence
- an optional predictive warning
- then a committed adaptive decision

### 10.2 Decisions Are Both Structured and Human-Readable

The right rail now gives three layers of explanation:

- `DecisionStory`
  - short narrative
- `DecisionPanel`
  - structured machine-facing details
- `ExplanationPanel`
  - deterministic human-readable reason mapping

### 10.3 Content Adaptation Feels Concrete

The user can:

- see content transition
- compare previous vs current content
- hear content through voice playback
- observe modality changes such as audio or visual emphasis

### 10.4 Learner State and Impact Are Visible Together

The UI surfaces:

- current learner context
- learner profile
- confidence
- impact deltas
- learning score
- adaptation history

### 10.5 The Demo Works With or Without Real Backend Activity

The product can be demonstrated in two ways:

- live mode against existing backend session data
- deterministic demo mode with no backend dependency

This is one of the strongest current properties of the system.

---

## 11. Known Gaps and Reality Check

### 11.1 Backend Limitations

Important backend limitations still remain:

- local backend environment is not fully ready by default
- some route/model mismatches still exist
- some export/report code paths reference inconsistent fields
- runtime state is in-memory rather than persistent
- deployment scaffolding is still incomplete

### 11.2 Frontend Limitations

The React demo is much stronger now, but a few gaps remain:

- some displayed live context is inferred rather than returned directly by the backend
- `DemoController` and persistent Demo Mode overlap conceptually and could eventually be unified
- the main frontend is demo-complete, but the true learner workflow is still lighter than the dashboard layer

### 11.3 Product Completion Gaps

Still needed for a fully functional product:

- a cleaner session-start to quiz-submit end-to-end learner flow
- backend bug-fix and test pass
- deployment packaging
- updated product documentation and PRD

---

## 12. Current File Map of the Main React App

### Pages

- `frontend-react/src/pages/Home.jsx`

### Services

- `frontend-react/src/services/api.js`
- `frontend-react/src/services/demoData.js`

### Core Components

- `ContentViewer.jsx`
- `ContentComparison.jsx`
- `VoicePlayer.jsx`
- `ThinkingIndicator.jsx`
- `DecisionStory.jsx`
- `DecisionPanel.jsx`
- `ExplanationPanel.jsx`
- `ContextPanel.jsx`
- `ImpactCard.jsx`
- `ConfidenceBar.jsx`
- `LearningScore.jsx`
- `LearnerProfile.jsx`
- `AdaptationStrip.jsx`
- `SystemStatus.jsx`
- `Charts.jsx`
- `Insights.jsx`
- `Timeline.jsx`
- `Controls.jsx`
- `DemoController.jsx`

### Supporting Legacy Surface

- `frontend/`

---

## 13. How to Explain EduVerse to a Reviewer

### Short Version

EduVerse is a deterministic adaptive learning system that observes learner signals, chooses predefined interventions using explicit rules, and presents those decisions through an explainable frontend.

### Reviewer-Friendly Version

EduVerse combines a FastAPI backend, SQL telemetry, rule-based adaptation logic, deterministic quiz evaluation, bounded reinforcement metrics, and a React demo UI.
The backend converts interactions and quiz outcomes into interpretable learner context, selects a best-fit intervention through explicit logic, and maps that intervention to structured content variants.
The frontend then turns those backend decisions into a compelling demo experience with content transitions, voice playback, confidence indicators, timeline history, learning metrics, narrative explanations, and a deterministic demo mode that showcases the full adaptive loop even without active backend traffic.

---

## 14. Development Directives

These principles should continue to guide future work:

- preserve deterministic adaptation logic
- avoid introducing opaque AI decision logic into the core adaptive path
- keep explanations traceable to rules, thresholds, formulas, or logged state
- prefer small reusable frontend modules
- keep frontend compatibility with existing backend endpoints where possible
- update this file whenever the actual project behavior materially changes
- update `eduverse-backend/DEV_LOG.md` when backend logic or formulas change

---

## 15. Current Status Summary

Today, EduVerse is:

- demo-ready on the frontend
- architecturally distinctive
- explainable by design
- visually polished for presentations
- partially connected to real backend state
- still not fully backend-hardened for production

The project already tells a convincing adaptive-learning story and now has a substantially stronger React demo than earlier iterations.
The next major leap is not more demo polish, but hardening the backend and completing one reliable live end-to-end learner flow.
