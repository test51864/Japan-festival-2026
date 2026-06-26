function installFinalJumpStopStyles() {
  if (document.getElementById('yanmar-final-jump-stop-style')) return;
  const style = document.createElement('style');
  style.id = 'yanmar-final-jump-stop-style';
  style.textContent = `
    body.yanmar-final-page .app-final .forms-panel {
      height: clamp(232px, 30svh, 258px) !important;
      min-height: clamp(232px, 30svh, 258px) !important;
      max-height: clamp(232px, 30svh, 258px) !important;
      grid-template-rows: auto auto minmax(0, 1fr) !important;
      align-content: start !important;
      contain: layout paint style !important;
    }

    body.yanmar-final-page .app-final .forms-panel .form-link {
      display: none !important;
    }

    body.yanmar-final-page .app-final .prize-entry-panel {
      min-height: 155px !important;
      height: 155px !important;
      max-height: 155px !important;
      align-content: start !important;
    }

    body.yanmar-final-page .app-final .prize-entry-status {
      height: 18px !important;
      overflow: hidden !important;
    }

    body.yanmar-final-page .app-final .leaderboard-panel {
      display: grid !important;
      width: min(780px, 100%) !important;
      min-height: 0 !important;
      height: auto !important;
      max-height: none !important;
      gap: 4px !important;
      align-content: start !important;
      margin: 0 auto !important;
      padding: 8px !important;
      overflow: hidden !important;
      overscroll-behavior: none !important;
      contain: layout paint style !important;
    }

    body.yanmar-final-page .app-final .leaderboard-panel h2 {
      margin: 0 !important;
      font-size: clamp(14px, 2.4vw, 19px) !important;
      line-height: 1 !important;
    }

    body.yanmar-final-page .app-final .leaderboard-panel > p:not(.database-leaderboard-status),
    body.yanmar-final-page .app-final .database-leaderboard-note {
      display: none !important;
    }

    body.yanmar-final-page .app-final .database-leaderboard-status {
      min-height: 14px !important;
      margin: 0 !important;
      font-size: 11px !important;
      line-height: 1.1 !important;
    }

    body.yanmar-final-page .app-final .leaderboard-panel ol,
    body.yanmar-final-page .app-final .database-leaderboard-list {
      display: grid !important;
      gap: 4px !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
    }

    body.yanmar-final-page .app-final .leaderboard-panel li,
    body.yanmar-final-page .app-final .database-leaderboard-row {
      min-height: 30px !important;
      padding: 4px 6px !important;
      gap: 6px !important;
      border-width: 1px !important;
      box-shadow: none !important;
    }

    body.yanmar-final-page .app-final .database-leaderboard-row {
      grid-template-columns: 30px minmax(0, 1fr) auto !important;
    }

    body.yanmar-final-page .app-final .database-rank,
    body.yanmar-final-page .app-final .leaderboard-panel li > span {
      width: 24px !important;
      height: 24px !important;
      font-size: 10px !important;
      border-radius: 6px !important;
    }

    body.yanmar-final-page .app-final .database-leaderboard-row strong,
    body.yanmar-final-page .app-final .leaderboard-panel li strong {
      font-size: 12px !important;
      line-height: 1 !important;
    }

    body.yanmar-final-page .app-final .database-leaderboard-row em,
    body.yanmar-final-page .app-final .leaderboard-panel li em {
      padding: 3px 5px !important;
      font-size: 10px !important;
      line-height: 1 !important;
    }

    body.yanmar-final-page .app-final .database-leaderboard-row small,
    body.yanmar-final-page .app-final .database-leaderboard-row:nth-child(n+4),
    body.yanmar-final-page .app-final .leaderboard-panel li:nth-child(n+4) {
      display: none !important;
    }

    @media (max-width: 520px) {
      body.yanmar-final-page .app-final .forms-panel {
        height: clamp(232px, 30svh, 256px) !important;
        min-height: clamp(232px, 30svh, 256px) !important;
        max-height: clamp(232px, 30svh, 256px) !important;
      }

      body.yanmar-final-page .app-final .leaderboard-panel {
        padding: 6px !important;
      }

      body.yanmar-final-page .app-final .database-leaderboard-row:nth-child(n+3),
      body.yanmar-final-page .app-final .leaderboard-panel li:nth-child(n+3) {
        display: none !important;
      }
    }

    @media (max-height: 720px) {
      body.yanmar-final-page .app-final .forms-panel {
        height: clamp(232px, 35svh, 258px) !important;
        min-height: clamp(232px, 35svh, 258px) !important;
        max-height: clamp(232px, 35svh, 258px) !important;
      }

      body.yanmar-final-page .app-final .prize-entry-panel {
        min-height: 155px !important;
        height: 155px !important;
        max-height: 155px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

if (typeof window !== 'undefined') {
  installFinalJumpStopStyles();
}
