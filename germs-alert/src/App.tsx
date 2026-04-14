import { useState, useEffect, useCallback } from 'react';
import MobileShell from './components/MobileShell';
import BottomNav from './components/BottomNav';
import Onboarding from './pages/Onboarding';
import Register from './pages/Register';
import Home from './pages/Home';
import ReportLocation from './pages/ReportLocation';
import ReportDescription from './pages/ReportDescription';
import ReportConfirm from './pages/ReportConfirm';
import Tracking from './pages/Tracking';
import Rating from './pages/Rating';
import History from './pages/History';
import Profile from './pages/Profile';
import { storage } from './lib/storage';
import { citizenSync } from './lib/sync';
import { ActiveAlert, TeamInfo } from './types';

type Screen = 'onboarding' | 'register' | 'home' | 'report-location' | 'report-description' | 'report-confirm' | 'tracking' | 'rating' | 'history' | 'profile';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeAlert, setActiveAlert] = useState<ActiveAlert | null>(null);
  const [reportData, setReportData] = useState<any>({});
  const [selectedCountry, setSelectedCountry] = useState('CI');

  // Init: check onboarding + profile + restore active alert
  useEffect(() => {
    if (!storage.isOnboarded()) { setScreen('onboarding'); return; }
    if (!storage.getProfile()) { setScreen('register'); return; }
    const saved = storage.getActiveAlert();
    if (saved) setActiveAlert(saved);
  }, []);

  // Persist active alert changes
  useEffect(() => {
    if (activeAlert) storage.saveActiveAlert(activeAlert);
  }, [activeAlert]);

  // BroadcastChannel listener (root level — never misses events)
  useEffect(() => {
    const unsubs = [
      citizenSync.on('alert:validated', (p: any) => {
        setActiveAlert(prev => {
          if (!prev || prev.alert.id !== p.alertId) return prev;
          const updated = { ...prev, currentStep: 2, alert: { ...prev.alert, statut: 'VALIDATED' as const } };
          // Update reputation +0.5
          const profile = storage.getProfile();
          if (profile) { profile.reputation = Math.min(5, profile.reputation + 0.5); storage.saveProfile(profile); }
          return updated;
        });
      }),
      citizenSync.on('alert:rejected', (p: any) => {
        setActiveAlert(prev => {
          if (!prev || prev.alert.id !== p.alertId) return prev;
          const updated = { ...prev, currentStep: -1, alert: { ...prev.alert, statut: 'REJECTED' as const } };
          const profile = storage.getProfile();
          if (profile) { profile.reputation = Math.max(0, profile.reputation - 0.5); storage.saveProfile(profile); }
          return updated;
        });
      }),
      citizenSync.on('team:assigned', (p: any) => {
        setActiveAlert(prev => {
          if (!prev) return prev;
          return { ...prev, team: p as TeamInfo, currentStep: Math.max(prev.currentStep, 2) };
        });
      }),
      citizenSync.on('intervention:status-changed', (p: any) => {
        setActiveAlert(prev => {
          if (!prev) return prev;
          const stepMap: Record<string, number> = { EN_ROUTE: 3, SUR_PLACE: 3, TERMINE: 4 };
          const newStep = stepMap[p.statut] ?? prev.currentStep;
          const updated = { ...prev, currentStep: newStep };
          if (p.statut === 'TERMINE') {
            setTimeout(() => setScreen('rating'), 1500);
          }
          return updated;
        });
      }),
      citizenSync.on('eta:updated', (p: any) => {
        setActiveAlert(prev => {
          if (!prev || !prev.team) return prev;
          return { ...prev, team: { ...prev.team, eta_minutes: p.eta_minutes, distance_km: p.distance_km } };
        });
      }),
    ];
    return () => { unsubs.forEach(u => u()); };
  }, []);

  const showNav = ['home', 'tracking', 'history', 'profile'].includes(screen);

  const handleNavigate = (tab: string) => {
    if (tab === 'home') setScreen('home');
    else if (tab === 'tracking') setScreen(activeAlert ? 'tracking' : 'home');
    else setScreen(tab as Screen);
  };

  const handleAlertCreated = (alert: ActiveAlert) => {
    setActiveAlert(alert);
    storage.addToHistory(alert.alert);
    setScreen('report-confirm');
  };

  const handleRatingDone = () => {
    if (activeAlert) {
      const updated = { ...activeAlert.alert, statut: 'VALIDATED' as const };
      storage.addToHistory(updated);
    }
    setActiveAlert(null);
    storage.clearActiveAlert();
    setScreen('home');
  };

  return (
    <MobileShell>
      <div className="flex-1 overflow-y-auto">
        {screen === 'onboarding' && <Onboarding onDone={(country: string) => { setSelectedCountry(country); setScreen('register'); }} />}
        {screen === 'register' && <Register onDone={() => setScreen('home')} initialCountry={selectedCountry} />}
        {screen === 'home' && <Home activeAlert={activeAlert} onSelectType={(type: string) => { setReportData({ type_incident: type }); setScreen('report-location'); }} onGoToTracking={() => setScreen('tracking')} />}
        {screen === 'report-location' && <ReportLocation onNext={(loc: any) => { setReportData((p: any) => ({ ...p, ...loc })); setScreen('report-description'); }} onBack={() => setScreen('home')} />}
        {screen === 'report-description' && <ReportDescription reportData={reportData} onNext={(desc: any) => { setReportData((p: any) => ({ ...p, ...desc })); }} onSubmit={(finalData: any) => handleAlertCreated(finalData)} onBack={() => setScreen('report-location')} />}
        {screen === 'report-confirm' && <ReportConfirm alert={activeAlert!} onGoToTracking={() => setScreen('tracking')} />}
        {screen === 'tracking' && <Tracking activeAlert={activeAlert} />}
        {screen === 'rating' && <Rating activeAlert={activeAlert} onDone={handleRatingDone} />}
        {screen === 'history' && <History />}
        {screen === 'profile' && <Profile onLogout={() => { storage.clearProfile(); setScreen('register'); }} />}
      </div>
      {showNav && <BottomNav active={screen} onNavigate={handleNavigate} alertCount={activeAlert ? 1 : 0} />}
    </MobileShell>
  );
}
