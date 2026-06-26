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

    @media (max-width: 520px) {
      body.yanmar-final-page .app-final .forms-panel {
        height: clamp(232px, 30svh, 256px) !important;
        min-height: clamp(232px, 30svh, 256px) !important;
        max-height: clamp(232px, 30svh, 256px) !important;
      }
    }

    @media (max-height: 720px) {
      body.yanmar-final-page .app-final .forms-panel {
        height: clamp(204px, 31svh, 232px) !important;
        min-height: clamp(204px, 31svh, 232px) !important;
        max-height: clamp(204px, 31svh, 232px) !important;
      }

      body.yanmar-final-page .app-final .prize-entry-panel {
        min-height: 142px !important;
        height: 142px !important;
        max-height: 142px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

if (typeof window !== 'undefined') {
  installFinalJumpStopStyles();
}
