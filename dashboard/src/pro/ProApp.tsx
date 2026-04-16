import { useState, useEffect } from 'react';
import MobileShell from './components/MobileShell';
import BottomNav from './components/BottomNav';
import ProRegister from './pages/ProRegister';
import Missions from './pages/Missions';
import MissionDetail from './pages/MissionDetail';
import BilanForm from './pages/BilanForm';
import AlertsList from './pages/AlertsList';
import TeamView from './pages/TeamView';
import MapScreen from './pages/MapScreen';
import { proSync } from './lib/sync';
import { proStorage } from './lib/storage';
import { Mission, ProTeam } from './lib/data';

type Screen = 'register' | 'missions' | 'detail' | 'bilan' | 'carte' | 'alertes' | 'equipe';

export default function ProApp() {
  const [team, setTeam] = useState<ProTeam | null>(proStorage.getTeam());
  const [screen, setScreen] = useState<Screen>(team ? 'missions' : 'register');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Listen for new missions from Dashboard
  useEffect(() => {
    const unsubs = [
      proSync.on('intervention:created', (p: any) => {
        console.log('[Pro] New mission received:', p);
        const newMission: Mission = {
          id: p.id || `mi-${Date.now()}`,
          code: p.code,
          type_incident: p.type_incident || 'Urgence',
          description: p.description || '',
          priorite: 'HAUTE',
          statut: 'NOUVEAU',
          source: 'CITOYEN',
          adresse: p.adresse || 'Adresse inconnue',
          lat: p.lat || 5.34,
          lng: p.lng || -4.01,
          distance_km: 2.5,
          eta_minutes: 5,
          citoyen_nom: p.citoyen_nom,
          citoyen_telephone: p.citoyen_telephone,
          equipe_assignee: true,
          created_at: new Date().toISOString(),
        };
        setMissions(prev => [newMission, ...prev]);
      }),
      proSync.on('intervention:status-changed', (p: any) => {
        setMissions(prev => prev.map(m =>
          m.id === p.interventionId ? { ...m, statut: p.statut } : m
        ));
      }),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  const handleRegistered = (newTeam: ProTeam) => {
    setTeam(newTeam);
    setScreen('missions');
  };

  const handleViewDetails = (id: string) => {
    setSelectedId(id);
    setScreen('detail');
  };

  const handleAccept = (id: string) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, statut: 'EN_ROUTE' as const } : m));
    proSync.send('intervention:status-changed', { interventionId: id, statut: 'EN_ROUTE' });
    setSelectedId(id);
    setScreen('detail');
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, statut: newStatus as any } : m));
    proSync.send('intervention:status-changed', { interventionId: id, statut: newStatus });
    if (newStatus === 'TERMINE') {
      setSelectedId(id);
      setScreen('bilan');
    }
  };

  const handleBilanSubmit = (bilan: any) => {
    proSync.send('bilan:submitted', bilan);
    setScreen('missions');
  };

  const handleCall = (tel: string) => {
    window.open(`tel:${tel.replace(/\s/g, '')}`, '_self');
  };

  const handleNavigate = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, '_blank');
  };

  const handleNav = (tab: string) => {
    if (tab === 'missions' || tab === 'carte' || tab === 'alertes' || tab === 'equipe') {
      setScreen(tab as Screen);
    }
  };

  const handleLogout = () => {
    proStorage.clearTeam();
    setTeam(null);
    setScreen('register');
  };

  const handleTeamUpdate = (updated: ProTeam) => {
    setTeam(updated);
  };

  // Not registered yet
  if (screen === 'register' || !team) {
    return (
      <MobileShell>
        <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-5 py-3.5 shrink-0">
          <h1 className="font-bold text-[15px] tracking-tight">GERMS Pro</h1>
          <p className="text-xs text-gray-400">Application Pompiers / Secouristes</p>
        </header>
        <ProRegister onDone={handleRegistered} />
      </MobileShell>
    );
  }

  const selectedMission = selectedId ? missions.find(m => m.id === selectedId) : null;
  const activeMissions = missions.filter(m => m.statut !== 'TERMINE');
  const showNav = screen !== 'detail' && screen !== 'bilan';

  return (
    <MobileShell>
      {/* Top bar */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-5 py-3.5 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-[15px] tracking-tight">GERMS Pro</h1>
            <p className="text-xs text-gray-400">{team.nom} — {team.unite}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400">Chef d'equipe</p>
            <p className="text-xs font-semibold">{team.chef_grade.substring(0, 3)}. {team.chef.split(' ')[0]} {team.chef.split(' ')[1]?.[0]}.</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {screen === 'missions' && <Missions missions={missions} onViewDetails={handleViewDetails} onAccept={handleAccept} />}
        {screen === 'detail' && selectedMission && (
          <MissionDetail mission={selectedMission} onBack={() => setScreen('missions')} onStatusChange={handleStatusChange} onCall={handleCall} onNavigate={handleNavigate} />
        )}
        {screen === 'detail' && !selectedMission && (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <p className="text-gray-400 mb-4">Mission introuvable</p>
            <button onClick={() => setScreen('missions')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">Retour aux missions</button>
          </div>
        )}
        {screen === 'bilan' && selectedMission && (
          <BilanForm mission={selectedMission} onSubmit={handleBilanSubmit} onSkip={() => setScreen('missions')} team={team ? { nom: team.nom, unite: team.unite, chef: team.chef, chef_grade: team.chef_grade, membres_count: team.membres.length } : undefined} />
        )}
        {screen === 'bilan' && !selectedMission && (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <p className="text-gray-400 mb-4">Mission introuvable</p>
            <button onClick={() => setScreen('missions')} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">Retour aux missions</button>
          </div>
        )}
        {screen === 'carte' && <MapScreen />}
        {screen === 'alertes' && <AlertsList missions={missions} onViewDetails={handleViewDetails} />}
        {screen === 'equipe' && <TeamView team={team} onTeamUpdate={handleTeamUpdate} onLogout={handleLogout} />}
      </div>

      {showNav && <BottomNav active={screen} onNavigate={handleNav} missionCount={activeMissions.length} />}
    </MobileShell>
  );
}
