const CURRENT_PLAYER_KEY = 'yanmar-festival-current-player';
const ADMIN_SECRET_NAME = 'yanmar-score-2026';
const DEFAULT_API_ORIGIN = 'https://japan-festival-2026.vercel.app';

function getApiOrigin() {
  if (window.YANMAR_SCORE_API_ORIGIN) return window.YANMAR_SCORE_API_ORIGIN.replace(/\/$/, '');
  if (window.location.hostname.includes('raw.githack.com')) return DEFAULT_API_ORIGIN;
  return '';
}

function apiUrl(path) {
  return `${getApiOrigin()}${path}`;
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
  return {
    name: nameInput?.value?.trim() || '',
    team: activeTeam?.textContent?.trim() || '',
    language: activeLanguage?.textContent?.trim() || '',
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

async function submitPrizeEntry(email) {
  const result = parseFinalResult();
  const response = await fetch(apiUrl('/api/submit-score'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, ...result }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) throw new Error(payload.error || 'Score opslaan is mislukt');
  return payload.entry;
}

async function fetchAdminScores(pin) {
  const response = await fetch(apiUrl(`/api/scores?pin=${encodeURIComponent(pin)}`));
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) throw new Error(payload.error || 'Scores ophalen is mislukt');
  return sortEntries(payload.entries || []);
}

function injectPrizeForm() {
  const formsPanel = document.querySelector('.final-card .forms-panel');
  if (!formsPanel || formsPanel.dataset.prizeTracking === 'ready') return;

  formsPanel.dataset.prizeTracking = 'ready';
  const title = formsPanel.querySelector('h2');
  const text = formsPanel.querySelector('p');
  const formLink = formsPanel.querySelector('.form-link');
  if (title) title.textContent = 'Prijsvraag deelname';
  if (text) text.textContent = 'Laat je e-mail achter om mee te doen. We slaan je score centraal op, zodat de prijs eerlijk naar de beste inzending kan gaan.';
  if (formLink) formLink.remove();

  const panel = document.createElement('div');
  panel.className = 'prize-entry-panel';
  panel.innerHTML = `
    <label class="prize-entry-label">
      <span>E-mail voor prijsvraag</span>
      <input class="prize-email-input" type="email" autocomplete="email" inputmode="email" placeholder="naam@example.com" />
    </label>
    <button class="secondary-cta prize-save-button" type="button">Sla score + e-mail op</button>
    <p class="prize-entry-status" role="status">Naam, e-mail, punten, goede antwoorden en percentage worden centraal opgeslagen.</p>
  `;

  formsPanel.appendChild(panel);

  const input = panel.querySelector('.prize-email-input');
  const button = panel.querySelector('.prize-save-button');
  const status = panel.querySelector('.prize-entry-status');

  button.addEventListener('click', async () => {
    const email = input.value.trim();
    if (!input.checkValidity() || !email) {
      status.textContent = 'Vul eerst een geldig e-mailadres in.';
      status.dataset.state = 'error';
      input.focus();
      return;
    }

    button.disabled = true;
    button.textContent = 'Opslaan...';
    status.textContent = 'Score wordt centraal opgeslagen.';
    status.dataset.state = 'busy';

    try {
      const entry = await submitPrizeEntry(email);
      status.textContent = `Opgeslagen: ${entry.points} punten, ${entry.correct}/${entry.total} goed (${entry.percentage}%).`;
      status.dataset.state = 'success';
      button.textContent = 'Opgeslagen';
    } catch (error) {
      status.textContent = `Niet opgeslagen: ${error.message}`;
      status.dataset.state = 'error';
      button.disabled = false;
      button.textContent = 'Probeer opnieuw';
    }
  });
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
          <a class="secondary-cta admin-issue-link" href="https://github.com/test51864/Japan-festival-2026/issues/1" target="_blank" rel="noreferrer">Open GitHub opslag</a>
        </div>
        <div class="admin-table-wrap">
          ${entries.length ? renderEntriesTable(entries) : '<p class="admin-empty">Nog geen prijsvraag-inzendingen.</p>'}
        </div>
        <p class="admin-note">Winnaar kiezen: sorteer op meeste punten. Bij gelijke stand: meeste goede antwoorden en hoogste percentage.</p>
      `;
      content.querySelector('.admin-export')?.addEventListener('click', () => downloadCsv(entries));
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
        <tr><th>#</th><th>Naam</th><th>E-mail</th><th>Punten</th><th>Goed</th><th>%</th><th>Team</th><th>Tijd</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function downloadCsv(entries) {
  const header = ['rank', 'name', 'email', 'points', 'correct', 'total', 'percentage', 'team', 'language', 'date'];
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

function scan() {
  injectPrizeForm();
}

if (typeof window !== 'undefined') {
  document.addEventListener('click', handleSetupClick, true);
  window.requestAnimationFrame(scan);
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
}
