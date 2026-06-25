let lastFinalCard = null;
let finalScrollTimer = 0;
let userEditingPrizeForm = false;
const settledFinalCards = new WeakSet();

function installFinalVisibilityStyles() {
  if (document.getElementById('yanmar-final-visibility-style')) return;
  const style = document.createElement('style');
  style.id = 'yanmar-final-visibility-style';
  style.textContent = `
    .app-final {
      align-items: flex-start !important;
      justify-content: center !important;
      overflow: visible !important;
    }

    @media (max-width: 760px) {
      .app-final {
        min-height: auto !important;
        padding-top: max(12px, env(safe-area-inset-top)) !important;
      }

      .app-final .final-card {
        margin-top: 0 !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function stopFinalScrollTimer() {
  window.clearInterval(finalScrollTimer);
  finalScrollTimer = 0;
}

function isEditingFinalForm() {
  const active = document.activeElement;
  return Boolean(
    userEditingPrizeForm
    || (active && active.closest && active.closest('.app-final .prize-entry-panel'))
  );
}

function markPrizeFormEditing(event) {
  const target = event.target;
  if (target && target.closest && target.closest('.app-final .prize-entry-panel')) {
    userEditingPrizeForm = true;
    stopFinalScrollTimer();
  }
}

function scrollFinalIntoView(card) {
  if (!card || isEditingFinalForm()) return false;
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);
  card.scrollIntoView({ block: 'start', inline: 'nearest' });
  return true;
}

function startFinalScrollSequence(card) {
  if (!card || settledFinalCards.has(card) || isEditingFinalForm()) return;

  if (!scrollFinalIntoView(card)) return;
  settledFinalCards.add(card);
  stopFinalScrollTimer();

  let runs = 0;
  finalScrollTimer = window.setInterval(() => {
    if (isEditingFinalForm()) {
      stopFinalScrollTimer();
      return;
    }

    scrollFinalIntoView(card);
    runs += 1;
    if (runs >= 5) stopFinalScrollTimer();
  }, 180);
}

function keepFinalVisible() {
  installFinalVisibilityStyles();
  const card = document.querySelector('.app-final .final-card');
  if (!card) {
    lastFinalCard = null;
    userEditingPrizeForm = false;
    stopFinalScrollTimer();
    return;
  }

  if (card !== lastFinalCard) {
    lastFinalCard = card;
    userEditingPrizeForm = false;
    startFinalScrollSequence(card);
  }
}

if (typeof window !== 'undefined') {
  installFinalVisibilityStyles();
  document.addEventListener('focusin', markPrizeFormEditing, true);
  document.addEventListener('input', markPrizeFormEditing, true);
  document.addEventListener('pointerdown', markPrizeFormEditing, true);
  window.requestAnimationFrame(keepFinalVisible);
  window.setInterval(keepFinalVisible, 250);
}
