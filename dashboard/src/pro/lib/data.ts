// Mock data for GERMS Pro — Abidjan / Cote d'Ivoire

export interface Mission {
  id: string;
  code: string;
  type_incident: string;
  description: string;
  priorite: 'HAUTE' | 'MOYENNE' | 'FAIBLE';
  statut: 'NOUVEAU' | 'EN_ROUTE' | 'SUR_PLACE' | 'TERMINE';
  source: 'CITOYEN' | 'CENTRAL';
  adresse: string;
  lat: number;
  lng: number;
  distance_km: number;
  eta_minutes: number;
  citoyen_nom?: string;
  citoyen_telephone?: string;
  equipe_assignee: boolean;
  created_at: string;
}

export interface ProTeam {
  nom: string;
  unite: string;
  code: string;
  chef: string;
  chef_grade: string;
  pays: string;
  membres: { nom: string; prenoms: string; grade: string; role: string }[];
}

const m = (minAgo: number) => new Date(Date.now() - minAgo * 60000).toISOString();

export const myTeam: ProTeam = {
  nom: 'Equipe Alpha',
  unite: 'GSPM Plateau',
  code: 'EQ-ALPHA',
  chef: 'Kouame Yao',
  chef_grade: 'Lieutenant',
  pays: 'CI',
  membres: [
    { nom: 'Kouame', prenoms: 'Yao', grade: 'Lieutenant', role: "Chef d'equipe" },
    { nom: 'Toure', prenoms: 'Abdoulaye', grade: 'Sergent', role: 'Conducteur' },
    { nom: "N'Guessan", prenoms: 'Ama', grade: 'Caporal', role: 'Equipier' },
    { nom: 'Kone', prenoms: 'Amadou', grade: 'Sapeur', role: 'Secouriste' },
  ],
};

export const initialMissions: Mission[] = [
  {
    id: 'mi1', code: 'INT-20260414-0001', type_incident: 'Incendie', description: 'Fumee epaisse provenant d\'un entrepot au bord de la lagune.',
    priorite: 'HAUTE', statut: 'NOUVEAU', source: 'CITOYEN',
    adresse: 'Zone industrielle de Vridi, Abidjan', lat: 5.3210, lng: -4.0154,
    distance_km: 2.3, eta_minutes: 4, citoyen_nom: 'Konan Yao A.', citoyen_telephone: '+225 07 08 09 10 11',
    equipe_assignee: true, created_at: m(5),
  },
  {
    id: 'mi2', code: 'INT-20260414-0002', type_incident: 'Accident de route', description: 'Collision entre un gbaka et un taxi. Plusieurs blesses.',
    priorite: 'MOYENNE', statut: 'EN_ROUTE', source: 'CITOYEN',
    adresse: 'Carrefour Palmeraie, Cocody, Abidjan', lat: 5.3480, lng: -3.9830,
    distance_km: 1.1, eta_minutes: 2, citoyen_nom: 'Traore Fatou', citoyen_telephone: '+225 05 12 34 56 78',
    equipe_assignee: true, created_at: m(15),
  },
  {
    id: 'mi3', code: 'INT-20260414-0003', type_incident: 'Secours a personne', description: 'Personne agee tombee au marche de Treichville.',
    priorite: 'HAUTE', statut: 'NOUVEAU', source: 'CENTRAL',
    adresse: 'Marche de Treichville, Abidjan', lat: 5.3167, lng: -4.0167,
    distance_km: 3.5, eta_minutes: 7, equipe_assignee: false, created_at: m(3),
  },
  {
    id: 'mi4', code: 'INT-20260413-0042', type_incident: 'Fuite de gaz', description: 'Forte odeur de gaz pres du marche.',
    priorite: 'HAUTE', statut: 'TERMINE', source: 'CITOYEN',
    adresse: "Marche d'Adjame, Abidjan", lat: 5.3550, lng: -4.0300,
    distance_km: 0, eta_minutes: 0, citoyen_nom: 'Coulibaly S.', citoyen_telephone: '+225 07 55 44 33 22',
    equipe_assignee: true, created_at: m(180),
  },
];
