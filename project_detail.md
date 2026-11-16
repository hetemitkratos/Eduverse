# EduVerse: Comprehensive Project Detail Document

## 1. Project Philosophy & Core Concept
EduVerse is a deterministic, rule-based adaptive learning platform designed as a modular monolith. The core value proposition of EduVerse is **explainability and determinism**. Unlike black-box Generative AI platforms, EduVerse relies on mathematically explicit engagement formulas, predefined content variants, and transparent rule thresholds. 

The system continuously monitors learner behavior (pauses, revisits, idle time, quiz scores) to deduce internal states like fatigue, confusion, and engagement. It then maps these states to concrete pedagogical interventions (e.g., switching to audio mode, chunking content, reducing pace) and provides the user and reviewer with a real-time, human-readable rationale for every decision made.

---

## 2. Technology Stack & Architecture
The system is divided into two primary environments: a backend API engine and a frontend React application, alongside a legacy vanilla JS telemetry dashboard.

### 2.1 Backend Stack
- **Framework:** FastAPI
- **Database ORM:** SQLAlchemy
- **Database:** PostgreSQL (via `DATABASE_URL`), defaults to SQLite (`test_runtime.db`) for local testing.
- **State Management:** In-memory `SessionState` for runtime performance.

### 2.2 Frontend Stack
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS
- **Data Visualization:** Recharts, Chart.js (legacy dashboard)
- **Native APIs:** Browser Speech Synthesis APIs and `HTMLAudioElement`

---

## 3. Backend Architecture Deep Dive

The backend operates via `src/main.py` and is structured into discrete layers to enforce modularity.

### 3.1 Data Model Inventory
The core entities tracked in the SQL database include:
- **`Learner`**: External identity of the user.
- **`Session`**: Links learner, topic, strategy mode, and tracks the lifecycle of learning.
- **`InteractionLog`**: A stream of every interaction event.
- **`DecisionLog`**: Logs system adaptations, storing the proposed action, confidence, the responsible agent, context key, and the specific content type returned.
- **`EvaluationLog`**: Records performance, engagement, and quiz scores mapped to learning effectiveness.
- **`QuizAttempt`**: Explicit scores, current difficulty levels, and raw user response JSON for analytics.
- **`ActionMetrics`**: Powering the RL layer; tracks action total attempts, success counts, and rolling average rewards.
- **`ModalityMetrics`**: Tracks performance segregated by presentation modalities.

### 3.2 Runtime Session State
To ensure real-time latency, the backend uses an in-memory `SessionState` object per active session. It maintains:
- Interaction counts, continuous pause rates, content revisit metrics, and idle durations.
- The latest contextual vectors (e.g., high fatigue, low learning, weak concepts).
- Recent engagement values, quiz scores, and the historical timeline of adaptive decisions to prevent UX oscillation.

### 3.3 The Adaptive Engine & Orchestrator Flow
The adaptive sequence evaluates every interaction deterministically:
1. **Interaction Parsing**: Interactions are pushed to `POST /api/interaction/`.
2. **Context Generation**: A Boolean context vector is built (e.g., `fatigue = pause_rate ≥ 0.4`, `confusion = revisit_count ≥ 2`, `low_learning = quiz_score < 0.5`).
3. **Agent Evaluation**:
   - **Engagement Agent**: Computes `E = 0.5(Pause) + 0.3(Revisit) + 0.2(Idle)`. Adapts dynamically using standard deviation bounds from rolling arrays rather than fixed static numbers.
   - **Accessibility Agent**: Rule-based priority system. A high pause rate demands `switch_to_audio`. High revisits demand `switch_to_visual`.
4. **Conflict Resolution (Orchestrator)**: When agents disagree, the Orchestrator resolves conflicts via a static `priority_map` (Accessibility > Engagement).
5. **Reinforcement Learning (RL) Layer**: Queries `ActionMetrics`. If an action has been attempted >5 times, a success bias boost (`avg_reward * 0.2`) is injected onto the base confidence.
6. **Constraint Checks**: Evaluates cooldowns based on strategy mode (e.g., `balanced`=30s, `demo`=5s) and prevents thrashing via an Oscillation Queue.
7. **Content Mapping**: The final action (e.g., `simplify_chunk`) is mapped directly against the static `content.json` dataset to return a deterministic content block.

### 3.4 Adaptive Quiz System
Quiz outcomes dynamically modify system parameters without Generative AI:
- `< 0.5` score locks difficulty at `easy` and forcefully triggers `simplify_chunk` adaptation.
- `≥ 0.8` score promotes difficulty to `medium`.
- Quiz logic is pure computation, using string matching against predefined answer blobs.

---

## 4. Frontend Architecture & State Flow

