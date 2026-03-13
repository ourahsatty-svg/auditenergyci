from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from typing import List

router = APIRouter()

@router.get("/{audit_id}")
def get_consommations(audit_id: int, db: Session = Depends(get_db)):
    return db.query(models.ConsommationMensuelle).filter(
        models.ConsommationMensuelle.audit_id == audit_id
    ).order_by(models.ConsommationMensuelle.annee, models.ConsommationMensuelle.mois).all()

@router.post("/")
def create_consommation(conso: schemas.ConsommationCreate, db: Session = Depends(get_db)):
    existing = db.query(models.ConsommationMensuelle).filter(
        models.ConsommationMensuelle.audit_id == conso.audit_id,
        models.ConsommationMensuelle.annee == conso.annee,
        models.ConsommationMensuelle.mois == conso.mois
    ).first()
    if existing:
        for k, v in conso.dict().items():
            setattr(existing, k, v)
        db.commit()
        return existing
    db_c = models.ConsommationMensuelle(**conso.dict())
    db.add(db_c)
    db.commit()
    db.refresh(db_c)
    return db_c

@router.post("/batch/{audit_id}")
def batch_consommations(audit_id: int, data: List[schemas.ConsommationCreate], db: Session = Depends(get_db)):
    for c in data:
        c.audit_id = audit_id
    results = []
    for c in data:
        db_c = models.ConsommationMensuelle(**c.dict())
        db.add(db_c)
        results.append(db_c)
    db.commit()
    return {"message": f"{len(results)} mois enregistrés"}
