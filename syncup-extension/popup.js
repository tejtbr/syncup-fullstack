// ─── Config ────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:8080';

const STATUS_LABELS = {
  IN_OFFICE: 'In Office',
  REMOTE:    'Remote',
  ON_LEAVE:  'On Leave',
  UNDECIDED: 'Undecided',
  NOT_SET:   'Not Set',
};

// ─── Storage helpers ────────────────────────────────────────────────────────
const store = {
  get: (keys) => new Promise(res => chrome.storage.local.get(keys, res)),
  set: (data) => new Promise(res => chrome.storage.local.set(data, res)),
  remove: (keys) => new Promise(res => chrome.storage.local.remove(keys, res)),
};

// ─── API helpers ────────────────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const { token } = await store.get(['token']);
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ─── DOM refs ───────────────────────────────────────────────────────────────
const loginView  = document.getElementById('login-view');
const mainView   = document.getElementById('main-view');
const loginBtn   = document.getElementById('login-btn');
const logoutBtn  = document.getElementById('logout-btn');
const loginError = document.getElementById('login-error');
const emailInput = document.getElementById('email-input');
const passInput  = document.getElementById('password-input');
const userDisp   = document.getElementById('user-display');
const dateBar    = document.getElementById('date-bar');
const locationWrap  = document.getElementById('location-wrap');
const locationSelect = document.getElementById('location-select');
const noteInput  = document.getElementById('note-input');
const savingBar  = document.getElementById('saving-bar');
const summaryEl  = document.getElementById('summary-pills');
const memberList = document.getElementById('member-list');
const refreshBtn = document.getElementById('refresh-btn');
const lastSync   = document.getElementById('last-sync');

// ─── View switcher ──────────────────────────────────────────────────────────
function showView(name) {
  loginView.classList.toggle('active', name === 'login');
  mainView.classList.toggle('active',  name === 'main');
}

// ─── Date display ───────────────────────────────────────────────────────────
function setDateBar() {
  const now = new Date();
  dateBar.textContent = now.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ─── Login ──────────────────────────────────────────────────────────────────
loginBtn.addEventListener('click', async () => {
  const email    = emailInput.value.trim();
  const password = passInput.value;
  if (!email || !password) { loginError.textContent = 'Please fill in both fields.'; return; }

  loginBtn.disabled    = true;
  loginBtn.textContent = 'Signing in…';
  loginError.textContent = '';

  try {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const { token, user } = res.data;
    await store.set({ token, user });
    await initMain(user);
  } catch (err) {
    loginError.textContent = err.message || 'Login failed. Check credentials.';
  } finally {
    loginBtn.disabled    = false;
    loginBtn.textContent = 'Sign In';
  }
});

// Allow Enter key to submit login
passInput.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });
emailInput.addEventListener('keydown', e => { if (e.key === 'Enter') passInput.focus(); });

// ─── Logout ─────────────────────────────────────────────────────────────────
logoutBtn.addEventListener('click', async () => {
  await store.remove(['token', 'user', 'myTeamId']);
  showView('login');
  emailInput.value = '';
  passInput.value  = '';
});

// ─── Init main view ─────────────────────────────────────────────────────────
async function initMain(user) {
  showView('main');
  setDateBar();
  userDisp.textContent = user.fullName?.split(' ')[0] || user.email;

  await Promise.all([
    loadMyStatus(),
    loadLocations(),
    loadTeamData(),
  ]);
}

// ─── Load my status for today ───────────────────────────────────────────────
async function loadMyStatus() {
  try {
    const res = await apiFetch('/api/status/me');
    const status = res.data;
    if (status) {
      setActiveButton(status.status);
      noteInput.value = status.note || '';
      if (status.status === 'IN_OFFICE' && status.officeLocation) {
        locationWrap.style.display = 'block';
        locationSelect.value = status.officeLocation.id || '';
      }
    }
  } catch { /* not set yet — that's fine */ }
}

// ─── Load office locations ──────────────────────────────────────────────────
async function loadLocations() {
  try {
    const res = await apiFetch('/api/status/locations');
    const locs = res.data || [];
    locationSelect.innerHTML = '<option value="">Select office location…</option>';
    locs.forEach(loc => {
      const opt = document.createElement('option');
      opt.value = loc.id;
      opt.textContent = loc.name;
      locationSelect.appendChild(opt);
    });
  } catch { /* ignore */ }
}

