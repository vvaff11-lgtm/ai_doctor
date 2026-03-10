from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Recommendation(BaseModel):
    title: str
    content: str
    icon: str

class MessageBase(BaseModel):
    role: str
    content: str
    timestamp: datetime
    suggestions: Optional[List[str]] = None
    risk_warning: Optional[str] = None
    recommendations: Optional[List[Recommendation]] = None

class MessageResponse(MessageBase):
    id: str

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    doctor_id: str
    content: str

class ChatSessionResponse(BaseModel):
    id: str
    user_id: str
    doctor_id: str
    last_message: Optional[str] = None
    timestamp: datetime
    department: Optional[str] = None

    class Config:
        from_attributes = True
