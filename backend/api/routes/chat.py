from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.api import deps
from backend.core.config import settings
from backend.models.chat import ChatSession, Message
from backend.models.doctor import Doctor
from backend.schemas.chat import ChatSessionResponse, MessageCreate, MessageResponse
from backend.services import supabase_store
from backend.services.gemini_service import get_doctor_response

router = APIRouter()


def _require_db(db: Optional[Session]) -> Session:
    if db is None:
        raise HTTPException(status_code=500, detail='Database session is not available')
    return db


@router.get('/sessions', response_model=List[ChatSessionResponse])
def get_sessions(db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)):
    if settings.USE_SUPABASE_REST:
        return supabase_store.list_sessions_for_user(current_user.id)

    db = _require_db(db)
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.timestamp.desc())
        .all()
    )
    return sessions


@router.delete('/sessions')
def clear_sessions(db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)):
    if settings.USE_SUPABASE_REST:
        deleted = supabase_store.clear_sessions_for_user(current_user.id)
        return {'deleted': deleted}

    db = _require_db(db)
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).all()
    deleted = len(sessions)
    for session in sessions:
        db.delete(session)
    db.commit()
    return {'deleted': deleted}


@router.get('/sessions/{doctor_id}', response_model=List[MessageResponse])
def get_session_messages(doctor_id: str, db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)):
    if settings.USE_SUPABASE_REST:
        session = supabase_store.get_session(current_user.id, doctor_id)
        if not session:
            return []
        return supabase_store.list_messages(session.id, ascending=True)

    db = _require_db(db)
    session = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id, ChatSession.doctor_id == doctor_id)
        .first()
    )

    if not session:
        return []

    messages = db.query(Message).filter(Message.session_id == session.id).order_by(Message.timestamp.asc()).all()
    return messages


@router.post('/send', response_model=MessageResponse)
def send_message(msg_in: MessageCreate, db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)):
    if settings.USE_SUPABASE_REST:
        doctor = supabase_store.get_doctor(msg_in.doctor_id)
        if not doctor:
            raise HTTPException(status_code=404, detail='Doctor not found')

        session = supabase_store.get_session(current_user.id, msg_in.doctor_id)
        if not session:
            session = supabase_store.create_session(
                {
                    'user_id': current_user.id,
                    'doctor_id': msg_in.doctor_id,
                    'department': doctor.department,
                    'last_message': msg_in.content,
                }
            )
        else:
            session = supabase_store.update_session(
                session.id,
                {
                    'last_message': msg_in.content,
                    'department': doctor.department,
                },
            )

        supabase_store.create_message(
            {
                'session_id': session.id,
                'role': 'user',
                'content': msg_in.content,
                'suggestions': None,
                'risk_warning': None,
                'recommendations': None,
            }
        )

        history = supabase_store.list_messages(session.id, ascending=False, limit=10)
        history.reverse()
        ai_resp = get_doctor_response(doctor.name, history[:-1], msg_in.content)

        ai_msg = supabase_store.create_message(
            {
                'session_id': session.id,
                'role': 'assistant',
                'content': ai_resp.get('text', ''),
                'suggestions': ai_resp.get('suggestions', []),
                'risk_warning': ai_resp.get('riskWarning', ''),
                'recommendations': ai_resp.get('recommendations', []),
            }
        )
        return ai_msg

    db = _require_db(db)
    doctor = db.query(Doctor).filter(Doctor.id == msg_in.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail='Doctor not found')

    session = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id, ChatSession.doctor_id == msg_in.doctor_id)
        .first()
    )

    if not session:
        session = ChatSession(
            user_id=current_user.id,
            doctor_id=msg_in.doctor_id,
            department=doctor.department,
            last_message=msg_in.content,
        )
        db.add(session)
        db.commit()
        db.refresh(session)
    else:
        session.last_message = msg_in.content
        db.commit()

    user_msg = Message(session_id=session.id, role='user', content=msg_in.content)
    db.add(user_msg)
    db.commit()

    history = (
        db.query(Message)
        .filter(Message.session_id == session.id)
        .order_by(Message.timestamp.desc())
        .limit(10)
        .all()
    )
    history.reverse()

    ai_resp = get_doctor_response(doctor.name, history[:-1], msg_in.content)

    ai_msg = Message(
        session_id=session.id,
        role='assistant',
        content=ai_resp.get('text', ''),
        suggestions=ai_resp.get('suggestions', []),
        risk_warning=ai_resp.get('riskWarning', ''),
        recommendations=ai_resp.get('recommendations', []),
    )
    db.add(ai_msg)
    db.commit()
    db.refresh(ai_msg)

    return ai_msg