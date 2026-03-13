# AuditEnergy CI — Guide de déploiement complet

Plateforme d'audit énergétique conforme DGE Côte d'Ivoire  
Normes EN 16247 / ISO 50002

---

## PRÉREQUIS (à installer sur votre ordinateur)

- Git : https://git-scm.com/downloads
- Node.js 20+ : https://nodejs.org
- Python 3.11+ : https://www.python.org/downloads
- Compte GitHub (gratuit) : https://github.com
- Compte Supabase (gratuit) : https://supabase.com
- Compte Railway (gratuit) : https://railway.app
- Compte Vercel (gratuit) : https://vercel.com
- Clé API Anthropic : https://console.anthropic.com

---

## ÉTAPE 1 — Créer la base de données sur Supabase (15 min)

1. Allez sur https://supabase.com → "Start your project" → créez un compte
2. Cliquez "New project" :
   - Name : auditenergyci
   - Database Password : notez ce mot de passe !
   - Region : choisissez "EU West" (le plus proche de l'Afrique de l'Ouest)
3. Attendez 2 minutes que le projet se crée
4. Allez dans "Settings" → "Database" → copiez la "Connection string (URI)"
   Elle ressemble à : postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres

5. Allez dans "SQL Editor" → "New query" → collez et exécutez ce SQL :

```sql
CREATE TABLE cabinets (
    id SERIAL PRIMARY KEY,
    nom VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audits (
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

CREATE TABLE equipements (
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

CREATE TABLE consommations_mensuelles (
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

CREATE TABLE apes (
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

CREATE TABLE rapports (
    id SERIAL PRIMARY KEY,
    audit_id INTEGER REFERENCES audits(id) ON DELETE CASCADE,
    url_docx VARCHAR,
    genere_le TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1
);
```

6. Cliquez "Run" → vous verrez "Success"


---

## ÉTAPE 2 — Obtenir votre clé API Anthropic (5 min)

1. Allez sur https://console.anthropic.com
2. Créez un compte → vérifiez votre email
3. Allez dans "API Keys" → "Create Key"
4. Nommez-la "auditenergyci" → copiez la clé (commence par sk-ant-)
5. Notez-la précieusement, elle ne sera plus affichée


---

## ÉTAPE 3 — Mettre le code sur GitHub (10 min)

Sur votre ordinateur, ouvrez un terminal :

```bash
# Créez votre dossier de projet
mkdir auditenergyci && cd auditenergyci

# Copiez les fichiers backend et frontend dans ce dossier
# (depuis le ZIP téléchargé)

# Initialisez Git
git init
git add .
git commit -m "Initial commit — AuditEnergy CI"

# Créez un repo sur GitHub : https://github.com/new
# Nommez-le "auditenergyci" → Create repository

# Puis dans le terminal :
git remote add origin https://github.com/VOTRE_USERNAME/auditenergyci.git
git branch -M main
git push -u origin main
```


---

## ÉTAPE 4 — Déployer le BACKEND sur Railway (15 min)

1. Allez sur https://railway.app → "Login with GitHub"
2. Cliquez "New Project" → "Deploy from GitHub repo"
3. Sélectionnez votre repo "auditenergyci"
4. Railway détecte automatiquement le Dockerfile dans /backend

5. Allez dans "Variables" (onglet de votre service) → ajoutez :
   ```
   DATABASE_URL = postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
   ANTHROPIC_API_KEY = sk-ant-votre-cle
   SECRET_KEY = une-chaine-aleatoire-longue
   ```

6. Allez dans "Settings" → "Networking" → "Generate Domain"
   Notez votre URL backend : https://auditenergyci-xxx.railway.app

7. Vérifiez que l'API fonctionne en visitant :
   https://votre-backend.railway.app/docs
   Vous devez voir la documentation Swagger de FastAPI


---

## ÉTAPE 5 — Déployer le FRONTEND sur Vercel (10 min)

1. Allez sur https://vercel.com → "Login with GitHub"
2. Cliquez "Add New Project" → importez "auditenergyci"
3. Dans "Root Directory" → changez pour "frontend"
4. Dans "Environment Variables" → ajoutez :
   ```
   NEXT_PUBLIC_API_URL = https://votre-backend.railway.app
   ```
5. Cliquez "Deploy" → attendez 2-3 minutes

6. Votre plateforme est en ligne sur :
   https://auditenergyci.vercel.app


---

## ÉTAPE 6 — Nom de domaine personnalisé (optionnel, 30 min)

Pour avoir auditenergyci.ci (recommandé pour les clients) :

1. Achetez le domaine :
   - .ci domain : ARTCI https://www.nic.ci (~15 000 FCFA/an)
   - Ou domaine .com : GoDaddy/Namecheap (~5 000 FCFA/an)

2. Dans Vercel → votre projet → "Settings" → "Domains"
3. Ajoutez votre domaine → suivez les instructions DNS
4. HTTPS est automatique (Let's Encrypt)


---

## STRUCTURE DU PROJET

```
auditenergyci/
├── backend/
│   ├── app/
│   │   ├── main.py          ← Point d'entrée FastAPI
│   │   ├── database.py      ← Connexion PostgreSQL
│   │   ├── models.py        ← Tables SQLAlchemy
│   │   ├── schemas.py       ← Validation Pydantic
│   │   └── routers/
│   │       ├── audits.py    ← CRUD audits + analyse
│   │       ├── equipements.py
│   │       ├── consommations.py
│   │       ├── ape.py
│   │       ├── ia.py        ← Claude API (recommandations)
│   │       └── rapports.py  ← Génération DOCX DGE
│   ├── requirements.txt
│   └── Dockerfile
│
└── frontend/
    ├── src/app/
    │   ├── layout.tsx        ← Navigation principale
    │   ├── dashboard/        ← Tableau de bord cabinet
    │   ├── audits/           ← Liste des audits
    │   ├── audit/
    │   │   ├── nouveau/      ← Créer un audit
    │   │   └── [id]/         ← Détail : collecte, analyse, IA, rapport
    │   └── page.tsx          ← Redirection dashboard
    ├── src/lib/api.ts        ← Client API axios
    └── package.json
```

---

## COÛTS MENSUELS (estimation)

| Service      | Plan gratuit         | Plan payant         |
|--------------|----------------------|---------------------|
| Vercel       | Gratuit (Hobby)      | Pro : ~10 USD/mois  |
| Railway      | 500h/mois gratuit    | ~5-20 USD/mois      |
| Supabase     | 500 MB gratuit       | Pro : 25 USD/mois   |
| Anthropic    | Pay per use          | ~0,01 USD/requête   |
| **TOTAL**    | **Gratuit démarrage**| **~30-55 USD/mois** |

1 audit facturé = 500 000 FCFA → couvre 15 mois de serveur

---

## SUPPORT ET ÉVOLUTIONS

Pour toute question technique :
- Documentation FastAPI : https://fastapi.tiangolo.com
- Documentation Next.js : https://nextjs.org/docs
- Documentation Supabase : https://supabase.com/docs
- Documentation Railway : https://docs.railway.app
- API Anthropic : https://docs.anthropic.com
