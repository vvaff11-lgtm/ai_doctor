from pydantic import BaseModel
from typing import List, Optional

class DoctorBase(BaseModel):
    name: str
    title: Optional[str] = None
    department: Optional[str] = None
    avatar: Optional[str] = None
    rating: Optional[float] = None
    status: Optional[str] = None
    specialties: Optional[List[str]] = []
    background: Optional[str] = None
    features: Optional[List[str]] = []
    tags: Optional[List[str]] = []

class DoctorResponse(DoctorBase):
    id: str

    class Config:
        from_attributes = True
