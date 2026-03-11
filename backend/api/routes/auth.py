import os
from datetime import timedelta
from pathlib import Path
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette.responses import FileResponse

from backend.api import deps
from backend.core import security
from backend.core.config import settings
from backend.models.user import User
from backend.schemas.user import Token, UserCreate, UserResponse, UserUpdate
from backend.services import supabase_store


class LoginRequest(BaseModel):
    username: str
    password: str


router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[2]
if os.getenv('VERCEL'):
    # Vercel serverless runtime allows writes only under /tmp.
    AVATAR_DIR = Path('/tmp') / 'ai-doctor' / 'avatars'
else:
    AVATAR_DIR = BASE_DIR / 'uploads' / 'avatars'
AVATAR_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTS = {'.png', '.jpg', '.jpeg', '.webp'}


def _require_db(db: Optional[Session]) -> Session:
    if db is None:
        raise HTTPException(status_code=500, detail='Database session is not available')
    return db


@router.post('/register', response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(deps.get_db)):
    if settings.USE_SUPABASE_REST_EFFECTIVE:
        user = supabase_store.get_user_by_username(user_in.username)
        if user:
            raise HTTPException(status_code=400, detail='Phone already registered')

        hashed_password = security.get_password_hash(user_in.password)
        user_data = user_in.model_dump(exclude={'password'})
        user_data['id'] = str(uuid4())
        user_data['password_hash'] = hashed_password
        return supabase_store.create_user(user_data)

    db = _require_db(db)
    user = db.query(User).filter(User.username == user_in.username).first()
    if user:
        raise HTTPException(status_code=400, detail='Phone already registered')

    hashed_password = security.get_password_hash(user_in.password)
    user_data = user_in.model_dump(exclude={'password'})
    db_user = User(**user_data, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.post('/login', response_model=Token)
def login(login_in: LoginRequest, db: Session = Depends(deps.get_db)):
    if settings.USE_SUPABASE_REST_EFFECTIVE:
        user = supabase_store.get_user_by_username(login_in.username)
    else:
        db = _require_db(db)
        user = db.query(User).filter(User.username == login_in.username).first()

    if not user or not security.verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid phone or password',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(subject=user.id, expires_delta=access_token_expires)
    return {'access_token': access_token, 'token_type': 'bearer'}


@router.get('/me', response_model=UserResponse)
def get_me(current_user=Depends(deps.get_current_user)):
    return current_user


@router.put('/me', response_model=UserResponse)
def update_me(
    payload: UserUpdate,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    updates = payload.model_dump(exclude_unset=True)

    if settings.USE_SUPABASE_REST_EFFECTIVE:
        return supabase_store.update_user(current_user.id, updates)

    db = _require_db(db)
    for field, value in updates.items():
        setattr(current_user, field, value)

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post('/avatar')
def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
):
    ext = Path(file.filename or '').suffix.lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail='Only png/jpg/jpeg/webp images are supported')

    filename = f'{current_user.id}_{uuid4().hex}{ext}'
    dst = AVATAR_DIR / filename
    dst.write_bytes(file.file.read())

    avatar_url = f'/api/auth/avatar/{filename}'
    if settings.USE_SUPABASE_REST_EFFECTIVE:
        supabase_store.update_user(current_user.id, {'avatar': avatar_url})
        return {'avatar': avatar_url}

    db = _require_db(db)
    current_user.avatar = avatar_url
    db.add(current_user)
    db.commit()

    return {'avatar': avatar_url}


@router.get('/avatar/{filename}')
def get_avatar(filename: str):
    safe_name = Path(filename).name
    target = AVATAR_DIR / safe_name
    if not target.exists():
        raise HTTPException(status_code=404, detail='Avatar not found')
    return FileResponse(target)

