import { useState, useEffect } from 'react';
import Login from './pages/Login';
import CommandCenter from './pages/CommandCenter';
import CitizenApp from './citizen/CitizenApp';
import ProApp from './pro/ProApp';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

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
    return <Login onLogin={(u: any) => { setUser(u); setIsLoggedIn(true); }} />;
  }

  return <CommandCenter user={user} onLogout={() => setIsLoggedIn(false)} />;
}

export default App;
