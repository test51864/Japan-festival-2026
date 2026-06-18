const SCORE_REPO = process.env.SCORE_REPO || 'test51864/Japan-festival-2026';
const SCORE_ISSUE = Number(process.env.SCORE_ISSUE || 1);
const ENTRY_MARKER = '<!-- yanmar-score-entry:v1 -->';

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

function parseEntryComment(comment) {
  if (!comment.body || !comment.body.includes(ENTRY_MARKER)) return null;
  const match = comment.body.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match) return null;

  try {
    const entry = JSON.parse(match[1]);
    return { ...entry, commentId: comment.id, commentUrl: comment.html_url };
  } catch {
    return null;
  }
}

async function fetchAllComments() {
  const token = process.env.SCORE_GITHUB_TOKEN;
  if (!token) {
    const error = new Error('SCORE_GITHUB_TOKEN is missing');
    error.status = 500;
    throw error;
  }

  const [owner, repo] = SCORE_REPO.split('/');
  const entries = [];

  for (let page = 1; page <= 10; page += 1) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${SCORE_ISSUE}/comments?per_page=100&page=${page}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'yanmar-festival-cup-scoreboard',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      const message = await response.text();
      const error = new Error(`GitHub read failed: ${message}`);
      error.status = response.status;
      throw error;
    }

    const comments = await response.json();
    comments.map(parseEntryComment).filter(Boolean).forEach((entry) => entries.push(entry));
    if (comments.length < 100) break;
  }

  return sortEntries(entries);
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
    const entries = await fetchAllComments();
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
