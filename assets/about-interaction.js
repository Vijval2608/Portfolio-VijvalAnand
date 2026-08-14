(() => {
  'use strict';

  const card = document.querySelector('[data-about-tilt]');
  if (!card) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarse = window.matchMedia('(hover: none), (pointer: coarse)');
  const animeCard = document.querySelector('.about-anime-card');
  const animeTrigger = document.querySelector('.about-anime-trigger');

  // ---------------- 3D pointer tilt ----------------
  let frame = 0;
  let targetX = 0;
  let targetY = 0;
  let targetGlowX = 50;
  let targetGlowY = 40;
  let currentX = 0;
  let currentY = 0;
  let currentGlowX = 50;
  let currentGlowY = 40;
  let targetShadowX = 0;
  let targetShadowY = 0;
  let currentShadowX = 0;
  let currentShadowY = 0;
  let targetShadowScale = 1;
  let currentShadowScale = 1;
  const perspective = card.closest('.about-portrait-perspective');

  const renderTilt = () => {
    currentX += (targetX - currentX) * .12;
    currentY += (targetY - currentY) * .12;
    currentGlowX += (targetGlowX - currentGlowX) * .15;
    currentGlowY += (targetGlowY - currentGlowY) * .15;
    currentShadowX += (targetShadowX - currentShadowX) * .13;
    currentShadowY += (targetShadowY - currentShadowY) * .13;
    currentShadowScale += (targetShadowScale - currentShadowScale) * .13;

    card.style.setProperty('--tilt-x', `${currentX.toFixed(3)}deg`);
    card.style.setProperty('--tilt-y', `${currentY.toFixed(3)}deg`);
    card.style.setProperty('--glow-x', `${currentGlowX.toFixed(2)}%`);
    card.style.setProperty('--glow-y', `${currentGlowY.toFixed(2)}%`);
    card.style.setProperty('--edge-light', `${(0.10 + Math.min(0.12, (Math.abs(currentX)+Math.abs(currentY))*.008)).toFixed(3)}`);

    if (perspective) {
      perspective.style.setProperty('--portrait-shadow-x', `${currentShadowX.toFixed(2)}px`);
      perspective.style.setProperty('--portrait-shadow-y', `${currentShadowY.toFixed(2)}px`);
      perspective.style.setProperty('--portrait-shadow-scale', currentShadowScale.toFixed(3));
    }

    const moving =
      Math.abs(targetX - currentX) > .02 ||
      Math.abs(targetY - currentY) > .02 ||
      Math.abs(targetGlowX - currentGlowX) > .08 ||
      Math.abs(targetGlowY - currentGlowY) > .08 ||
      Math.abs(targetShadowX - currentShadowX) > .08 ||
      Math.abs(targetShadowY - currentShadowY) > .08 ||
      Math.abs(targetShadowScale - currentShadowScale) > .002;

    frame = moving ? requestAnimationFrame(renderTilt) : 0;
  };

  const requestTiltFrame = () => {
    if (!frame) frame = requestAnimationFrame(renderTilt);
  };

  if (!reduced.matches && !coarse.matches) {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

      // Deliberately a little more expressive than the previous pass:
      // enough movement to immediately communicate "3D", still restrained.
      targetY = (px - .5) * 14;
      targetX = (.5 - py) * 11.5;
      targetGlowX = px * 100;
      targetGlowY = py * 100;
      targetShadowX = (.5 - px) * 17;
      targetShadowY = 3 + py * 5;
      targetShadowScale = .94 + py * .08;
      requestTiltFrame();
    });

    card.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
      targetGlowX = 50;
      targetGlowY = 40;
      targetShadowX = 0;
      targetShadowY = 0;
      targetShadowScale = 1;
      requestTiltFrame();
    });
  }

  // ---------------- brief TV-static pulses ----------------
  let isVisible = false;
  let staticTimer = 0;
  let pulseTimers = [];

  const clearPulseTimers = () => {
    pulseTimers.forEach(clearTimeout);
    pulseTimers = [];
  };

  const pulse = () => {
    if (!isVisible || reduced.matches) return;

    clearPulseTimers();
    const sequence = [
      [0, 78],
      [115, 48],
      [205, 96],
      [355, 58]
    ];

    sequence.forEach(([delay, length]) => {
      pulseTimers.push(setTimeout(() => card.classList.add('is-static'), delay));
      pulseTimers.push(setTimeout(() => card.classList.remove('is-static'), delay + length));
    });
  };

  const scheduleStatic = () => {
    clearTimeout(staticTimer);
    if (!isVisible || reduced.matches) return;
    const nextDelay = 4700 + Math.random() * 3300;
    staticTimer = setTimeout(() => {
      pulse();
      scheduleStatic();
    }, nextDelay);
  };

  const visibilityObserver = new IntersectionObserver((entries) => {
    const entry = entries[0];
    isVisible = !!entry?.isIntersecting;
    if (isVisible) {
      scheduleStatic();
    } else {
      clearTimeout(staticTimer);
      clearPulseTimers();
      card.classList.remove('is-static');
    }
  }, { threshold:[0,.15] });

  visibilityObserver.observe(card);

  // ---------------- Kagurabachi glass detail ----------------
  if (animeCard && animeTrigger) {
    animeTrigger.addEventListener('click', (event) => {
      event.preventDefault();
      const open = animeCard.classList.toggle('is-open');
      animeTrigger.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('pointerdown', (event) => {
      if (!animeCard.contains(event.target)) {
        animeCard.classList.remove('is-open');
        animeTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    animeTrigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        const open = animeCard.classList.toggle('is-open');
        animeTrigger.setAttribute('aria-expanded', String(open));
        return;
      }

      if (event.key === 'Escape') {
        animeCard.classList.remove('is-open');
        animeTrigger.setAttribute('aria-expanded', 'false');
        animeTrigger.blur();
      }
    });
  }
})();