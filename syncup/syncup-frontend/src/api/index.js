import axios from 'axios'
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

// --- Analytics (port 8081) ---
const analyticsApi = axios.create({
  baseURL: import.meta.env.VITE_ANALYTICS_URL || 'http://localhost:8081',
  headers: { 'Content-Type': 'application/json' },
});
analyticsApi.interceptors.request.use(config => {
  const token = localStorage.getItem('syncup_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const analyticsApiCalls = {
  getDepartmentStats: (date) =>
    analyticsApi.get('/api/analytics/department', { params: { date } }).then(r => r.data.data),

  getDepartmentRange: (from, to) =>
    analyticsApi.get('/api/analytics/department/range', { params: { from, to } }).then(r => r.data.data),

  getLocationStats: (date) =>
    analyticsApi.get('/api/analytics/location', { params: { date } }).then(r => r.data.data),

  getPeopleAtLocation: (locationId, date) =>
    analyticsApi.get(`/api/analytics/location/${locationId}/people`, { params: { date } }).then(r => r.data.data),

  getLocationTrend: (from, to) =>
    analyticsApi.get('/api/analytics/location/trend', { params: { from, to } }).then(r => r.data.data),

  getWeeklyTrends: (weeks = 4) =>
    analyticsApi.get('/api/analytics/trends', { params: { weeks } }).then(r => r.data.data),

  getOrgSummary: (date) =>
    analyticsApi.get('/api/analytics/summary', { params: { date } }).then(r => r.data.data),
};

// --- VibeCheck (port 8082) ---
const vibeApi = axios.create({
  baseURL: import.meta.env.VITE_VIBE_URL || 'http://localhost:8082',
  headers: { 'Content-Type': 'application/json' },
});

export const vibeApiCalls = {
  submitMood: (userId, data) =>
    vibeApi.post(`/api/vibe/mood?userId=${userId}`, data).then(r => r.data.data),

  getMyMoodToday: (userId) =>
    vibeApi.get(`/api/vibe/mood/me?userId=${userId}`).then(r => r.data.data),

  getMyHistory: (userId) =>
    vibeApi.get(`/api/vibe/mood/history?userId=${userId}`).then(r => r.data.data),

  getDashboard: () =>
    vibeApi.get('/api/vibe/dashboard').then(r => r.data.data),
};

// --- Admin API ---
export const adminApi = {
  getOverview: (date) =>
    api.get('/api/admin/overview', { params: { date } }).then(r => r.data.data),
  getEmployees: () =>
    api.get('/api/admin/employees').then(r => r.data.data),
  getLocations: () =>
    api.get('/api/admin/locations').then(r => r.data.data),
  addLocation: (data) =>
    api.post('/api/admin/locations', data).then(r => r.data.data),
  updateLocation: (id, data) =>
    api.put(`/api/admin/locations/${id}`, data).then(r => r.data.data),
  deleteLocation: (id) =>
    api.delete(`/api/admin/locations/${id}`),
};

// --- Vibe Analysis API (Admin only) ---
// Note: This now uses the vibecheck service for comments from mood_entries table
export const vibeAnalysisApi = {
  // Analyze comments with date range and optional department filter
  analyzeComments: (dateFrom, dateTo, department = null) =>
    vibeApi.post('/api/vibe/analyze-comments', { 
      dateFrom, 
      dateTo, 
      department,
      period: `from ${dateFrom} to ${dateTo}`
    }).then(r => r.data.data),

  // Legacy endpoint (kept for backward compatibility if needed)
  legacyAnalyzeComments: (comments) =>
    api.post('/api/admin/vibe/analyze-comments', { comments }).then(r => r.data.data),
};

// --- Ideas API ---
export const ideasApi = {
  getAll: () =>
    api.get('/api/ideas').then(r => r.data.data),
  submit: (data) =>
    api.post('/api/ideas', data).then(r => r.data.data),
  upvote: (id) =>
    api.post(`/api/ideas/${id}/upvote`).then(r => r.data.data),
  adminRespond: (id, data) =>
    api.patch(`/api/ideas/${id}/respond`, data).then(r => r.data.data),
  delete: (id) =>
    api.delete(`/api/ideas/${id}`),
};
