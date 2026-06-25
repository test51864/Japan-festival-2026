const TABLE_NAME = process.env.SUPABASE_SCORE_TABLE || 'yanmar_festival_scores';
const DELETE_RPC_NAME = process.env.SUPABASE_DELETE_SCORE_RPC || 'yanmar_festival_delete_score';

function setCors(response) {
  response.setHeader('Access-Control-Allow-Origin', process.env.SCORE_ALLOWED_ORIGIN || '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function cleanText(value, max = 120) {
  return String(value || '').replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, max);
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

function readQueryPayload(request) {
  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);
  return Object.fromEntries(url.searchParams.entries());
}

async function readPayload(request) {
  const queryPayload = readQueryPayload(request);
  const rawBody = await readBody(request);
  if (!rawBody) return queryPayload;
  return { ...queryPayload, ...JSON.parse(rawBody) };
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

async function deleteWithServiceRole(url, key, id) {
  const query = new URLSearchParams({ id: `eq.${id}` });
  const response = await fetch(`${url}/rest/v1/${TABLE_NAME}?${query.toString()}`, {
    method: 'DELETE',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: 'application/json',
      Prefer: 'return=representation',
    },
  });

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(`Supabase delete failed: ${message}`);
    error.status = response.status;
    throw error;
  }

  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) ? rows : [];
}

async function deleteWithRpc(url, key, pin, id) {
  const response = await fetch(`${url}/rest/v1/rpc/${DELETE_RPC_NAME}`, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ admin_pin: pin, score_id: id }),
  });

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(`Supabase delete RPC failed: ${message}`);
    error.status = response.status;
    throw error;
  }

  return response.json().catch(() => []);
}

module.exports = async function handler(request, response) {
  setCors(response);

  if (request.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }

  if (!['POST', 'DELETE'].includes(request.method)) {
    response.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const payload = await readPayload(request);
    const pin = cleanText(payload.pin, 120);
    const id = cleanText(payload.id || payload.scoreId || payload.entryId, 120);
    const adminPin = process.env.SCORE_ADMIN_PIN || 'yanmar-score-2026';

    if (String(pin || '') !== String(adminPin)) {
      response.status(401).json({ ok: false, error: 'Invalid admin pin' });
      return;
    }

    if (!id) {
      response.status(400).json({ ok: false, error: 'Score id is required' });
      return;
    }

    const { url, key, hasServiceRole } = supabaseConfig();
    const deleted = hasServiceRole
      ? await deleteWithServiceRole(url, key, id)
      : await deleteWithRpc(url, key, pin, id);

    response.status(200).json({ ok: true, id, deleted });
  } catch (error) {
    response.status(error.status || 500).json({ ok: false, error: error.message || 'Unknown error' });
  }
};
