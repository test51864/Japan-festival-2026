const FIELD_EVENTS = ['streamer', 'paper-plane', 'confetti'];

let sessionPoints = 0;
const countedPointNodes = new WeakSet();

function updateSessionPoints(root = document) {
  root.querySelectorAll?.('.points-pop').forEach((node) => {
    if (countedPointNodes.has(node)) return;
    countedPointNodes.add(node);

    const value = Number.parseInt(node.textContent.replace(/[^0-9]/g, ''), 10);
    if (Number.isFinite(value)) sessionPoints += value;
  });

  if (document.querySelector('.app-setup')) {
    sessionPoints = 0;
  }
}

function distractionChance() {
  return Math.min(0.78, 0.14 + sessionPoints / 1000);
}

function pickFieldEvent() {
  if (Math.random() > distractionChance()) return 'none';
  return FIELD_EVENTS[Math.floor(Math.random() * FIELD_EVENTS.length)];
}

function sideFromClass(node) {
  return Array.from(node.classList).some((className) => className.endsWith('-left')) ? 'left' : 'right';
}

function applyRandomFieldEvent(node) {
  if (!(node instanceof HTMLElement) || !node.matches('.field-cat')) return;
  if (node.dataset.randomized === 'true') return;

  updateSessionPoints();

  const eventName = pickFieldEvent();
  const side = sideFromClass(node);
  node.dataset.randomized = 'true';
  node.dataset.fieldEvent = eventName;
  node.dataset.fieldSide = side;
}

function scanFieldEvents(root = document) {
  updateSessionPoints(root);
  root.querySelectorAll?.('.field-cat').forEach(applyRandomFieldEvent);
}

if (typeof window !== 'undefined') {
  window.requestAnimationFrame(() => scanFieldEvents());

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        updateSessionPoints(node);
        applyRandomFieldEvent(node);
        scanFieldEvents(node);
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
}
