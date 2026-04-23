import { ProTeam } from './data';

const KEYS = {
  team: 'germs_pro_team',
  loggedIn: 'germs_pro_logged',
  accounts: 'germs_pro_accounts',
};

export interface ProAccount {
  team: ProTeam;
  password: string;
  email: string;
  telephone: string;
  created_at: string;
}

export const proStorage = {
  getTeam: (): ProTeam | null => {
    try { const v = localStorage.getItem(KEYS.team); return v ? JSON.parse(v) : null; } catch { return null; }
  },
  saveTeam: (t: ProTeam) => localStorage.setItem(KEYS.team, JSON.stringify(t)),
  clearTeam: () => { localStorage.removeItem(KEYS.team); localStorage.removeItem(KEYS.loggedIn); },
  isLoggedIn: () => localStorage.getItem(KEYS.loggedIn) === 'true',
  setLoggedIn: () => localStorage.setItem(KEYS.loggedIn, 'true'),

  // Account registry
  getAccounts: (): ProAccount[] => {
    try { const v = localStorage.getItem(KEYS.accounts); return v ? JSON.parse(v) : []; } catch { return []; }
  },
  saveAccount: (account: ProAccount) => {
    const accounts = proStorage.getAccounts();
    // Replace if same code exists, otherwise add
    const idx = accounts.findIndex(a => a.team.code === account.team.code);
    if (idx >= 0) accounts[idx] = account;
    else accounts.push(account);
    localStorage.setItem(KEYS.accounts, JSON.stringify(accounts));
  },
  findAccount: (code: string, password: string): ProAccount | null => {
    const accounts = proStorage.getAccounts();
    return accounts.find(a => a.team.code === code && a.password === password) || null;
  },
  findByCode: (code: string): ProAccount | null => {
    const accounts = proStorage.getAccounts();
    return accounts.find(a => a.team.code === code) || null;
  },
  findByEmail: (email: string, password: string): ProAccount | null => {
    const accounts = proStorage.getAccounts();
    return accounts.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password) || null;
  },
};
