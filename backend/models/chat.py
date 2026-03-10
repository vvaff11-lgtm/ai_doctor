import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.db.database import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"))
    doctor_id = Column(String(36), ForeignKey("doctors.id"))
    last_message = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    department = Column(String(50))

    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("chat_sessions.id"))
    role = Column(String(20)) # 'user' or 'assistant'
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    suggestions = Column(JSON, nullable=True)
    risk_warning = Column(Text, nullable=True)
    recommendations = Column(JSON, nullable=True)

    session = relationship("ChatSession", back_populates="messages")
