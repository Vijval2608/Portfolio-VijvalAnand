(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reducedMotion.matches) return;

  // Uses the independent CSS `scale` property so this never replaces the
  // transform stacks used for rotations, note positioning, etc.
  if (!('scale' in document.documentElement.style)) return;

  // IMPORTANT: How I Work is deliberately absent. That section owns its own
  // horizontal-scroll motion and receives no viewport spring animation.
  const groups = [
    {
      root: '.figma-hero-section',
      selectors: [
        '.figma-role-label',
        '.figma-name-first',
        '.figma-name-last',
        '.figma-years',
        '.figma-intro',
        '.figma-actions',
        '.figma-computer',
        '.figma-music-card'
      ]
    },
    {
      root: '.figma-work-section',
      selectors: [
        '.figma-work-heading',
        '.figma-work-list',
        '.figma-work-preview-wrap'
      ]
    },
    {
      root: '.figma-skills-section',
      selectors: [
        '.figma-skills-kicker',
        '.figma-skills-title',
        '.figma-sticky-wrap',
        '.figma-skills-window'
      ]
    },
    {
      root: '.experience-section',
      selectors: [
        '.section-heading > div',
        '.section-heading > p',
        '.career-item'
      ]
    },
    {
      root: '.about-section-v2',
      selectors: [
        '.about-head-main',
        '.about-head-note',
        '.about-portrait-wrap',
        '.about-lead-v2',
        '.about-design-belief',
        '.about-brain-note',
        '.about-personal-card',
        '.about-meta-rail'
      ]
    },
    {
      root: '.contact-section',
      selectors: [
        '.contact-top',
        '.contact-card > h2',
        '.contact-bottom'
      ]
    }
  ];

  const records = new Map();
  const SMALL_SCALE = 0.958;
  const REST_SCALE = 1;
  const OVERSHOOT = 1.0075;
  const SETTLE = 0.9985;

  const readScale = (el) => {
    const value = getComputedStyle(el).scale;
    if (!value || value === 'none') return String(SMALL_SCALE);
    return value;
  };

  const freezeAtCurrentScale = (el) => {
    const current = readScale(el);
    el.style.scale = current;
    return current;
  };

  const cancelRunning = (record) => {
    if (!record.animation) return;
    freezeAtCurrentScale(record.el);
    record.animation.cancel();
    record.animation = null;
  };

  const springIn = (record) => {
    if (record.state === 'in') return;
    cancelRunning(record);

    const el = record.el;
    const from = readScale(el);
    const delay = Math.min(record.order * 42, 150);

    record.state = 'in';
    const animation = el.animate([
      { scale: from, offset: 0 },
      { scale: String(OVERSHOOT), offset: 0.72 },
      { scale: String(SETTLE), offset: 0.89 },
      { scale: String(REST_SCALE), offset: 1 }
    ], {
      duration: 700,
      delay,
      easing: 'cubic-bezier(.18,.76,.22,1)',
      fill: 'both'
    });

    record.animation = animation;
    animation.finished.then(() => {
      if (record.animation !== animation) return;
      el.style.scale = String(REST_SCALE);
      animation.cancel();
      record.animation = null;
    }).catch(() => {});
  };

  const shrinkOut = (record) => {
    if (record.state === 'out') return;
    cancelRunning(record);

    const el = record.el;
    const from = readScale(el);
    record.state = 'out';

    const animation = el.animate([
      { scale: from },
      { scale: String(SMALL_SCALE) }
    ], {
      duration: 420,
      easing: 'cubic-bezier(.34,0,.22,1)',
      fill: 'both'
    });

    record.animation = animation;
    animation.finished.then(() => {
      if (record.animation !== animation) return;
      el.style.scale = String(SMALL_SCALE);
      animation.cancel();
      record.animation = null;
    }).catch(() => {});
  };

  const addElement = (el, order, origin = 'center') => {
    if (!el || records.has(el)) return;

    el.dataset.sectionSpring = '';
    if (origin !== 'center') el.dataset.sectionSpringOrigin = origin;

    // CSS already supplies SMALL_SCALE before JS executes. Setting it inline
    // here simply makes the animation state deterministic after restoration.
    el.style.scale = String(SMALL_SCALE);

    records.set(el, {
      el,
      order,
      state: 'out',
      animation: null
    });
  };

  groups.forEach((group) => {
    const root = document.querySelector(group.root);
    if (!root) return;

    let order = 0;
    group.selectors.forEach((selector) => {
      root.querySelectorAll(selector).forEach((el) => {
        let origin = 'center';
        if (
          el.matches('.figma-role-label, .figma-name-first, .figma-name-last, .figma-intro, .figma-actions, .figma-work-heading, .figma-skills-kicker, .figma-skills-title, .section-heading > div, .section-heading > p, .about-head-main, .about-head-note, .about-lead-v2, .about-design-belief, .about-brain-note, .about-personal-card, .about-meta-rail, .contact-top, .contact-card > h2, .contact-bottom')
        ) {
          origin = 'left';
        }
        addElement(el, order, origin);
        order += 1;
      });
    });
  });

  if (!records.size) return;

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const record = records.get(entry.target);
      if (!record) continue;

      // Spring to normal size once the component meaningfully enters.
      // Keep it at exactly 1 for the whole visible period. Only scale down
      // after it has actually left the viewport.
      if (entry.isIntersecting && entry.intersectionRatio >= 0.08) {
        springIn(record);
      } else if (!entry.isIntersecting) {
        shrinkOut(record);
      }
    }
  }, {
    root: null,
    rootMargin: '0px',
    threshold: [0, 0.08, 0.2, 0.5]
  });

  records.forEach((record) => observer.observe(record.el));

  // Browser restoration / resize can change geometry without a clean
  // IntersectionObserver transition. Re-establish only truly off-screen
  // elements as small; visible elements are left under observer control.
  const resync = () => {
    records.forEach((record) => {
      const rect = record.el.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < window.innerHeight;
      if (!visible) shrinkOut(record);
    });
  };

  window.addEventListener('pageshow', () => requestAnimationFrame(resync), { passive: true });
  window.addEventListener('resize', () => requestAnimationFrame(resync), { passive: true });
})();
