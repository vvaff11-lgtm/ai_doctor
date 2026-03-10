from fastapi import APIRouter
from backend.api.routes import auth, doctors, chat

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(doctors.router, prefix="/doctors", tags=["doctors"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
