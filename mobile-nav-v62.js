(() => {
  const nav = document.querySelector('.figma-nav');
  const toggle = nav?.querySelector('.figma-mobile-menu-icon');
  if (!nav || !toggle) return;

  const phone = window.matchMedia('(max-width: 600px)');

  const setOpen = (open) => {
    const next = Boolean(open && phone.matches);
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
    if (!phone.matches) setOpen(false);
  };

  if (typeof phone.addEventListener === 'function') {
    phone.addEventListener('change', handleBreakpoint);
  } else if (typeof phone.addListener === 'function') {
    phone.addListener(handleBreakpoint);
  }
})();
