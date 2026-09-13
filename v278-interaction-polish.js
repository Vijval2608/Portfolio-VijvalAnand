(() => {
  'use strict';

  const illustration = document.querySelector('.figma-skills-window-custom');
  const buildCta = document.querySelector('#skills-build-cta');
  const codePanel = document.querySelector('#skills-code-panel');
  const codeContent = document.querySelector('#skills-code-content');
  const copyButton = document.querySelector('#skills-code-copy');
  const closeButton = document.querySelector('#skills-code-close');
  const pongHint = document.querySelector('#hero-pong-hint');

  /* V277 — copyable slice of the actual Skills rig: head + eyes cursor-follow. */
  const SKILLS_SNIPPET = `const head = root.querySelector('#skills-head-group');
const eyes = root.querySelector('#skills-eyes-group');

let blink = 1;
let hx = 0, hy = 0, ex = 0, ey = 0;
let thx = 0, thy = 0, tex = 0, tey = 0;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function matrixAround(cx, cy, angleDeg, tx, ty, scaleX = 1, scaleY = 1) {
  const r = angleDeg * Math.PI / 180;
  const c = Math.cos(r), s = Math.sin(r);
  const a = c * scaleX, b = s * scaleX;
  const cc = -s * scaleY, d = c * scaleY;
  const e = tx + cx - a * cx - cc * cy;
  const f = ty + cy - b * cx - d * cy;
  return \`matrix(\${a} \${b} \${cc} \${d} \${e} \${f})\`;
}

function pointerMove(ev) {
  const r = root.getBoundingClientRect();
  const nx = clamp((ev.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1);
  const ny = clamp((ev.clientY - (r.top + r.height / 2)) / (r.height / 2), -1, 1);

  // Head follows lightly; eyes travel a little further.
  thx = nx * 4.6;
  thy = ny * 3.45;
  tex = nx * 7.45;
  tey = ny * 4.45;
}

function updateHead(time) {
  hx += (thx - hx) * .12;
  hy += (thy - hy) * .12;
  ex += (tex - ex) * .12;
  ey += (tey - ey) * .12;

  const phase = (time / 2440) * Math.PI * 2;
  const angle = Math.sin(phase - .35) * 1.35;
  const nodY = ((Math.sin(phase - .15) + 1) * .5) * 2.05;

  head.setAttribute('transform', matrixAround(374, 327.3, angle, hx, hy + nodY));
  eyes.setAttribute('transform', matrixAround(362, 300, 0, ex, ey, 1, blink));
}

window.addEventListener('pointermove', pointerMove, { passive: true });`

  if (codeContent) codeContent.textContent = SKILLS_SNIPPET;

  /* V278 — Pong hint now lives inside .figma-actions and is positioned
     entirely with CSS variables so Vijval can tune it manually. */

  const setPanelOpen = open => {
    if (!codePanel || !illustration) return;
    codePanel.classList.toggle('is-open', open);
    codePanel.setAttribute('aria-hidden', String(!open));
    illustration.classList.toggle('is-code-open', open);

    if (open) {
      window.requestAnimationFrame(() => closeButton?.focus({ preventScroll:true }));
    } else {
      buildCta?.focus({ preventScroll:true });
    }
  };

  buildCta?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    setPanelOpen(true);
  });

  closeButton?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    setPanelOpen(false);
  });

  copyButton?.addEventListener('click', async event => {
    event.preventDefault();
    event.stopPropagation();

    let copied = false;
    try {
      await navigator.clipboard.writeText(SKILLS_SNIPPET);
      copied = true;
    } catch (_) {
      const area = document.createElement('textarea');
      area.value = SKILLS_SNIPPET;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try { copied = document.execCommand('copy'); } catch (_) {}
      area.remove();
    }

    copyButton.textContent = copied ? 'copied :)' : 'select + copy';
    window.setTimeout(() => {
      if (copyButton.isConnected) copyButton.textContent = 'copy';
    }, 1400);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && codePanel?.classList.contains('is-open')) {
      setPanelOpen(false);
    }
  });

  pongHint?.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    const pong = window.VijvalPong;
    if (pong?.enter) pong.enter();
  });
})();
