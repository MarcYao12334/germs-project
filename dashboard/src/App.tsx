import { useState, useEffect } from 'react';
import Login from './pages/Login';
import CommandCenter from './pages/CommandCenter';
import CitizenApp from './citizen/CitizenApp';
import ProApp from './pro/ProApp';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('germs_dashboard_logged') === 'true');
  const [user, setUser] = useState<any>(() => {
    try { const u = localStorage.getItem('germs_dashboard_user'); return u ? JSON.parse(u) : null; } catch { return null; }
  });

  const path = window.location.pathname;

  // GERMS Alert (Citoyen) — /citizen
  if (path.startsWith('/citizen')) {
    return <CitizenApp />;
  }

  // GERMS Pro (Pompiers) — /pro
  if (path.startsWith('/pro')) {
    return <ProApp />;
  }

  // Dashboard — requires login
  if (!isLoggedIn) {
    return <Login onLogin={(u: any) => { setUser(u); setIsLoggedIn(true); localStorage.setItem('germs_dashboard_logged', 'true'); localStorage.setItem('germs_dashboard_user', JSON.stringify(u)); }} />;
  }

  return <CommandCenter user={user} onLogout={() => { setIsLoggedIn(false); setUser(null); localStorage.removeItem('germs_dashboard_logged'); localStorage.removeItem('germs_dashboard_user'); }} />;
}

export default App;
