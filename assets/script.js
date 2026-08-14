const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion) document.documentElement.classList.add('no-motion-engine');

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// Mobile menu
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
if (menuButton && mobileMenu) {
  const closeMenu = () => {
    menuButton.classList.remove('active');
    menuButton.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = !mobileMenu.classList.contains('open');
    menuButton.classList.toggle('active', isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.classList.toggle('open', isOpen);
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    document.body.classList.toggle('menu-open', isOpen);
  });

  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
}

// Scroll progress + header state, updated through rAF for smoother scrolling.
const progressBar = document.querySelector('.scroll-progress span');
const siteHeader = document.querySelector('.site-header');
let scrollTicking = false;

const updateScrollUI = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
  if (siteHeader) siteHeader.classList.toggle('is-scrolled', window.scrollY > 25.2);
  scrollTicking = false;
};

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(updateScrollUI);
    scrollTicking = true;
  }
}, { passive: true });
updateScrollUI();

// Very soft cursor light on desktop.
const cursorGlow = document.querySelector('.cursor-glow');
if (cursorGlow && window.matchMedia('(pointer:fine)').matches && !prefersReducedMotion) {
  let gx = window.innerWidth / 2;
  let gy = window.innerHeight / 2;
  let tx = gx;
  let ty = gy;

  window.addEventListener('pointermove', (e) => {
    tx = e.clientX;
    ty = e.clientY;
    cursorGlow.style.opacity = '1';
  }, { passive: true });

  const animateGlow = () => {
    gx += (tx - gx) * 0.085;
    gy += (ty - gy) * 0.085;
    cursorGlow.style.transform = `translate3d(${gx - 180}px, ${gy - 180}px, 0)`;
    requestAnimationFrame(animateGlow);
  };
  animateGlow();
}

