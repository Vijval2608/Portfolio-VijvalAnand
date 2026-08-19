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

  const specs = [
    { x:96.85, y:88.22, width:89.301, text:'DESIGNING' },
    { x:97,    y:121,   width:128,    text:'PRODUCTS THAT' },
    { x:97,    y:153,   width:125,    text:'HIT DIFFERENT.' }
  ];

  let started = false;

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

  const reset = () => {
    artboard.dataset.copyReady = 'false';
    artboard.dataset.cursorActive = 'false';
    artboard.dataset.cursorMode = 'typing';

    lines.forEach(line => {
      line.classList.remove('is-typing','is-complete');
      line.style.clipPath = 'inset(0 100% 0 0)';
    });

    setCursorPosition(specs[0].x, specs[0].y, 0);
  };

  const revealAll = () => {
    lines.forEach(line => {
      line.classList.add('is-complete');
      line.style.clipPath = 'inset(0 0% 0 0)';
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
    if (!line || !spec) {
      done();
      return;
    }

    const text = spec.text;
    let visible = 0;

    line.classList.add('is-typing');
    artboard.dataset.cursorMode = 'typing';
    artboard.dataset.cursorActive = 'true';

    /* underscore starts in the next active character cell */
    setCursorPosition(spec.x, spec.y, lineIndex);

    const nextChar = () => {
      visible += 1;

      const ratio = measurePrefixRatio(line, text, visible);
      line.style.clipPath = `inset(0 ${(100 - ratio * 100).toFixed(4)}% 0 0)`;

      /* DESIG_ -> DESIGN_ */
      const cursorX = spec.x + spec.width * ratio + 1.15;
      setCursorPosition(cursorX, spec.y, lineIndex);

      if (visible >= text.length) {
        line.classList.remove('is-typing');
        line.classList.add('is-complete');
        line.style.clipPath = 'inset(0 0% 0 0)';

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

  const typeAll = () => {
    typeLine(0, () => {
      typeLine(1, () => {
        typeLine(2, () => {});
      });
    });
  };

  const start = () => {
    if (started) return;
    started = true;
    reset();

    if (reduced) {
      revealAll();
      return;
    }

    screen.dataset.screenState = 'booting';

    window.setTimeout(() => {
      screen.dataset.screenState = 'typing';
      typeAll();
    }, 625);
  };

  const begin = () => {
    if (document.fonts?.ready) {
      Promise.race([
        document.fonts.ready,
        new Promise(resolve => window.setTimeout(resolve, 700))
      ]).then(start);
    } else {
      start();
    }
  };

  if (!root.classList.contains('hero-intro-pending')) {
    window.setTimeout(begin, 120);
  } else {
    window.addEventListener('hero:intro-complete', () => {
      window.setTimeout(begin, 90);
    }, { once:true });

    window.setTimeout(begin, 4300);
  }
})();