// ─── Status buttons ─────────────────────────────────────────────────────────
function setActiveButton(statusValue) {
  document.querySelectorAll('.status-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.status === statusValue) btn.classList.add('active');
  });
  locationWrap.style.display = statusValue === 'IN_OFFICE' ? 'block' : 'none';
}

let saveTimer = null;
document.querySelectorAll('.status-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setActiveButton(btn.dataset.status);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveStatus(btn.dataset.status), 300);
  });
});

noteInput.addEventListener('blur', async () => {
  const active = document.querySelector('.status-btn.active');
  if (active) await saveStatus(active.dataset.status);
});

locationSelect.addEventListener('change', async () => {
  const active = document.querySelector('.status-btn.active');
  if (active) await saveStatus(active.dataset.status);
});

async function saveStatus(status) {
  savingBar.style.display = 'block';
  try {
    const payload = {
      status,
      note: noteInput.value.trim() || null,
      officeLocationId: (status === 'IN_OFFICE' && locationSelect.value) ? locationSelect.value : null,
    };
    await apiFetch('/api/status/me', { method: 'POST', body: JSON.stringify(payload) });
    // Notify background to refresh badge
    chrome.runtime.sendMessage({ type: 'STATUS_UPDATED' });
  } catch (err) {
    console.error('Save failed', err);
  } finally {
    savingBar.style.display = 'none';
  }
}

// ─── Team data ──────────────────────────────────────────────────────────────
async function loadTeamData() {
  refreshBtn.classList.add('spinning');
  try {
    // First try to get org summary
    await loadOrgSummary();

    // Then load first team the user belongs to
    const { myTeamId } = await store.get(['myTeamId']);
    if (myTeamId) {
      await loadTeamMembers(myTeamId);
    } else {
      const teamsRes = await apiFetch('/api/teams/my');
      const teams = teamsRes.data || [];
      if (teams.length > 0) {
        await store.set({ myTeamId: teams[0].id });
        await loadTeamMembers(teams[0].id);
      } else {
        memberList.innerHTML = '<div class="no-team-msg">You have no teams yet.<br>Create one in SyncUp.</div>';
      }
    }
    lastSync.textContent = 'Updated ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    console.error('Team load failed', err);
    memberList.innerHTML = '<div class="no-team-msg">Could not load team data.</div>';
  } finally {
    refreshBtn.classList.remove('spinning');
  }
}

async function loadOrgSummary() {
  const res = await apiFetch('/api/status/summary');
  const s   = res.data;
  summaryEl.innerHTML = `
    <div class="pill in"><span class="dot"></span>${s.inOffice} In Office</div>
    <div class="pill rem"><span class="dot"></span>${s.remote} Remote</div>
    <div class="pill lea"><span class="dot"></span>${s.onLeave} On Leave</div>
    <div class="pill und"><span class="dot"></span>${s.undecided} Undecided</div>
  `;
}

async function loadTeamMembers(teamId) {
  const res     = await apiFetch(`/api/status/team/${teamId}`);
  const members = res.data || [];

  if (members.length === 0) {
    memberList.innerHTML = '<div class="no-team-msg">No members in this team.</div>';
    return;
  }

  memberList.innerHTML = members.map(m => {
    const status  = m.status || 'NOT_SET';
    const initials = m.user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const avatarColors = ['#2563EB','#7C3AED','#0891B2','#059669','#D97706'];
    const color = avatarColors[m.user.fullName.charCodeAt(0) % avatarColors.length];
    return `
      <div class="member-row">
        <div class="avatar" style="background:${color}">${initials}</div>
        <div class="member-info">
          <div class="member-name">${escHtml(m.user.fullName)}</div>
          <div class="member-dept">${escHtml(m.user.department || '—')}</div>
        </div>
        <span class="status-badge badge-${status}">${STATUS_LABELS[status] || status}</span>
      </div>
    `;
  }).join('');
}

refreshBtn.addEventListener('click', loadTeamData);

// ─── Escape HTML ─────────────────────────────────────────────────────────────
function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── Boot ────────────────────────────────────────────────────────────────────
async function boot() {
  const { token, user } = await store.get(['token', 'user']);
  if (token && user) {
    await initMain(user);
  } else {
    showView('login');
  }
}

boot();
