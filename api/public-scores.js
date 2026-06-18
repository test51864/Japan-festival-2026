const PUBLIC_VIEW_NAME = process.env.SUPABASE_PUBLIC_SCORE_VIEW || 'yanmar_festival_public_scores';

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
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY || '';
  if (!url || !key) {
    const error = new Error('Supabase env vars missing: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY');
    error.status = 500;
    throw error;
  }
  return { url, key };
}

async function fetchPublicScores() {
  const { url, key } = supabaseConfig();
  const query = new URLSearchParams({
    select: 'id,created_at,name,points,correct,total,percentage,team,language',
    order: 'points.desc,correct.desc,percentage.desc,created_at.asc',
    limit: '25',
  });
  const response = await fetch(`${url}/rest/v1/${PUBLIC_VIEW_NAME}?${query.toString()}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(`Supabase public leaderboard read failed: ${message}`);
    error.status = response.status;
    throw error;
  }

  const rows = await response.json();
  return sortEntries(rows.map((row) => ({
    id: row.id,
    date: row.created_at,
    name: row.name,
    points: row.points,
    correct: row.correct,
    total: row.total,
    percentage: row.percentage,
    team: row.team,
    language: row.language,
  })));
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

  try {
    const entries = await fetchPublicScores();
    response.status(200).json({ ok: true, entries });
  } catch (error) {
    response.status(error.status || 500).json({ ok: false, error: error.message || 'Unknown error' });
  }
};
