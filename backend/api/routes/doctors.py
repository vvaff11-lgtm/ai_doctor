from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.api import deps
from backend.core.config import settings
from backend.models.doctor import Doctor
from backend.schemas.doctor import DoctorResponse
from backend.services import supabase_store

router = APIRouter()


def _require_db(db: Optional[Session]) -> Session:
    if db is None:
        raise HTTPException(status_code=500, detail='Database session is not available')
    return db


@router.get('/', response_model=List[DoctorResponse])
def get_doctors(db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)):
    if settings.USE_SUPABASE_REST:
        return supabase_store.list_doctors()

    db = _require_db(db)
    doctors = db.query(Doctor).all()
    return doctors


@router.get('/{doctor_id}', response_model=DoctorResponse)
def get_doctor(doctor_id: str, db: Session = Depends(deps.get_db), current_user=Depends(deps.get_current_user)):
    if settings.USE_SUPABASE_REST:
        doctor = supabase_store.get_doctor(doctor_id)
    else:
        db = _require_db(db)
        doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()

    if not doctor:
        raise HTTPException(status_code=404, detail='医生未找到')
    return doctor