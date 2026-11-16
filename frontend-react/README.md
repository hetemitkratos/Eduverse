# EduVerse Photosynthesis Demo

This frontend is now tuned for a single guided demo around the `Photosynthesis` topic.
It is intentionally simplified so the lesson stays readable, the adaptation flow is easy to narrate, and every visible change is manually enforced.

## Demo URL

- Frontend: `http://127.0.0.1:5174/`
- Backend: `http://127.0.0.1:8000/`

## Demo Flow

Use this sequence when presenting:

1. Open the frontend.
2. Click `Run Demo`.
3. Explain that the lesson starts on the base photosynthesis content.
4. Click one or more learner interaction buttons:
   - `Pause Spike`
   - `Revisit Content`
   - `Go Idle`
5. Wait for the system to show `Decision Ready`.
6. Explain the proposed change in the right rail.
7. Click `Enforce Adaptation`.
8. Show how the lesson changes only when you allow it.
9. Use the quiz to demonstrate low-learning or weak-concept adaptation.
10. If the system decides `maintain`, explain that the content stays on the same lesson rather than switching to a fake placeholder.

## What Works In The Demo

- Photosynthesis lesson preview on load
- Real backend session creation
- Real interaction logging
- Real quiz loading and submission
- Manual enforcement of new adaptations
- Voice playback
- Automatic voice start when the lesson switches into audio mode

## Manual Enforcement Behavior

The app does not immediately apply a new lesson state when a decision is generated.
Instead it shows a `Decision Ready` card with an `Enforce Adaptation` button.

This is intentional for demo stability:

- you can explain the decision first
- the content does not jump unexpectedly
- the lesson only changes when you want it to

## Adding A Real Image

The content viewer now supports real images for visual mode.

### Where to put the file

Place the image in:

- `frontend-react/public/demo/photosynthesis-infographic.jpg`

You can use a different file name if you want.

### How to wire it up

Update the photosynthesis visual block in:

- `eduverse-backend/data/content.json`

Change:

```json
"diagram": "Sunlight -> Chlorophyll absorbs light -> Light-dependent reactions in thylakoids -> Water split -> Oxygen released + ATP + NADPH made -> Calvin cycle in stroma -> Carbon dioxide combined -> Glucose produced"
```

To something like:

```json
"diagram": "/demo/photosynthesis-infographic.jpg"
```

If `diagram` points to an image file path ending in `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`, or `.svg`, the frontend will render the picture.
If it is plain text, the frontend will show it as diagram notes instead.

## Audio Behavior

Audio mode currently works in a demo-friendly way:

- when the lesson enters audio mode, playback starts automatically
- if an audio URL is not provided, browser speech synthesis reads the lesson text aloud
- if the content changes, previous playback is stopped first

## Recommended Demo Script

Use this short story:

1. Start on the default photosynthesis explanation.
2. Trigger `Revisit Content` to simulate confusion.
3. Show the `Decision Ready` state.
4. Enforce the change and explain why the system adapted.
5. Submit poor quiz answers to trigger simplification.
6. Show that the system stays on the photosynthesis lesson and changes format, not topic.
7. Trigger fatigue with `Pause Spike` and narrate the audio-support transition.

## If Something Looks Wrong

- If you do not see content changes, click `Check Decision`.
- If the system chooses `maintain`, the lesson should remain on the current photosynthesis content.
- If visual mode does not show an image, make sure the `diagram` value in `content.json` is a valid image path.
- If audio mode activates without a real file, the browser will read the text aloud instead.
