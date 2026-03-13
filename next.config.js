from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class StatutAudit(str, enum.Enum):
    en_cours = "en_cours"
    termine = "termine"
    valide = "valide"

class TypeSite(str, enum.Enum):
    industrie = "industrie"
    batiment = "batiment"

class Cabinet(Base):
    __tablename__ = "cabinets"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    audits = relationship("Audit", back_populates="cabinet")

class Audit(Base):
    __tablename__ = "audits"
    id = Column(Integer, primary_key=True, index=True)
    cabinet_id = Column(Integer, ForeignKey("cabinets.id"))
    nom_entreprise = Column(String, nullable=False)
    secteur = Column(String)
    type_site = Column(Enum(TypeSite), default=TypeSite.industrie)
    localisation = Column(String)
    surface_m2 = Column(Float)
    nb_employes = Column(Integer)
    fournisseur_energie = Column(String)
    facture_annuelle_fcfa = Column(Float)
    consommation_annuelle_kwh = Column(Float)
    type_energie = Column(String)
    auditeur = Column(String)
    date_debut = Column(DateTime(timezone=True))
    date_fin = Column(DateTime(timezone=True))
    statut = Column(Enum(StatutAudit), default=StatutAudit.en_cours)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    cabinet = relationship("Cabinet", back_populates="audits")
    equipements = relationship("Equipement", back_populates="audit")
    consommations = relationship("ConsommationMensuelle", back_populates="audit")
    apes = relationship("APE", back_populates="audit")

class Equipement(Base):
    __tablename__ = "equipements"
    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(Integer, ForeignKey("audits.id"))
    categorie = Column(String)  # moteur, cvc, eclairage, chaudiere, compresseur
    nom = Column(String)
    quantite = Column(Integer, default=1)
    puissance_kw = Column(Float)
    rendement_pct = Column(Float)
    heures_an = Column(Float)
    annee_installation = Column(Integer)
    etat_maintenance = Column(String)
    consommation_kwh_an = Column(Float)
    pct_consommation = Column(Float)
    audit = relationship("Audit", back_populates="equipements")

class ConsommationMensuelle(Base):
    __tablename__ = "consommations_mensuelles"
    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(Integer, ForeignKey("audits.id"))
    annee = Column(Integer)
    mois = Column(Integer)  # 1-12
    electricite_kwh = Column(Float, default=0)
    gaz_kwh = Column(Float, default=0)
    fioul_kwh = Column(Float, default=0)
    vapeur_kwh = Column(Float, default=0)
    cout_fcfa = Column(Float, default=0)
    audit = relationship("Audit", back_populates="consommations")

class APE(Base):
    __tablename__ = "apes"
    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(Integer, ForeignKey("audits.id"))
    titre = Column(String)
    description = Column(Text)
    categorie = Column(String)  # force_motrice, eclairage, cvc, chaudiere, etc.
    economie_kwh_an = Column(Float)
    economie_fcfa_an = Column(Float)
    investissement_fcfa = Column(Float)
    roi_mois = Column(Float)
    reduction_co2_t_an = Column(Float)
    priorite = Column(Integer, default=1)  # 1=haute, 2=moyenne, 3=basse
    source_ia = Column(String, default="Claude AI")
    audit = relationship("Audit", back_populates="apes")

class Rapport(Base):
    __tablename__ = "rapports"
    id = Column(Integer, primary_key=True, index=True)
    audit_id = Column(Integer, ForeignKey("audits.id"), unique=True)
    url_docx = Column(String)
    genere_le = Column(DateTime(timezone=True), server_default=func.now())
    version = Column(Integer, default=1)
