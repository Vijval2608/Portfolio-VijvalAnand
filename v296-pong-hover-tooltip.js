(() => {
  'use strict';

  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const computer = document.querySelector('.figma-computer-artboard');
  if (!fine || !computer) return;

  const bubble = document.createElement('span');
  bubble.className = 'v296-pong-cursor-tooltip';
  bubble.textContent = 'psst... wanna play pong?';
  bubble.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bubble);

  let x = innerWidth * .5;
  let y = innerHeight * .5;
  let hovering = false;
  let visible = false;
  let raf = 0;
  let lastX = NaN;
  let lastY = NaN;
  let tooltipWidth = 0;

  const CURSOR_RIGHT_OFFSET = 15;
  const CURSOR_TOP_OFFSET = 13;
  const VIEWPORT_GUTTER = 10;

  const measureTooltip = () => {
    tooltipWidth = bubble.offsetWidth || tooltipWidth || 170;
  };

  const pongActive = () => computer.classList.contains('v204-pong-active');

  const syncVisibility = () => {
    const next = hovering && !pongActive() && !document.hidden;
    if (visible === next) return;
    visible = next;
    bubble.classList.toggle('is-visible', next);
  };

  const render = () => {
    raf = 0;
    if (!hovering && !visible) return;

    // Anchor the tooltip from the pointer's upper-right edge instead of
    // centering it above the cursor. It grows outward to the right and only
    // flips leftward near the viewport edge to avoid clipping.
    const naturalX = x + CURSOR_RIGHT_OFFSET;
    const maxX = innerWidth - (tooltipWidth || 170) - VIEWPORT_GUTTER;
    const bx = Math.max(VIEWPORT_GUTTER, Math.min(maxX, naturalX));
    const by = Math.max(34, y - CURSOR_TOP_OFFSET);
    if (bx !== lastX || by !== lastY) {
      lastX = bx;
      lastY = by;
      bubble.style.transform =
        `translate3d(${bx}px,${by}px,0) translateY(-100%)${reduced ? '' : ' scale(1)'}`;
    }
    syncVisibility();
  };

  const requestFrame = () => {
    if (!raf && !document.hidden) raf = requestAnimationFrame(render);
  };

  const sample = event => {
    if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
    x = event.clientX;
    y = event.clientY;
    requestFrame();
  };

  computer.addEventListener('pointerenter', event => {
    hovering = true;
    measureTooltip();
    sample(event);
    syncVisibility();
  }, { passive:true });

  computer.addEventListener('pointermove', sample, { passive:true });

  computer.addEventListener('pointerleave', () => {
    hovering = false;
    syncVisibility();
  }, { passive:true });

  // Clicking the computer enters Pong through the existing Pong controller;
  // hide the hint immediately once that state begins, and restore it if Pong
  // later exits while the pointer is still over the computer.
  const stateObserver = new MutationObserver(() => {
    syncVisibility();
    requestFrame();
  });
  stateObserver.observe(computer, { attributes:true, attributeFilter:['class'] });

  addEventListener('resize', () => {
    measureTooltip();
    requestFrame();
  }, { passive:true });

  document.addEventListener('visibilitychange', syncVisibility, { passive:true });
  addEventListener('blur', () => {
    hovering = false;
    syncVisibility();
  }, { passive:true });
})();
