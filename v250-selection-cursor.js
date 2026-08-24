(() => {
  'use strict';

  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return;

  // Remove any legacy cursor nodes if an older cached script ever injected them.
  document.querySelectorAll(
    '.v203-cursor-dot,.v203-cursor-ring,.v203-cursor-label,.v232-cursor-dot,.v232-cursor-ring'
  ).forEach(el => el.remove());

  document.documentElement.classList.remove('v203-cursor-on','v232-cursor-on');

  const mark = document.createElement('span');
  const frame = document.createElement('span');
  mark.className = 'v250-cursor-mark';
  frame.className = 'v250-cursor-frame';
  mark.setAttribute('aria-hidden','true');
  frame.setAttribute('aria-hidden','true');
  document.body.append(mark, frame);
  document.documentElement.classList.add('v250-cursor-on');

  const interactiveSelector = [
    'a[href]',
    'button:not([disabled])',
    '[role="button"]',
    '[data-resume-trigger]',
    '.figma-computer-artboard',
    '.figma-computer-screen-wrap',
    '.figma-work-item',
    '.figma-work-view',
    '.viewer-close',
    '.viewer-backdrop',
    '.v204-about-trigger',
    '.figma-sound-toggle',
    '.figma-primary-action',
    '.contact-email',
    '.contact-secondary a'
  ].join(',');

  const surfaceSelector = [
    '.figma-music-card',
    '.figma-film-card-process',
    '.figma-skills-note',
    '.experience-card',
    '.experience-item',
    '.about-card-v2',
    '.figma-work-preview'
  ].join(',');

  let x = innerWidth * .5;
  let y = innerHeight * .5;
  let fx = x;
  let fy = y;
  let lastX = x;
  let lastY = y;
  let angle = 0;
  let stretchX = 1;
  let stretchY = 1;
  let visible = false;
  let interactive = false;
  let surface = false;

  const toggleState = (el, name, next) => el.classList.toggle(name, next);

  const setVisible = next => {
    if (visible === next) return;
    visible = next;
    toggleState(mark,'is-visible',next);
    toggleState(frame,'is-visible',next);
  };

  const setMode = target => {
    const nextInteractive = !!target?.closest?.(interactiveSelector);
    const nextSurface = !nextInteractive && !!target?.closest?.(surfaceSelector);
    if (interactive !== nextInteractive) {
      interactive = nextInteractive;
      toggleState(mark,'is-interactive',interactive);
      toggleState(frame,'is-interactive',interactive);
    }
    if (surface !== nextSurface) {
      surface = nextSurface;
      toggleState(mark,'is-surface',surface);
      toggleState(frame,'is-surface',surface);
    }
  };

  const render = () => {
    const dx = x - lastX;
    const dy = y - lastY;
    lastX = x;
    lastY = y;

    const speed = Math.min(26, Math.hypot(dx,dy));
    const follow = interactive ? .36 : surface ? .28 : .22;
    fx += (x - fx) * follow;
    fy += (y - fy) * follow;

    // Motion gives the frame a tiny kinetic lean. On actionable UI it
    // straightens so the selection-frame metaphor becomes more explicit.
    const targetAngle = interactive ? 0 : Math.max(-10,Math.min(10,dx * .72));
    angle += (targetAngle - angle) * .18;

    const targetStretchX = 1 + Math.min(.14,speed * .0052);
    const targetStretchY = 1 - Math.min(.065,speed * .0024);
    stretchX += (targetStretchX - stretchX) * .18;
    stretchY += (targetStretchY - stretchY) * .18;

    mark.style.setProperty('--v250-x',`${x.toFixed(2)}px`);
    mark.style.setProperty('--v250-y',`${y.toFixed(2)}px`);
    frame.style.setProperty('--v250-fx',`${fx.toFixed(2)}px`);
    frame.style.setProperty('--v250-fy',`${fy.toFixed(2)}px`);
    frame.style.setProperty('--v250-angle',`${angle.toFixed(2)}deg`);
    frame.style.setProperty('--v250-stretch-x',stretchX.toFixed(3));
    frame.style.setProperty('--v250-stretch-y',stretchY.toFixed(3));

    requestAnimationFrame(render);
  };

  document.addEventListener('pointermove', event => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    x = event.clientX;
    y = event.clientY;
    setVisible(true);
    setMode(event.target);
  }, { passive:true });

  document.addEventListener('pointerover', event => setMode(event.target), { passive:true });

  document.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    mark.classList.add('is-pressed');
    frame.classList.add('is-pressed');
  }, { passive:true });

  const release = () => {
    mark.classList.remove('is-pressed');
    frame.classList.remove('is-pressed');
  };

  document.addEventListener('pointerup',release,{ passive:true });
  document.addEventListener('pointercancel',release,{ passive:true });

  document.documentElement.addEventListener('mouseleave',() => setVisible(false),{ passive:true });
  addEventListener('blur',() => {
    release();
    setVisible(false);
    setMode(null);
  },{ passive:true });

  render();
})();
