const PRIZE_ENTRIES_KEY = 'yanmar-festival-cup-prize-entries';
const CURRENT_PLAYER_KEY = 'yanmar-festival-current-player';
const ADMIN_SECRET_NAME = 'yanmar-score-2026';

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value) || fallback;
  } catch {
    return fallback;
  }
}

function readEntries() {
  if (typeof window === 'undefined') return [];
  const entries = safeJsonParse(window.localStorage.getItem(PRIZE_ENTRIES_KEY), []);
  return Array.isArray(entries) ? entries : [];
}

function writeEntries(entries) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PRIZE_ENTRIES_KEY, JSON.stringify(entries));
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

function sortEntries(entries) {
  return [...entries].sort((a, b) => (
    Number(b.points || 0) - Number(a.points || 0)
    || Number(b.correct || 0) - Number(a.correct || 0)
    || Number(b.percentage || 0) - Number(a.percentage || 0)
    || String(a.date || '').localeCompare(String(b.date || ''))
  ));
}

function savePrizeEntry(email) {
  const result = parseFinalResult();
  const entry = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    email,
    ...result,
  };
  const entries = sortEntries([entry, ...readEntries()]);
  writeEntries(entries);
  return entry;
}

function injectPrizeForm() {
  const formsPanel = document.querySelector('.final-card .forms-panel');
  if (!formsPanel || formsPanel.dataset.prizeTracking === 'ready') return;

  formsPanel.dataset.prizeTracking = 'ready';
  const panel = document.createElement('div');
  panel.className = 'prize-entry-panel';
  panel.innerHTML = `
    <label class="prize-entry-label">
      <span>E-mail voor prijsvraag</span>
      <input class="prize-email-input" type="email" autocomplete="email" inputmode="email" placeholder="naam@example.com" />
    </label>
    <button class="secondary-cta prize-save-button" type="button">Sla score + e-mail op</button>
    <p class="prize-entry-status" role="status">Naam, e-mail, punten en percentage worden opgeslagen in het verborgen scoreoverzicht.</p>
  `;

  const formLink = formsPanel.querySelector('.form-link');
  formsPanel.insertBefore(panel, formLink || null);

  const input = panel.querySelector('.prize-email-input');
  const button = panel.querySelector('.prize-save-button');
  const status = panel.querySelector('.prize-entry-status');

  button.addEventListener('click', () => {
    const email = input.value.trim();
    if (!input.checkValidity() || !email) {
      status.textContent = 'Vul eerst een geldig e-mailadres in.';
      status.dataset.state = 'error';
      input.focus();
      return;
    }

    const entry = savePrizeEntry(email);
    status.textContent = `Opgeslagen: ${entry.points} punten, ${entry.correct}/${entry.total} goed (${entry.percentage}%).`;
    status.dataset.state = 'success';
    button.textContent = 'Opgeslagen';
  });
}

function renderAdminScreen() {
  const root = document.getElementById('root');
  if (!root) return;
  const entries = sortEntries(readEntries());
  const perfectCount = entries.filter((entry) => Number(entry.correct) === Number(entry.total) && Number(entry.total) > 0).length;
  const best = entries[0];

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
        <div class="admin-stats">
          <span><strong>${entries.length}</strong>inzendingen</span>
          <span><strong>${perfectCount}</strong>alles goed</span>
          <span><strong>${best ? Number(best.points || 0) : 0}</strong>hoogste score</span>
        </div>
        <div class="admin-actions">
          <button class="primary-cta admin-export" type="button">Export CSV</button>
          <button class="secondary-cta admin-clear" type="button">Wis lokaal overzicht</button>
        </div>
        <div class="admin-table-wrap">
          ${entries.length ? renderEntriesTable(entries) : '<p class="admin-empty">Nog geen prijsvraag-inzendingen op dit device.</p>'}
        </div>
        <p class="admin-note">Tip: kies eerst op meeste punten. Bij gelijke stand gebruik je goede antwoorden en percentage.</p>
      </section>
    </main>
  `;

  root.querySelector('.admin-back')?.addEventListener('click', () => window.location.reload());
  root.querySelector('.admin-export')?.addEventListener('click', () => downloadCsv(entries));
  root.querySelector('.admin-clear')?.addEventListener('click', () => {
    if (!window.confirm('Weet je zeker dat je het lokale scoreoverzicht wilt wissen?')) return;
    writeEntries([]);
    renderAdminScreen();
  });
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
      <td>${new Date(entry.date).toLocaleString()}</td>
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
