(() => {
  const section = document.querySelector('.figma-process-section');
  const intro = section?.querySelector('.figma-process-intro');
  const pinWrap = section?.querySelector('.figma-process-pin-wrap');
  const stage = section?.querySelector('.figma-process-stage');
  const film = section?.querySelector('#figma-process-film');
  const kicker = section?.querySelector('.figma-process-kicker');
  const title = section?.querySelector('.figma-process-title');
  const note = section?.querySelector('.figma-process-note');
  if (!section || !intro || !pinWrap || !stage || !film) return;

  // Keep the sprocket rail crisp and deployment-independent.
  section.querySelectorAll('.figma-film-perfs').forEach((row) => {
    if (row.children.length) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 146; i += 1) frag.appendChild(document.createElement('i'));
    row.appendChild(frag);
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let introTimeline = null;
  let resizeTimer = 0;
  let horizontalRaf = 0;

  // Horizontal state is deliberately independent from ScrollTrigger's scrub
  // tween. One vertical scroll position always maps to one exact film X value,
  // so reversing direction cannot leave an animation lagging behind the page.
  const horizontal = {
    enabled: false,
    start: 0,
    distance: 1,
    travel: 0,
    lastProgress: -1
  };

  const readNumber = (name, fallback) => {
    const value = parseFloat(getComputedStyle(section).getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  };

  const clamp01 = (value) => Math.max(0, Math.min(1, value));

  const setFilmX = (x) => {
    // Direct translate3d avoids a second animation clock fighting scroll.
    // Rounding only to 1/100 px keeps high-DPI trackpad movement fluid.
    const safeX = Math.round(x * 100) / 100;
    film.style.transform = `translate3d(${safeX}px,0,0)`;
  };

  const updateHorizontalNow = () => {
    horizontalRaf = 0;
    if (!horizontal.enabled) return;

    const progress = clamp01((window.scrollY - horizontal.start) / horizontal.distance);
    if (Math.abs(progress - horizontal.lastProgress) < 0.00001) return;

    horizontal.lastProgress = progress;
    setFilmX(-horizontal.travel * progress);
  };

  const requestHorizontalUpdate = () => {
    if (!horizontal.enabled || horizontalRaf) return;
    horizontalRaf = requestAnimationFrame(updateHorizontalNow);
  };

  const measurePinStart = () => pinWrap.getBoundingClientRect().top + window.scrollY;

  const computeTravel = () => {
    const viewportWidth = stage.clientWidth || window.innerWidth;
    const lastCard = film.querySelector('.figma-film-card-last');
    if (!lastCard) return 0;

    const lastCardRight = film.offsetLeft + lastCard.offsetLeft + lastCard.offsetWidth;
    const endGap = Math.max(54, Math.min(90, viewportWidth * 0.05));
    return Math.max(0, lastCardRight - viewportWidth + endGap);
  };

  const syncHorizontalMetrics = () => {
    if (!horizontal.enabled) return;
    horizontal.start = measurePinStart();
    horizontal.distance = Math.max(1, pinWrap.offsetHeight - stage.offsetHeight);
    horizontal.travel = computeTravel();
    horizontal.lastProgress = -1;
    updateHorizontalNow();
  };

  const clearMotion = () => {
    if (introTimeline) {
      introTimeline.scrollTrigger?.kill();
      introTimeline.kill();
      introTimeline = null;
    }

    horizontal.enabled = false;
    horizontal.lastProgress = -1;
    if (horizontalRaf) {
      cancelAnimationFrame(horizontalRaf);
      horizontalRaf = 0;
    }

    pinWrap.style.removeProperty('height');
    film.style.removeProperty('transform');

    if (window.gsap) {
      [kicker, title, note]
        .filter(Boolean)
        .forEach((el) => gsap.set(el, { clearProps: 'transform' }));
    }
  };

  const setup = () => {
    clearMotion();

    const breakpoint = readNumber('--fp-desktop-breakpoint', 774);
    if (reducedMotion || window.innerWidth < breakpoint) return;

    // The intro remains ScrollTrigger-driven; it has no pin and therefore
    // doesn't participate in the horizontal lock/re-entry problem.
    if (window.gsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.config({ force3D: true, nullTargetWarn: false });

      introTimeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: intro,
          start: () => `top ${Math.max(0, window.innerHeight - 150)}px`,
          end: () => `top -${Math.round(window.innerHeight * 0.48)}px`,
          scrub: 0.38,
          invalidateOnRefresh: true,
          refreshPriority: 2
        }
      });

      if (kicker) introTimeline.fromTo(kicker, { y: 0 }, { y: -315 }, 0);
      if (title) introTimeline.fromTo(title, { y: 0 }, { y: -360 }, 0);
      if (note) introTimeline.fromTo(note, { y: 0 }, { y: -704 }, 0);
    }

    const travel = computeTravel();
    const horizontalDistance = Math.max(travel * 1.18, window.innerHeight * 4.2);

    // Native sticky owns the lock. The runway length is exactly the duration
    // of horizontal travel plus one viewport, so it releases at progress 1
    // and re-locks at the same point when scrolling upward.
    pinWrap.style.height = `${Math.ceil(stage.offsetHeight + horizontalDistance)}px`;

    horizontal.enabled = true;
    horizontal.start = measurePinStart();
    horizontal.distance = Math.max(1, pinWrap.offsetHeight - stage.offsetHeight);
    horizontal.travel = travel;
    horizontal.lastProgress = -1;

    // Important for reloads/history restoration and for entering from below.
    updateHorizontalNow();
  };

  const refreshSafely = () => {
    setup();
    requestAnimationFrame(() => {
      window.ScrollTrigger?.refresh();
      requestAnimationFrame(syncHorizontalMetrics);
    });
  };

  // One passive listener for the entire lifetime of the page. It does not
  // accumulate across resize/setup calls.
  window.addEventListener('scroll', requestHorizontalUpdate, { passive: true });

  // Page lifecycle events can change layout without a user scroll. Re-measure
  // and immediately place the film at the correct progress afterwards.
  window.addEventListener('pageshow', () => requestAnimationFrame(syncHorizontalMetrics));
  window.addEventListener('load', () => requestAnimationFrame(syncHorizontalMetrics), { once: true });

  setup();

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        window.ScrollTrigger?.refresh();
        syncHorizontalMetrics();
      });
    });
  }

  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(refreshSafely, 180);
  }, { passive: true });

  // Some browsers restore scroll position after the synchronous setup call.
  requestAnimationFrame(() => requestAnimationFrame(syncHorizontalMetrics));
})();
