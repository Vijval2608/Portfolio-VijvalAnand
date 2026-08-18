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
  let lastFrameTime = performance.now();

  const horizontal = {
    enabled: false,
    start: 0,
    distance: 1,
    travel: 0,
    targetProgress: 0,
    currentProgress: 0
  };

  const readNumber = (name, fallback) => {
    const value = parseFloat(getComputedStyle(section).getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  };

  const clamp01 = (value) => Math.max(0, Math.min(1, value));

  const setFilmX = (x) => {
    const safeX = Math.round(x * 1000) / 1000;
    film.style.transform = `translate3d(${safeX}px,0,0)`;
  };

  const rawProgress = () =>
    clamp01((window.scrollY - horizontal.start) / horizontal.distance);

  const renderHorizontal = (now) => {
    horizontalRaf = 0;
    if (!horizontal.enabled) return;

    horizontal.targetProgress = rawProgress();

    /* Native vertical momentum remains the source of truth. We only smooth the
       film's visual catch-up with a frame-rate-independent exponential filter.
       This removes wheel-step jitter without swallowing trackpad momentum. */
    const dt = Math.min(40, Math.max(8, now - lastFrameTime));
    lastFrameTime = now;
    const alpha = 1 - Math.exp(-dt * 0.024);

    if (horizontal.targetProgress <= 0.0005) {
      horizontal.currentProgress = 0;
    } else if (horizontal.targetProgress >= 0.9995) {
      horizontal.currentProgress = 1;
    } else {
      horizontal.currentProgress +=
        (horizontal.targetProgress - horizontal.currentProgress) * alpha;
    }

    setFilmX(-horizontal.travel * horizontal.currentProgress);

    if (
      Math.abs(horizontal.targetProgress - horizontal.currentProgress) > 0.00008
    ) {
      horizontalRaf = requestAnimationFrame(renderHorizontal);
    }
  };

  const requestHorizontalUpdate = () => {
    if (!horizontal.enabled) return;
    horizontal.targetProgress = rawProgress();
    if (!horizontalRaf) {
      lastFrameTime = performance.now();
      horizontalRaf = requestAnimationFrame(renderHorizontal);
    }
  };

  const measurePinStart = () =>
    pinWrap.getBoundingClientRect().top + window.scrollY;

  const computeTravel = () => {
    const viewportWidth = stage.clientWidth || window.innerWidth;
    const lastCard = film.querySelector('.figma-film-card-last');
    if (!lastCard) return 0;

    const lastCardRight =
      film.offsetLeft + lastCard.offsetLeft + lastCard.offsetWidth;
    const endGap = Math.max(54, Math.min(90, viewportWidth * 0.05));
    return Math.max(0, lastCardRight - viewportWidth + endGap);
  };

  const syncHorizontalMetrics = () => {
    if (!horizontal.enabled) return;
    horizontal.start = measurePinStart();
    horizontal.distance = Math.max(1, pinWrap.offsetHeight - stage.offsetHeight);
    horizontal.travel = computeTravel();
    horizontal.targetProgress = rawProgress();
    horizontal.currentProgress = horizontal.targetProgress;
    setFilmX(-horizontal.travel * horizontal.currentProgress);
  };

  const clearMotion = () => {
    if (introTimeline) {
      introTimeline.scrollTrigger?.kill();
      introTimeline.kill();
      introTimeline = null;
    }

    horizontal.enabled = false;
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

    /* Considerably shorter runway than v112. One vertical momentum gesture now
       carries much farther through the horizontal film instead of requiring
       repeated wheel/trackpad inputs. */
    const horizontalDistance = Math.max(
      travel * 0.72,
      window.innerHeight * 1.65
    );

    pinWrap.style.height =
      `${Math.ceil(stage.offsetHeight + horizontalDistance)}px`;

    horizontal.enabled = true;
    horizontal.start = measurePinStart();
    horizontal.distance = Math.max(
      1,
      pinWrap.offsetHeight - stage.offsetHeight
    );
    horizontal.travel = travel;
    horizontal.targetProgress = rawProgress();
    horizontal.currentProgress = horizontal.targetProgress;

    setFilmX(-horizontal.travel * horizontal.currentProgress);
  };

  const refreshSafely = () => {
    setup();
    requestAnimationFrame(() => {
      window.ScrollTrigger?.refresh();
      requestAnimationFrame(syncHorizontalMetrics);
    });
  };

  window.addEventListener('scroll', requestHorizontalUpdate, { passive: true });
  window.addEventListener(
    'pageshow',
    () => requestAnimationFrame(syncHorizontalMetrics)
  );
  window.addEventListener(
    'load',
    () => requestAnimationFrame(syncHorizontalMetrics),
    { once: true }
  );

  setup();

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        window.ScrollTrigger?.refresh();
        syncHorizontalMetrics();
      });
    });
  }

  window.addEventListener(
    'resize',
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refreshSafely, 180);
    },
    { passive: true }
  );

  requestAnimationFrame(() =>
    requestAnimationFrame(syncHorizontalMetrics)
  );
})();
