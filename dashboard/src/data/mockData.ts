// Mock data pour le développement - simule le backend complet
// Permet de visualiser le dashboard sans backend

export interface Alert {
  id: string;
  code: string;
  type_incident: string;
  description: string;
  lat: number;
  lng: number;
  adresse: string;
  statut: 'PENDING' | 'VALIDATED' | 'REJECTED' | 'DUPLICATE';
  utilisateur_id: string;
  citoyen_nom: string;
  citoyen_prenoms: string;
  citoyen_telephone: string;
  citoyen_reputation: number;
  pays: string;
  langue: string;
  media_urls: string[];
  created_at: string;
  similar_alert_nearby?: boolean;
  similar_alert_distance?: number;
  similar_intervention_id?: string;
}

export interface Intervention {
  id: string;
  code: string;
  type_incident: string;
  priorite: 'HAUTE' | 'MOYENNE' | 'FAIBLE';
  statut: 'NOUVEAU' | 'EN_ROUTE' | 'SUR_PLACE' | 'TERMINE';
  source: string;
  alerte_principale_id: string;
  lat: number;
  lng: number;
  adresse: string;
  equipe_id: string | null;
  equipe_nom: string | null;
  equipe_unite: string | null;
  operateur_id: string;
  debut_at: string;
  arrivee_at: string | null;
  fin_at: string | null;
  pays: string;
  bilan: any;
  eta_minutes: number | null;
  distance_km: number | null;
  created_at: string;
}

export interface Team {
  id: string;
  nom: string;
  unite: string;
  type_vehicule: string;
  immatriculation: string;
  telephone: string;
  code_equipe: string;
  pays: string;
  note_moyenne: number;
  actif: boolean;
  lat: number;
  lng: number;
  statut: 'DISPONIBLE' | 'EN_MISSION' | 'RETOUR_CASERNE';
  membres: TeamMember[];
}

export interface TeamMember {
  id: string;
  nom: string;
  prenoms: string;
  grade: string;
  role: string;
}

export interface CallLog {
  id: string;
  date: string;
  duree_secondes: number;
  operateur: string;
  numero_appele: string;
  canal: string;
  intervention_id?: string;
  alerte_id?: string;
}

export interface Stats {
  interventions_actives: number;
  alertes_en_attente: number;
  equipes_disponibles: number;
  temps_moyen_minutes: number;
  taux_reussite: number;
}

// ─── Données de démonstration ───

const now = new Date();
const h = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3600000).toISOString();
const m = (minAgo: number) => new Date(now.getTime() - minAgo * 60000).toISOString();

