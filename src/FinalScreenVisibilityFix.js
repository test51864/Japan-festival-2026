let lastFinalCard = null;
let finalScrollTimer = 0;

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

function scrollFinalIntoView(card) {
  if (!card) return;
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo(0, 0);
  card.scrollIntoView({ block: 'start', inline: 'nearest' });
}

function keepFinalVisible() {
  installFinalVisibilityStyles();
  const card = document.querySelector('.app-final .final-card');
  if (!card) {
    lastFinalCard = null;
    window.clearInterval(finalScrollTimer);
    finalScrollTimer = 0;
    return;
  }

  if (card === lastFinalCard && finalScrollTimer) return;
  lastFinalCard = card;

  scrollFinalIntoView(card);
  window.clearInterval(finalScrollTimer);
  let runs = 0;
  finalScrollTimer = window.setInterval(() => {
    scrollFinalIntoView(card);
    runs += 1;
    if (runs >= 8) {
      window.clearInterval(finalScrollTimer);
      finalScrollTimer = 0;
    }
  }, 180);
}

if (typeof window !== 'undefined') {
  installFinalVisibilityStyles();
  window.requestAnimationFrame(keepFinalVisible);
  window.setInterval(keepFinalVisible, 250);
}
