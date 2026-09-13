(() => {
  'use strict';

  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return;

  document.querySelectorAll(
    '.v203-cursor-dot,.v203-cursor-ring,.v203-cursor-label,.v232-cursor-dot,.v232-cursor-ring,.v250-cursor-mark,.v250-cursor-frame'
  ).forEach(el => el.remove());
  document.documentElement.classList.remove('v203-cursor-on','v232-cursor-on','v250-cursor-on');

  const mark = document.createElement('span');
  const frame = document.createElement('span');
  mark.className = 'v250-cursor-mark';
  frame.className = 'v250-cursor-frame';
  mark.setAttribute('aria-hidden','true');
  frame.setAttribute('aria-hidden','true');
  document.body.append(mark, frame);
  document.documentElement.classList.add('v250-cursor-on');

  const interactiveSelector = [
    'a[href]','button:not([disabled])','[role="button"]','[data-resume-trigger]',
    '.figma-computer-artboard','.figma-computer-screen-wrap','.figma-work-item',
    '.figma-work-media-shell','[data-v276-interactive]','.figma-work-view',
    '.viewer-close','.viewer-backdrop','.v204-about-trigger','.figma-sound-toggle',
    '.figma-primary-action','.contact-email','.contact-secondary a'
  ].join(',');

  const surfaceSelector = [
    '.figma-music-card','.figma-film-card-process','.figma-skills-note',
    '.experience-card','.experience-item','.about-card-v2','.figma-work-preview'
  ].join(',');

  const glow = document.querySelector('.cursor-glow');
  let x = innerWidth * .5, y = innerHeight * .5;
  let fx = x, fy = y;
  let gx = x, gy = y, glowTick = 0;
  let prevX = x, prevY = y;
  let vx = 0, vy = 0;
  let angle = 0, sx = 1, sy = 1;
  let visible = false, interactive = false, surface = false;
  let raf = 0;

  const setVisible = next => {
    if (visible === next) return;
    visible = next;
    mark.classList.toggle('is-visible', next);
    frame.classList.toggle('is-visible', next);
  };

  const setMode = target => {
    const nextInteractive = !!target?.closest?.(interactiveSelector);
    const nextSurface = !nextInteractive && !!target?.closest?.(surfaceSelector);
    if (interactive !== nextInteractive) {
      interactive = nextInteractive;
      mark.classList.toggle('is-interactive', interactive);
      frame.classList.toggle('is-interactive', interactive);
    }
    if (surface !== nextSurface) {
      surface = nextSurface;
      mark.classList.toggle('is-surface', surface);
      frame.classList.toggle('is-surface', surface);
    }
  };

  const render = () => {
    raf = 0;

    // Marker is intentionally 1:1 with the newest pointer sample. Only the
    // selection frame follows, so the cursor never feels like it is dragging.
    mark.style.transform = `translate3d(${x}px,${y}px,0)`;

    const follow = interactive ? .58 : surface ? .50 : .46;
    fx += (x - fx) * follow;
    fy += (y - fy) * follow;

    const speed = Math.min(24, Math.hypot(vx, vy));
    const targetAngle = interactive ? 0 : Math.max(-8, Math.min(8, vx * .52));
    angle += (targetAngle - angle) * .38;
    sx += ((1 + Math.min(.10, speed * .0038)) - sx) * .38;
    sy += ((1 - Math.min(.045, speed * .0017)) - sy) * .38;

    frame.style.transform =
      `translate3d(${fx}px,${fy}px,0) translate(-50%,-50%) rotate(${angle}deg) scale(${sx},${sy})`;

    if (glow && !window.__v288SoftwareRenderer) {
      gx += (x - gx) * .24;
      gy += (y - gy) * .24;
      if ((glowTick++ & 1) === 0) {
        glow.style.transform = `translate3d(${gx - 180}px,${gy - 180}px,0)`;
      }
    }

    vx *= .58;
    vy *= .58;

    const moving = Math.abs(x-fx)>.12 || Math.abs(y-fy)>.12 ||
      Math.abs(angle)>.025 || Math.abs(sx-1)>.0015 || Math.abs(sy-1)>.0015 ||
      Math.abs(vx)+Math.abs(vy)>.05;
    if (moving && !document.hidden) raf = requestAnimationFrame(render);
  };

  const requestFrame = () => {
    if (!raf && !document.hidden) raf = requestAnimationFrame(render);
  };

  document.addEventListener('pointermove', event => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    const nx = event.clientX, ny = event.clientY;
    vx = nx - prevX; vy = ny - prevY;
    prevX = nx; prevY = ny;
    x = nx; y = ny;
    if (!visible) setMode(event.target);
    setVisible(true);
    requestFrame();
  }, { passive:true });

  // Mode hit-testing belongs to boundary changes, not every mouse sample.
  document.addEventListener('pointerover', event => {
    setMode(event.target);
    requestFrame();
  }, { passive:true });

  document.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    mark.classList.add('is-pressed');
    frame.classList.add('is-pressed');
  }, { passive:true });

  const release = () => {
    mark.classList.remove('is-pressed');
    frame.classList.remove('is-pressed');
  };
  document.addEventListener('pointerup', release, { passive:true });
  document.addEventListener('pointercancel', release, { passive:true });

  document.documentElement.addEventListener('mouseleave', () => setVisible(false), { passive:true });
  addEventListener('blur', () => { release(); setVisible(false); setMode(null); }, { passive:true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && raf) { cancelAnimationFrame(raf); raf = 0; }
  }, { passive:true });
})();
