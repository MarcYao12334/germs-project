const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  // Stats
  getStats: (country?: string) => request(`/interventions/stats${country ? `?country=${country}` : ''}`),
  
  // Alerts
  getAlerts: (country?: string) => request(`/alerts${country ? `?country=${country}` : ''}`),
  createAlert: (data: any) => request('/alerts', { method: 'POST', body: JSON.stringify(data) }),
  validateAlert: (id: string, operatorId: string) => request(`/alerts/${id}/validate`, { method: 'PATCH', body: JSON.stringify({ operatorId }) }),
  rejectAlert: (id: string, motif: string) => request(`/alerts/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ motif }) }),
  
  // Interventions
  getInterventions: (country?: string) => request(`/interventions${country ? `?country=${country}` : ''}`),
  createIntervention: (alertId: string, operatorId: string) => request('/interventions', { method: 'POST', body: JSON.stringify({ alertId, operatorId }) }),
  updateStatus: (id: string, status: string, version: number) => request(`/interventions/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, version }) }),
  assignTeam: (id: string, teamId: string) => request(`/interventions/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ teamId }) }),
  
  // Teams
  getTeams: (country?: string) => request(`/teams${country ? `?country=${country}` : ''}`),
  createTeam: (data: any) => request('/teams', { method: 'POST', body: JSON.stringify(data) }),

  // Health
  health: () => request('/health'),
};
