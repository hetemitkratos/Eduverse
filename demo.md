# EduVerse — Demo Guide

> **Who this is for:** Presenters, reviewers, and developers running EduVerse for the first time.  
> There are two demo experiences — a **Learner Demo** (public-facing) and a **Researcher Demo** (technical deep-dive). This guide covers both.

---

## Quick Start (2 minutes)

### 1. Start the backend

```powershell
cd d:\EduVerse\eduverse-backend
venv\Scripts\python.exe -m uvicorn src.main:app --reload --port 8000
```

Expected output:
```
INFO:     Application startup complete.
```

> The backend loads `data/content.json` on startup. If it fails validation, it will print which topic or variant is missing.

### 2. Start the frontend

Open a second terminal:

```powershell
cd d:\EduVerse\frontend-react
npm run dev
```

Expected output:
```
VITE ready in ~400ms
➜  Local:   http://localhost:5173/
```

> If port 5173 is busy, Vite auto-assigns the next free port (e.g. 5174). Check the terminal output for the actual URL.

### 3. Open the app

| URL | What you get |
|-----|-------------|
| `http://localhost:5173/#/` | Researcher Demo — full adaptive engine view |
| `http://localhost:5173/#/learn` | Learner Demo — clean 3-step learner journey |

---

## Experience A — Learner Demo (`#/learn`)

**Best for:** Stakeholder presentations, user walkthroughs, showing the product as a real learner would see it.

The learner sees content adaptation happening — but never sees raw decisions, confidence scores, or agent names. The system is transparent through behavior, not data.

### Step 1 — Topic Select

Navigate to `/#/learn`. You will see three topic cards:

| Topic | Difficulty | Est. Time | Questions |
|-------|-----------|-----------|-----------|
| Photosynthesis | Beginner | 8 min | 5 |
| Newton's Laws | Beginner | 10 min | 5 |
| Basic Electricity | Intermediate | 12 min | 5 |

Click any card. The system:
- Creates a new session via `POST /api/session/start`
- Loads default text content via `GET /api/content?topic=...&variant=default`
- Loads the quiz via `GET /api/session/{id}/quiz/`

### Step 2 — Learn (Interact with Content)

The learner sees the content and three interaction buttons:

| Button | What it signals | Backend event |
|--------|----------------|---------------|
| ✅ I understood this | Normal reading | `pause = 0.05` (low fatigue) |
| 🔁 Read it again | Confusion / revisit | `revisit += 1` |
| ⏸ Need a break | Fatigue | `pause = 0.80` (high fatigue) |

**Progress tracking:** Every click advances the progress bar by 15%. At **60% (4 interactions)**, the "Take the Quiz →" button appears.

**Adaptation trigger:** Every 2nd interaction, the system fires:
1. `POST /api/session/{id}/evaluate_async` — runs the evaluation pipeline
2. `GET /api/session/{id}/adaptation` — gets the new adaptive decision

If the content mode changes (Text → Audio → Visual), a soft toast appears:
> 🧠 *We've adjusted how this content is delivered to better suit your learning.*

**To trigger audio mode:** Click "⏸ Need a break" twice. The Accessibility Agent will detect `fatigue=true` and switch to audio mode.

**To trigger visual mode:** Click "🔁 Read it again" twice. The Accessibility Agent will detect `confusion=true` and switch to visual mode.

### Step 3 — Quiz

One question at a time. Navigation:
- **Next →** — advance to next question (requires an answer)
- **← Back** — go back to a previous question
- **Jump dots** — click any dot to jump to that question
- **Submit Answers ✓** — appears only on the last question

The quiz is difficulty-aware:
- Default difficulty: `easy`
- Score ≥ 0.8 → promoted to `medium`
- Score < 0.5 → stays at `easy` and triggers `simplify_chunk` adaptation

### Step 4 — Results

After submission you see:
- **Animated score ring** (green ≥ 80%, amber ≥ 50%, red < 50%)
- **Stat cards**: Quiz Score, Engagement, Learning Effectiveness
- **Adaptation timeline**: every content change explained in plain English
- **Weak concepts**: listed if score < 80%

