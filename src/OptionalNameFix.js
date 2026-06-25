const CURRENT_PLAYER_KEY = 'yanmar-festival-current-player';
const ADMIN_SECRET_NAME = 'yanmar-score-2026';

const SETUP_COPY = {
  en: {
    name: 'Player name (optional)',
    placeholder: 'Optional',
    intro: 'Choose your language, optionally enter your name, pick your team, and take penalty shots through the Japan Festival challenge.',
  },
  nl: {
    name: 'Naam (optioneel)',
    placeholder: 'Mag leeg blijven',
    intro: 'Kies je taal, vul eventueel je naam in, kies je team en neem penaltys in de Japan Festival challenge.',
  },
};

function cleanText(value, max = 80) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value) || fallback;
  } catch {
    return fallback;
  }
}

function readCurrentPlayer() {
  return safeJsonParse(window.sessionStorage.getItem(CURRENT_PLAYER_KEY), {});
}

function writeCurrentPlayer(setup) {
  window.sessionStorage.setItem(CURRENT_PLAYER_KEY, JSON.stringify(setup));
}

function activeLanguage() {
  const active = document.querySelector('.app-setup .language-flags button.active span:last-child');
  const code = cleanText(active?.textContent, 12).toUpperCase();
  if (code === 'NL') return 'NL';
  return 'EN';
}

function activeTeam() {
  const active = document.querySelector('.app-setup .team-card.active');
  const label = cleanText(active?.querySelector('strong')?.textContent, 50);
  const code = cleanText(active?.querySelector('span')?.textContent, 12).toUpperCase();
  if (label) return label;
  if (code === 'JPN') return 'Team Japan';
  if (code === 'NED') return 'Team Netherlands';
  return '';
}

function setupInfoFromScreen() {
  const stored = readCurrentPlayer();
  const rawName = cleanText(document.querySelector('.app-setup .name-input')?.value, 60);
  const team = activeTeam() || cleanText(stored.team, 50);
  const language = activeLanguage() || cleanText(stored.language, 12) || 'NL';
  const publicName = rawName || team || 'Player';

  return {
    ...stored,
    name: publicName,
    typedName: rawName,
    team,
    language,
    startedAt: stored.startedAt || new Date().toISOString(),
  };
}

function saveSetupAfterStart(event) {
  const button = event.target.closest?.('button');
  if (!button || !button.classList.contains('primary-cta') || !document.querySelector('.app-setup')) return;

  const rawName = cleanText(document.querySelector('.app-setup .name-input')?.value, 60);
  if (rawName.toLowerCase() === ADMIN_SECRET_NAME) return;

  window.setTimeout(() => writeCurrentPlayer(setupInfoFromScreen()), 0);
}

function languageKey() {
  return activeLanguage() === 'NL' ? 'nl' : 'en';
}

function applyOptionalNameCopy() {
  const input = document.querySelector('.app-setup .name-input');
  if (!input) return;

  const copy = SETUP_COPY[languageKey()];
  const label = input.closest('.setup-group')?.querySelector('.group-label');
  const intro = document.querySelector('.app-setup .intro-copy');

  if (label) label.textContent = copy.name;
  if (intro) intro.textContent = copy.intro;
  input.placeholder = copy.placeholder;
  input.required = false;
  input.removeAttribute('required');
}

function nameFallbackFromCurrentPlayer(payload = {}) {
  const stored = readCurrentPlayer();
  const team = cleanText(payload.team, 50) || cleanText(stored.team, 50);
  return cleanText(payload.name, 60) || cleanText(stored.typedName, 60) || cleanText(stored.name, 60) || team || 'Player';
}

function patchPayload(payload) {
  const stored = readCurrentPlayer();
  const team = cleanText(payload.team, 50) || cleanText(stored.team, 50);
  const language = cleanText(payload.language, 12) || cleanText(stored.language, 12);

  return {
    ...payload,
    name: nameFallbackFromCurrentPlayer({ ...payload, team }),
    team,
    language,
  };
}

function isSubmitUrl(value) {
  const url = String(value || '');
  return url.includes('/api/submit-score') || url.includes('/api/save-score');
}

function patchGetPayload(urlText) {
  const url = new URL(urlText, window.location.href);
  const encodedPayload = url.searchParams.get('payload');
  if (!encodedPayload) return url.toString();

  const payload = safeJsonParse(encodedPayload, null);
  if (!payload || typeof payload !== 'object') return url.toString();

  url.searchParams.set('payload', JSON.stringify(patchPayload(payload)));
  return url.toString();
}

function installFetchPatch() {
  if (window.__yanmarOptionalNameFetchPatch) return;
  window.__yanmarOptionalNameFetchPatch = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    if (!isSubmitUrl(url)) return originalFetch(input, init);

    if (init && typeof init.body === 'string') {
      const payload = safeJsonParse(init.body, null);
      if (payload && typeof payload === 'object') {
        return originalFetch(input, { ...init, body: JSON.stringify(patchPayload(payload)) });
      }
    }

    if (String(url || '').includes('payload=')) {
      return originalFetch(patchGetPayload(url), init);
    }

    return originalFetch(input, init);
  };
}

function scan() {
  applyOptionalNameCopy();
}

if (typeof window !== 'undefined') {
  installFetchPatch();
  document.addEventListener('click', saveSetupAfterStart, false);
  window.requestAnimationFrame(scan);
  window.setInterval(scan, 300);
}
