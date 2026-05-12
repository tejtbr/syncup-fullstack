import api from './client'

// --- Status ---
export const statusApi = {
  setStatus: (data) =>
    api.post('/api/status/me', data).then(r => r.data.data),

  getMyStatus: (date) =>
    api.get('/api/status/me', { params: { date } }).then(r => r.data.data),

  getTeamDashboard: (teamId, date) =>
    api.get(`/api/status/team/${teamId}`, { params: { date } }).then(r => r.data.data),

  getOrgSummary: (date) =>
    api.get('/api/status/summary', { params: { date } }).then(r => r.data.data),

  getLocations: () =>
    api.get('/api/status/locations').then(r => r.data.data),
}

// --- Teams ---
export const teamApi = {
  createTeam: (data) =>
    api.post('/api/teams', data).then(r => r.data.data),

  getMyTeams: () =>
    api.get('/api/teams/my').then(r => r.data.data),

  getTeam: (teamId) =>
    api.get(`/api/teams/${teamId}`).then(r => r.data.data),

  getTeamMembers: (teamId) =>
    api.get(`/api/teams/${teamId}/members`).then(r => r.data.data),

  addMember: (teamId, data) =>
    api.post(`/api/teams/${teamId}/members`, data).then(r => r.data.data),

  removeMember: (teamId, userId) =>
    api.delete(`/api/teams/${teamId}/members/${userId}`),

  deleteTeam: (teamId) =>
    api.delete(`/api/teams/${teamId}`),
}

// --- Users ---
export const userApi = {
  getAll: () =>
    api.get('/api/users').then(r => r.data.data),

  getMe: () =>
    api.get('/api/users/me').then(r => r.data.data),
}