Action buttons:
- **🔄 Try Again** — returns to the learning step with the same session
- **Choose New Topic →** — resets to topic picker

---

## Experience B — Researcher Demo (`#/`)

**Best for:** Technical reviewers, architecture walkthroughs, live engine observation.

This page shows everything the learner doesn't see: raw decisions, confidence values, agent reasoning, reinforcement metrics, and a full adaptation timeline.

### One-Click Automated Simulation

Click **Run Demo** in the header.

The simulation runs through 5 scripted phases automatically:

| Phase | What happens | Expected engine decision |
|-------|-------------|--------------------------|
| **1 — Baseline** | Session starts, content loads, normal reading | `maintain` (no change needed) |
| **2 — Fatigue** | Three consecutive heavy pauses (0.55 → 0.70 → 0.80) | `switch_to_audio` — Accessibility Agent detects `fatigue=true, confusion=false` |
| **3 — Confusion** | Pause rate resets, then 2 revisits logged | `switch_to_visual` — Accessibility Agent detects `confusion=true, fatigue=false` |
| **4 — Quiz Failure** | Quiz submitted with deliberate wrong answers | `simplify_chunk` — low_quiz_score bypass overrides all agents |
| **5 — Complete** | Demo ends | Manual interaction available |

> The simulation uses `strategy_mode = "demo"` which sets cooldown to 5 seconds (vs. 30s in balanced mode), so adaptations fire quickly during presentations.

### What to point at during the simulation

| Panel | What to say |
|-------|------------|
| **Thinking Indicator** | "The engine is analysing — it doesn't adapt instantly, it deliberates." |
| **Decision Panel** | "Action, confidence, intensity, and strategy — all explicit, no black box." |
| **Decision Story** | "A 2-sentence human narrative automatically generated from the rule outputs." |
| **Explanation Panel** | "The exact context signals that caused the decision." |
| **Context Panel** | "Fatigue, confusion, learning status, session phase — the learner model in real time." |
| **Content Viewer** | "The actual content the learner sees changing — text → audio → visual." |
| **Charts** | "Engagement and quiz score over time, updating after every evaluation cycle." |
| **Timeline** | "Every decision ever made in this session — expandable with reasoning and context." |
| **System State (button)** | "Full in-memory session state dump — every variable the engine can see." |

### Manual Interactions (after demo completes)

Use the **Live Interactions** panel to fire individual signals:

| Button | Fires | Threshold it crosses |
|--------|-------|---------------------|
| Pause Spike | `pause = 0.7` | `pause_rate ≥ 0.4` → fatigue |
| Revisit Content | `revisit += 1` | `revisit_count ≥ 2` → confusion |
| Go Idle | `idle += 30s` | Feeds `E = 0.5(pause) + 0.3(revisit×0.1) + 0.2(min(idle/60,1))` |

Each manual interaction runs:
1. `POST /api/interaction/` — updates session state
2. `POST /api/session/{id}/evaluate_async` — runs evaluation
3. `GET /api/session/{id}/adaptation` — fetches new decision
4. UI updates through the Unified Thinking Flow (1s deliberation delay, then commit)

---

## The Adaptive Engine — For Reviewer Questions

### How does adaptation work?

```
Interaction logged
  → SessionState updated (pause_rate, revisit_count, idle_time)
  → Context vector generated:
       fatigue      = pause_rate ≥ 0.4
       confusion    = revisit_count ≥ 2
       low_learning = last_quiz_score < 0.5
       trend        = slope of recent engagement scores
       phase        = early (<10 interactions) / mid / late (>30)
  → Engagement Agent evaluates (dynamic std-dev thresholds)
  → Accessibility Agent evaluates (rule-based priority)
  → Orchestrator resolves conflicts (accessibility priority > engagement)
  → RL boost applied if action has ≥ 5 prior attempts (capped at avg_reward × 0.2)
  → Cooldown check (30s balanced / 60s conservative / 10s aggressive / 5s demo)
  → Oscillation check (last 3 decisions checked for thrashing)
  → Action mapped to content payload
  → DecisionLog written to DB
```

