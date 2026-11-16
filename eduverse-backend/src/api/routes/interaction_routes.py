from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.db.database import get_db
from src.core.types.requests import InteractionRequest
from src.modules.interaction.service import log_interaction

router = APIRouter(prefix="/api/interaction", tags=["Interaction"])

@router.post("/")
def add_interaction(request: InteractionRequest, db: Session = Depends(get_db)):
    updated_state = log_interaction(db, request)
    return {
        "status": "success", 
        "current_state": updated_state.model_dump() # Pydantic v2 dump
    }
