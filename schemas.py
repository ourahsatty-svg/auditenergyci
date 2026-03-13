from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from typing import List

router = APIRouter()

@router.get("/", response_model=List[schemas.AuditOut])
def list_audits(db: Session = Depends(get_db)):
    return db.query(models.Audit).all()

@router.post("/", response_model=schemas.AuditOut)
def create_audit(audit: schemas.AuditCreate, db: Session = Depends(get_db)):
    db_audit = models.Audit(**audit.dict())
    db.add(db_audit)
    db.commit()
    db.refresh(db_audit)
    return db_audit

@router.get("/{audit_id}", response_model=schemas.AuditOut)
def get_audit(audit_id: int, db: Session = Depends(get_db)):
    audit = db.query(models.Audit).filter(models.Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit non trouvé")
    return audit

@router.put("/{audit_id}/statut")
def update_statut(audit_id: int, statut: str, db: Session = Depends(get_db)):
    audit = db.query(models.Audit).filter(models.Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit non trouvé")
    audit.statut = statut
    db.commit()
    return {"message": "Statut mis à jour", "statut": statut}

@router.get("/{audit_id}/analyse")
def analyse_energetique(audit_id: int, db: Session = Depends(get_db)):
    audit = db.query(models.Audit).filter(models.Audit.id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit non trouvé")
    consomm = db.query(models.ConsommationMensuelle).filter(
        models.ConsommationMensuelle.audit_id == audit_id
    ).all()
    equipements = db.query(models.Equipement).filter(
        models.Equipement.audit_id == audit_id
    ).all()

    total_kwh = sum(c.electricite_kwh + c.gaz_kwh + c.fioul_kwh + c.vapeur_kwh for c in consomm)
    total_cout = sum(c.cout_fcfa for c in consomm)
    facteur_co2 = 0.47  # kgCO2/kWh réseau CIE
    emissions_co2 = total_kwh * facteur_co2 / 1000

    potentiel_economie_pct = 0.22
    potentiel_kwh = total_kwh * potentiel_economie_pct
    potentiel_fcfa = total_cout * potentiel_economie_pct

    surface = audit.surface_m2 or 1
    intensite = total_kwh / surface if surface > 0 else 0

    return {
        "audit_id": audit_id,
        "consommation_totale_kwh": round(total_kwh, 2),
        "cout_total_fcfa": round(total_cout, 2),
        "emissions_co2_t": round(emissions_co2, 2),
        "intensite_energetique": round(intensite, 3),
        "potentiel_economie_kwh": round(potentiel_kwh, 2),
        "potentiel_economie_fcfa": round(potentiel_fcfa, 2),
        "nb_equipements": len(equipements),
        "mois_analyses": len(consomm),
    }
