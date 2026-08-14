(() => {
  const hero = document.querySelector('.figma-hero-section');
  if (!hero) return;

  const nav = document.querySelector('.figma-nav');
  const updateNav = () => {
    if (!nav) return;
    nav.classList.toggle('is-scrolled', window.scrollY > 16.2);
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
      bar.style.height = '1.8px';
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
    const minBarHeight = 2.7;

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

  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const showHeroImmediately = () => {
    root.classList.remove('hero-intro-pending');
    hero.querySelectorAll('[style]').forEach(() => {});
  };

  const letterize = (element) => {
    if (!element || element.classList.contains('is-letterized')) {
      return element ? [...element.querySelectorAll('.figma-name-char')] : [];
    }

    const word = (element.textContent || '').trim();
    element.textContent = '';
    element.classList.add('is-letterized');
    element.setAttribute('aria-label', word);

    const fragment = document.createDocumentFragment();
    [...word].forEach((character, index) => {
      const span = document.createElement('span');
      span.className = 'figma-name-char';
      span.setAttribute('aria-hidden', 'true');
      span.dataset.charIndex = String(index);
      span.textContent = character;
      fragment.appendChild(span);
    });
    element.appendChild(fragment);

    return [...element.querySelectorAll('.figma-name-char')];
  };

  const firstName = hero.querySelector('.figma-name-first');
  const lastName = hero.querySelector('.figma-name-last');
  const firstChars = letterize(firstName);
  const lastChars = letterize(lastName);

  if (!window.gsap || reducedMotion || window.scrollY > 36) {
    if (firstName) firstName.style.opacity = '1';
    if (lastName) lastName.style.opacity = '1';
    root.classList.remove('hero-intro-pending');
    return;
  }

  const q = gsap.utils.selector(hero);
  const role = hero.querySelector('.figma-role-label');
  const years = hero.querySelector('.figma-years');
  const intro = hero.querySelector('.figma-intro');
  const introLine = hero.querySelector('.figma-intro-line');
  const introCopy = intro?.querySelector('p');
  const actions = hero.querySelector('.figma-actions');
  const actionItems = actions ? [...actions.children] : [];
  const computer = hero.querySelector('.figma-computer');
  const computerShadow = hero.querySelector('.figma-computer-shadow');
  const lowerShadow = hero.querySelector('.figma-lower-shadow');
  const musicCard = hero.querySelector('.figma-music-card');
  const stars = [...hero.querySelectorAll('.figma-star')];

  // If GSAP ever fails after the pending class was applied, never leave the
  // hero hidden. This timer is cleared when the real sequence finishes.
  const safetyReveal = window.setTimeout(() => {
    root.classList.remove('hero-intro-pending');
  }, 4200);

  gsap.set([firstName, lastName], { opacity: 1 });
  gsap.set([...firstChars, ...lastChars], {
    opacity: 0,
    yPercent: 105,
    scaleX: .94,
    scaleY: .78,
    rotateZ: (i) => (i % 2 ? 3.5 : -3.5),
    filter: 'blur(5px)'
  });

  if (role) gsap.set(role, { opacity: 0, x: -11, y: 5, filter: 'blur(4px)' });
  if (years) gsap.set(years, { opacity: 0, y: 10, scale: .94 });
  if (nav) gsap.set(nav, { opacity: 0, y: -12, filter: 'blur(5px)' });

  if (intro) gsap.set(intro, { opacity: 1 });
  const phoneHero = window.matchMedia('(max-width: 600px)').matches;
  if (introLine) {
    gsap.set(introLine, phoneHero
      ? { scaleX: 0, scaleY: 1, transformOrigin: '50% 50%' }
      : { scaleY: 0, transformOrigin: '50% 50%' });
  }
  if (introCopy) gsap.set(introCopy, { opacity: 0, x: -9, filter: 'blur(4px)' });

  if (actions) gsap.set(actions, { opacity: 1 });
  if (actionItems.length) {
    gsap.set(actionItems, { opacity: 0, y: 12, scale: .975 });
  }

  if (computerShadow) {
    gsap.set(computerShadow, {
      opacity: 0,
      scaleX: .64,
      scaleY: .76,
      transformOrigin: '50% 50%'
    });
  }
  if (lowerShadow) {
    gsap.set(lowerShadow, {
      opacity: 0,
      scaleX: .62,
      scaleY: .72,
      transformOrigin: '50% 50%'
    });
  }
  if (computer) gsap.set(computer, { opacity: 0, y: 31 });
  if (musicCard) {
    gsap.set(musicCard, {
      opacity: 0,
      x: 20,
      y: 12,
      rotateZ: 1.8,
      transformOrigin: '50% 60%'
    });
  }
  if (stars.length) {
    gsap.set(stars, { opacity: 0, scale: .18, rotateZ: -22 });
  }

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      window.clearTimeout(safetyReveal);
      root.classList.remove('hero-intro-pending');

      // Clear only entrance-specific inline values. Layout/transforms from the
      // normal site CSS are then fully in control again.
      gsap.set([
        nav, role, years, intro, introCopy, actions,
        computer, computerShadow, lowerShadow, musicCard, ...stars
      ].filter(Boolean), { clearProps: 'opacity,filter' });

      if (musicCard) gsap.set(musicCard,{clearProps:'transform'});

      window.dispatchEvent(new CustomEvent('hero:intro-complete'));
    }
  });

  const springLetters = (characters, at) => {
    if (!characters.length) return;

    tl.to(characters, {
      opacity: 1,
      yPercent: -7,
      scaleX: 1,
      scaleY: 1.045,
      rotateZ: 0,
      filter: 'blur(0px)',
      duration: .53,
      ease: 'back.out(1.85)',
      stagger: {
        each: .058,
        from: 'start'
      }
    }, at);

    tl.to(characters, {
      yPercent: 0,
      scaleY: 1,
      duration: .20,
      ease: 'power2.out',
      stagger: {
        each: .058,
        from: 'start'
      }
    }, at + .34);
  };

  // Opening beat: one continuous wave through both parts of the name.
  springLetters(firstChars, .08);
  springLetters(lastChars, .37);

  // Supporting information arrives only after the name has established itself.
  if (role) {
    tl.to(role, {
      opacity: 1,
      x: 0,
      y: 0,
      filter: 'blur(0px)',
      duration: .44
    }, .94);
  }

  if (years) {
    tl.to(years, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: .42,
      ease: 'back.out(1.35)'
    }, 1.02);
  }

  if (nav) {
    tl.to(nav, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: .52
    }, 1.00);
  }

  // The orange rule draws first; the paragraph follows the direction of it.
  if (introLine) {
    tl.to(introLine, {
      ...(phoneHero ? { scaleX: 1 } : { scaleY: 1 }),
      duration: .46,
      ease: 'power2.inOut'
    }, 1.14);
  }

  if (introCopy) {
    tl.to(introCopy, {
      opacity: 1,
      x: 0,
      filter: 'blur(0px)',
      duration: .52
    }, 1.28);
  }

  // Actions lift in as a pair with a small readable stagger.
  if (actionItems.length) {
    tl.to(actionItems, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: .48,
      stagger: .085,
      ease: 'back.out(1.22)'
    }, 1.45);
  }

  // Hardware rises from the surface while both shadows spread into place.
  if (computerShadow) {
    tl.to(computerShadow, {
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      duration: .62,
      ease: 'power2.out'
    }, 1.48);
  }

  if (lowerShadow) {
    tl.to(lowerShadow, {
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      duration: .56,
      ease: 'power2.out'
    }, 1.57);
  }

  if (computer) {
    tl.to(computer, {
      opacity: 1,
      y: 0,
      duration: .72,
      ease: 'back.out(1.12)'
    }, 1.49);
  }

  if (stars.length) {
    tl.to(stars, {
      opacity: 1,
      scale: 1,
      rotateZ: 0,
      duration: .44,
      stagger: .09,
      ease: 'back.out(1.85)'
    }, 1.76);
  }

  // Last beat: the glass player floats in after the workstation is established.
  if (musicCard) {
    tl.to(musicCard, {
      opacity: 1,
      x: 0,
      y: 0,
      rotateZ: 0,
      duration: .62,
      ease: 'back.out(1.20)'
    }, 1.77);
  }

})();
