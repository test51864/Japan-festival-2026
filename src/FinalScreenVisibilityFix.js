function installFinalVisibilityStyles() {
  if (document.getElementById('yanmar-final-visibility-style')) return;
  const style = document.createElement('style');
  style.id = 'yanmar-final-visibility-style';
  style.textContent = `
    html.yanmar-final-page,
    body.yanmar-final-page {
      width: 100% !important;
      height: 100vh !important;
      height: 100svh !important;
      min-height: 100vh !important;
      min-height: 100svh !important;
      max-height: 100vh !important;
      max-height: 100svh !important;
      overflow: hidden !important;
      overscroll-behavior: none !important;
      scroll-behavior: auto !important;
    }

    body.yanmar-final-page {
      position: fixed !important;
      inset: 0 !important;
      margin: 0 !important;
    }

    body.yanmar-final-page #root {
      width: 100% !important;
      height: 100vh !important;
      height: 100svh !important;
      min-height: 0 !important;
      overflow: hidden !important;
    }

    .app-final {
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      height: 100svh !important;
      min-height: 0 !important;
      max-height: 100vh !important;
      max-height: 100svh !important;
      align-items: flex-start !important;
      justify-content: center !important;
      overflow: hidden !important;
      overscroll-behavior: none !important;
      padding: clamp(8px, 1.5vh, 16px) 10px max(8px, env(safe-area-inset-bottom)) !important;
    }

    .app-final .final-card {
      width: min(760px, 100%) !important;
      height: calc(100vh - clamp(16px, 3vh, 32px)) !important;
      height: calc(100svh - clamp(16px, 3vh, 32px)) !important;
      max-height: calc(100vh - clamp(16px, 3vh, 32px)) !important;
      max-height: calc(100svh - clamp(16px, 3vh, 32px)) !important;
      display: grid !important;
      grid-template-rows: auto auto auto auto auto minmax(0, auto) 1fr auto !important;
      align-content: start !important;
      gap: clamp(5px, 1vh, 10px) !important;
      margin: 0 auto !important;
      overflow: hidden !important;
      overscroll-behavior: none !important;
      overflow-anchor: none !important;
      padding: clamp(10px, 2vh, 22px) !important;
    }

    .app-final .wordmark-final {
      min-height: clamp(42px, 7vh, 72px) !important;
      margin: 0 auto clamp(2px, 0.6vh, 8px) !important;
      padding: clamp(6px, 1vh, 10px) clamp(14px, 3vw, 24px) clamp(4px, 0.8vh, 8px) !important;
      font-size: clamp(30px, 6vw, 54px) !important;
      box-shadow: 8px 9px 0 rgba(16, 17, 20, 0.24) !important;
    }

    .app-final .eyebrow {
      margin: 0 !important;
      font-size: clamp(10px, 1.7vh, 13px) !important;
    }

    .app-final .final-card h1 {
      font-size: clamp(28px, 7vw, 58px) !important;
      line-height: 0.95 !important;
      margin: 0 !important;
    }

    .app-final .result-medal {
      min-height: clamp(36px, 6vh, 52px) !important;
      margin: 0 auto !important;
      padding: clamp(7px, 1.2vh, 11px) clamp(12px, 2vw, 18px) !important;
      font-size: clamp(14px, 2.3vw, 24px) !important;
    }

    .app-final .score-summary {
      width: min(780px, 100%) !important;
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: clamp(8px, 1.4vw, 16px) !important;
      margin: 0 auto !important;
    }

    .app-final .score-summary span {
      min-height: clamp(58px, 10vh, 100px) !important;
      padding: clamp(8px, 1.2vh, 12px) !important;
    }

    .app-final .score-summary strong {
      font-size: clamp(24px, 5vw, 42px) !important;
      line-height: 1 !important;
    }

    .app-final .forms-panel {
      width: min(780px, 100%) !important;
      max-width: 780px !important;
      min-height: 0 !important;
      display: grid !important;
      gap: clamp(6px, 1vh, 10px) !important;
      margin: 0 auto !important;
      padding: clamp(10px, 1.6vh, 16px) !important;
      overflow: hidden !important;
      overscroll-behavior: none !important;
      overflow-anchor: none !important;
    }

    .app-final .forms-panel h2 {
      font-size: clamp(17px, 3vw, 26px) !important;
      line-height: 1 !important;
    }

    .app-final .forms-panel p {
      font-size: clamp(13px, 1.7vw, 16px) !important;
      line-height: 1.32 !important;
    }

    .app-final .prize-entry-panel {
      gap: clamp(6px, 1vh, 9px) !important;
      overflow-anchor: none !important;
    }

    .app-final .prize-entry-label {
      gap: 5px !important;
    }

    .app-final .prize-entry-label span {
      font-size: clamp(11px, 1.8vw, 13px) !important;
      line-height: 1 !important;
    }

    .app-final .prize-email-input {
      min-height: 48px !important;
      height: 48px !important;
      font-size: 16px !important;
      transform: translateZ(0) !important;
      -webkit-text-size-adjust: 100% !important;
      overflow-anchor: none !important;
      scroll-margin: 0 !important;
    }

    .app-final .prize-save-button {
      min-height: 48px !important;
      margin: 0 !important;
    }

    .app-final .prize-entry-status {
      min-height: 18px !important;
      line-height: 1.2 !important;
      font-size: 12px !important;
    }

    .app-final .leaderboard-panel,
    .app-final .final-actions {
      display: none !important;
    }

    @media (max-width: 520px) {
      .app-final {
        padding: 6px 6px max(6px, env(safe-area-inset-bottom)) !important;
      }

      .app-final .final-card {
        gap: 5px !important;
        padding: 8px !important;
        grid-template-rows: auto auto auto auto auto minmax(0, auto) 0 0 !important;
      }

      .app-final .wordmark-final {
        min-height: 40px !important;
        font-size: clamp(28px, 12vw, 44px) !important;
        border-width: 2px !important;
      }

      .app-final .final-card h1 {
        font-size: clamp(25px, 10vw, 44px) !important;
      }

      .app-final .score-summary span {
        min-height: 54px !important;
      }

      .app-final .forms-panel {
        padding: 9px !important;
      }
    }

    @media (max-height: 720px) {
      .app-final .wordmark-final {
        min-height: 36px !important;
        font-size: clamp(24px, 6vw, 42px) !important;
      }

      .app-final .final-card h1 {
        font-size: clamp(24px, 6vw, 42px) !important;
      }

      .app-final .result-medal,
      .app-final .score-summary span {
        min-height: 42px !important;
      }

      .app-final .forms-panel p {
        font-size: 12px !important;
        line-height: 1.24 !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function setFinalLock(active) {
  document.documentElement.classList.toggle('yanmar-final-page', active);
  document.body.classList.toggle('yanmar-final-page', active);
}

function scanFinalScreen() {
  installFinalVisibilityStyles();
  setFinalLock(Boolean(document.querySelector('.app-final .final-card')));
}

if (typeof window !== 'undefined') {
  installFinalVisibilityStyles();
  window.requestAnimationFrame(scanFinalScreen);
  window.setInterval(scanFinalScreen, 250);
}
