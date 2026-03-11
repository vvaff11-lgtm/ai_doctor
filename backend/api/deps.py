from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from backend.core import security
from backend.core.config import settings
from backend.db.database import get_db
from backend.models.user import User
from backend.services.supabase_store import get_user_by_id

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f'{settings.API_V1_STR}/auth/login')


def get_current_user(db: Optional[Session] = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail='Could not validate credentials',
        headers={'WWW-Authenticate': 'Bearer'},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[security.ALGORITHM])
        user_id = payload.get('sub')
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    if settings.USE_SUPABASE_REST_EFFECTIVE:
        user = get_user_by_id(user_id)
    else:
        if db is None:
            raise HTTPException(status_code=500, detail='Database session is not available')
        user = db.query(User).filter(User.id == user_id).first()

    if user is None:
        raise credentials_exception
    return user