export const mockAlerts: Alert[] = [
  {
    id: 'a1', code: 'ALT-20260414-A1F3', type_incident: 'Incendie', description: 'Fumee epaisse provenant d\'un entrepot au bord de la lagune. Flammes visibles.',
    lat: 5.3210, lng: -4.0154, adresse: 'Zone industrielle de Vridi, Abidjan',
    statut: 'PENDING', utilisateur_id: 'u1', citoyen_nom: 'Konan', citoyen_prenoms: 'Yao Aristide', citoyen_telephone: '+225 07 08 09 10 11', citoyen_reputation: 4.5,
    pays: 'CI', langue: 'fr', media_urls: [], created_at: m(3),
  },
  {
    id: 'a2', code: 'ALT-20260414-B2K7', type_incident: 'Accident de route', description: 'Collision entre un gbaka et un taxi au carrefour. Plusieurs blesses.',
    lat: 5.3480, lng: -3.9830, adresse: 'Carrefour Palmeraie, Cocody, Abidjan',
    statut: 'PENDING', utilisateur_id: 'u2', citoyen_nom: 'Traore', citoyen_prenoms: 'Fatou', citoyen_telephone: '+225 05 12 34 56 78', citoyen_reputation: 3.5,
    pays: 'CI', langue: 'fr', media_urls: [], created_at: m(8),
    similar_alert_nearby: true, similar_alert_distance: 220, similar_intervention_id: 'i2',
  },
  {
    id: 'a3', code: 'ALT-20260414-C3M9', type_incident: 'Fuite de gaz', description: 'Forte odeur de gaz pres d\'une bonbonne dans le quartier.',
    lat: 5.3590, lng: -3.9950, adresse: 'Riviera Palmeraie, Cocody, Abidjan',
    statut: 'PENDING', utilisateur_id: 'u3', citoyen_nom: 'Coulibaly', citoyen_prenoms: 'Seydou', citoyen_telephone: '+225 07 55 44 33 22', citoyen_reputation: 5.0,
    pays: 'CI', langue: 'fr', media_urls: [], created_at: m(12),
  },
  {
    id: 'a4', code: 'ALT-20260414-D4P2', type_incident: 'Secours à personne', description: 'Personne agee tombee dans les escaliers au marche.',
    lat: 5.3167, lng: -4.0167, adresse: 'Marche de Treichville, Abidjan',
    statut: 'VALIDATED', utilisateur_id: 'u4', citoyen_nom: 'Bamba', citoyen_prenoms: 'Moussa', citoyen_telephone: '+225 01 11 22 33 44', citoyen_reputation: 4.0,
    pays: 'CI', langue: 'fr', media_urls: [], created_at: m(25),
  },
  {
    id: 'a5', code: 'ALT-20260414-E5Q1', type_incident: 'Inondation', description: 'Montee des eaux apres forte pluie, route impraticable.',
    lat: 5.3380, lng: -4.0280, adresse: 'Boulevard de Marseille, Marcory, Abidjan',
    statut: 'REJECTED', utilisateur_id: 'u5', citoyen_nom: 'Diallo', citoyen_prenoms: 'Aminata', citoyen_telephone: '+225 07 77 88 99 00', citoyen_reputation: 1.5,
    pays: 'CI', langue: 'fr', media_urls: [], created_at: h(1),
  },
  {
    id: 'a6', code: 'ALT-20260414-F6R8', type_incident: 'Incendie', description: 'Feu dans un atelier de menuiserie a Adjame.',
    lat: 5.3500, lng: -4.0200, adresse: 'Quartier Adjame, Abidjan',
    statut: 'PENDING', utilisateur_id: 'u6', citoyen_nom: 'Koffi', citoyen_prenoms: 'Ange', citoyen_telephone: '+225 05 33 22 11 00', citoyen_reputation: 3.0,
    pays: 'CI', langue: 'fr', media_urls: [], created_at: m(1),
  },
];

