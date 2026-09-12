(() => {
  'use strict';
  const root = document.documentElement;

  const markInteractiveReady = () => root.classList.add('v288-interactive-ready');
  addEventListener('hero:intro-complete', markInteractiveReady, { once:true });

  // Pause purely decorative CSS animations when their section is well outside
  // the viewport. This does not touch transitions, interaction state, or JS.
  const sections = [...document.querySelectorAll('main > section, .site-footer')];
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        entry.target.classList.toggle('v288-section-paused', !entry.isIntersecting);
      }
    }, { rootMargin:'240px 0px 240px 0px', threshold:0 });
    sections.forEach(section => io.observe(section));
  }

  const applyRendererMode = detail => {
    const software = !!detail?.software;
    root.classList.toggle('v288-software-renderer', software);
    root.classList.toggle('v288-gpu-renderer', !software);
  };
  addEventListener('v288:renderer-mode', e => applyRendererMode(e.detail));
  if (typeof window.__v288SoftwareRenderer === 'boolean') {
    applyRendererMode({ software:window.__v288SoftwareRenderer });
  }
})();
