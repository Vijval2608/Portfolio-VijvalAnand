/* V287 — release Work video decoder memory when it cannot affect pixels. */
(() => {
  'use strict';
  const section = document.querySelector('.figma-work-section');
  const preview = document.querySelector('#figma-work-preview');
  if (!section || !preview) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let sectionVisible = false;
  let sectionNear = false;
  const unloadTimers = new WeakMap();

  const videos = () => [...preview.querySelectorAll('video.figma-work-video-preview')];

  function remember(video) {
    if (!video.dataset.v287MediaSrc) {
      const src = video.getAttribute('src');
      if (src) video.dataset.v287MediaSrc = src;
    }
  }

  function cancelUnload(video) {
    const timer = unloadTimers.get(video);
    if (timer) clearTimeout(timer);
    unloadTimers.delete(video);
  }

  function unload(video) {
    cancelUnload(video);
    remember(video);
    try { video.pause(); } catch (_) {}
    if (video.getAttribute('src')) {
      video.removeAttribute('src');
      video.preload = 'none';
      try { video.load(); } catch (_) {}
    }
  }

  function scheduleUnload(video, delay = 780) {
    cancelUnload(video);
    const timer = setTimeout(() => {
      const card = video.closest('.figma-work-card');
      if (!sectionVisible || !card?.classList.contains('is-front') || document.hidden) {
        unload(video);
      }
    }, delay);
    unloadTimers.set(video, timer);
  }

  function restore(video) {
    cancelUnload(video);
    remember(video);
    if (!video.getAttribute('src') && video.dataset.v287MediaSrc) {
      video.src = video.dataset.v287MediaSrc;
      video.preload = 'metadata';
      try { video.load(); } catch (_) {}
    }
  }

  function sync() {
    videos().forEach(video => {
      remember(video);
      const card = video.closest('.figma-work-card');
      const front = !!card?.classList.contains('is-front');
      const worklyReduced = reduced.matches && card?.dataset.stackProject === 'workly';

      if (sectionNear && front && !document.hidden) restore(video);

      if (sectionVisible && front && !document.hidden && !worklyReduced) {
        restore(video);
        video.play().catch(() => {});
      } else {
        try { video.pause(); } catch (_) {}
        if (!sectionVisible || !front || document.hidden) {
          scheduleUnload(video, sectionNear && !document.hidden ? 780 : 0);
        }
      }
    });
  }

  /* Pre-warm shortly before the section becomes visible, but don't keep video
     decoders resident throughout the rest of this long portfolio. */
  const nearObserver = new IntersectionObserver(([entry]) => {
    sectionNear = !!entry?.isIntersecting;
    sync();
  }, { rootMargin: '700px 0px', threshold: 0 });

  const visibleObserver = new IntersectionObserver(([entry]) => {
    sectionVisible = !!entry?.isIntersecting;
    sync();
  }, { rootMargin: '0px', threshold: 0 });

  nearObserver.observe(section);
  visibleObserver.observe(section);

  /* Existing Work logic owns stack order. We only respond after the is-front
     class changes, after its card animation has already been scheduled. */
  const cardObserver = new MutationObserver(sync);
  cardObserver.observe(preview, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['class']
  });

  document.addEventListener('visibilitychange', sync, { passive: true });
  if (reduced.addEventListener) reduced.addEventListener('change', sync);
  else reduced.addListener?.(sync);

  videos().forEach(remember);
  sync();
})();
