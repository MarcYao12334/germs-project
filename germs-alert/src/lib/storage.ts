import { CitizenProfile, ActiveAlert, Alert } from '../types';

const KEYS = {
  profile: 'germs_citizen_profile',
  active: 'germs_active_alert',
  history: 'germs_alert_history',
  onboarded: 'germs_onboarded',
};

function get<T>(key: string): T | null {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function set(key: string, value: any) { localStorage.setItem(key, JSON.stringify(value)); }

export const storage = {
  getProfile: () => get<CitizenProfile>(KEYS.profile),
  saveProfile: (p: CitizenProfile) => set(KEYS.profile, p),
  clearProfile: () => localStorage.removeItem(KEYS.profile),

  getActiveAlert: () => get<ActiveAlert>(KEYS.active),
  saveActiveAlert: (a: ActiveAlert) => set(KEYS.active, a),
  clearActiveAlert: () => localStorage.removeItem(KEYS.active),

  getHistory: () => get<Alert[]>(KEYS.history) || [],
  addToHistory: (a: Alert) => {
    const h = get<Alert[]>(KEYS.history) || [];
    h.unshift(a);
    set(KEYS.history, h.slice(0, 50));
  },

  isOnboarded: () => localStorage.getItem(KEYS.onboarded) === 'true',
  setOnboarded: () => localStorage.setItem(KEYS.onboarded, 'true'),
};
