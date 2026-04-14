# GERMS - Global Emergency Response Management System

## Architecture

```
germs-project/
├── backend/          # NestJS API + WebSocket (Socket.io)
├── dashboard/        # React + Vite + Tailwind (Centre de Commandement)
├── infrastructure/   # Docker configs, SQL init
├── docker-compose.yml
├── render.yaml       # Deploy backend sur Render (gratuit)
└── vercel.json       # Deploy dashboard sur Vercel (gratuit)
```

## Demarrage rapide (Docker - recommande)

### Prerequis
- Docker Desktop installe et lance

### Lancer tout le projet
```bash
cd germs-project
docker-compose up --build
```

### Acces
| Service | URL |
|---------|-----|
| Dashboard | http://localhost:5173 |
| API Backend | http://localhost:3000/api/health |
| PostgreSQL | localhost:5432 (germs_dev / germs_user / germs_dev_password) |
| Redis | localhost:6379 |

## Demarrage sans Docker

### 1. PostgreSQL + PostGIS
Installer PostgreSQL 16 avec PostGIS, creer la base :
```bash
psql -U postgres -c "CREATE DATABASE germs_dev;"
psql -U postgres -d germs_dev -f infrastructure/docker/init.sql
```

### 2. Redis
Installer Redis et le lancer sur le port 6379.

### 3. Backend
```bash
cd backend
npm install
npm run start:dev
```

### 4. Dashboard
```bash
cd dashboard
npm install
npm run dev
```

## Deploiement Cloud Gratuit

### Etape 1 : PostgreSQL - Neon (gratuit)
1. Creer un compte sur https://neon.tech
2. Creer un projet "germs"
3. Copier la connection string
4. Executer le SQL init : copier le contenu de `infrastructure/docker/init.sql` dans la console SQL Neon
5. Activer PostGIS : `CREATE EXTENSION postgis;`

### Etape 2 : Redis - Upstash (gratuit)
1. Creer un compte sur https://upstash.com
2. Creer une base Redis (region EU)
3. Noter le host, port et password

### Etape 3 : Backend - Render (gratuit)
1. Pusher le projet sur GitHub
2. Aller sur https://render.com
3. New > Blueprint > connecter le repo GitHub
4. Le fichier `render.yaml` configure tout automatiquement
5. Ajouter les variables d'environnement Redis (Upstash) manuellement
6. Remplacer les variables DB par celles de Neon

### Etape 4 : Dashboard - Vercel (gratuit)
1. Aller sur https://vercel.com
2. Importer le repo GitHub
3. Root Directory : `dashboard`
4. Framework : Vite
5. Variables d'environnement :
   - `VITE_API_URL` = URL du backend Render (ex: https://germs-backend.onrender.com)
   - `VITE_WS_URL` = meme URL

## API Endpoints

| Methode | Route | Description |
|---------|-------|-------------|
| GET | /api/health | Health check |
| POST | /api/auth/login | Connexion |
| POST | /api/auth/register | Inscription |
| GET | /api/alerts | Liste des alertes |
| POST | /api/alerts | Creer une alerte |
| PATCH | /api/alerts/:id/validate | Valider une alerte |
| GET | /api/interventions | Liste des interventions |
| GET | /api/interventions/stats | KPIs temps reel |
| POST | /api/interventions | Creer depuis alerte |
| PATCH | /api/interventions/:id/status | Changer statut |
| GET | /api/teams | Liste des equipes |
| POST | /api/teams | Creer une equipe |
| POST | /api/teams/:id/position | Maj position GPS |

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| alert:new | Server -> Client | Nouvelle alerte citoyenne |
| alert:validated | Server -> Client | Alerte validee |
| intervention:created | Server -> Client | Intervention creee |
| intervention:status-changed | Server -> Client | Statut change |
| intervention:updated | Server -> Client | Intervention mise a jour |
| position:updated | Bidirectionnel | Position GPS equipe |
| position:update | Client -> Server | Envoyer position GPS |

## Stack Technique

- **Backend** : Node.js + NestJS + TypeORM + Socket.io
- **Frontend** : React 18 + Vite 5 + Tailwind CSS + Leaflet
- **BDD** : PostgreSQL 16 + PostGIS
- **Cache/Queues** : Redis 7 + Bull
- **Temps reel** : Socket.io avec Redis adapter
