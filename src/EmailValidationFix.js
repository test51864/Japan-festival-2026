const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CURRENT_PLAYER_KEY = 'yanmar-festival-current-player';

const COPY = {
  en: {
    missing: 'Enter your e-mail address first.',
    invalid: 'Enter a valid e-mail address.',
    save: 'Save score',
  },
  nl: {
    missing: 'Vul eerst je e-mailadres in.',
    invalid: 'Vul een geldig e-mailadres in.',
    save: 'Sla score op',
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
  if (stored.includes('nl')) return 'nl';
  if (document.querySelector('.prize-save-button')?.textContent?.toLowerCase().includes('sla')) return 'nl';
  return 'en';
}

function valid(email) {
  return EMAIL_PATTERN.test(email);
}

function prepareEmailInputs() {
  document.querySelectorAll('.final-card .prize-email-input').forEach((input) => {
    input.type = 'email';
    input.required = true;
    input.autocomplete = 'email';
    input.inputMode = 'email';
    input.pattern = '[^\\s@]+@[^\\s@]+\\.[^\\s@]+';
  });
}

function blockInvalidPrizeEmail(event) {
  const button = event.target.closest?.('.prize-save-button');
  if (!button) return;

  const panel = button.closest('.prize-entry-panel');
  const input = panel?.querySelector('.prize-email-input');
  const status = panel?.querySelector('.prize-entry-status');
  if (!input || !status) return;

  const copy = COPY[currentLanguage()];
  const email = input.value.trim();
  const message = !email ? copy.missing : (!valid(email) ? copy.invalid : '');
  if (!message) {
    input.setAttribute('aria-invalid', 'false');
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
  button.disabled = false;
  button.textContent = copy.save;
  status.textContent = message;
  status.dataset.state = 'error';
  input.setAttribute('aria-invalid', 'true');
  input.focus();
}

if (typeof window !== 'undefined') {
  document.addEventListener('click', blockInvalidPrizeEmail, true);
  window.requestAnimationFrame(prepareEmailInputs);
  window.setInterval(prepareEmailInputs, 350);
}
