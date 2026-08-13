(() => {
  const section = document.querySelector('.figma-process-section');
  const stage = section?.querySelector('.figma-process-stage');
  const film = document.querySelector('#figma-process-film');
  if (!section || !stage || !film) return;

  // The extended strip contains a leading blank + four process frames +
  // a trailing blank. The perforations are intentionally smaller and closer
  // together so the physical tape is shorter without shrinking the cards.
  section.querySelectorAll('.figma-film-perfs').forEach((row) => {
    if (row.children.length) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 169; i += 1) {
      frag.appendChild(document.createElement('i'));
    }
    row.appendChild(frag);
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let tween = null;
  let resizeTimer = 0;

  const readNumber = (name, fallback) => {
    const value = parseFloat(getComputedStyle(section).getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  };

  const clearMotion = () => {
    if (tween) {
      tween.scrollTrigger?.kill();
      tween.kill();
      tween = null;
    }
    if (window.gsap) gsap.set(film, { x: 0 });
  };

  const setup = () => {
    clearMotion();

    const breakpoint = readNumber('--fp-desktop-breakpoint', 860);
    if (!window.gsap || !window.ScrollTrigger || reducedMotion || window.innerWidth < breakpoint) {
      section.style.removeProperty('--fp-film-fit-scale');
      film.style.removeProperty('top');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Keep the tape at a deterministic size. Its vertical footprint is shorter
    // because the perforations and rail spacing are smaller, not because the
    // whole component is being viewport-scaled.
    section.style.removeProperty('--fp-film-fit-scale');
    film.style.removeProperty('top');

    const rect = film.getBoundingClientRect();
    const endBreathingRoom = 31;
    const travel = Math.max(0, rect.right - window.innerWidth + endBreathingRoom);

    tween = gsap.to(film, {
      x: -travel,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        // Pin a little later, after more of the section has entered the viewport.
        start: 'top top-=120px',
        end: () => `+=${Math.max(travel * 1.08, window.innerHeight * 3.05)}`,
        pin: stage,
        scrub: 1.05,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });
  };

  setup();

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(setup, 120);
  }, { passive: true });
})();
