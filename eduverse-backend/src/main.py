from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.db.database import init_db
from src.api.routes import session_routes, interaction_routes, adaptive_routes, evaluation_routes, dashboard_routes, content_routes
from src.modules.content.repository.loader import preload_content, validate_content_dataset
from src.modules.quiz import router as quiz_router

app = FastAPI(title="EduVerse Adaptive Learning API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(session_routes.router)
app.include_router(interaction_routes.router)
app.include_router(adaptive_routes.router)
app.include_router(evaluation_routes.router)
app.include_router(quiz_router.router)
app.include_router(quiz_router.public_router)
app.include_router(dashboard_routes.router)
app.include_router(content_routes.router)

@app.on_event("startup")
def on_startup():
    # Initialize the database
    init_db()
    preload_content()
    validation_issues = validate_content_dataset()
    if validation_issues:
        raise RuntimeError("Content dataset validation failed: " + " | ".join(validation_issues))

@app.get("/")
def read_root():
    return {"message": "EduVerse API is running."}
