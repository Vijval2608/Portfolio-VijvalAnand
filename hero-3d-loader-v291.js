/* V291 — reliable/early startup wrapper around the proven V288 renderer.
   The renderer/model itself is intentionally untouched. */
(() => {
  'use strict';
  const root = document.documentElement;
  const desktop = matchMedia('(min-width:769px)');
  const bundleURL = new URL('./hero-3d-v288.js', document.currentScript.src).href;
  const MAX_MOUNT_ATTEMPTS = 3;
  const TOTAL_BUDGET_MS = 12000;
  let finished = false;
  let starting = false;
  let bundlePromise = null;
  let budgetTimer = 0;

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  const getArtboard = () => document.querySelector('.figma-computer-artboard');

  function status(artboard, state, message) {
    if (!artboard) return;
    artboard.dataset.modelStatus = state;
    let label = artboard.querySelector('.v258-model-status');
    if (!label) {
      label = document.createElement('span');
      label.className = 'v258-model-status';
      label.setAttribute('role', 'status');
      artboard.appendChild(label);
    }
    label.textContent = message || '';
    label.hidden = state === 'ready' || state === 'failed-open';
  }

  const signalReady = () => {
    if (finished) return;
    finished = true;
    clearTimeout(budgetTimer);
    window.__hero3DRuntimeReady = true;
    window.__hero3DRuntimeFailed = false;
    root.classList.add('v286-3d-ready');
    root.classList.remove('v291-3d-retrying');
    window.dispatchEvent(new CustomEvent('hero:3d-runtime-ready'));
  };

  const signalFailed = error => {
    if (finished) return;
    finished = true;
    clearTimeout(budgetTimer);
    window.__hero3DRuntimeFailed = true;
    root.classList.remove('v291-3d-retrying');
    const artboard = getArtboard();
    status(artboard, 'failed-open', '');
    console.warn('V291: 3D unavailable; releasing portfolio without blocking it.', error);
    window.dispatchEvent(new CustomEvent('hero:3d-runtime-failed', {
      detail: { message: error?.message || String(error || '3D failed') }
    }));
  };

  const canCreateWebGL2 = () => {
    try {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2', {
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: false
      });
      if (!gl) return false;
      try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch (_) {}
      return true;
    } catch (_) {
      return false;
    }
  };

  const loadBundle = (retryIndex = 0) => {
    if (window.VijvalHero3DBundle?.mountHeroModel) return Promise.resolve();
    if (bundlePromise && retryIndex === 0) return bundlePromise;

    bundlePromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.dataset.v291HeroBundle = String(retryIndex + 1);
      script.async = true;
      script.fetchPriority = 'high';
      script.src = retryIndex
        ? `${bundleURL}${bundleURL.includes('?') ? '&' : '?'}v291retry=${retryIndex}`
        : bundleURL;

      const timeout = setTimeout(() => {
        script.remove();
        reject(new Error('3D runtime download timed out.'));
      }, 6500);

      script.onload = () => {
        clearTimeout(timeout);
        if (window.VijvalHero3DBundle?.mountHeroModel) resolve();
        else reject(new Error('3D runtime loaded but did not initialize.'));
      };
      script.onerror = () => {
        clearTimeout(timeout);
        script.remove();
        reject(new Error('3D runtime could not be downloaded.'));
      };
      document.head.appendChild(script);
    });
    return bundlePromise;
  };

  const clearPartialState = artboard => {
    if (!artboard) return;
    // A successful renderer owns this canvas. A failed V288 mount normally
    // disposes before append, but clean any partial node defensively.
    if (!artboard.classList.contains('v258-model-ready')) {
      artboard.querySelectorAll('.v258-model-canvas').forEach(node => node.remove());
      window.VijvalHero3D = null;
    }
  };

  const start = async () => {
    if (!desktop.matches || finished || starting) {
      if (!desktop.matches) root.classList.remove('v286-3d-loading');
      return;
    }
    const artboard = getArtboard();
    if (!artboard) return;
    starting = true;
    status(artboard, 'loading', 'Booting 3D computer…');

    // Fast fail only for a browser that cannot create WebGL2 at all. Software
    // WebGL is allowed; the performance governor can simplify it later.
    if (!canCreateWebGL2()) {
      signalFailed(new Error('WebGL2 is unavailable in this browser session.'));
      return;
    }

    budgetTimer = setTimeout(() => {
      signalFailed(new Error('3D startup exceeded the V291 time budget.'));
    }, TOTAL_BUDGET_MS);

    let lastError = null;
    for (let attempt = 0; attempt < MAX_MOUNT_ATTEMPTS && !finished; attempt++) {
      try {
        if (attempt) {
          root.classList.add('v291-3d-retrying');
          status(artboard, 'loading', 'Retrying 3D computer…');
          await wait(attempt === 1 ? 350 : 850);
        }

        try {
          await loadBundle(attempt);
        } catch (downloadError) {
          // A failed script request may be transient. Permit the next attempt
          // to create a fresh request rather than reusing a rejected promise.
          bundlePromise = null;
          throw downloadError;
        }

        if (finished) return;
        clearPartialState(artboard);
        await window.VijvalHero3DBundle.mountHeroModel();

        if (
          !artboard.classList.contains('v258-model-ready') ||
          !window.VijvalHero3D?.renderer ||
          !window.VijvalHero3D?.model
        ) {
          throw new Error('3D renderer returned without a ready model.');
        }

        status(artboard, 'ready', '');
        // Same paint handoff as the approved V286/V288 startup: wait for the
        // actual model frame to make it through the compositor before intro.
        requestAnimationFrame(() => requestAnimationFrame(signalReady));
        return;
      } catch (error) {
        lastError = error;
        console.warn(`V291: 3D startup attempt ${attempt + 1} failed.`, error);
        clearPartialState(artboard);
      }
    }

    if (!finished) signalFailed(lastError || new Error('3D startup failed.'));
  };

  // This file is intentionally placed immediately after the computer DOM, so
  // the heavy V288 bundle can begin downloading while the rest of the page is
  // still being parsed.
  start();
  desktop.addEventListener('change', start);
})();
