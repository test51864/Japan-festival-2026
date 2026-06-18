const TABLE_NAME = process.env.SUPABASE_SCORE_TABLE || 'yanmar_festival_scores';
const ADMIN_RPC_NAME = process.env.SUPABASE_ADMIN_SCORE_RPC || 'yanmar_festival_admin_scores';

function setCors(response) {
  response.setHeader('Access-Control-Allow-Origin', process.env.SCORE_ALLOWED_ORIGIN || '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => (
    Number(b.points || 0) - Number(a.points || 0)
    || Number(b.correct || 0) - Number(a.correct || 0)
    || Number(b.percentage || 0) - Number(a.percentage || 0)
    || String(a.date || '').localeCompare(String(b.date || ''))
  ));
}

function supabaseConfig() {
  const url = (process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';
  const key = serviceKey || anonKey;
  if (!url || !key) {
    const error = new Error('Supabase env vars missing: set SUPABASE_URL and SUPABASE_ANON_KEY');
    error.status = 500;
    throw error;
  }
  return { url, key, hasServiceRole: Boolean(serviceKey) };
}

function mapScore(row) {
  return {
    id: row.id,
    date: row.created_at,
    name: row.name,
    email: row.email,
    hasEmail: row.has_email,
    points: row.points,
    correct: row.correct,
    total: row.total,
    percentage: row.percentage,
    team: row.team,
    language: row.language,
  };
}

async function fetchScoresWithServiceRole(url, key) {
  const query = new URLSearchParams({
    select: '*',
    order: 'points.desc,correct.desc,percentage.desc,created_at.asc',
    limit: '1000',
  });
  const response = await fetch(`${url}/rest/v1/${TABLE_NAME}?${query.toString()}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(`Supabase read failed: ${message}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function fetchScoresWithRpc(url, key, pin) {
  const response = await fetch(`${url}/rest/v1/rpc/${ADMIN_RPC_NAME}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ admin_pin: pin }),
  });

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(`Supabase admin read failed: ${message}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function fetchScores(pin) {
  const { url, key, hasServiceRole } = supabaseConfig();
  const rows = hasServiceRole
    ? await fetchScoresWithServiceRole(url, key)
    : await fetchScoresWithRpc(url, key, pin);
  return sortEntries(rows.map(mapScore));
}

module.exports = async function handler(request, response) {
  setCors(response);

  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

  if (request.method !== 'GET') {
    response.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const pin = request.query?.pin || new URL(request.url, 'http://localhost').searchParams.get('pin');
  const adminPin = process.env.SCORE_ADMIN_PIN || 'yanmar-score-2026';
  if (String(pin || '') !== String(adminPin)) {
    response.status(401).json({ ok: false, error: 'Invalid admin pin' });
    return;
  }

  try {
    const entries = await fetchScores(pin);
    response.status(200).json({
      ok: true,
      entries,
      stats: {
        total: entries.length,
        perfect: entries.filter((entry) => Number(entry.total) > 0 && Number(entry.correct) === Number(entry.total)).length,
        highestPoints: Number(entries[0]?.points || 0),
      },
    });
  } catch (error) {
    response.status(error.status || 500).json({ ok: false, error: error.message || 'Unknown error' });
  }
};