The React frontend (`frontend-react/`) handles two critical roles: presenting the learning material to the user and surfacing the system's "internal thoughts" to the presenter/researcher.

### 4.1 Page Layout (`Home.jsx`)
The interface is split into three core zones:
- **Top Bar**: Controls for live polling vs demo mode, session injection, and one-click demo triggers.
- **Left Panel (Learner Zone)**: `ContentViewer` (text, voice, imagery) and `ContentComparison` (diffing the previous content with the newly adapted content).
- **Right Rail (Telemetry Zone)**: Surfaces `ThinkingIndicator`, `DecisionStory` (human-readable), `DecisionPanel` (machine-readable), `ContextPanel`, `ImpactCard`, and continuous engagement `Charts` + `Timeline`.

### 4.2 Data Ingestion Modes
The application serves data in three distinct flows:
- **Live Mode**: Continuously polls `api.js` (`/adaptation`, `/dashboard`, `/report`) every 5 seconds. Deltas are calculated dynamically on the frontend.
- **Demo Mode**: Utilizes `demoData.js` to run an offline deterministic timeline every 2.5 seconds, injecting a fake context payload to simulate engine behavior without a live database.
- **One-Click Demo Flow**: Triggered via `DemoController.jsx`. Bypasses the interval and pushes a mocked decision manually. Ideal for staged academic presentations.

### 4.3 Unified Thinking Scheduler
To make the AI feel intentional, frontend updates are throttled:
1. Update payload received.
2. Existing update timers cancelled.
3. `isThinking` set to true -> triggers `<ThinkingIndicator />` ("Analyzing -> Evaluating -> Adapting").
4. Hard delay of 1000ms.
5. Payloads committed via React `startTransition`.
6. UI seamlessly repaints with the new content, charts, and metrics.

---

## 5. Major Technical Milestones & Development Log

- **Phase 1 (Core MVP)**: FastAPI foundation mapped to PostgreSQL. Initialized independent `Engagement` and `Accessibility` agents with decoupled mapping mechanisms for text content.
- **Phase 2 (Safeguards)**: Implemented extreme mathematical constraints for academic review. Added `interaction_density`, explicit 30s rate limits, and an Oscillation queue to stop UI thrashing. Built the `ΔE / E_before` effectiveness metric.
- **Phase 3 (Multi-Modal)**: Extended the mapping engine to interpret `switch_to_audio` and `switch_to_visual` logic. Integrated `HTMLAudioElement` and speech synthesis gracefully on the UI layer.
- **Phase 4 (Quiz System)**: Transitioned evaluation to pure rule-based logic natively checking JSON arrays. Background workers recalculate `learning_effectiveness` off quiz arrays immediately after submission.
- **Phase 5 (Dashboard)**: Extracted telemetry to discrete API endpoints (`/api/dashboard/overview`) to decouple learner processes from researcher monitoring requests.
- **Phase 6 (Reinforcement Learning)**: Bootstrapped a deterministic SQL-driven RL system via `ActionMetrics`. Injects a mathematically bounded `20% max` confidence boost directly into the Orchestrator if previous attempts proved successful.
- **Phase 7 (Architecture v2.0)**: Extracted boolean context states natively. Upgraded threshold limits from fixed `.7/.3` metrics to rolling standard deviations. Injected strategy modes natively into SQL bounds.

---

## 6. Real-World Execution Flow (Demo Guide)

The project currently supports two primary interaction flows:

### The Learner Experience (`#/learn`)
- Clean UI, zero telemetry.
- User triggers `I understood this`, `Read it again`, or `Need a break`.
- `Read it again` × 2 triggers confusion -> visual mode.
- `Need a break` × 2 triggers fatigue -> audio mode.
- User answers quizzes; poor performance silently shifts content complexity without breaking the experience.

### The Researcher Experience (`#/`)
- Exposes the entire mechanical operation.
- Users trigger simulated `Pause Spikes` or `Go Idle` metrics.
- The UI surfaces the exact context vector (e.g., `fatigue=true`), the exact engine chosen (`Accessibility Agent`), and explicit metrics (`Confidence: 87%`, `Reward Applied: 12%`).
- Explanations are deterministic (e.g., "Because you paused extensively, we predict fatigue. Switched to Audio mode.").

---

## 7. Known Gaps & Future Roadmap
- **Persistence**: Runtime state relies entirely on Python dictionary memory. Needs migration to Redis for multi-worker scaling.
- **Data Synchronization**: A few dashboard API models infer data on the frontend to match schema inconsistencies; this requires a backend DTO unification pass.
- **Deployment**: Local environments require isolated setup commands (`uvicorn` + `npm run dev`). Full Dockerization is pending to complete the production story.
