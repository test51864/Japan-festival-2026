const ADMIN_DELETE_DEFAULT_ORIGINS = [
  'https://japan-festival-2026-ardidelawi01-2135s-projects.vercel.app',
  'https://japan-festival-2026.vercel.app',
];

let adminPatchBusy = false;
let lastPatchedSignature = '';

function installAdminDeleteStyle() {
  if (document.getElementById('yanmar-admin-delete-style')) return;
  const style = document.createElement('style');
  style.id = 'yanmar-admin-delete-style';
  style.textContent = `
    .admin-delete-entry {
      min-height: 34px;
      border: 2px solid #101114;
      border-radius: 8px;
      background: #fff5f6;
      color: #d01822;
      cursor: pointer;
      font-size: 12px;
      font-weight: 1000;
      padding: 6px 10px;
      white-space: nowrap;
    }
    .admin-delete-entry:disabled {
      cursor: not-allowed;
      opacity: 0.58;
    }
  `;
  document.head.appendChild(style);
}

function getApiOrigins() {
  const configured = Array.isArray(window.YANMAR_SCORE_API_ORIGINS)
    ? window.YANMAR_SCORE_API_ORIGINS
    : [window.YANMAR_SCORE_API_ORIGIN].filter(Boolean);
  const sameOrigin = window.location.hostname.includes('raw.githack.com') ? [] : [''];
  return [...new Set([...sameOrigin, ...configured, ...ADMIN_DELETE_DEFAULT_ORIGINS].filter((origin) => origin !== undefined && origin !== null).map((origin) => String(origin).replace(/\/$/, '')))];
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
      lastError = error?.message || 'API niet bereikbaar.';
    }
  }
  throw new Error(lastError);
}

async function fetchAdminScores(pin) {
  const payload = await fetchJsonWithFallback(`/api/scores?pin=${encodeURIComponent(pin)}`);
  return payload.entries || [];
}

async function deleteAdminScore(pin, id) {
  return fetchJsonWithFallback('/api/delete-score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin, id }),
  });
}

function patchAdminTable(entries, pin) {
  const table = document.querySelector('.admin-table');
  if (!table) return;
  const headerRow = table.querySelector('thead tr');
  if (headerRow && !headerRow.querySelector('.admin-delete-header')) {
    const header = document.createElement('th');
    header.className = 'admin-delete-header';
    header.textContent = 'Actie';
    headerRow.appendChild(header);
  }

  const rows = Array.from(table.querySelectorAll('tbody tr'));
  rows.forEach((row, index) => {
    if (row.querySelector('.admin-delete-cell')) return;
    const entry = entries[index];
    const cell = document.createElement('td');
    cell.className = 'admin-delete-cell';

    if (!entry?.id) {
      cell.textContent = '-';
      row.appendChild(cell);
      return;
    }

    const button = document.createElement('button');
    button.className = 'admin-delete-entry';
    button.type = 'button';
    button.textContent = 'Verwijder';
    button.addEventListener('click', async () => {
      const name = entry.name || `#${index + 1}`;
      if (!window.confirm(`Inzending van ${name} verwijderen?`)) return;
      const status = document.querySelector('.admin-status');
      button.disabled = true;
      button.textContent = 'Verwijderen...';
      if (status) {
        status.textContent = 'Inzending verwijderen...';
        status.dataset.state = 'busy';
      }

      try {
        await deleteAdminScore(pin, entry.id);
        if (status) {
          status.textContent = 'Inzending verwijderd. Scores worden ververst...';
          status.dataset.state = 'success';
        }
        document.querySelector('.admin-refresh')?.click();
        lastPatchedSignature = '';
      } catch (error) {
        button.disabled = false;
        button.textContent = 'Verwijder';
        if (status) {
          status.textContent = `Verwijderen niet gelukt: ${error.message}`;
          status.dataset.state = 'error';
        }
      }
    });

    cell.appendChild(button);
    row.appendChild(cell);
  });
}

async function scanAdminDeleteControls() {
  installAdminDeleteStyle();
  const table = document.querySelector('.admin-table');
  const pinInput = document.querySelector('.admin-pin-input');
  if (!table || !pinInput || adminPatchBusy) return;

  const signature = `${pinInput.value}:${table.querySelectorAll('tbody tr').length}:${table.textContent.length}`;
  if (signature === lastPatchedSignature) return;
  adminPatchBusy = true;

  try {
    const pin = pinInput.value.trim();
    const entries = await fetchAdminScores(pin);
    patchAdminTable(entries, pin);
    lastPatchedSignature = signature;
  } catch {
    lastPatchedSignature = '';
  } finally {
    adminPatchBusy = false;
  }
}

if (typeof window !== 'undefined') {
  installAdminDeleteStyle();
  window.setInterval(scanAdminDeleteControls, 900);
}
