const FIELD_EVENTS = ['cat', 'fox', 'crane', 'streamer', 'paper-plane', 'confetti', 'none'];

function pickFieldEvent() {
  const roll = Math.random();
  if (roll < 0.14) return 'none';
  return FIELD_EVENTS[Math.floor(Math.random() * (FIELD_EVENTS.length - 1))];
}

function sideFromClass(node) {
  return Array.from(node.classList).some((className) => className.endsWith('-left')) ? 'left' : 'right';
}

function applyRandomFieldEvent(node) {
  if (!(node instanceof HTMLElement) || !node.matches('.field-cat')) return;
  if (node.dataset.randomized === 'true') return;

  const eventName = pickFieldEvent();
  const side = sideFromClass(node);
  node.dataset.randomized = 'true';
  node.dataset.fieldEvent = eventName;
  node.dataset.fieldSide = side;
}

function scanFieldEvents(root = document) {
  root.querySelectorAll?.('.field-cat').forEach(applyRandomFieldEvent);
}

if (typeof window !== 'undefined') {
  window.requestAnimationFrame(() => scanFieldEvents());

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        applyRandomFieldEvent(node);
        scanFieldEvents(node);
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}
