import uuid
from sqlalchemy import Column, String, Float, JSON, Text
from backend.db.database import Base

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), nullable=False)
    title = Column(String(100))
    department = Column(String(50), index=True)
    avatar = Column(String(500))
    rating = Column(Float)
    status = Column(String(20))
    specialties = Column(JSON)  # 存储字符串列表
    background = Column(Text)
    features = Column(JSON)     # 存储字符串列表
    tags = Column(JSON)         # 存储字符串列表
