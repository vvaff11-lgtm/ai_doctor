from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.api import deps
from backend.models.chat import ChatSession, Message
from backend.models.doctor import Doctor
from backend.schemas.chat import MessageCreate, MessageResponse, ChatSessionResponse
from backend.services.gemini_service import get_doctor_response

router = APIRouter()


@router.get('/sessions', response_model=List[ChatSessionResponse])
def get_sessions(db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)):
    """Get chat sessions for current user."""
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.timestamp.desc())
        .all()
    )
    return sessions


@router.delete('/sessions')
def clear_sessions(db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)):
    """Delete all chat sessions for current user."""
    sessions = db.query(ChatSession).filter(ChatSession.user_id == current_user.id).all()
    deleted = len(sessions)
    for session in sessions:
        db.delete(session)
    db.commit()
    return {'deleted': deleted}


@router.get('/sessions/{doctor_id}', response_model=List[MessageResponse])
def get_session_messages(doctor_id: str, db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)):
    """Get message history with a doctor."""
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
    """Send a message to a doctor and get AI reply."""
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
