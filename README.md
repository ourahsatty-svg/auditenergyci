from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from typing import List

router = APIRouter()

@router.get("/{audit_id}")
def get_equipements(audit_id: int, db: Session = Depends(get_db)):
    return db.query(models.Equipement).filter(models.Equipement.audit_id == audit_id).all()

@router.post("/")
def create_equipement(eq: schemas.EquipementCreate, db: Session = Depends(get_db)):
    conso = eq.puissance_kw * eq.heures_an * eq.quantite
    db_eq = models.Equipement(**eq.dict(), consommation_kwh_an=conso)
    db.add(db_eq)
    db.commit()
    db.refresh(db_eq)
    return db_eq

@router.delete("/{eq_id}")
def delete_equipement(eq_id: int, db: Session = Depends(get_db)):
    eq = db.query(models.Equipement).filter(models.Equipement.id == eq_id).first()
    if eq:
        db.delete(eq)
        db.commit()
    return {"message": "Supprimé"}
