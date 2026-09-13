/* V271 — v266 CRT sequence with startup-race guards.
   hero:computer-ready is authoritative; emergency timers may only run if that
   event never arrives, so they cannot race/reset the normal intro. */
(() => {
  const hero = document.querySelector('.figma-hero-section');
  const artboard = hero?.querySelector('.figma-computer-artboard');
  const screen = hero?.querySelector('.figma-computer-screen-wrap');
  const cursor = artboard?.querySelector('.figma-computer-cursor');
  const lines = artboard ? [...artboard.querySelectorAll('[data-computer-line]')] : [];
  if (!hero || !artboard || !screen || !cursor || lines.length !== 3) return;

  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FIGMA_W = 493;
  const FIGMA_H = 459;
  const originalTexts = lines.map(line => line.dataset.computerLine || line.textContent.trim());
  const specs = [
    { x:96.85, y:88.22, width:89.301, text:originalTexts[0] },
    { x:97,    y:121,   width:128,    text:originalTexts[1] },
    { x:97,    y:153,   width:125,    text:originalTexts[2] }
  ];

  const bootFrames = ['.','..','...','..','.','..','...','..','.'];
  let started = false;
  let bootTimer = 0;
  let bootFrame = 0;
  let normalTypingStarted = false;
  let motionSequenceStarted = false;

  const setCursorPosition = (x, y, lineIndex = -1) => {
    cursor.style.left = `${(x / FIGMA_W) * 100}%`;
    cursor.style.top = `${(y / FIGMA_H) * 100}%`;
    artboard.dataset.cursorLine = lineIndex >= 0 ? String(lineIndex) : '';
  };

  const measurePrefixRatio = (line, text, visibleCount) => {
    if (visibleCount <= 0) return 0;
    if (visibleCount >= text.length) return 1;
    const node = [...line.childNodes].find(n => n.nodeType === Node.TEXT_NODE);
    if (!node) return visibleCount / text.length;
    try {
      const range = document.createRange();
      range.setStart(node, 0);
      range.setEnd(node, visibleCount);
      const prefix = range.getBoundingClientRect().width;
      range.setStart(node, 0);
      range.setEnd(node, text.length);
      const full = range.getBoundingClientRect().width;
      if (full > 0) return Math.max(0, Math.min(1, prefix / full));
    } catch (_) {}
    return visibleCount / text.length;
  };

  const restoreOriginalTexts = () => {
    lines.forEach((line, i) => { line.textContent = originalTexts[i]; });
  };

  const hideAllCopy = () => {
    artboard.dataset.copyReady = 'false';
    artboard.dataset.cursorActive = 'false';
    artboard.dataset.cursorMode = 'blank';
    lines.forEach(line => {
      line.textContent = '';
      line.classList.remove('is-typing','is-complete','v262-boot-line','v264-boot-line');
      line.style.clipPath = 'inset(-24% 100% -24% 0)';
    });
  };

  const resetForTyping = () => {
    artboard.dataset.copyReady = 'false';
    artboard.dataset.cursorActive = 'false';
    artboard.dataset.cursorMode = 'typing';
    restoreOriginalTexts();
    lines.forEach(line => {
      line.classList.remove('is-typing','is-complete','v262-boot-line','v264-boot-line');
      line.style.clipPath = 'inset(-24% 100% -24% 0)';
    });
    setCursorPosition(specs[0].x, specs[0].y, 0);
  };

  const showBlankScreen = () => {
    clearInterval(bootTimer);
    bootTimer = 0;
    bootFrame = 0;
    hideAllCopy();
    screen.dataset.screenState = 'blank';
  };

  const startPowerOn = () => {
    if (normalTypingStarted) return;
    started = true;
    hideAllCopy();
    screen.dataset.screenState = 'powering';
  };

  const revealAll = () => {
    restoreOriginalTexts();
    lines.forEach(line => {
      line.classList.remove('v262-boot-line','v264-boot-line');
      line.classList.add('is-complete');
      line.style.clipPath = 'inset(-24% 0% -24% 0)';
    });
    screen.dataset.screenState = 'ready';
    artboard.dataset.cursorMode = 'final';
    artboard.dataset.cursorActive = 'true';
    setCursorPosition(97.00029, 169);
    artboard.dataset.copyReady = 'true';
  };

  const typeLine = (lineIndex, done) => {
    const line = lines[lineIndex];
    const spec = specs[lineIndex];
    if (!line || !spec) { done(); return; }

    const text = spec.text;
    let visible = 0;
    line.classList.add('is-typing');
    artboard.dataset.cursorMode = 'typing';
    artboard.dataset.cursorActive = 'true';
    setCursorPosition(spec.x, spec.y, lineIndex);

    const nextChar = () => {
      visible += 1;
      const ratio = measurePrefixRatio(line, text, visible);
      line.style.clipPath = `inset(-24% ${(100 - ratio * 100).toFixed(4)}% -24% 0)`;
      setCursorPosition(spec.x + spec.width * ratio + 1.15, spec.y, lineIndex);

      if (visible >= text.length) {
        line.classList.remove('is-typing');
        line.classList.add('is-complete');
        line.style.clipPath = 'inset(-24% 0% -24% 0)';
        if (lineIndex < lines.length - 1) {
          const nextSpec = specs[lineIndex + 1];
          window.setTimeout(() => {
            setCursorPosition(nextSpec.x, nextSpec.y, lineIndex + 1);
            done();
          }, 145);
        } else {
          window.setTimeout(() => {
            artboard.dataset.cursorMode = 'final';
            setCursorPosition(97.00029, 169);
            screen.dataset.screenState = 'ready';
            artboard.dataset.copyReady = 'true';
            done();
          }, 110);
        }
        return;
      }

      const glyph = text[visible - 1];
      let delay = 56 + Math.random() * 12;
      if (glyph === ' ') delay = 34;
      if (glyph === '.') delay = 145;
      window.setTimeout(nextChar, delay);
    };

    window.setTimeout(nextChar, 95);
  };

  const typeAll = () => typeLine(0, () => typeLine(1, () => typeLine(2, () => {})));

  const startNormalTyping = () => {
    if (normalTypingStarted) return;
    normalTypingStarted = true;
    clearInterval(bootTimer);
    bootTimer = 0;
    resetForTyping();
    screen.dataset.screenState = 'typing';
    window.setTimeout(typeAll, 95);
  };

  const drawBootFrame = () => {
    const dots = bootFrames[bootFrame % bootFrames.length];
    bootFrame += 1;
    artboard.dataset.copyReady = 'false';
    artboard.dataset.cursorActive = 'false';
    artboard.dataset.cursorMode = 'boot';
    screen.dataset.screenState = 'booting';

    lines[0].textContent = 'BOOTING';
    lines[1].textContent = dots;
    lines[2].textContent = '';
    lines.forEach((line, i) => {
      line.classList.remove('is-typing');
      line.classList.toggle('v264-boot-line', i < 2);
      line.classList.toggle('is-complete', i < 2);
      line.style.clipPath = i < 2 ? 'inset(-24% 0% -24% 0)' : 'inset(-24% 100% -24% 0)';
    });
  };

  const startBootText = () => {
    if (normalTypingStarted) return;
    started = true;
    bootFrame = 0;
    drawBootFrame();
    clearInterval(bootTimer);
    if (!reduced) bootTimer = window.setInterval(drawBootFrame, 255);
  };

  const replay = () => {
    if (reduced) return;
    started = true;
    normalTypingStarted = false;
    startNormalTyping();
  };

  window.VijvalHeroComputer = {
    replay,
    isReady: () => artboard.dataset.copyReady === 'true'
  };

  if (reduced) {
    revealAll();
    return;
  }

  if (!root.classList.contains('hero-intro-pending')) {
    window.setTimeout(() => {
      started = true;
      startNormalTyping();
    }, 80);
    return;
  }

  showBlankScreen();
  window.addEventListener('hero:computer-ready', () => {
    motionSequenceStarted = true;
    showBlankScreen();
  }, { once:true });
  window.addEventListener('hero:crt-power-on', startPowerOn, { once:true });
  window.addEventListener('hero:computer-boot-text-start', startBootText, { once:true });
  window.addEventListener('hero:computer-settle-start', startNormalTyping, { once:true });
  window.addEventListener('hero:intro-complete', startNormalTyping, { once:true });


  /* V286: intentionally no pre-intro safety timers. A cold-cache desktop load
     stays blank until the 3D runtime is actually ready; the authoritative Hero
     motion events then drive blank → power → BOOTING → typing in order. */
})();
