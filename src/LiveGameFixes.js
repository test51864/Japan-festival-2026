const CURRENT_PLAYER_KEY = 'yanmar-festival-current-player';
const ADMIN_SECRET_NAME = 'yanmar-score-2026';
const DEFAULT_API_ORIGINS = [
  'https://japan-festival-2026-ardidelawi01-2135s-projects.vercel.app',
  'https://japan-festival-2026.vercel.app',
];
const SUBMIT_PATHS = ['/api/submit-score', '/api/save-score'];

const PRIZE_COPY = {
  en: {
    title: 'Prize draw entry',
    text: 'Enter your e-mail/contact to save your score. The public leaderboard only shows name and score.',
    label: 'E-mail / contact',
    placeholder: 'name@example.com',
    saveButton: 'Save score',
    savingButton: 'Saving...',
    savedButton: 'Saved',
    retryButton: 'Try again',
    missingContact: 'Enter your e-mail/contact first.',
    savingStatus: 'Saving your score.',
    successStatus: ({ points, correct, total, percentage }) => `Saved: ${points} points, ${correct}/${total} correct (${percentage}%).`,
    errorPrefix: 'Not saved:',
    saveFailed: 'Saving failed.',
    apiUnavailable: 'The score server is not reachable yet. Please try again.',
  },
  nl: {
    title: 'Prijsvraag deelname',
    text: 'Vul je e-mail/contact in om je score op te slaan. De publieke leaderboard toont alleen naam en score.',
    label: 'E-mail / contact',
    placeholder: 'naam@example.com',
    saveButton: 'Sla score op',
    savingButton: 'Opslaan...',
    savedButton: 'Opgeslagen',
    retryButton: 'Probeer opnieuw',
    missingContact: 'Vul eerst je e-mail/contact in.',
    savingStatus: 'Score wordt opgeslagen.',
    successStatus: ({ points, correct, total, percentage }) => `Opgeslagen: ${points} punten, ${correct}/${total} goed (${percentage}%).`,
    errorPrefix: 'Niet opgeslagen:',
    saveFailed: 'Opslaan is niet gelukt.',
    apiUnavailable: 'API niet bereikbaar. Probeer het opnieuw.',
  },
};

const translatedPanels = new WeakSet();
let statusPoll = 0;

function installTwoLanguageStyle() {
  if (document.getElementById('yanmar-two-language-style')) return;
  const style = document.createElement('style');
  style.id = 'yanmar-two-language-style';
  style.textContent = `
    .language-flags { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
    .language-flags button[aria-label="Japanese"] { display: none !important; }
  `;
  document.head.appendChild(style);
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value) || fallback;
  } catch {
    return fallback;
  }
}

function currentLanguage() {
  const setup = safeJsonParse(window.sessionStorage.getItem(CURRENT_PLAYER_KEY), {});
  const stored = String(setup.language || '').toLowerCase();
  if (stored.includes('nl')) return 'nl';
  return 'en';
}

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function applyQuestionCopy() {
  const heading = document.querySelector('.question-copy h1');
  if (!heading) return;
  const current = heading.textContent.trim();
  if (current === 'Which logo truly fits Yanmar?') setText(heading, 'Which one is the Yanmar logo?');
  if (current === 'Welk logo past echt bij Yanmar?') setText(heading, 'Welk logo is van Yanmar?');
}

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

async function fetchJsonWithFallback(path, options = {}) {
  let lastError = 'API niet bereikbaar.';
  for (const origin of getApiOrigins()) {
    try {
      const response = await fetch(apiUrl(origin, path), options);
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload.ok !== false) return payload;
      lastError = payload.error || `API antwoordde met ${response.status}`;
      if (![401, 403, 404, 405].includes(response.status)) break;
    } catch (error) {
      lastError = error?.message === 'Failed to fetch'
        ? 'API niet bereikbaar. Controleer of Vercel public access aan staat.'
        : (error?.message || 'API niet bereikbaar.');
    }
  }
  throw new Error(lastError);
}

