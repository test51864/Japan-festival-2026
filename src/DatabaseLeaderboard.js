const CURRENT_PLAYER_KEY = 'yanmar-festival-current-player';
const DEFAULT_API_ORIGINS = [
  'https://japan-festival-2026-ardidelawi01-2135s-projects.vercel.app',
  'https://japan-festival-2026.vercel.app',
];

const LEADERBOARD_COPY = {
  en: {
    title: 'Live leaderboard',
    note: 'Top saved scores from the database.',
    loading: 'Loading live scores...',
    empty: 'No saved scores yet.',
    error: 'Live leaderboard is not available yet.',
    points: 'pts',
    correct: 'correct',
  },
  nl: {
    title: 'Live leaderboard',
    note: 'Top scores uit de database.',
    loading: 'Live scores laden...',
    empty: 'Nog geen opgeslagen scores.',
    error: 'Live leaderboard is nog niet beschikbaar.',
    points: 'pt',
    correct: 'goed',
  },
};

const settledPanels = new WeakSet();
let lastSuccessMessage = '';
let reloadTimer = 0;

function getApiOrigins() {
  const configured = Array.isArray(window.YANMAR_SCORE_API_ORIGINS)
    ? window.YANMAR_SCORE_API_ORIGINS
    : [window.YANMAR_SCORE_API_ORIGIN].filter(Boolean);
  const sameOrigin = window.location.hostname.includes('raw.githack.com') ? [] : [''];
  return [...new Set([...sameOrigin, ...configured, ...DEFAULT_API_ORIGINS].filter((origin) => origin !== undefined && origin !== null).map((origin) => String(origin).replace(/\/$/, '')))];
}

function apiUrl(origin, path) {
  return `${origin}${path}`;
}

async function fetchJsonWithFallback(path) {
  let lastError = 'API niet bereikbaar.';
  for (const origin of getApiOrigins()) {
    try {
      const response = await fetch(apiUrl(origin, path));
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload.ok !== false) return payload;
      lastError = payload.error || `API antwoordde met ${response.status}`;
      if (![401, 403, 404].includes(response.status)) break;
    } catch (error) {
      lastError = error?.message || 'API niet bereikbaar.';
    }
  }
  throw new Error(lastError);
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value) || fallback;
  } catch {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function currentCopy() {
  const setup = safeJsonParse(window.sessionStorage.getItem(CURRENT_PLAYER_KEY), {});
  const language = String(setup.language || '').toLowerCase();
  if (language.includes('nl') || document.body.textContent.includes('Speel opnieuw')) return LEADERBOARD_COPY.nl;
  return LEADERBOARD_COPY.en;
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => (
    Number(b.points || 0) - Number(a.points || 0)
    || Number(b.correct || 0) - Number(a.correct || 0)
    || Number(b.percentage || 0) - Number(a.percentage || 0)
    || String(a.date || '').localeCompare(String(b.date || ''))
  ));
}

async function fetchPublicScores() {
  const payload = await fetchJsonWithFallback('/api/public-scores');
  return sortEntries(payload.entries || []);
}

function renderRows(entries, copy) {
  return entries.slice(0, 10).map((entry, index) => `
    <li class="database-leaderboard-row">
      <span class="database-rank">#${index + 1}</span>
      <strong>${escapeHtml(entry.name || 'Player')}</strong>
      <em>${Number(entry.points || 0)} ${copy.points}</em>
      <small>${Number(entry.correct || 0)}/${Number(entry.total || 0)} ${copy.correct}</small>
    </li>
  `).join('');
}

function renderLeaderboardShell(panel, copy) {
  if (panel.dataset.databaseLeaderboard === 'ready') return;
  panel.dataset.databaseLeaderboard = 'ready';
  panel.innerHTML = `
    <h2>${copy.title}</h2>
    <p class="database-leaderboard-note">${copy.note}</p>
    <p class="database-leaderboard-status" role="status">${copy.loading}</p>
    <ol class="database-leaderboard-list"></ol>
  `;
}

async function loadDatabaseLeaderboard(panel) {
  if (!panel || panel.dataset.databaseLoading === 'true') return;
  const copy = currentCopy();
  renderLeaderboardShell(panel, copy);
  const status = panel.querySelector('.database-leaderboard-status');
  const list = panel.querySelector('.database-leaderboard-list');
  panel.dataset.databaseLoading = 'true';
  if (status) {
    status.textContent = copy.loading;
    status.dataset.state = 'busy';
  }

  try {
    const entries = await fetchPublicScores();
    if (status) {
      status.textContent = entries.length ? '' : copy.empty;
      status.dataset.state = entries.length ? 'success' : 'empty';
    }
    if (list) list.innerHTML = entries.length ? renderRows(entries, copy) : '';
  } catch {
    if (status) {
      status.textContent = copy.error;
      status.dataset.state = 'error';
    }
    if (list) list.innerHTML = '';
  } finally {
    panel.dataset.databaseLoading = 'false';
  }
}

function scheduleLeaderboard(panel) {
  if (!panel || settledPanels.has(panel)) return;
  settledPanels.add(panel);
  window.setTimeout(() => loadDatabaseLeaderboard(panel), 900);
  window.setTimeout(() => loadDatabaseLeaderboard(panel), 1800);
}

function refreshAfterSubmission() {
  const status = document.querySelector('.prize-entry-status[data-state="success"]');
  if (!status || status.textContent === lastSuccessMessage) return;
  lastSuccessMessage = status.textContent;
  window.clearTimeout(reloadTimer);
  reloadTimer = window.setTimeout(() => {
    const panel = document.querySelector('.final-card .leaderboard-panel');
    if (panel) loadDatabaseLeaderboard(panel);
  }, 700);
}

function scan() {
  const panel = document.querySelector('.final-card .leaderboard-panel');
  if (panel) scheduleLeaderboard(panel);
  refreshAfterSubmission();
}

if (typeof window !== 'undefined') {
  window.requestAnimationFrame(scan);
  window.setInterval(scan, 350);
}
