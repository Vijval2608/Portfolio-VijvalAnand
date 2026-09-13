(() => {
  'use strict';

  const states = [
    'favicon-v299-striped.svg',
    'favicon-v299-solid.svg'
  ];
  const intervalMs = 700;
  let index = 0;
  let timer = 0;

  const iconLinks = Array.from(document.querySelectorAll('link[rel~="icon"]'));
  if (!iconLinks.length) return;

  // Warm both tiny SVG assets before the visible cycle begins so the tab icon
  // does not briefly lag or blank between states on a cold cache.
  for (const src of states) {
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
  }

  const apply = (src) => {
    for (const link of iconLinks) {
      link.type = 'image/svg+xml';
      link.href = src;
    }
  };

  const schedule = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      index = (index + 1) % states.length;
      apply(states[index]);
      schedule();
    }, intervalMs);
  };

  apply(states[index]);
  schedule();

  // Avoid a queued catch-up swap after a long background-tab pause.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.clearTimeout(timer);
      return;
    }
    apply(states[index]);
    schedule();
  });
})();
