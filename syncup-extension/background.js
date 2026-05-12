// ─── Config ─────────────────────────────────────────────────────────────────
const API_BASE       = 'http://localhost:8080';
const POLL_INTERVAL  = 5;   // minutes — how often to refresh badge
const ALARM_NAME     = 'syncup-poll';

// ─── Storage helpers ─────────────────────────────────────────────────────────
const store = {
  get: (keys) => new Promise(res => chrome.storage.local.get(keys, res)),
  set: (data) => new Promise(res => chrome.storage.local.set(data, res)),
};

// ─── On install / startup ─────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  console.log('[SyncUp] Extension installed');
  scheduleAlarm();
  updateBadge();
});

chrome.runtime.onStartup.addListener(() => {
  scheduleAlarm();
  updateBadge();
});

// ─── Alarm — fires every POLL_INTERVAL minutes ────────────────────────────────
function scheduleAlarm() {
  chrome.alarms.get(ALARM_NAME, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: POLL_INTERVAL,
        periodInMinutes: POLL_INTERVAL,
      });
    }
  });
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    updateBadge();
  }
});

// ─── Message from popup — update immediately when status changes ──────────────
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'STATUS_UPDATED') {
    updateBadge();
  }
});

// ─── Core: fetch summary and update badge ─────────────────────────────────────
async function updateBadge() {
  try {
    const { token } = await store.get(['token']);

    if (!token) {
      // Not logged in — clear badge
      await chrome.action.setBadgeText({ text: '' });
      return;
    }

    const res = await fetch(`${API_BASE}/api/status/summary`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      if (res.status === 401) {
        // Token expired — clear badge and notify
        await chrome.action.setBadgeText({ text: '' });
        await showNotification('SyncUp', 'Your session has expired. Please sign in again.');
      }
      return;
    }

    const data = await res.json();
    const summary = data.data;

    if (!summary) return;

    const inOffice  = summary.inOffice  || 0;
    const undecided = summary.undecided || 0;
    const total     = summary.totalEmployees || 0;

    // Badge shows number of people IN the office today
    // Green when ≥ 50% are in, amber when < 50%, red when 0
    let badgeText  = inOffice > 0 ? String(inOffice) : '';
    let badgeColor = '#10B981'; // green

    if (inOffice === 0) {
      badgeColor = '#94A3B8'; // grey
    } else if (total > 0 && inOffice / total < 0.5) {
      badgeColor = '#F59E0B'; // amber — less than half in office
    }

    await chrome.action.setBadgeText({ text: badgeText });
    await chrome.action.setBadgeBackgroundColor({ color: badgeColor });
    await chrome.action.setTitle({
      title: `SyncUp — ${inOffice} in office · ${summary.remote} remote · ${undecided} undecided`
    });

    // Store last known summary for popup to read instantly
    await store.set({ lastSummary: summary, lastUpdated: Date.now() });

    // Notify if many people still undecided (gentle nudge at 9am)
    const hour = new Date().getHours();
    if (hour === 9 && undecided > 3) {
      await showNotification(
        '📋 SyncUp Reminder',
        `${undecided} teammates haven't set their status yet today.`
      );
    }

  } catch (err) {
    console.error('[SyncUp background] updateBadge error:', err);
    await chrome.action.setBadgeText({ text: '!' });
    await chrome.action.setBadgeBackgroundColor({ color: '#EF4444' });
  }
}

// ─── Notification helper ──────────────────────────────────────────────────────
async function showNotification(title, message) {
  chrome.notifications.create({
    type:    'basic',
    iconUrl: 'icons/icon48.png',
    title,
    message,
  });
}
