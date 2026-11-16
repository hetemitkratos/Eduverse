# EduVerse Project Structure

This document outlines the directory structure and main components of the EduVerse project.

## Root Directory
- `eduverse-backend/`: The Python-based backend service.
- `frontend-react/`: The modern React-based frontend application.
- `frontend/`: Legacy or experimental HTML/JS frontend.
- `db.md`: Database documentation.
- `prd.md`: Product Requirements Document.
- `project_context.md`: High-level project context and goals.
- `project_detail.md`: Detailed technical specifications.
- `demo.md`: Demo scripts or information.

---

## Backend (`eduverse-backend/`)
The backend is built with Python and FastAPI, focusing on adaptive learning and content generation.

- `src/`: Main source code.
  - `main.py`: Entry point for the FastAPI application.
  - `api/`: REST API route definitions.
  - `core/`: Central engine logic (e.g., strategy engine, AI pipelines).
  - `modules/`: Feature-specific logic:
    - `adaptive/`: Adaptive learning algorithms and agents.
    - `content/`: Content generation logic.
    - `quiz/`: Quiz generation and assessment.
    - `session/`: User session management.
    - `evaluation/`: Performance tracking and explainable AI metrics.
  - `db/`: Database models and connection management.
  - `config/`: Application configuration.
  - `utils/`: Common utility functions.
- `tests/`: Automated test suite for backend components.
- `data/`: Local data storage or assets.
- `requirements.txt`: Python dependencies.

---

## Frontend React (`frontend-react/`)
The frontend is a modern React application built with Vite, Tailwind CSS, and Framer Motion for animations.

- `src/`: React source code.
  - `main.jsx`: Application entry point.
  - `App.jsx`: Root component with routing.
  - `components/`: Reusable UI components.
    - `learner/`: Specific components for the learner interface (e.g., TopicPicker).
    - Specialized panels: `ConceptGraphPanel`, `EvaluationPanel`, `DecisionTrace`, etc.
    - Layout components: `Dashboard`, `Timeline`, `Charts`.
  - `pages/`: Page-level components.
    - `Home.jsx`: Landing and overview page.
    - `LearnPage.jsx`: The main learning interface.
  - `services/`: API client services for communicating with the backend.
  - `assets/`: Static assets like images and fonts.
- `index.html`: Main HTML template.
- `package.json`: Project dependencies and scripts.
- `vite.config.js`: Vite build configuration.
- `tailwind.config.js`: Tailwind CSS styling configuration.

---

## Legacy Frontend (`frontend/`)
A simpler, non-React frontend used for early prototyping or specific experiments.
- `index.html`: Main page.
- `app.js`: Core logic.
- `components/`: UI components.