export const mockInterventions: Intervention[] = [
  {
    id: 'i1', code: 'INT-20260414-0001', type_incident: 'Incendie', priorite: 'HAUTE', statut: 'EN_ROUTE',
    source: 'ALERTE', alerte_principale_id: 'a-old-1', lat: 5.3300, lng: -4.0100,
    adresse: 'Boulevard Lagunaire, Plateau, Abidjan', equipe_id: 't1', equipe_nom: 'Equipe Alpha', equipe_unite: 'GSPM Plateau',
    operateur_id: 'op1', debut_at: m(15), arrivee_at: null, fin_at: null, pays: 'CI', bilan: null,
    eta_minutes: 4, distance_km: 2.3, created_at: m(15),
  },
  {
    id: 'i2', code: 'INT-20260414-0002', type_incident: 'Accident de route', priorite: 'HAUTE', statut: 'SUR_PLACE',
    source: 'ALERTE', alerte_principale_id: 'a-old-2', lat: 5.3450, lng: -3.9900,
    adresse: 'Pont Felix Houphouet-Boigny, Abidjan', equipe_id: 't2', equipe_nom: 'Equipe Bravo', equipe_unite: 'GSPM Cocody',
    operateur_id: 'op1', debut_at: m(32), arrivee_at: m(20), fin_at: null, pays: 'CI', bilan: null,
    eta_minutes: 0, distance_km: 0, created_at: m(32),
  },
  {
    id: 'i3', code: 'INT-20260414-0003', type_incident: 'Secours à personne', priorite: 'MOYENNE', statut: 'EN_ROUTE',
    source: 'APPEL', alerte_principale_id: '', lat: 5.3600, lng: -4.0050,
    adresse: 'CHU de Cocody, Abidjan', equipe_id: 't3', equipe_nom: 'Equipe Charlie', equipe_unite: 'GSPM Abobo',
    operateur_id: 'op2', debut_at: m(8), arrivee_at: null, fin_at: null, pays: 'CI', bilan: null,
    eta_minutes: 6, distance_km: 3.8, created_at: m(8),
  },
  {
    id: 'i4', code: 'INT-20260413-0042', type_incident: 'Fuite de gaz', priorite: 'HAUTE', statut: 'TERMINE',
    source: 'ALERTE', alerte_principale_id: 'a-old-3', lat: 5.3550, lng: -4.0300,
    adresse: 'Marche d\'Adjame, Abidjan', equipe_id: 't1', equipe_nom: 'Equipe Alpha', equipe_unite: 'GSPM Plateau',
    operateur_id: 'op1', debut_at: h(3), arrivee_at: h(2.5), fin_at: h(1.5), pays: 'CI',
    bilan: { vehicules: 2, personnel: 6, victimes: 0, actions: ['Ventilation', 'Coupure gaz'] },
    eta_minutes: null, distance_km: null, created_at: h(3),
  },
  {
    id: 'i5', code: 'INT-20260413-0041', type_incident: 'Inondation', priorite: 'FAIBLE', statut: 'TERMINE',
    source: 'APPEL', alerte_principale_id: '', lat: 5.3250, lng: -4.0250,
    adresse: 'Zone 4, Marcory, Abidjan', equipe_id: 't4', equipe_nom: 'Equipe Delta', equipe_unite: 'GSPM Yopougon',
    operateur_id: 'op2', debut_at: h(5), arrivee_at: h(4.5), fin_at: h(3), pays: 'CI',
    bilan: { vehicules: 1, personnel: 4, victimes: 0, actions: ['Pompage', 'Securisation'] },
    eta_minutes: null, distance_km: null, created_at: h(5),
  },
];

