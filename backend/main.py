import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.api_router import api_router
from backend.core.config import settings
from backend.db.database import Base, engine

logger = logging.getLogger(__name__)

if not settings.USE_SUPABASE_REST_EFFECTIVE and engine is not None:
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as exc:
        # Keep serverless cold-start alive even if database is temporarily unreachable.
        logger.warning('Skip auto create_all due to DB init error: %s', exc)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get('/')
def root():
    return {'message': 'Welcome to AI Doctor Backend API'}