### Strategy profiles

| Mode | Cooldown | Threshold offset | Use case |
|------|---------|-----------------|----------|
| `balanced` | 30s | ±0.00 | Default |
| `aggressive` | 10s | ±0.15 | Fast adaptation |
| `conservative` | 60s | ±0.15 | Slow, careful adaptation |
| `demo` | 5s | ±0.10 | Live presentations |

Strategy auto-switches:
- Learning effectiveness < 0.4 → `conservative`
- Engagement trend dropping AND effectiveness < 0.6 → `conservative`
- Effectiveness > 0.7 AND trend stable → `conservative → balanced`

### Content modes available

| Mode | Triggered by | Content format |
|------|-------------|---------------|
| `text / default` | Baseline | Long-form paragraph |
| `simplified` | Low engagement trend | Shorter, plainer paragraph |
| `chunked` | Simplify decision | Numbered steps |
| `audio` | Fatigue (high pause rate) | Audio URL + text fallback |
| `visual` | Confusion (high revisit count) | Diagram + descriptive text |
| `hybrid` | Fatigue + confusion | Mixed audio + visual |

---

## API Quick Reference

```
GET  /api/topics                         → list all available topics
GET  /api/content?topic=X&variant=Y     → content variant for a topic

POST /api/session/start                  → create session
     body: { learner_id, topic_id, strategy_mode }

POST /api/interaction/                   → log an interaction
     body: { session_id, event_type, event_value }

GET  /api/session/{id}/adaptation       → get current adaptive decision + content
POST /api/session/{id}/evaluate_async   → trigger evaluation (background)
GET  /api/session/{id}/report           → latest evaluation report
GET  /api/session/{id}/quiz/            → quiz for current difficulty
POST /api/session/{id}/quiz/submit      → submit answers
     body: { answers: ["A", "B", ...] }

GET  /api/session/{id}/system-state     → full in-memory session state (debug)
GET  /api/session/{id}/dashboard        → session-level telemetry
GET  /api/dashboard/overview            → platform-wide aggregate metrics
GET  /api/dashboard/actions             → reinforcement learning action stats
GET  /api/dashboard/insights            → derived analytical insights
GET  /api/dashboard/export/csv          → CSV export of all session data
```

Interactive API docs: `http://localhost:8000/docs`

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Backend fails on startup with "Content dataset validation failed" | Check `data/content.json` has `default`, `simplified`, `chunked`, `summary`, `visual` variants for every topic |
| Frontend shows "Could not load topics" | Confirm backend is running on port 8000 and CORS is open (`allow_origins=["*"]`) |
| Adaptation never fires | The 30s cooldown is active. Use `strategy_mode = "demo"` (5s cooldown) or wait |
| Quiz returns empty questions | Run `seed_quiz.py` to populate the Quiz table from `data/content.json` |
| `switch_to_audio` never fires | Needs 3+ consecutive pause interactions with values > 0.4 to push the weighted average past the fatigue threshold |
| Session state lost after backend restart | Expected — state is in-memory. Start a fresh session via `/api/session/start` |

---

## File Locations

```
EduVerse/
├── eduverse-backend/
│   ├── src/main.py                     # FastAPI entrypoint
│   ├── data/content.json               # All topic content + quiz data
│   ├── src/core/context_engine.py      # Context vector generation
│   ├── src/core/strategy_engine.py     # Strategy profiles
│   ├── src/modules/adaptive/agents/    # Engagement + Accessibility agents
│   ├── src/modules/adaptive/orchestrator/resolver.py  # Conflict resolution + RL
│   └── src/modules/evaluation/worker.py               # Evaluation + delayed reward
│
└── frontend-react/
    ├── src/pages/Home.jsx              # Researcher demo page
    ├── src/pages/LearnPage.jsx         # Learner journey page
    ├── src/components/learner/         # Learner-facing components
    ├── src/services/api.js             # All backend calls + normalization
    └── src/services/demoData.js        # Offline demo snapshots (fallback)
```
