-- Script SQL à exécuter dans Supabase SQL Editor
-- AuditEnergy CI — Création des tables DGE

CREATE TABLE IF NOT EXISTS cabinets (
    id SERIAL PRIMARY KEY,
    nom VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audits (
    id SERIAL PRIMARY KEY,
    cabinet_id INTEGER REFERENCES cabinets(id),
    nom_entreprise VARCHAR NOT NULL,
    secteur VARCHAR,
    type_site VARCHAR DEFAULT 'industrie',
    localisation VARCHAR,
    surface_m2 FLOAT,
    nb_employes INTEGER,
    fournisseur_energie VARCHAR,
    facture_annuelle_fcfa FLOAT,
    consommation_annuelle_kwh FLOAT,
    type_energie VARCHAR,
    auditeur VARCHAR,
    date_debut TIMESTAMPTZ,
    date_fin TIMESTAMPTZ,
    statut VARCHAR DEFAULT 'en_cours',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS equipements (
    id SERIAL PRIMARY KEY,
    audit_id INTEGER REFERENCES audits(id) ON DELETE CASCADE,
    categorie VARCHAR,
    nom VARCHAR,
    quantite INTEGER DEFAULT 1,
    puissance_kw FLOAT,
    rendement_pct FLOAT,
    heures_an FLOAT,
    annee_installation INTEGER,
    etat_maintenance VARCHAR,
    consommation_kwh_an FLOAT,
    pct_consommation FLOAT
);

CREATE TABLE IF NOT EXISTS consommations_mensuelles (
    id SERIAL PRIMARY KEY,
    audit_id INTEGER REFERENCES audits(id) ON DELETE CASCADE,
    annee INTEGER,
    mois INTEGER,
    electricite_kwh FLOAT DEFAULT 0,
    gaz_kwh FLOAT DEFAULT 0,
    fioul_kwh FLOAT DEFAULT 0,
    vapeur_kwh FLOAT DEFAULT 0,
    cout_fcfa FLOAT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS apes (
    id SERIAL PRIMARY KEY,
    audit_id INTEGER REFERENCES audits(id) ON DELETE CASCADE,
    titre VARCHAR,
    description TEXT,
    categorie VARCHAR,
    economie_kwh_an FLOAT,
    economie_fcfa_an FLOAT,
    investissement_fcfa FLOAT,
    roi_mois FLOAT,
    reduction_co2_t_an FLOAT,
    priorite INTEGER DEFAULT 1,
    source_ia VARCHAR DEFAULT 'Claude AI'
);

CREATE TABLE IF NOT EXISTS rapports (
    id SERIAL PRIMARY KEY,
    audit_id INTEGER REFERENCES audits(id) ON DELETE CASCADE,
    url_docx VARCHAR,
    genere_le TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1
);

-- Insérer un cabinet de démo
INSERT INTO cabinets (nom, email) 
VALUES ('Cabinet Énergie CI', 'contact@energieci.com')
ON CONFLICT (email) DO NOTHING;

SELECT 'Tables créées avec succès !' AS message;