if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ force3D: true, nullTargetWarn: false });

  // Intro: intentionally calm. The content appears quickly and remains readable throughout.
  gsap.from('.site-header', {
    y: -16.2,
    opacity: 0,
    duration: .72,
    ease: 'back.out(1.18)',
    delay: .08
  });

  const heroTl = gsap.timeline({ defaults: { ease: 'back.out(1.16)' } });
  heroTl
    .from('.hero-eyebrow > span', { y: 9, opacity: 0, duration: .48, stagger: .06 }, .10)
    .from('.hero-title', { y: 27, opacity: 0, duration: .9 }, .12)
    .from('.hero-bottom', { y: 15.3, opacity: 0, duration: .68 }, .29)
    .from('.portrait-card', { y: 27, rotate: 3, scale: .975, opacity: 0, duration: .9 }, .23)
    .from('.floating-note', { y: 9, opacity: 0, scale: .97, duration: .55, stagger: .09 }, .58);

  // Bento cards scale smoothly into place while they cross the lower viewport.
  // The starting opacity/scale stay high so the section never feels hidden or hard to read.
  gsap.utils.toArray('.bento-reveal').forEach((card) => {
    gsap.fromTo(card,
      { scale: .955, y: 23.4, opacity: .78 },
      {
        scale: 1,
        y: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top 94%',
          end: 'top 69%',
          scrub: .75,
          invalidateOnRefresh: true
        }
      }
    );
  });

  // Headings and text use a softer one-time reveal instead of reversing on scroll-back.
  gsap.utils.toArray('.reveal-up').forEach((el) => {
    gsap.from(el, {
      y: 19.8,
      opacity: 0,
      duration: .78,
      ease: 'back.out(1.08)',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true
      }
    });
  });

  // A restrained perspective settle for the featured product visual.
  const dashboard = document.querySelector('.dashboard-art');
  const featured = document.querySelector('.project-card-featured');
  if (dashboard && featured) {
    gsap.fromTo(dashboard,
      { rotateX: 10, scale: .965, y: 21.6 },
      {
        rotateX: 3.5,
        scale: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: featured,
          start: 'top 76%',
          end: 'bottom 72%',
          scrub: .9
        }
      }
    );
  }

  // Subtle hero depth. Reduced from V1 so the layout feels calmer and more professional.
  gsap.to('.portrait-card', {
    y: -14.4,
    rotate: -.4,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1
    }
  });

  gsap.to('.note-a', {
    y: -21.6,
    x: -3.6,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.1 }
  });

  gsap.to('.note-b', {
    y: 17.1,
    x: 4.5,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.1 }
  });

  // Micro motion in the workflow cards. It only plays when visible and stays understated.
  gsap.utils.toArray('.principle-card').forEach((card) => {
    const pieces = card.querySelectorAll('.mini-diagram i, .mini-diagram b, .ship-stamp');
    if (!pieces.length) return;
    gsap.from(pieces, {
      y: 7.2,
      opacity: .35,
      stagger: .055,
      duration: .55,
      ease: 'power2.out',
      scrollTrigger: { trigger: card, start: 'top 78%', once: true }
    });
  });

  // Give images a tiny amount of scroll depth without moving the surrounding cards.
  gsap.utils.toArray('.project-image-wrap img').forEach((img) => {
    gsap.fromTo(img,
      { yPercent: -1.5, scale: 1.025 },
      {
        yPercent: 1.5,
        scale: 1.025,
        ease: 'none',
        scrollTrigger: {
          trigger: img.closest('.image-project'),
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2
        }
      }
    );
  });


  // V3 work showcase: vertical scrolling drives one calm horizontal project journey.
  // Desktop only; tablet/mobile keeps the projects in a normal readable stack.
  const workScroll = document.querySelector('[data-work-scroll]');
  const workStage = document.querySelector('.work-stage');
  const workTrack = document.querySelector('.work-track');
  const workProgress = document.querySelector('.work-progress-track span');
  const workCounter = document.querySelector('.work-counter b');
  const workPanels = gsap.utils.toArray('.work-panel');

  if (workScroll && workStage && workTrack && workPanels.length) {
    const workMM = gsap.matchMedia();

    workMM.add('(min-width: 774.9px)', () => {
      const getDistance = () => Math.max(0, workTrack.scrollWidth - window.innerWidth);
      const getDuration = () => Math.max(getDistance() * .9, window.innerHeight * 3.1);

      const horizontalTween = gsap.to(workTrack, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: workScroll,
          start: 'top top',
          end: () => `+=${getDuration()}`,
          pin: workStage,
          pinSpacing: true,
          scrub: .75,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (workProgress) gsap.set(workProgress, { scaleX: self.progress });
            if (workCounter) {
              const index = Math.min(workPanels.length - 1, Math.round(self.progress * (workPanels.length - 1)));
              workCounter.textContent = String(index + 1).padStart(2, '0');
            }
          }
        }
      });

      // Tiny visual settle as each card enters the viewport; content remains fully legible.
      workPanels.forEach((panel) => {
        gsap.fromTo(panel,
          { scale: .985 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              containerAnimation: horizontalTween,
              start: 'left 88%',
              end: 'left 55%',
              scrub: .65
            }
          }
        );
      });

      return () => {
        gsap.set(workTrack, { clearProps: 'transform' });
        if (workProgress) gsap.set(workProgress, { clearProps: 'transform' });
      };
    });
  }

  // Retro fusion: tactile details get a small spring when they first enter view.
  gsap.utils.toArray('.career-card, .skills-core').forEach((el) => {
    gsap.from(el, {
      y: 10.8,
      scale: .992,
      opacity: .6,
      duration: .62,
      ease: 'back.out(1.16)',
      scrollTrigger: { trigger: el, start: 'top 91%', once: true }
    });
  });

  // Process rail: a single progress line quietly activates each step.
  const processRail = document.querySelector('[data-process-rail]');
  const processLine = document.querySelector('.process-line span');
  const processSteps = gsap.utils.toArray('.process-step');
  if (processRail && processLine && processSteps.length) {
    gsap.to(processLine, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: processRail,
        start: 'top 72%',
        end: 'bottom 48%',
        scrub: .8,
        onUpdate: (self) => {
          processSteps.forEach((step, index) => {
            const threshold = index / Math.max(1, processSteps.length - 1);
            step.classList.toggle('is-active', self.progress + .08 >= threshold);
          });
        }
      }
    });
  }

  // Skills: stagger only the compact labels, not the entire layout.
  gsap.utils.toArray('.skill-row').forEach((row) => {
    const chips = row.querySelectorAll('.skill-chips span');
    if (!chips.length) return;
    gsap.from(chips, {
      y: 6.3,
      opacity: .45,
      duration: .48,
      stagger: .035,
      ease: 'back.out(1.2)',
      scrollTrigger: { trigger: row, start: 'top 82%', once: true }
    });
  });

  // Experience: the timeline grows with the reader and marks roles as they pass.
  const careerTimeline = document.querySelector('[data-career-timeline]');
  const careerLine = document.querySelector('.career-line span');
  const careerItems = gsap.utils.toArray('.career-item');
  if (careerTimeline && careerLine && careerItems.length) {
    gsap.to(careerLine, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: careerTimeline,
        start: 'top 70%',
        end: 'bottom 58%',
        scrub: .85,
        onUpdate: (self) => {
          careerItems.forEach((item, index) => {
            const threshold = index / Math.max(1, careerItems.length - 1);
            item.classList.toggle('is-active', self.progress + .07 >= threshold);
          });
        }
      }
    });
  }

  // Refresh after fonts/assets settle so trigger positions remain accurate.
  window.addEventListener('load', () => ScrollTrigger.refresh());
} else {
  document.documentElement.classList.add('no-motion-engine');
  // Fallback reveal if GSAP is unavailable or the user prefers reduced motion.
  const revealItems = document.querySelectorAll('.bento-reveal, .reveal-up');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .10 });

  revealItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(12.6px) scale(.985)';
    item.style.transition = 'opacity .62s ease, transform .62s cubic-bezier(.2,.75,.2,1)';
    observer.observe(item);
  });
}
