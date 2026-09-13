(() => {
  'use strict';

  const states = [
    'favicon-v299-striped.svg',
    'favicon-v299-solid.svg'
  ];

  // Slower when the tab is active, faster when the tab is inactive so it can
  // catch the viewer's eye from the tab bar.
  const activeIntervalMs = 1000;
  const inactiveIntervalMs = 450;

  let index = 0;
  let timer = 0;

  const iconLinks = Array.from(document.querySelectorAll('link[rel~="icon"]'));
  if (!iconLinks.length) return;

  // Warm both tiny SVG assets before the visible cycle begins.
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

  const getCurrentInterval = () => document.hidden ? inactiveIntervalMs : activeIntervalMs;

  const schedule = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      index = (index + 1) % states.length;
      apply(states[index]);
      schedule();
    }, getCurrentInterval());
  };

  apply(states[index]);
  schedule();

  // Re-schedule on visibility changes so the cadence changes immediately when
  // switching between active and background-tab states.
  document.addEventListener('visibilitychange', () => {
    window.clearTimeout(timer);
    schedule();
  });
})();