export const mockTeams: Team[] = [
  {
    id: 't1', nom: 'Equipe Alpha', unite: 'GSPM Plateau', type_vehicule: 'Camion citerne', immatriculation: 'CI-1234-AB',
    telephone: '+225 27 20 21 22 23', code_equipe: 'EQ-ALPHA', pays: 'CI', note_moyenne: 4.7, actif: true,
    lat: 5.3320, lng: -4.0080, statut: 'EN_MISSION',
    membres: [
      { id: 'm1', nom: 'Kouame', prenoms: 'Yao', grade: 'Lieutenant', role: 'Chef d\'equipe' },
      { id: 'm2', nom: 'Toure', prenoms: 'Abdoulaye', grade: 'Sergent', role: 'Conducteur' },
      { id: 'm3', nom: 'N\'Guessan', prenoms: 'Ama', grade: 'Caporal', role: 'Equipier' },
      { id: 'm4', nom: 'Kone', prenoms: 'Amadou', grade: 'Sapeur', role: 'Secouriste' },
    ],
  },
  {
    id: 't2', nom: 'Equipe Bravo', unite: 'GSPM Cocody', type_vehicule: 'Ambulance', immatriculation: 'CI-5678-CD',
    telephone: '+225 27 22 43 44 45', code_equipe: 'EQ-BRAVO', pays: 'CI', note_moyenne: 4.2, actif: true,
    lat: 5.3450, lng: -3.9900, statut: 'EN_MISSION',
    membres: [
      { id: 'm5', nom: 'Ouattara', prenoms: 'Ibrahim', grade: 'Lieutenant', role: 'Chef d\'equipe' },
      { id: 'm6', nom: 'Bamba', prenoms: 'Moussa', grade: 'Sergent', role: 'Conducteur' },
      { id: 'm7', nom: 'Yao', prenoms: 'Akissi', grade: 'Caporal', role: 'Infirmiere' },
    ],
  },
  {
    id: 't3', nom: 'Equipe Charlie', unite: 'GSPM Abobo', type_vehicule: 'Echelle', immatriculation: 'CI-9012-EF',
    telephone: '+225 27 24 55 66 77', code_equipe: 'EQ-CHARLIE', pays: 'CI', note_moyenne: 4.5, actif: true,
    lat: 5.3650, lng: -4.0100, statut: 'EN_MISSION',
    membres: [
      { id: 'm8', nom: 'Dje', prenoms: 'Michel', grade: 'Capitaine', role: 'Chef d\'equipe' },
      { id: 'm9', nom: 'Traore', prenoms: 'Issouf', grade: 'Sergent', role: 'Conducteur' },
      { id: 'm10', nom: 'Aka', prenoms: 'Josiane', grade: 'Caporal', role: 'Equipier' },
      { id: 'm11', nom: 'Dosso', prenoms: 'Lacina', grade: 'Sapeur', role: 'Equipier' },
      { id: 'm12', nom: 'Diallo', prenoms: 'Fatoumata', grade: 'Sapeur', role: 'Secouriste' },
    ],
  },
  {
    id: 't4', nom: 'Equipe Delta', unite: 'GSPM Yopougon', type_vehicule: 'Camion citerne', immatriculation: 'CI-3456-GH',
    telephone: '+225 27 23 78 90 12', code_equipe: 'EQ-DELTA', pays: 'CI', note_moyenne: 3.8, actif: true,
    lat: 5.3200, lng: -4.0600, statut: 'DISPONIBLE',
    membres: [
      { id: 'm13', nom: 'Achi', prenoms: 'Thomas', grade: 'Lieutenant', role: 'Chef d\'equipe' },
      { id: 'm14', nom: 'Soro', prenoms: 'Oumar', grade: 'Sergent', role: 'Conducteur' },
      { id: 'm15', nom: 'Assi', prenoms: 'Emma', grade: 'Caporal', role: 'Equipier' },
    ],
  },
  {
    id: 't5', nom: 'Equipe Echo', unite: 'GSPM Port-Bouet', type_vehicule: 'Ambulance', immatriculation: 'CI-7890-IJ',
    telephone: '+225 27 21 34 56 78', code_equipe: 'EQ-ECHO', pays: 'CI', note_moyenne: 4.9, actif: true,
    lat: 5.3050, lng: -3.9700, statut: 'DISPONIBLE',
    membres: [
      { id: 'm16', nom: 'Ble', prenoms: 'Anne', grade: 'Lieutenant', role: 'Chef d\'equipe' },
      { id: 'm17', nom: 'Coulibaly', prenoms: 'Seydou', grade: 'Sergent', role: 'Conducteur' },
      { id: 'm18', nom: 'Gnamba', prenoms: 'David', grade: 'Caporal', role: 'Infirmier' },
      { id: 'm19', nom: 'Dembele', prenoms: 'Mariam', grade: 'Sapeur', role: 'Secouriste' },
    ],
  },
];

export const mockCallLogs: CallLog[] = [
  { id: 'c1', date: m(5), duree_secondes: 45, operateur: 'Op. Kouadio', numero_appele: '+225 07 08 09 10 11', canal: 'Appel vocal', alerte_id: 'a1' },
  { id: 'c2', date: m(12), duree_secondes: 30, operateur: 'Op. Kouadio', numero_appele: '+225 05 12 34 56 78', canal: 'WhatsApp', alerte_id: 'a2' },
  { id: 'c3', date: m(35), duree_secondes: 120, operateur: 'Op. N\'Dri', numero_appele: '+225 01 11 22 33 44', canal: 'SMS', alerte_id: 'a4' },
  { id: 'c4', date: h(1), duree_secondes: 60, operateur: 'Op. Kouadio', numero_appele: '+225 07 77 88 99 00', canal: 'Appel vocal', alerte_id: 'a5' },
  { id: 'c5', date: h(2), duree_secondes: 90, operateur: 'Op. N\'Dri', numero_appele: '+225 27 20 21 22 23', canal: 'Appel vocal', intervention_id: 'i4' },
];

export const mockStats: Stats = {
  interventions_actives: 3,
  alertes_en_attente: 4,
  equipes_disponibles: 2,
  temps_moyen_minutes: 42.5,
  taux_reussite: 94.2,
};
