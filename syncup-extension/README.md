# SyncUp Browser Extension

A Chrome/Edge extension that lets employees set their daily work status and see their team's presence — directly from the browser toolbar.

---

## What It Does

- **One-click status** — set In Office / Remote / On Leave / Undecided without opening SyncUp
- **Live badge** — toolbar icon shows how many people are in the office today (green/amber/grey)
- **Team summary** — see all teammates' statuses at a glance in the popup
- **Auto-refresh** — badge updates every 5 minutes in the background
- **9am nudge** — notification if teammates haven't set their status yet

---

## Files

```
syncup-extension/
├── manifest.json     ← Extension config (permissions, icons, files)
├── popup.html        ← UI shown when clicking the toolbar icon
├── popup.js          ← Popup logic (login, status buttons, team list)
├── background.js     ← Service worker (badge updates, polling, notifications)
├── icons/
│   ├── icon16.png    ← 16×16 icon (you need to add these)
│   ├── icon48.png    ← 48×48 icon
│   └── icon128.png   ← 128×128 icon
└── README.md
```

---

## Setup Steps

### Step 1 — Make sure SyncUp backend is running

```bash
cd syncup-presence-service
mvn spring-boot:run
# Backend must be running at http://localhost:8080
```

### Step 2 — Add icons

Create an `icons/` folder inside `syncup-extension/` and add three PNG icons:
- `icon16.png` — 16×16 pixels
- `icon48.png` — 48×48 pixels
- `icon128.png` — 128×128 pixels

> **Quick option:** Use any blue square PNG and resize it to the 3 sizes.
> You can use a free tool like https://www.favicon.io or just copy any PNG and rename it.
> The extension will still load without icons but will show a broken image.

### Step 3 — Load the extension in Chrome

1. Open Chrome and go to: `chrome://extensions`
2. Turn on **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `syncup-extension/` folder
5. The SyncUp icon will appear in your toolbar

### Step 4 — Load in Edge (same steps)

1. Open Edge and go to: `edge://extensions`
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select the `syncup-extension/` folder

### Step 5 — Sign In

1. Click the SyncUp icon in the toolbar
2. Enter your credentials:
   - Email: `alice@syncup.com`
   - Password: `Password@123`
3. You'll see the status picker and team dashboard

---

## How the Badge Works

| Badge | Meaning |
|-------|---------|
| Green number (e.g. `4`) | 4+ people in office, ≥50% of team |
| Amber number (e.g. `2`) | Few people in office, <50% of team |
| Grey or blank | Nobody in office / not logged in |
| Red `!` | Cannot reach the backend API |

The badge tooltip (hover over icon) shows the full breakdown: "3 in office · 2 remote · 1 undecided"

---

## Updating the API URL

By default the extension points to `http://localhost:8080`.

To change it (e.g. for a deployed server), edit the top of both files:

**popup.js** — line 2:
```js
const API_BASE = 'http://localhost:8080';  // ← change this
```

**background.js** — line 2:
```js
const API_BASE = 'http://localhost:8080';  // ← change this
```

Also update `host_permissions` in `manifest.json`:
```json
"host_permissions": [
  "https://your-server.com/*"
]
```

After any code change, go to `chrome://extensions` and click the **↻ reload** button on the SyncUp card.

---

## Permissions Explained

| Permission | Why |
|-----------|-----|
| `storage` | Save JWT token and user data locally |
| `alarms` | Poll the API every 5 minutes for badge updates |
| `notifications` | Show 9am reminder if teammates haven't set status |
| `badges` | Show the number badge on the toolbar icon |
| `host_permissions` | Allow API calls to localhost:8080 |

---

## Publishing to Chrome Web Store (optional)

1. Zip the entire `syncup-extension/` folder
2. Go to https://chrome.google.com/webstore/devconsole
3. Pay the one-time $5 developer fee
4. Upload the zip and fill in the store listing
5. Submit for review (takes ~1 business day)

For internal company use, you can distribute the `.zip` directly — employees load it via "Load unpacked" with Developer Mode.
