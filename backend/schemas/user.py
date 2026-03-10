from pydantic import BaseModel
from typing import Optional


class UserBase(BaseModel):
    username: str
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    allergies: Optional[str] = ''
    chronic_diseases: Optional[str] = ''
    avatar: Optional[str] = ''


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    allergies: Optional[str] = None
    chronic_diseases: Optional[str] = None
    avatar: Optional[str] = None


class UserResponse(UserBase):
    id: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
