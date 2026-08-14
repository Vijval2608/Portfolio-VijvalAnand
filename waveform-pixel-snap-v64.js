(() => {
  const waveform = document.querySelector('.figma-waveform');
  if (!waveform) return;

  const bars = [...waveform.querySelectorAll('.wave-bar')];
  if (bars.length < 2) return;

  const BAR_WIDTH = 2;

  const snapToDevicePixel = (value) => {
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    return Math.round(value * dpr) / dpr;
  };

  const layout = () => {
    const width = waveform.getBoundingClientRect().width;
    if (!Number.isFinite(width) || width <= BAR_WIDTH) return;

    const usable = Math.max(0, width - BAR_WIDTH);
    const last = bars.length - 1;

    bars.forEach((bar, index) => {
      const rawX = last ? (usable * index / last) : 0;
      const x = snapToDevicePixel(rawX);
      bar.style.setProperty('--wave-x', `${x}px`);
    });
  };

  layout();

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(layout);
    observer.observe(waveform);
  } else {
    window.addEventListener('resize', layout, { passive: true });
  }

  window.addEventListener('orientationchange', layout, { passive: true });
})();
