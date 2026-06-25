let lastFinalCard = null;
let settleTimer = 0;
let editingPrizeForm = false;
let lockedScrollY = null;
let lastViewportHeight = 0;

function installFinalVisibilityStyles() {
  if (document.getElementById('yanmar-final-visibility-style')) return;
  const style = document.createElement('style');
  style.id = 'yanmar-final-visibility-style';
  style.textContent = `
    .app-final {
      align-items: flex-start !important;
      justify-content: center !important;
      min-height: auto !important;
      overflow: visible !important;
      padding-top: max(12px, env(safe-area-inset-top)) !important;
    }

    .app-final .final-card {
      margin-top: 0 !important;
      overflow-anchor: none !important;
    }

    .app-final .forms-panel,
    .app-final .prize-entry-panel,
    .app-final .prize-email-input {
      overflow-anchor: none !important;
      scroll-margin-top: 16px !important;
    }

    .app-final .prize-email-input {
      font-size: 16px !important;
      transform: translateZ(0) !important;
      -webkit-text-size-adjust: 100% !important;
    }

    body.yanmar-final-input-active,
    body.yanmar-final-input-active .app-final {
      overscroll-behavior: contain !important;
      scroll-behavior: auto !important;
    }

    body.yanmar-final-input-active .app-final {
      padding-bottom: max(20px, env(safe-area-inset-bottom)) !important;
    }
  `;
  document.head.appendChild(style);
}

function clearSettleTimer() {
  window.clearTimeout(settleTimer);
  settleTimer = 0;
}

function getPrizeInput() {
  return document.querySelector('.app-final .prize-email-input');
}

function getScrollY() {
  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function setScrollY(value) {
  window.scrollTo(0, value);
  document.documentElement.scrollTop = value;
  document.body.scrollTop = value;
}

function activeInPrizeForm() {
  const active = document.activeElement;
  return Boolean(active && active.closest && active.closest('.app-final .prize-entry-panel'));
}

function beginPrizeEditing() {
  editingPrizeForm = true;
  document.body.classList.add('yanmar-final-input-active');
  clearSettleTimer();
  if (lockedScrollY === null) lockedScrollY = getScrollY();
}

function endPrizeEditingSoon() {
  window.setTimeout(() => {
    if (activeInPrizeForm()) return;
    editingPrizeForm = false;
    lockedScrollY = null;
    document.body.classList.remove('yanmar-final-input-active');
  }, 150);
}

function eventInsidePrizeForm(event) {
  const target = event.target;
  return Boolean(target && target.closest && target.closest('.app-final .prize-entry-panel'));
}

function markPrizeFormEditing(event) {
  if (!eventInsidePrizeForm(event)) return;
  beginPrizeEditing();
}

function preventProgrammaticJumpWhileEditing() {
  if (!editingPrizeForm || lockedScrollY === null) return;
  const delta = Math.abs(getScrollY() - lockedScrollY);
  if (delta > 2) setScrollY(lockedScrollY);
}

function keepInputStable() {
  const input = getPrizeInput();
  if (!input || !editingPrizeForm) return;

  const rect = input.getBoundingClientRect();
  const viewportHeight = window.visualViewport?.height || window.innerHeight;
  const comfortableBottom = Math.max(160, viewportHeight - 26);

  if (rect.bottom > comfortableBottom) {
    const nextY = getScrollY() + (rect.bottom - comfortableBottom);
    lockedScrollY = nextY;
    setScrollY(nextY);
  } else {
    preventProgrammaticJumpWhileEditing();
  }
}

function settleFinalCard(card) {
  if (!card || editingPrizeForm) return;
  clearSettleTimer();

  const rect = card.getBoundingClientRect();
  if (Math.abs(rect.top) > 18) {
    card.scrollIntoView({ block: 'start', inline: 'nearest' });
  }

  settleTimer = window.setTimeout(() => {
    if (editingPrizeForm || activeInPrizeForm()) return;
    const nextRect = card.getBoundingClientRect();
    if (Math.abs(nextRect.top) > 18) card.scrollIntoView({ block: 'start', inline: 'nearest' });
  }, 280);
}

function scanFinalScreen() {
  installFinalVisibilityStyles();
  const card = document.querySelector('.app-final .final-card');
  if (!card) {
    lastFinalCard = null;
    editingPrizeForm = false;
    lockedScrollY = null;
    document.body.classList.remove('yanmar-final-input-active');
    clearSettleTimer();
    return;
  }

  if (card !== lastFinalCard) {
    lastFinalCard = card;
    editingPrizeForm = false;
    lockedScrollY = null;
    document.body.classList.remove('yanmar-final-input-active');
    settleFinalCard(card);
  }

  keepInputStable();
}

function handleViewportChange() {
  const nextHeight = window.visualViewport?.height || window.innerHeight;
  const heightChanged = Math.abs(nextHeight - lastViewportHeight) > 8;
  lastViewportHeight = nextHeight;

  if (editingPrizeForm && heightChanged) {
    window.requestAnimationFrame(keepInputStable);
    window.setTimeout(keepInputStable, 80);
    return;
  }

  scanFinalScreen();
}

if (typeof window !== 'undefined') {
  installFinalVisibilityStyles();
  lastViewportHeight = window.visualViewport?.height || window.innerHeight;
  document.addEventListener('focusin', markPrizeFormEditing, true);
  document.addEventListener('pointerdown', markPrizeFormEditing, true);
  document.addEventListener('touchstart', markPrizeFormEditing, true);
  document.addEventListener('input', markPrizeFormEditing, true);
  document.addEventListener('focusout', endPrizeEditingSoon, true);
  window.addEventListener('scroll', preventProgrammaticJumpWhileEditing, true);
  window.addEventListener('resize', handleViewportChange, { passive: true });
  window.visualViewport?.addEventListener('resize', handleViewportChange, { passive: true });
  window.visualViewport?.addEventListener('scroll', handleViewportChange, { passive: true });
  window.requestAnimationFrame(scanFinalScreen);
  window.setInterval(scanFinalScreen, 450);
}
