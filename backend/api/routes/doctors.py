from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.api import deps
from backend.models.doctor import Doctor
from backend.schemas.doctor import DoctorResponse

router = APIRouter()

@router.get("/", response_model=List[DoctorResponse])
def get_doctors(db: Session = Depends(deps.get_db), current_user = Depends(deps.get_current_user)):
    """获取医生列表"""
    doctors = db.query(Doctor).all()
    return doctors

@router.get("/{doctor_id}", response_model=DoctorResponse)
def get_doctor(doctor_id: str, db: Session = Depends(deps.get_db), current_user = Depends(deps.get_current_user)):
    """获取单个医生详情"""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="医生未找到")
    return doctor
