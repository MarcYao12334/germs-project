export interface Alert {
  id: string; code: string; type_incident: string; description: string;
  lat: number; lng: number; adresse: string;
  statut: 'PENDING' | 'VALIDATED' | 'REJECTED' | 'DUPLICATE';
  utilisateur_id: string; citoyen_nom: string; citoyen_prenoms: string;
  citoyen_telephone: string; citoyen_reputation: number;
  pays: string; langue: string; media_urls: string[];
  created_at: string; similar_alert_nearby?: boolean;
  similar_alert_distance?: number; similar_intervention_id?: string;
}

export interface Intervention {
  id: string; code: string; type_incident: string;
  priorite: 'HAUTE' | 'MOYENNE' | 'FAIBLE';
  statut: 'NOUVEAU' | 'EN_ROUTE' | 'SUR_PLACE' | 'TERMINE';
  equipe_id: string | null; equipe_nom: string | null; equipe_unite: string | null;
  eta_minutes: number | null; distance_km: number | null;
}

export interface CitizenProfile {
  id: string; nom: string; prenoms: string;
  telephone: string; email?: string;
  pays: string; langue: string;
  reputation: number; created_at: string;
}

export interface TeamInfo {
  nom: string; unite: string; type_vehicule: string;
  note_moyenne: number; eta_minutes: number; distance_km: number;
}

export interface SyncEvent {
  type: string; payload: any;
  origin: 'dashboard' | 'citizen' | 'pro';
  ts: number;
}

export interface ActiveAlert {
  alert: Alert;
  intervention?: Intervention;
  team?: TeamInfo;
  currentStep: number; // 0-4
  rating?: { score: number; comment: string };
}

export type IncidentType = 'Incendie' | 'Accident de route' | 'Secours à personne' | 'Fuite de gaz' | 'Inondation' | 'Autre urgence';
