/* V251 — Footer Pong shortcut.
   The link exists only when the responsive layout actually renders the Hero
   computer. It scrolls home, lets the Hero finish re-entering, then starts Pong. */
(() => {
  'use strict';

  const link = document.querySelector('.footer-play-pong');
  const hero = document.querySelector('.figma-hero-section');
  const computer = hero?.querySelector('.figma-computer');
  const artboard = computer?.querySelector('.figma-computer-artboard');
  if (!link || !hero || !computer || !artboard) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let launchToken = 0;

  const computerIsRendered = () => {
    const style = getComputedStyle(computer);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = computer.getBoundingClientRect();
    return rect.width > 2 && rect.height > 2;
  };

  const syncAvailability = () => {
    link.classList.toggle('is-pong-available', computerIsRendered());
    link.setAttribute('aria-hidden', computerIsRendered() ? 'false' : 'true');
    link.tabIndex = computerIsRendered() ? 0 : -1;
  };

  const heroTop = () => {
    const rect = hero.getBoundingClientRect();
    return Math.max(0, rect.top + (window.scrollY || window.pageYOffset || 0));
  };

  const waitForHero = (token) => new Promise(resolve => {
    const started = performance.now();
    let stableFrames = 0;
    let previousY = window.scrollY || window.pageYOffset || 0;

    const frame = () => {
      if (token !== launchToken) return resolve(false);

      const y = window.scrollY || window.pageYOffset || 0;
      const target = heroTop();
      const nearTop = Math.abs(y - target) < 3;
      const stable = Math.abs(y - previousY) < .35;
      previousY = y;
      stableFrames = nearTop && stable ? stableFrames + 1 : 0;

      const heroBusy = hero.classList.contains('v242-hero-transitioning');
      if ((stableFrames >= 5 && !heroBusy) || performance.now() - started > 3400) {
        return resolve(true);
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });

  const enterPongWhenReady = (token, attempt = 0) => {
    if (token !== launchToken || !computerIsRendered()) return;
    const pong = window.VijvalPong;
    if (pong?.enter) {
      pong.enter();
      if (pong.isActive?.()) {
        try { artboard.focus({preventScroll:true}); } catch { artboard.focus(); }
        return;
      }
    }
    if (attempt < 18) setTimeout(() => enterPongWhenReady(token, attempt + 1), 90);
  };

  link.addEventListener('click', async event => {
    if (!computerIsRendered()) return;
    event.preventDefault();

    const token = ++launchToken;
    window.VijvalPong?.exit?.();
    window.scrollTo({
      top: heroTop(),
      behavior: reduced.matches ? 'auto' : 'smooth'
    });

    const ok = await waitForHero(token);
    if (!ok || token !== launchToken) return;

    /* The threshold controller may settle on the same frame its class clears;
       one extra paint keeps Pong from competing with that final commit. */
    requestAnimationFrame(() => requestAnimationFrame(() => enterPongWhenReady(token)));
  });

  syncAvailability();
  addEventListener('resize', syncAvailability, {passive:true});
  addEventListener('orientationchange', syncAvailability, {passive:true});
})();
