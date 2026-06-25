const CURRENT_PLAYER_KEY = 'yanmar-festival-current-player';

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
  ja: {
    title: '\u62bd\u9078\u53c2\u52a0',
    text: '\u30b9\u30b3\u30a2\u3092\u4fdd\u5b58\u3059\u308b\u305f\u3081\u306b\u30e1\u30fc\u30eb/\u9023\u7d61\u5148\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002\u516c\u958b\u30ea\u30fc\u30c0\u30fc\u30dc\u30fc\u30c9\u306b\u306f\u540d\u524d\u3068\u30b9\u30b3\u30a2\u306e\u307f\u8868\u793a\u3055\u308c\u307e\u3059\u3002',
    label: '\u30e1\u30fc\u30eb / \u9023\u7d61\u5148',
    placeholder: 'name@example.com',
    saveButton: '\u30b9\u30b3\u30a2\u3092\u4fdd\u5b58',
    savingButton: '\u4fdd\u5b58\u4e2d...',
    savedButton: '\u4fdd\u5b58\u6e08\u307f',
    retryButton: '\u518d\u8a66\u884c',
    missingContact: '\u30e1\u30fc\u30eb/\u9023\u7d61\u5148\u3092\u5165\u529b\u3057\u3066\u304f\u3060\u3055\u3044\u3002',
    savingStatus: '\u30b9\u30b3\u30a2\u3092\u4fdd\u5b58\u4e2d\u3067\u3059\u3002',
    successStatus: ({ points, correct, total, percentage }) => `\u4fdd\u5b58\u3057\u307e\u3057\u305f: ${points}\u30dd\u30a4\u30f3\u30c8\u3001${correct}/${total}\u554f\u6b63\u89e3 (${percentage}%).`,
    errorPrefix: '\u4fdd\u5b58\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f:',
    saveFailed: '\u4fdd\u5b58\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f\u3002',
    apiUnavailable: '\u30b9\u30b3\u30a2\u30b5\u30fc\u30d0\u30fc\u306b\u63a5\u7d9a\u3067\u304d\u307e\u305b\u3093\u3002\u3082\u3046\u4e00\u5ea6\u304a\u8a66\u3057\u304f\u3060\u3055\u3044\u3002',
  },
};

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
  if (stored.includes('jpn') || stored.includes('ja')) return 'ja';
  if (stored.includes('nl')) return 'nl';
  if (stored.includes('en')) return 'en';

  const bodyText = document.body.textContent || '';
  if (bodyText.includes('Speel opnieuw')) return 'nl';
  if (bodyText.includes('\u3082\u3046\u4e00\u5ea6')) return 'ja';
  return 'en';
}

function setText(node, value) {
  if (node && node.textContent !== value) node.textContent = value;
}

function parseFinalResult() {
  const strongValues = Array.from(document.querySelectorAll('.final-card .score-summary strong')).map((node) => node.textContent.trim());
  const points = Number.parseInt(strongValues[0]?.replace(/[^0-9]/g, '') || '0', 10) || 0;
  const [correctRaw, totalRaw] = (strongValues[1] || '0/0').split('/');
  const correct = Number.parseInt(correctRaw, 10) || 0;
  const total = Number.parseInt(totalRaw, 10) || 0;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  return { points, correct, total, percentage };
}

function normalizeErrorMessage(message) {
  return String(message || '')
    .replace(/^Niet opgeslagen:\s*/i, '')
    .replace(/^Not saved:\s*/i, '')
    .replace(/^\u4fdd\u5b58\u3067\u304d\u307e\u305b\u3093\u3067\u3057\u305f:\s*/i, '')
    .trim();
}

function translateErrorMessage(message, copy) {
  const normalized = normalizeErrorMessage(message);
  if (!normalized) return copy.saveFailed;
  if (/API niet bereikbaar|Failed to fetch|public access|server is not reachable/i.test(normalized)) return copy.apiUnavailable;
  if (/Opslaan is niet gelukt|Saving failed/i.test(normalized)) return copy.saveFailed;
  return normalized;
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
    const isMissingContact = !input?.value?.trim() || /Vul eerst|Enter your|\u30e1\u30fc\u30eb/.test(status.textContent || '');
    setText(button, isMissingContact ? copy.saveButton : copy.retryButton);
    setText(status, isMissingContact ? copy.missingContact : `${copy.errorPrefix} ${translateErrorMessage(status.textContent, copy)}`);
    return;
  }

  setText(button, copy.saveButton);
}

function scan() {
  applyPrizeLanguage();
}

if (typeof window !== 'undefined') {
  window.requestAnimationFrame(scan);
  new MutationObserver(scan).observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['data-state', 'placeholder', 'disabled'],
  });
}
