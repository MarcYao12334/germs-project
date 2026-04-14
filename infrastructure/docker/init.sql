-- =============================================
-- GERMS Database Initialization
-- PostgreSQL + PostGIS
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- TYPES ENUM
-- =============================================
CREATE TYPE user_role AS ENUM ('CITOYEN', 'POMPIER', 'OPERATEUR', 'ADMIN');
CREATE TYPE alert_status AS ENUM ('PENDING', 'VALIDATED', 'REJECTED', 'DUPLICATE');
CREATE TYPE intervention_status AS ENUM ('NOUVEAU', 'EN_ROUTE', 'SUR_PLACE', 'TERMINE');
CREATE TYPE priority_level AS ENUM ('HAUTE', 'MOYENNE', 'FAIBLE');
CREATE TYPE channel_type AS ENUM ('WHATSAPP', 'SMS', 'EMAIL', 'AUTHENTICATOR', 'PUSH');

-- =============================================
-- TABLE: parametres_pays
-- =============================================
CREATE TABLE parametres_pays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code_pays VARCHAR(3) NOT NULL UNIQUE,
  nom_pays VARCHAR(100) NOT NULL,
  devise VARCHAR(10) DEFAULT 'EUR',
  format_date VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  unite_distance VARCHAR(10) DEFAULT 'km',
  fuseau_horaire VARCHAR(50) DEFAULT 'Europe/Paris',
  rayon_doublon_metres INT DEFAULT 500,
  canaux_2fa channel_type[] DEFAULT '{SMS,EMAIL}',
  types_incidents TEXT[] DEFAULT '{Incendie,Accident,Secours,Fuite de gaz,Inondation,Autre}',
  langue_defaut VARCHAR(10) DEFAULT 'fr',
  actif BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: utilisateurs
-- =============================================
CREATE TABLE utilisateurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role user_role NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenoms VARCHAR(100),
  telephone VARCHAR(20),
  email VARCHAR(150),
  password_hash VARCHAR(255),
  pays VARCHAR(3) REFERENCES parametres_pays(code_pays),
  langue_pref VARCHAR(10) DEFAULT 'fr',
  reputation DECIMAL(3,1) DEFAULT 3.0,
  blacklist_until TIMESTAMP,
  statut_2fa BOOLEAN DEFAULT false,
  fcm_token TEXT,
  actif BOOLEAN DEFAULT true,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_utilisateurs_role ON utilisateurs(role);
CREATE INDEX idx_utilisateurs_pays ON utilisateurs(pays);
CREATE INDEX idx_utilisateurs_telephone ON utilisateurs(telephone);

-- =============================================
-- TABLE: equipes
-- =============================================
CREATE TABLE equipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(100) NOT NULL,
  unite VARCHAR(100),
  type_vehicule VARCHAR(50),
  immatriculation VARCHAR(30),
  telephone VARCHAR(20),
  code_equipe VARCHAR(20) UNIQUE NOT NULL,
  pays VARCHAR(3) REFERENCES parametres_pays(code_pays),
  langue_pref VARCHAR(10) DEFAULT 'fr',
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  note_moyenne DECIMAL(3,1) DEFAULT 0,
  actif BOOLEAN DEFAULT true,
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: pompiers
-- =============================================
CREATE TABLE pompiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE CASCADE,
  equipe_id UUID REFERENCES equipes(id),
  grade VARCHAR(50),
  role_equipe VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: alertes
-- =============================================
CREATE TABLE alertes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(30) NOT NULL UNIQUE,
  type_incident VARCHAR(50) NOT NULL,
  description TEXT,
  geom GEOMETRY(Point, 4326),
  adresse TEXT,
  statut alert_status DEFAULT 'PENDING',
  utilisateur_id UUID REFERENCES utilisateurs(id),
  reputation_snapshot DECIMAL(3,1),
  telephone_contact VARCHAR(20),
  pays VARCHAR(3) REFERENCES parametres_pays(code_pays),
  langue VARCHAR(10),
  media_urls TEXT[],
  similar_alerts UUID[],
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_alertes_statut ON alertes(statut);
CREATE INDEX idx_alertes_pays ON alertes(pays);
CREATE INDEX idx_alertes_geom ON alertes USING GIST(geom);
CREATE INDEX idx_alertes_created ON alertes(created_at DESC);

-- =============================================
-- TABLE: interventions
-- =============================================
CREATE TABLE interventions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(30) NOT NULL UNIQUE,
  type_incident VARCHAR(50) NOT NULL,
  priorite priority_level DEFAULT 'MOYENNE',
  statut intervention_status DEFAULT 'NOUVEAU',
  source VARCHAR(20) DEFAULT 'ALERTE',
  alerte_principale_id UUID REFERENCES alertes(id),
  geom GEOMETRY(Point, 4326),
  adresse TEXT,
  equipe_id UUID REFERENCES equipes(id),
  operateur_id UUID REFERENCES utilisateurs(id),
  debut_at TIMESTAMP,
  arrivee_at TIMESTAMP,
  fin_at TIMESTAMP,
  pays VARCHAR(3) REFERENCES parametres_pays(code_pays),
  bilan JSONB,
  version INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interventions_statut ON interventions(statut);
