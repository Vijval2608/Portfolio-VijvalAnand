(() => {
  const nav = document.querySelector('.figma-nav');
  const toggle = nav?.querySelector('.figma-mobile-menu-icon');
  if (!nav || !toggle) return;

  /* Phone uses the existing compact nav. Portrait tablets through 900px use
     the same interaction model, while landscape tablets stay desktop-like. */
  const compactNav = window.matchMedia(
    '(max-width: 600px), (min-width: 601px) and (max-width: 900px) and (orientation: portrait)'
  );

  const setOpen = (open) => {
    const next = Boolean(open && compactNav.matches);
    nav.classList.toggle('is-mobile-open', next);
    toggle.setAttribute('aria-expanded', String(next));
    toggle.setAttribute('aria-label', next ? 'Close navigation menu' : 'Open navigation menu');
  };

  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(!nav.classList.contains('is-mobile-open'));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-mobile-open')) {
      setOpen(false);
      toggle.focus();
    }
  });

  const handleBreakpoint = () => {
    if (!compactNav.matches) setOpen(false);
  };

  if (typeof compactNav.addEventListener === 'function') {
    compactNav.addEventListener('change', handleBreakpoint);
  } else if (typeof compactNav.addListener === 'function') {
    compactNav.addListener(handleBreakpoint);
  }
})();
