const SCORE_REPO = process.env.SCORE_REPO || 'test51864/Japan-festival-2026';
const SCORE_ISSUE = Number(process.env.SCORE_ISSUE || 1);
const ENTRY_MARKER = '<!-- yanmar-score-entry:v1 -->';

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

async function createIssueComment(entry) {
  const token = process.env.SCORE_GITHUB_TOKEN;
  if (!token) {
    const error = new Error('SCORE_GITHUB_TOKEN is missing');
    error.status = 500;
    throw error;
  }

  const [owner, repo] = SCORE_REPO.split('/');
  const body = `${ENTRY_MARKER}\n\`\`\`json\n${JSON.stringify(entry, null, 2)}\n\`\`\``;
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${SCORE_ISSUE}/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'yanmar-festival-cup-scoreboard',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ body }),
  });

  if (!response.ok) {
    const message = await response.text();
    const error = new Error(`GitHub write failed: ${message}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
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
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      name: cleanText(payload.name, 60) || 'Player',
      email,
      points,
      correct,
      total,
      percentage,
      team: cleanText(payload.team, 50),
      language: cleanText(payload.language, 12),
      userAgent: cleanText(request.headers['user-agent'], 180),
    };

    await createIssueComment(entry);
    response.status(200).json({ ok: true, entry });
  } catch (error) {
    response.status(error.status || 500).json({ ok: false, error: error.message || 'Unknown error' });
  }
};
