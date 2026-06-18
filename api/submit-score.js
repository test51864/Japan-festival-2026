const TABLE_NAME = process.env.SUPABASE_SCORE_TABLE || 'yanmar_festival_scores';

function setCors(response) {
  response.setHeader('Access-Control-Allow-Origin', process.env.SCORE_ALLOWED_ORIGIN || '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function cleanText(value, max = 80) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
}

function cleanNumber(value, min = 0, max = 999999) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(min, Math.min(max, Math.round(number)));
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 20000) reject(new Error('Payload too large'));
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';
  if (!url || !key) {
    const error = new Error('Supabase env vars missing: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
    error.status = 500;
    throw error;
  }
  return { url, key };
}

async function insertScore(entry) {
  const { url, key } = supabaseConfig();
  const response = await fetch(`${url}/rest/v1/${TABLE_NAME}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify(entry),
  });

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(`Supabase insert failed: ${message}`);
    error.status = response.status;
    throw error;
  }

  const rows = await response.json();
  return rows[0] || entry;
}

module.exports = async function handler(request, response) {
  setCors(response);

  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const payload = JSON.parse(await readBody(request) || '{}');
    const email = cleanText(payload.email, 140).toLowerCase();
    if (!isEmail(email)) {
      response.status(400).json({ ok: false, error: 'Valid email is required' });
      return;
    }

    const correct = cleanNumber(payload.correct, 0, 50);
    const total = cleanNumber(payload.total, 0, 50);
    const points = cleanNumber(payload.points, 0, 10000);
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    const entry = {
      name: cleanText(payload.name, 60) || 'Player',
      email,
      has_email: true,
      points,
      correct,
      total,
      percentage,
      team: cleanText(payload.team, 50),
      language: cleanText(payload.language, 12),
      user_agent: cleanText(request.headers['user-agent'], 180),
    };

    const saved = await insertScore(entry);
    response.status(200).json({
      ok: true,
      entry: {
        id: saved.id,
        date: saved.created_at || new Date().toISOString(),
        name: saved.name,
        points: saved.points,
        correct: saved.correct,
        total: saved.total,
        percentage: saved.percentage,
        team: saved.team,
        language: saved.language,
      },
    });
  } catch (error) {
    response.status(error.status || 500).json({ ok: false, error: error.message || 'Unknown error' });
  }
};
