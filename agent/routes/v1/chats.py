from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid

from db.db import Session as DbSession
from models.models import DBUser, ChatSession, ChatMessage, UserSettings

router = APIRouter(
    prefix="/v1/chats",
    tags=["chats"],
)

def get_db():
    db = DbSession()
    try:
        yield db
    finally:
        db.close()

class UserSettingsReq(BaseModel):
    gemini_api_key: Optional[str] = None
    gemini_api_key_2: Optional[str] = None
    groq_api_key: Optional[str] = None
    groq_api_key_2: Optional[str] = None
    huggingfacehub_api_token: Optional[str] = None
    database_uri: Optional[str] = None

@router.get("/settings/{user_id}")
def get_user_settings(user_id: str, db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        return {}
    return {
        "gemini_api_key": settings.gemini_api_key or "",
        "gemini_api_key_2": settings.gemini_api_key_2 or "",
        "groq_api_key": settings.groq_api_key or "",
        "groq_api_key_2": settings.groq_api_key_2 or "",
        "huggingfacehub_api_token": settings.huggingfacehub_api_token or "",
        "database_uri": settings.database_uri or ""
    }

@router.put("/settings/{user_id}")
def update_user_settings(user_id: str, req: UserSettingsReq, db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings:
        settings = UserSettings(user_id=user_id)
        db.add(settings)
    
    settings.gemini_api_key = req.gemini_api_key
    settings.gemini_api_key_2 = req.gemini_api_key_2
    settings.groq_api_key = req.groq_api_key
    settings.groq_api_key_2 = req.groq_api_key_2
    settings.huggingfacehub_api_token = req.huggingfacehub_api_token
    settings.database_uri = req.database_uri
    
    db.commit()
    return {"status": "ok"}

class InitUserRequest(BaseModel):
    user_id: Optional[str] = None

@router.post("/init_user")
def init_user(req: InitUserRequest, db: Session = Depends(get_db)):
    if req.user_id:
        existing = db.query(DBUser).filter(DBUser.id == req.user_id).first()
        if existing:
            return {"user_id": existing.id}
    
    new_id = str(uuid.uuid4())
    db.add(DBUser(id=new_id))
    db.commit()
    return {"user_id": new_id}


class CreateSessionReq(BaseModel):
    user_id: str
    id: str
    label: str
    q_count: int

@router.post("/sessions")
def create_session(req: CreateSessionReq, db: Session = Depends(get_db)):
    existing = db.query(ChatSession).filter(ChatSession.id == req.id).first()
    if existing:
        existing.q_count = req.q_count
        # Optionally update created_at to bump it to top, though technically 'created' hasn't changed.
        # But the user wants newest generation at top.
        from datetime import datetime
        existing.created_at = datetime.utcnow()
    else:
        db.add(ChatSession(
            id=req.id,
            user_id=req.user_id,
            label=req.label.strip(),
            q_count=req.q_count
        ))
    db.commit()
    return {"status": "ok"}


@router.get("/sessions/{user_id}")
def get_sessions(user_id: str, db: Session = Depends(get_db)):
    # Group by label to ensure only one item per subject, keeping newest first
    # We'll fetch all and deduplicate in Python for simplicity with SQLAlchemy models
    sessions = db.query(ChatSession).filter(ChatSession.user_id == user_id).order_by(ChatSession.created_at.desc()).all()
    
    seen_labels = set()
    unique_sessions = []
    for s in sessions:
        clean_label = s.label.strip()
        if clean_label not in seen_labels:
            seen_labels.add(clean_label)
            unique_sessions.append(s)
            
    return [{
        "id": s.id,
        "label": s.label.strip(),
        "qCount": s.q_count
    } for s in unique_sessions]


class CreateMessageReq(BaseModel):
    id: str
    session_id: str
    type: str
    payload: Dict[str, Any]

@router.post("/messages")
def upsert_message(req: CreateMessageReq, db: Session = Depends(get_db)):
    # Defensive check: ensure the session exists before inserting a message
    # (Fixes common race conditions where messages are sent before sessions are committed)
    session_exists = db.query(ChatSession).filter(ChatSession.id == req.session_id).first()
    if not session_exists:
        # Create a basic placeholder session if it doesn't exists to avoid IntegrityError
        # Actually, let's just return 400 if it's really missing, but since we await now, 
        # it shouldn't happen.
        print(f"⚠️ Warning: upsert_message called for non-existent session {req.session_id}. Raising exception.")
        raise HTTPException(status_code=400, detail="Session does not exist.")

    from sqlalchemy.dialects.postgresql import insert as pg_insert
    stmt = pg_insert(ChatMessage).values(
        id=req.id,
        session_id=req.session_id,
        type=req.type,
        payload=req.payload
    ).on_conflict_do_update(
        index_elements=["id"],
        set_={"payload": req.payload}
    )
    db.execute(stmt)
    db.commit()
    return {"status": "ok"}


@router.get("/sessions/{session_id}/messages")
def get_messages(session_id: str, db: Session = Depends(get_db)):
    msgs = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()
    out = []
    for m in msgs:
        obj = dict(m.payload)
        obj["id"] = m.id
        obj["type"] = m.type
        out.append(obj)
    return out
