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
  ja: {
    title: '\u30e9\u30a4\u30d6\u30ea\u30fc\u30c0\u30fc\u30dc\u30fc\u30c9',
    note: '\u30c7\u30fc\u30bf\u30d9\u30fc\u30b9\u306e\u4e0a\u4f4d\u30b9\u30b3\u30a2\u3002',
    loading: '\u30e9\u30a4\u30d6\u30b9\u30b3\u30a2\u3092\u8aad\u307f\u8fbc\u307f\u4e2d...',
    empty: '\u307e\u3060\u4fdd\u5b58\u3055\u308c\u305f\u30b9\u30b3\u30a2\u306f\u3042\u308a\u307e\u305b\u3093\u3002',
    error: '\u30e9\u30a4\u30d6\u30ea\u30fc\u30c0\u30fc\u30dc\u30fc\u30c9\u306f\u307e\u3060\u5229\u7528\u3067\u304d\u307e\u305b\u3093\u3002',
    points: 'pt',
    correct: '\u6b63\u89e3',
  },
};

let lastSuccessMessage = '';

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
      lastError = error?.message === 'Failed to fetch'
        ? 'API niet bereikbaar. Controleer of Vercel public access aan staat.'
        : (error?.message || 'API niet bereikbaar.');
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
  if (language.includes('jpn') || language.includes('ja')) return LEADERBOARD_COPY.ja;
  if (language.includes('nl')) return LEADERBOARD_COPY.nl;
  if (document.body.textContent.includes('Speel opnieuw')) return LEADERBOARD_COPY.nl;
  if (document.body.textContent.includes('\u3082\u3046\u4e00\u5ea6')) return LEADERBOARD_COPY.ja;
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

async function loadDatabaseLeaderboard(panel) {
  if (!panel || panel.dataset.databaseLoading === 'true') return;
  const copy = currentCopy();
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

function injectDatabaseLeaderboard() {
  const panel = document.querySelector('.final-card .leaderboard-panel');
  if (!panel || panel.dataset.databaseLeaderboard === 'ready') return;
  const copy = currentCopy();
  panel.dataset.databaseLeaderboard = 'ready';
  panel.innerHTML = `
    <h2>${copy.title}</h2>
    <p class="database-leaderboard-note">${copy.note}</p>
    <p class="database-leaderboard-status" role="status">${copy.loading}</p>
    <ol class="database-leaderboard-list"></ol>
  `;
  loadDatabaseLeaderboard(panel);
}

function refreshAfterSubmission() {
  const status = document.querySelector('.prize-entry-status[data-state="success"]');
  if (!status || status.textContent === lastSuccessMessage) return;
  lastSuccessMessage = status.textContent;
  window.setTimeout(() => loadDatabaseLeaderboard(document.querySelector('.final-card .leaderboard-panel')), 650);
}

function scan() {
  injectDatabaseLeaderboard();
  refreshAfterSubmission();
}

if (typeof window !== 'undefined') {
  window.requestAnimationFrame(scan);
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-state'] });
}
