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
  }, 4800);

  gsap.set([firstName, lastName], { opacity: 1 });
  gsap.set([...firstChars, ...lastChars], {
    opacity: 0,
    yPercent: 105,
    scaleX: .94,
    scaleY: .78,
    rotateZ: (i) => (i % 2 ? 3.5 : -3.5),
    filter: 'blur(5px)'
  });

  if (role) gsap.set(role, { opacity: 0, x: -8, y: 5, filter: 'blur(3px)' });
  if (years) gsap.set(years, { opacity: 0, y: 7, scale: .96 });
  if (nav) gsap.set(nav, { opacity: 0, y: -12, filter: 'blur(5px)' });

  if (intro) gsap.set(intro, { opacity: 1 });
  const phoneHero = window.matchMedia('(max-width: 600px)').matches;
  if (introLine) {
    gsap.set(introLine, phoneHero
      ? { scaleX: 0, scaleY: 1, transformOrigin: '50% 50%' }
      : { scaleY: 0, transformOrigin: '50% 50%' });
  }
  if (introCopy) {
    /*
     * Keep the paragraph DOM completely untouched.
     * We reveal the already-wrapped text block with a mask, so line breaks can
     * never change during the animation.
     *
     * Desktop: reveal left -> right, starting beside the vertical orange rule.
     * Phone: reveal bottom -> top, starting above the horizontal orange rule.
     */
    gsap.set(introCopy, {
      opacity: 1,
      y: 0,
      filter: 'none',
      clipPath: phoneHero
        ? 'inset(100% 0 0 0)'
        : 'inset(0 100% 0 0)',
      willChange: 'clip-path'
    });
  }

  if (actions) gsap.set(actions, { opacity: 1 });
  if (actionItems.length) {
    actionItems.forEach((item) => {
      item.style.scale = '0.958';
      item.style.transformOrigin = '50% 50%';
    });
    gsap.set(actionItems, { opacity: 0 });
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
  if (computer) gsap.set(computer, { opacity: 0, y: 24, scale: .965, transformOrigin: '50% 70%' });
  if (musicCard) {
    // The desktop music-card CSS intentionally has transform:none!important.
    // So the entrance spring uses the independent CSS `scale` property instead
    // of transform scale. This makes the pop visible without disturbing the
    // card's pixel-locked desktop geometry.
    musicCard.getAnimations().forEach((animation) => animation.cancel());
    musicCard.style.scale = '0.84';
    musicCard.style.transformOrigin = '50% 50%';
    gsap.set(musicCard, {
      opacity: 0,
      y: 0,
      rotateZ: 0
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

      if (introCopy) {
        gsap.set(introCopy, { clearProps: 'clipPath,willChange' });
      }

      actionItems.forEach((item) => {
        item.style.scale = '1';
      });

      if (musicCard) {
        musicCard.style.scale = '1';
        gsap.set(musicCard, { clearProps: 'transform' });
      }

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

  /*
   * V175 HERO CHOREOGRAPHY
   * ----------------------
   * Keep the approved name wave untouched, then collapse the rest of the hero
   * into two coordinated beats instead of a long component-by-component queue.
   *
   * Beat 1 (after the name): workstation + role + years + nav.
   * Beat 2 (while the workstation is still settling): center-expanding orange
   * rule + stable block-mask paragraph reveal + springing music player + stars.
   * CTAs follow only after the paragraph has fully resolved.
   *
   * The computer screen is told to boot as soon as the workstation becomes
   * legible, so typing continues as ambient motion after the layout is already
   * present instead of delaying the rest of the hero.
   */

  // Three readable beats:
  // 1) name wave (unchanged)
  // 2) workstation / role / years
  // 3) supporting content
  //
  // The larger 0.78s gap between beats 2 and 3 gives the eye time to register
  // the computer and catch the first CRT typing movement before the lower
  // content enters.
  const workstationBeat = 1.34;
  const contentBeat = 2.12;

  // Beat 1 — establish identity + workstation together.
  if (role) {
    tl.to(role, {
      opacity: 1,
      x: 0,
      y: 0,
      filter: 'blur(0px)',
      duration: .38,
      ease: 'power3.out'
    }, workstationBeat);
  }

  if (years) {
    tl.to(years, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: .40,
      ease: 'back.out(1.28)'
    }, workstationBeat + .02);
  }

  if (nav) {
    tl.to(nav, {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: .44,
      ease: 'power3.out'
    }, workstationBeat);
  }

  if (computerShadow) {
    tl.to(computerShadow, {
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      duration: .54,
      ease: 'power2.out'
    }, workstationBeat);
  }

  if (lowerShadow) {
    tl.to(lowerShadow, {
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      duration: .50,
      ease: 'power2.out'
    }, workstationBeat + .04);
  }

  if (computer) {
    tl.to(computer, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: .64,
      ease: 'back.out(1.16)'
    }, workstationBeat);

    // Start the CRT/typing sequence while the computer is still settling.
    tl.call(() => {
      window.dispatchEvent(new CustomEvent('hero:computer-ready'));
    }, null, workstationBeat + .14);
  }

  // Beat 2 — supporting content arrives as one composition, not a queue.
  if (introLine) {
    tl.to(introLine, {
      ...(phoneHero ? { scaleX: 1 } : { scaleY: 1 }),
      duration: .60,
      ease: 'power3.inOut'
    }, contentBeat);
  }

  /*
   * Paragraph reveal:
   * one stable mask over the existing wrapped paragraph.
   * No word spans, no line rebuilding, no opacity fade.
   *
   * The orange rule starts first; 120ms later the copy wipes away from that
   * rule while keeping its final layout throughout the entire animation.
   */
  const copyRevealStart = contentBeat + .12;
  const copyRevealDuration = .56;

  if (introCopy) {
    tl.to(introCopy, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: copyRevealDuration,
      ease: 'power3.inOut'
    }, copyRevealStart);
  }

  const copyRevealEnd = copyRevealStart + copyRevealDuration;

  // CTAs intentionally wait until the paragraph has completely landed.
  // Their scale curve is the exact normal section-spring curve.
  const ctaBeat = copyRevealEnd + .14;

  if (actionItems.length) {
    tl.call(() => {
      actionItems.forEach((item, index) => {
        item.getAnimations().forEach((animation) => animation.cancel());
        item.style.scale = '0.958';

        window.setTimeout(() => {
          gsap.to(item, {
            opacity: 1,
            duration: .16,
            ease: 'power2.out'
          });

          const spring = item.animate([
            { scale: '0.958', offset: 0 },
            { scale: '1.0075', offset: .72 },
            { scale: '0.9985', offset: .89 },
            { scale: '1', offset: 1 }
          ], {
            duration: 700,
            easing: 'cubic-bezier(.18,.76,.22,1)',
            fill: 'forwards'
          });

          spring.finished.then(() => {
            item.style.scale = '1';
            spring.cancel();
          }).catch(() => {
            item.style.scale = '1';
          });
        }, index * 55);
      });
    }, null, ctaBeat);

    // Keep the GSAP timeline alive until the CTA springs have settled.
    tl.to({}, { duration: .78 }, ctaBeat);
  }

  /*
   * Music spring:
   * exactly synchronized with the paragraph reveal.
   *
   * Both now START at copyRevealStart and FINISH after copyRevealDuration.
   * The music card keeps the same amplified section-spring shape, only its
   * duration is matched to the paragraph so the two feel like one visual beat.
   */
  if (musicCard) {
    tl.to(musicCard, {
      opacity: 1,
      duration: .10,
      ease: 'power2.out'
    }, copyRevealStart);

    tl.call(() => {
      musicCard.getAnimations().forEach((animation) => animation.cancel());
      musicCard.style.scale = '0.84';

      const spring = musicCard.animate([
        { scale: '0.84', offset: 0 },
        { scale: '1.055', offset: .72 },
        { scale: '0.985', offset: .89 },
        { scale: '1', offset: 1 }
      ], {
        duration: copyRevealDuration * 1000,
        easing: 'cubic-bezier(.18,.76,.22,1)',
        fill: 'forwards'
      });

      spring.finished.then(() => {
        musicCard.style.scale = '1';
        spring.cancel();
      }).catch(() => {
        musicCard.style.scale = '1';
      });
    }, null, copyRevealStart);
  }

  if (stars.length) {
    tl.to(stars, {
      opacity: 1,
      scale: 1,
      rotateZ: 0,
      duration: .42,
      stagger: .055,
      ease: 'back.out(1.75)'
    }, copyRevealStart + .10);
  }

})();
