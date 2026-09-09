(() => {
  'use strict';

  const root = document.documentElement;
  const nav = document.querySelector('.figma-nav');
  if (!nav) {
    root.classList.remove('v221-nav-pending');
    return;
  }

  const desktop = matchMedia('(min-width:769px)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!desktop || reduced) {
    root.classList.remove('v221-nav-pending');
    return;
  }

  const logo = nav.querySelector('.figma-nav-logo');
  const links = [...nav.querySelectorAll('.figma-nav-links a')];
  const actionItems = [...nav.querySelectorAll('.figma-nav-actions > *')];
  const mobileIcon = nav.querySelector('.figma-mobile-menu-icon');
  const contentItems = [logo, ...links, ...actionItems].filter(Boolean);

  let revealed = false;
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const shellEase = 'cubic-bezier(.20,.82,.20,1)';
  const contentEase = 'cubic-bezier(.16,1,.30,1)';

  const animateContentItem = (el, delay, duration) => {
    const animation = el.animate(
      [
        { opacity: 0, transform: 'translateY(1.5px) scale(.996)' },
        { opacity: .38, transform: 'translateY(.65px) scale(.9985)', offset: .36 },
        { opacity: .78, transform: 'translateY(.18px) scale(.9996)', offset: .70 },
        { opacity: 1, transform: 'translateY(0) scale(1)' }
      ],
      { duration, delay, easing: contentEase, fill: 'forwards' }
    );
    return animation.finished.catch(() => {});
  };

  const reveal = async (event) => {
    if (revealed) return;
    revealed = true;

    // V227: this is the exact duration of the Hero component reveal. Both
    // systems start on the same custom event and hand back control together.
    const sharedDuration = Math.max(1500, Number(event?.detail?.duration) || 2050);
    const startedAt = performance.now();

    const rect = nav.getBoundingClientRect();
    const fullWidth = rect.width;
    const navHeight = rect.height || 54;
    const pillWidth = Math.max(navHeight, 54);

    nav.classList.add('v223-nav-revealing', 'v223-shell-only');
    nav.style.width = `${pillWidth}px`;
    nav.style.opacity = '0';
    nav.style.visibility = 'visible';
    nav.style.pointerEvents = 'none';

    contentItems.forEach(el => {
      el.style.opacity = '0';
      el.style.visibility = 'hidden';
    });
    if (mobileIcon) {
      mobileIcon.style.opacity = '0';
      mobileIcon.style.visibility = 'hidden';
    }

    root.classList.remove('v221-nav-pending');

    // Empty shell materializes while the Hero planes start emerging.
    const fadeDuration = Math.round(sharedDuration * .13);
    await nav.animate(
      [{ opacity: 0 }, { opacity: .58, offset: .48 }, { opacity: 1 }],
      { duration: fadeDuration, easing: shellEase, fill: 'forwards' }
    ).finished.catch(() => {});

    await wait(Math.round(sharedDuration * .01));

    // Keep the navbar completely empty for the entire width transformation.
    const expandDuration = Math.round(sharedDuration * .38);
    await nav.animate(
      [
        { width: `${pillWidth}px` },
        { width: `${pillWidth + (fullWidth - pillWidth) * .28}px`, offset: .28 },
        { width: `${pillWidth + (fullWidth - pillWidth) * .76}px`, offset: .68 },
        { width: `${fullWidth}px` }
      ],
      { duration: expandDuration, easing: shellEase, fill: 'forwards' }
    ).finished.catch(() => {});
    nav.style.width = `${fullWidth}px`;

    await wait(Math.round(sharedDuration * .018));

    // Menu content resolves continuously while the Hero planes are completing
    // their spring settle. No blur filter is used, keeping glyphs crisp.
    nav.classList.remove('v223-shell-only');
    contentItems.forEach(el => {
      el.style.visibility = 'visible';
      el.style.opacity = '0';
    });

    const contentDuration = Math.round(sharedDuration * .39);
    const fades = [];
    if (logo) fades.push(animateContentItem(logo, 0, contentDuration));
    links.forEach((link, index) => {
      fades.push(animateContentItem(link, 26 + index * 27, contentDuration));
    });
    actionItems.forEach((item, index) => {
      fades.push(animateContentItem(item, 92 + index * 34, contentDuration));
    });
    await Promise.all(fades);

    // Keep the total shell/content sequence locked to the component duration.
    const elapsed = performance.now() - startedAt;
    if (elapsed < sharedDuration) await wait(sharedDuration - elapsed);

    contentItems.forEach(el => {
      el.style.opacity = '';
      el.style.visibility = '';
      el.style.transform = '';
      el.style.filter = '';
    });
    if (mobileIcon) {
      mobileIcon.style.opacity = '';
      mobileIcon.style.visibility = '';
    }
    nav.style.width = '';
    nav.style.opacity = '';
    nav.style.visibility = '';
    nav.style.pointerEvents = '';
    nav.style.overflow = '';
    nav.classList.remove('v223-nav-revealing');
  };

  addEventListener('hero:components-start', reveal, { once:true });

  // Safety for restored pages: if the full Hero intro already completed before
  // this script was ready, reveal normally rather than leaving navigation hidden.
  addEventListener('hero:intro-complete', event => {
    if (!revealed) reveal({detail:{duration:1200}});
  }, { once:true });

  requestAnimationFrame(() => {
    if (!root.classList.contains('hero-intro-pending') && !revealed) {
      reveal({detail:{duration:1200}});
    }
  });
})();
