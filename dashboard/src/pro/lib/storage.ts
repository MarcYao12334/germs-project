import { ProTeam } from './data';

const KEYS = {
  team: 'germs_pro_team',
  loggedIn: 'germs_pro_logged',
};

export const proStorage = {
  getTeam: (): ProTeam | null => {
    try { const v = localStorage.getItem(KEYS.team); return v ? JSON.parse(v) : null; } catch { return null; }
  },
  saveTeam: (t: ProTeam) => localStorage.setItem(KEYS.team, JSON.stringify(t)),
  clearTeam: () => { localStorage.removeItem(KEYS.team); localStorage.removeItem(KEYS.loggedIn); },
  isLoggedIn: () => localStorage.getItem(KEYS.loggedIn) === 'true',
  setLoggedIn: () => localStorage.setItem(KEYS.loggedIn, 'true'),
};
