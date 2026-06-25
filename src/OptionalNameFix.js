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

function cleanText(value, max) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max || 80);
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
  const code = cleanText(active && active.textContent, 12).toUpperCase();
  return code === 'NL' ? 'NL' : 'EN';
}

function activeTeam() {
  const active = document.querySelector('.app-setup .team-card.active');
  if (!active) return '';

  const labelNode = active.querySelector('strong');
  const codeNode = active.querySelector('span');
  const label = cleanText(labelNode && labelNode.textContent, 50);
  const code = cleanText(codeNode && codeNode.textContent, 12).toUpperCase();

  if (label) return label;
  if (code === 'JPN') return 'Team Japan';
  if (code === 'NED') return 'Team Netherlands';
  return '';
}

function rawPlayerName() {
  const input = document.querySelector('.app-setup .name-input');
  return cleanText(input && input.value, 60);
}

function setupInfoFromScreen() {
  const stored = readCurrentPlayer();
  const rawName = rawPlayerName();
  const team = activeTeam() || cleanText(stored.team, 50);
  const language = activeLanguage() || cleanText(stored.language, 12) || 'NL';
  const publicName = rawName || team || 'Player';

  return {
    name: publicName,
    typedName: rawName,
    team,
    language,
    startedAt: stored.startedAt || new Date().toISOString(),
  };
}

function saveSetupAfterStart(event) {
  const target = event.target;
  const button = target && target.closest ? target.closest('button') : null;
  if (!button || !button.classList.contains('primary-cta') || !document.querySelector('.app-setup')) return;
  if (rawPlayerName().toLowerCase() === ADMIN_SECRET_NAME) return;

  window.setTimeout(() => writeCurrentPlayer(setupInfoFromScreen()), 0);
}

function applyOptionalNameCopy() {
  const input = document.querySelector('.app-setup .name-input');
  if (!input) return;

  const copy = SETUP_COPY[activeLanguage() === 'NL' ? 'nl' : 'en'];
  const group = input.closest ? input.closest('.setup-group') : null;
  const label = group ? group.querySelector('.group-label') : null;
  const intro = document.querySelector('.app-setup .intro-copy');

  if (label) label.textContent = copy.name;
  if (intro) intro.textContent = copy.intro;
  input.placeholder = copy.placeholder;
  input.required = false;
  input.removeAttribute('required');
}

function scan() {
  applyOptionalNameCopy();
}

if (typeof window !== 'undefined') {
  document.addEventListener('click', saveSetupAfterStart, false);
  window.requestAnimationFrame(scan);
  window.setInterval(scan, 300);
}