CREATE INDEX idx_interventions_equipe ON interventions(equipe_id);
CREATE INDEX idx_interventions_pays ON interventions(pays);
CREATE INDEX idx_interventions_geom ON interventions USING GIST(geom);
CREATE INDEX idx_interventions_created ON interventions(created_at DESC);

-- =============================================
-- TABLE: positions_equipes
-- =============================================
CREATE TABLE positions_equipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipe_id UUID REFERENCES equipes(id) ON DELETE CASCADE,
  geom GEOMETRY(Point, 4326) NOT NULL,
  vitesse DECIMAL(5,1),
  direction DECIMAL(5,1),
  accuracy DECIMAL(5,1),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_positions_equipe ON positions_equipes(equipe_id);
CREATE INDEX idx_positions_geom ON positions_equipes USING GIST(geom);
CREATE INDEX idx_positions_updated ON positions_equipes(updated_at DESC);

-- =============================================
-- TABLE: notes_equipes
-- =============================================
CREATE TABLE notes_equipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intervention_id UUID REFERENCES interventions(id),
  equipe_id UUID REFERENCES equipes(id),
  utilisateur_citoyen_id UUID REFERENCES utilisateurs(id),
  note INT CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT,
  pays VARCHAR(3),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: codes_2fa
-- =============================================
CREATE TABLE codes_2fa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  utilisateur_id UUID REFERENCES utilisateurs(id) ON DELETE CASCADE,
  canal channel_type NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  expire_at TIMESTAMP NOT NULL,
  nb_tentatives INT DEFAULT 0,
  consomme BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABLE: historique
-- =============================================
CREATE TABLE historique (
  id BIGSERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  intervention_id UUID REFERENCES interventions(id),
  alerte_id UUID REFERENCES alertes(id),
  utilisateur_id UUID REFERENCES utilisateurs(id),
  metadata JSONB,
  pays VARCHAR(3),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_historique_type ON historique(type);
CREATE INDEX idx_historique_created ON historique(created_at DESC);

-- =============================================
-- TABLE: statistiques_jour
-- =============================================
CREATE TABLE statistiques_jour (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  nb_alertes INT DEFAULT 0,
  nb_interventions INT DEFAULT 0,
  temps_moyen_minutes DECIMAL(6,1),
  taux_reussite DECIMAL(5,2),
  pays VARCHAR(3) REFERENCES parametres_pays(code_pays),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, pays)
);

-- =============================================
-- TABLE: event_store (Event Sourcing)
-- =============================================
CREATE TABLE event_store (
  id BIGSERIAL PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  aggregate_id UUID NOT NULL,
  aggregate_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  user_id UUID,
  metadata JSONB,
  version INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_event_store_aggregate ON event_store(aggregate_id, version);
CREATE INDEX idx_event_store_type ON event_store(event_type);

-- =============================================
-- TABLE: audit_log
-- =============================================
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  country VARCHAR(3),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user_created ON audit_log(user_id, created_at);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);

-- =============================================
-- TABLE: notifications
-- =============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES utilisateurs(id),
  type VARCHAR(50) NOT NULL,
  channel channel_type,
  title TEXT,
  body TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TRIGGERS: Optimistic Locking
-- =============================================
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_interventions_version
BEFORE UPDATE ON interventions
FOR EACH ROW EXECUTE FUNCTION increment_version();

CREATE TRIGGER tg_alertes_version
BEFORE UPDATE ON alertes
FOR EACH ROW EXECUTE FUNCTION increment_version();

CREATE TRIGGER tg_equipes_version
BEFORE UPDATE ON equipes
FOR EACH ROW EXECUTE FUNCTION increment_version();

-- =============================================
-- SEED DATA: Pays de test
-- =============================================
INSERT INTO parametres_pays (code_pays, nom_pays, devise, format_date, unite_distance, fuseau_horaire, langue_defaut, canaux_2fa, types_incidents) VALUES
('FR', 'France', 'EUR', 'DD/MM/YYYY', 'km', 'Europe/Paris', 'fr', '{SMS,EMAIL,WHATSAPP}', '{Incendie,Accident de route,Secours à personne,Fuite de gaz,Inondation,Autre urgence}'),
('CI', 'Côte d''Ivoire', 'XOF', 'DD/MM/YYYY', 'km', 'Africa/Abidjan', 'fr', '{SMS,WHATSAPP}', '{Incendie,Accident,Secours,Inondation,Autre}'),
('US', 'États-Unis', 'USD', 'MM/DD/YYYY', 'miles', 'America/New_York', 'en', '{SMS,EMAIL,AUTHENTICATOR}', '{Fire,Car Accident,Medical Emergency,Gas Leak,Flood,Other}');

-- Utilisateur admin de test
INSERT INTO utilisateurs (role, nom, prenoms, telephone, email, password_hash, pays, langue_pref, statut_2fa) VALUES
('ADMIN', 'Admin', 'GERMS', '+33600000000', 'admin@germs.dev', '$2b$10$dummyhashfordev', 'FR', 'fr', true);