async function submitJsonWithFallback(paths, payload) {
  let lastError = 'Opslaan is niet gelukt.';
  for (const path of paths) {
    try {
      return await fetchJsonWithFallback(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      lastError = error.message;
    }
  }

  const encoded = encodeURIComponent(JSON.stringify(payload));
  for (const path of paths) {
    try {
      return await fetchJsonWithFallback(`${path}?payload=${encoded}`, { method: 'GET' });
    } catch (error) {
      lastError = error.message;
    }
  }

  throw new Error(lastError);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function csvEscape(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => (
    Number(b.points || 0) - Number(a.points || 0)
    || Number(b.correct || 0) - Number(a.correct || 0)
    || Number(b.percentage || 0) - Number(a.percentage || 0)
    || String(a.date || '').localeCompare(String(b.date || ''))
  ));
}

function getSetupInfo() {
  const nameInput = document.querySelector('.app-setup .name-input');
  const activeTeam = document.querySelector('.app-setup .team-card.active strong');
  const activeLanguage = document.querySelector('.app-setup .language-flags button.active span:last-child');
  const language = activeLanguage?.textContent?.trim() || 'NL';
  return {
    name: nameInput?.value?.trim() || '',
    team: activeTeam?.textContent?.trim() || '',
    language: language === 'JPN' ? 'EN' : language,
    startedAt: new Date().toISOString(),
  };
}

function saveCurrentPlayer(setup = getSetupInfo()) {
  window.sessionStorage.setItem(CURRENT_PLAYER_KEY, JSON.stringify(setup));
}

function readCurrentPlayer() {
  return safeJsonParse(window.sessionStorage.getItem(CURRENT_PLAYER_KEY), {});
}

function parseFinalResult() {
  const strongValues = Array.from(document.querySelectorAll('.final-card .score-summary strong')).map((node) => node.textContent.trim());
  const points = Number.parseInt(strongValues[0]?.replace(/[^0-9]/g, '') || '0', 10) || 0;
  const [correctRaw, totalRaw] = (strongValues[1] || '0/0').split('/');
  const correct = Number.parseInt(correctRaw, 10) || 0;
  const total = Number.parseInt(totalRaw, 10) || 0;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const setup = readCurrentPlayer();
  const heading = document.querySelector('.final-card h1')?.textContent?.trim() || '';
  const headingName = heading.includes(',') ? heading.split(',')[0].trim() : '';

  return {
    name: setup.name || headingName || 'Player',
    team: setup.team || '',
    language: setup.language || '',
    points,
    correct,
    total,
    percentage,
  };
}

function normalizeErrorMessage(message) {
  const trimmed = String(message || '').trim();
  const prefix = Object.values(PRIZE_COPY).map((copy) => copy.errorPrefix).find((value) => trimmed.startsWith(value));
  return (prefix ? trimmed.slice(prefix.length) : trimmed).trim();
}

function translateErrorMessage(message, copy) {
  const normalized = normalizeErrorMessage(message);
  if (!normalized) return copy.saveFailed;
  if (/API niet bereikbaar|Failed to fetch|public access|server is not reachable/i.test(normalized)) return copy.apiUnavailable;
  if (/Opslaan is niet gelukt|Saving failed/i.test(normalized)) return copy.saveFailed;
  return normalized;
}

async function submitPrizeEntry(contact) {
  const result = parseFinalResult();
  const payload = await submitJsonWithFallback(SUBMIT_PATHS, { email: contact, contact, ...result });
  return payload.entry;
}

async function fetchAdminScores(pin) {
  const payload = await fetchJsonWithFallback(`/api/scores?pin=${encodeURIComponent(pin)}`);
  return sortEntries(payload.entries || []);
}

function applyPrizeLanguage() {
  const formsPanel = document.querySelector('.final-card .forms-panel');
  if (!formsPanel) return;

  const copy = PRIZE_COPY[currentLanguage()];
  const title = formsPanel.querySelector('h2');
  const text = formsPanel.querySelector('p:not(.prize-entry-status)');
  const label = formsPanel.querySelector('.prize-entry-label span');
  const input = formsPanel.querySelector('.prize-email-input');
  const button = formsPanel.querySelector('.prize-save-button');
  const status = formsPanel.querySelector('.prize-entry-status');

  setText(title, copy.title);
  setText(text, copy.text);
  setText(label, copy.label);
  if (input && input.placeholder !== copy.placeholder) input.placeholder = copy.placeholder;

  const state = status?.dataset.state || '';
  if (state === 'busy') {
    setText(button, copy.savingButton);
    setText(status, copy.savingStatus);
    return;
  }
  if (state === 'success') {
    setText(button, copy.savedButton);
    setText(status, copy.successStatus(parseFinalResult()));
    return;
  }
  if (state === 'error') {
    const missingContact = !input?.value?.trim() || Object.values(PRIZE_COPY).some((item) => status.textContent.includes(item.missingContact));
    setText(button, missingContact ? copy.saveButton : copy.retryButton);
    setText(status, missingContact ? copy.missingContact : `${copy.errorPrefix} ${translateErrorMessage(status.textContent, copy)}`);
    return;
  }

  setText(button, copy.saveButton);
}

function buildPrizeEntryPanel() {
  const panel = document.createElement('div');
  panel.className = 'prize-entry-panel';
  panel.innerHTML = `
    <label class="prize-entry-label">
      <span></span>
      <input class="prize-email-input" type="text" autocomplete="email" inputmode="email" />
    </label>
    <button class="secondary-cta prize-save-button" type="button"></button>
    <p class="prize-entry-status" role="status"></p>
  `;

  const input = panel.querySelector('.prize-email-input');
  const button = panel.querySelector('.prize-save-button');
  const status = panel.querySelector('.prize-entry-status');

  button.addEventListener('click', async () => {
    const copy = PRIZE_COPY[currentLanguage()];
    const contact = input.value.trim();
    if (!contact) {
      status.textContent = copy.missingContact;
      status.dataset.state = 'error';
      applyPrizeLanguage();
      input.focus();
      return;
    }

    button.disabled = true;
    button.textContent = copy.savingButton;
    status.textContent = copy.savingStatus;
    status.dataset.state = 'busy';

    try {
      const entry = await submitPrizeEntry(contact);
      status.textContent = copy.successStatus(entry);
      status.dataset.state = 'success';
      button.textContent = copy.savedButton;
    } catch (error) {
      status.textContent = `${copy.errorPrefix} ${translateErrorMessage(error.message, copy)}`;
      status.dataset.state = 'error';
      button.disabled = false;
      button.textContent = copy.retryButton;
    }
    applyPrizeLanguage();
  });

  return panel;
}

function injectPrizeForm() {
  const formsPanel = document.querySelector('.final-card .forms-panel');
  if (!formsPanel) return;

  const formLink = formsPanel.querySelector('.form-link');
  if (formLink) formLink.remove();

  if (!formsPanel.querySelector('.prize-entry-panel')) {
    formsPanel.appendChild(buildPrizeEntryPanel());
  }

  applyPrizeLanguage();
}

function translateAfterFinalSettles(panel) {
  if (translatedPanels.has(panel)) return;
  translatedPanels.add(panel);
  window.setTimeout(injectPrizeForm, 900);
  window.setTimeout(injectPrizeForm, 1600);
}

function scanForPrizePanel() {
  installTwoLanguageStyle();
  applyQuestionCopy();
  const panel = document.querySelector('.final-card .forms-panel');
  if (panel) translateAfterFinalSettles(panel);
}

function startStatusPolling() {
  window.clearInterval(statusPoll);
  const stopAt = Date.now() + 15000;
  statusPoll = window.setInterval(() => {
    applyPrizeLanguage();
    if (Date.now() > stopAt || !document.querySelector('.final-card .forms-panel')) {
      window.clearInterval(statusPoll);
      statusPoll = 0;
    }
  }, 350);
}

function renderAdminScreen(pin = ADMIN_SECRET_NAME) {
  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = `
    <main class="app app-admin">
      <section class="admin-card">
        <div class="admin-topline">
          <div>
            <p class="eyebrow">Yanmar Festival Cup</p>
            <h1>Prize Scoreboard</h1>
          </div>
          <button class="secondary-cta admin-back" type="button">Terug</button>
        </div>
        <div class="admin-pin-row">
          <label class="prize-entry-label">
            <span>Admin pin</span>
            <input class="prize-email-input admin-pin-input" type="password" value="${escapeHtml(pin)}" />
          </label>
          <button class="primary-cta admin-refresh" type="button">Laad scores</button>
        </div>
        <div class="admin-status">Scores laden...</div>
        <div class="admin-content"></div>
      </section>
    </main>
  `;

  const pinInput = root.querySelector('.admin-pin-input');
  const content = root.querySelector('.admin-content');
  const status = root.querySelector('.admin-status');

  root.querySelector('.admin-back')?.addEventListener('click', () => window.location.reload());
  root.querySelector('.admin-refresh')?.addEventListener('click', () => loadAdminScores(pinInput.value.trim()));

  async function loadAdminScores(nextPin) {
    status.textContent = 'Scores laden...';
    status.dataset.state = 'busy';
    content.innerHTML = '';

    try {
      const entries = await fetchAdminScores(nextPin);
      const perfectCount = entries.filter((entry) => Number(entry.correct) === Number(entry.total) && Number(entry.total) > 0).length;
      const best = entries[0];
      status.textContent = entries.length ? 'Centrale scores geladen.' : 'Nog geen centrale inzendingen.';
      status.dataset.state = 'success';
      content.innerHTML = `
        <div class="admin-stats">
          <span><strong>${entries.length}</strong>inzendingen</span>
          <span><strong>${perfectCount}</strong>alles goed</span>
          <span><strong>${best ? Number(best.points || 0) : 0}</strong>hoogste score</span>
        </div>
        <div class="admin-actions">
          <button class="primary-cta admin-export" type="button">Export CSV</button>
          <button class="secondary-cta admin-issue-link" type="button">Ververs scores</button>
        </div>
        <div class="admin-table-wrap">
          ${entries.length ? renderEntriesTable(entries) : '<p class="admin-empty">Nog geen prijsvraag-inzendingen.</p>'}
        </div>
        <p class="admin-note">Winnaar kiezen: sorteer op meeste punten. Bij gelijke stand: meeste goede antwoorden en hoogste percentage.</p>
      `;
      content.querySelector('.admin-export')?.addEventListener('click', () => downloadCsv(entries));
      content.querySelector('.admin-issue-link')?.addEventListener('click', () => loadAdminScores(pinInput.value.trim()));
    } catch (error) {
      status.textContent = `Niet gelukt: ${error.message}`;
      status.dataset.state = 'error';
    }
  }

  loadAdminScores(pin);
}

function renderEntriesTable(entries) {
  const rows = entries.map((entry, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${escapeHtml(entry.name)}</td>
      <td>${escapeHtml(entry.email)}</td>
      <td>${Number(entry.points || 0)}</td>
      <td>${Number(entry.correct || 0)}/${Number(entry.total || 0)}</td>
      <td>${Number(entry.percentage || 0)}%</td>
      <td>${escapeHtml(entry.team)}</td>
      <td>${entry.date ? new Date(entry.date).toLocaleString() : ''}</td>
    </tr>
  `).join('');

  return `
    <table class="admin-table">
      <thead>
        <tr><th>#</th><th>Naam</th><th>E-mail/contact</th><th>Punten</th><th>Goed</th><th>%</th><th>Team</th><th>Tijd</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function downloadCsv(entries) {
  const header = ['rank', 'name', 'email_or_contact', 'points', 'correct', 'total', 'percentage', 'team', 'language', 'date'];
  const lines = [header.join(',')];
  entries.forEach((entry, index) => {
    lines.push([
      index + 1,
      entry.name,
      entry.email,
      entry.points,
      entry.correct,
      entry.total,
      entry.percentage,
      entry.team,
      entry.language,
      entry.date,
    ].map(csvEscape).join(','));
  });

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `yanmar-festival-cup-scores-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function handleSetupClick(event) {
  const button = event.target.closest?.('button');
  if (!button || !document.querySelector('.app-setup') || !button.classList.contains('primary-cta')) return;

  const setup = getSetupInfo();
  if (setup.name.toLowerCase() === ADMIN_SECRET_NAME) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
    renderAdminScreen();
    return;
  }

  saveCurrentPlayer(setup);
}

if (typeof window !== 'undefined') {
  installTwoLanguageStyle();
  document.addEventListener('click', handleSetupClick, true);
  document.addEventListener('click', (event) => {
    if (event.target.closest?.('.prize-save-button')) {
      window.setTimeout(startStatusPolling, 80);
    }
  }, true);
  window.requestAnimationFrame(scanForPrizePanel);
  window.setInterval(scanForPrizePanel, 300);
}
