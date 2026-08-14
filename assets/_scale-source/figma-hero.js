(() => {
  const hero = document.querySelector('.figma-hero-section');
  if (!hero) return;

  const nav = document.querySelector('.figma-nav');
  const updateNav = () => {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 18);
  };
  updateNav();
  window.addEventListener('scroll', updateNav, { passive: true });

  // Resume actions: one deliberate click opens the PDF for quick viewing AND
  // starts a local download. Keeping both actions synchronous preserves the
  // browser's user-gesture permission for the new tab and download.
  const resumeTriggers = [...document.querySelectorAll('[data-resume-trigger]')];
  resumeTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const href = trigger.getAttribute('href') || 'assets/Vijval_Resume.pdf';
      const absoluteUrl = new URL(href, window.location.href).href;

      const previewWindow = window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
      if (previewWindow) previewWindow.opener = null;

      const downloader = document.createElement('a');
      downloader.href = href;
      downloader.download = 'Vijval_Anand_Resume.pdf';
      downloader.setAttribute('aria-hidden', 'true');
      downloader.style.display = 'none';
      document.body.appendChild(downloader);
      downloader.click();
      downloader.remove();
    });
  });

  const player = hero.querySelector('.figma-music-card');
  const audio = player?.querySelector('.figma-hero-audio');
  const sound = player?.querySelector('.figma-sound-toggle');
  const label = sound?.querySelector('.figma-sound-label');
  const waveform = player?.querySelector('.figma-waveform');
  const bars = waveform ? [...waveform.querySelectorAll('.wave-bar')] : [];
  const status = player?.querySelector('.figma-audio-status');
  const waveformData = window.SWEET_DREAMS_WAVEFORM || null;

  let raf = 0;
  let smoothedLevels = bars.map(() => 0);

  const setDots = () => {
    smoothedLevels = bars.map(() => 0);
    bars.forEach((bar) => {
      bar.style.height = '2px';
      bar.style.opacity = '.96';
    });
  };

  const setVisualState = (playing) => {
    if (!sound) return;
    sound.setAttribute('aria-pressed', String(playing));
    sound.setAttribute('aria-label', playing ? 'Turn music off' : 'Turn music on');
    if (label) label.textContent = playing ? 'ON' : 'OFF';
    waveform?.classList.toggle('is-playing', playing);
    player?.classList.toggle('is-playing', playing);
    if (status) status.textContent = playing ? 'Music is on' : 'Music is off';
    if (!playing) setDots();
  };

  const getFrame = () => {
    if (!audio || !waveformData?.data?.length) return null;
    const fps = waveformData.fps || 10;
    const idx = Math.min(
      waveformData.data.length - 1,
      Math.max(0, Math.floor(audio.currentTime * fps))
    );
    return waveformData.data[idx];
  };

  const drawWave = () => {
    cancelAnimationFrame(raf);
    if (!audio || audio.paused || !bars.length) return;

    const frame = getFrame();
    const maxHeight = Math.max(10, waveform?.clientHeight || 18);
    const minBarHeight = 3;

    bars.forEach((bar, i) => {
      // The precomputed data was generated from this exact MP3, so the bar
      // movement remains tied to the music even in browsers that restrict
      // Web Audio analysis for local files.
      const raw = frame?.[i] ?? 0;
      const target = raw / 255;
      const current = smoothedLevels[i] || 0;
      const rate = target > current ? .44 : .22;
      const level = current + (target - current) * rate;
      smoothedLevels[i] = level;

      const h = minBarHeight + level * (maxHeight - minBarHeight);
      bar.style.height = `${h.toFixed(2)}px`;
      bar.style.opacity = `${(.72 + level * .28).toFixed(2)}`;
    });

    raf = requestAnimationFrame(drawWave);
  };

  const playAudio = async () => {
    if (!audio) return;
    try {
      // Important: play() is called directly inside the user's click gesture.
      // This keeps it compatible with browser autoplay policies.
      await audio.play();
      setVisualState(true);
      drawWave();
    } catch (error) {
      setVisualState(false);
      if (status) status.textContent = 'Could not start audio. Tap the toggle again.';
      console.error('Sweet dreams playback failed:', error);
    }
  };

  const pauseAudio = () => {
    if (!audio) return;
    audio.pause();
    cancelAnimationFrame(raf);
    setVisualState(false);
  };

  if (sound && audio) {
    audio.volume = 0.72;
    audio.loop = true;
    setVisualState(false);

    sound.addEventListener('click', async () => {
      if (audio.paused) await playAudio();
      else pauseAudio();
    });

    audio.addEventListener('play', () => {
      setVisualState(true);
      drawWave();
    });
    audio.addEventListener('pause', () => setVisualState(false));
    audio.addEventListener('ended', () => setVisualState(false));
    audio.addEventListener('waiting', () => {
      if (status) status.textContent = 'Loading Sweet dreams…';
    });
    audio.addEventListener('canplay', () => {
      if (status && audio.paused) status.textContent = 'Music is off';
    });
    audio.addEventListener('error', () => {
      cancelAnimationFrame(raf);
      setVisualState(false);
      if (status) status.textContent = 'The Sweet dreams audio file could not be loaded.';
    });
  }

  if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const q = gsap.utils.selector(hero);
    const tl = gsap.timeline({defaults:{ease:'power3.out'}});
    if (nav) gsap.from(nav,{y:-10,opacity:0,duration:.55,ease:'power3.out',delay:.05});
    tl.from(q('.figma-role-label'),{y:8,opacity:0,duration:.42},.16)
      .from(q('.figma-name-first'),{y:20,opacity:0,duration:.66},.18)
      .from(q('.figma-name-last'),{y:20,opacity:0,duration:.66},.25)
      .from(q('.figma-years'),{y:8,opacity:0,duration:.38},.34)
      .from(q('.figma-intro'),{x:-7,opacity:0,duration:.48},.42)
      .from(q('.figma-actions'),{y:7,opacity:0,duration:.44},.48)
      .from(q('.figma-computer'),{y:18,opacity:0,duration:.68,ease:'back.out(1.08)'},.30)
      .from(q('.figma-music-card'),{x:10,y:8,scale:.985,opacity:0,duration:.50,ease:'back.out(1.12)'},.52)
      .from(q('.figma-star'),{scale:.2,rotate:-18,opacity:0,duration:.42,stagger:.08,ease:'back.out(1.7)'},.52);
  }
})();
