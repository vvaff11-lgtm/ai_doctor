import uuid
from sqlalchemy import Column, String, Integer, Text
from backend.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(50))
    age = Column(Integer)
    gender = Column(String(10))
    allergies = Column(Text, default="")
    chronic_diseases = Column(Text, default="")
    avatar = Column(String(500), default="")
