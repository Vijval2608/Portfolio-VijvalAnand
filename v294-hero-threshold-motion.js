/* V294 — scroll-anchored + visually smoothed Hero/Works handoff on top of the
   proven V291 startup. The first-load computer boot sequence is unchanged.
   Scroll still defines the destination state, but fast wheel/trackpad jumps are
   absorbed by a short reversible visual catch-up so the eye can follow the
   computer instead of seeing it snap between states. */
(() => {
  'use strict';

  const hero = document.querySelector('.figma-hero-section');
  const stage = hero?.querySelector('.figma-hero-stage');
  const scene = stage?.querySelector('.v206-depth-scene');
  if (!hero || !stage || !scene) return;

  const desktop = matchMedia('(min-width:769px)').matches;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!desktop || reduced) {
    document.documentElement.classList.remove('hero-intro-pending');
    document.documentElement.classList.remove('v230-hero-prepaint');
    document.documentElement.classList.remove('v266-intro-lock');
    document.documentElement.classList.remove('v286-3d-loading');
    return;
  }

  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const mix = (a,b,t) => a+(b-a)*t;
  const smooth = t => t*t*(3-2*t);
  const smoother = t => t*t*t*(t*(t*6-15)+10);
  const easeOut = t => 1-Math.pow(1-t,3);
  const transitionEase = t => 1-Math.pow(1-clamp(t,0,1),2.7);

  const computer = scene.querySelector('.figma-computer');
  const computerArtboard = computer?.querySelector('.figma-computer-artboard');
  const musicRig = scene.querySelector('.v207-music-rig');
  const musicCard = musicRig?.querySelector('.figma-music-card');
  if (!computer || !computerArtboard) {
    document.documentElement.classList.remove('hero-intro-pending');
    document.documentElement.classList.remove('v230-hero-prepaint');
    return;
  }

  /* Approved V213 exit / re-entry geometry. This remains the sole source of
     truth for where every non-computer Hero plane converges. */
  const configs = [
    {el:scene.querySelector('.figma-name-first'),  pull:.74,z:-198,start:.01,end:.50,arcX:-5, arcY:-5},
    {el:scene.querySelector('.figma-name-last'),   pull:.77,z:-194,start:.03,end:.53,arcX: 6, arcY:-7},
    {el:scene.querySelector('.figma-role-label'),  pull:.86,z:-214,start:.06,end:.56,arcX:-7, arcY:-2},
    {el:scene.querySelector('.figma-years'),       pull:.89,z:-228,start:.08,end:.58,arcX: 8, arcY: 1},
    {el:scene.querySelector('.figma-intro'),       pull:.94,z:-252,start:.10,end:.62,arcX:-10,arcY: 5},
    {el:scene.querySelector('.figma-actions'),     pull:.98,z:-272,start:.13,end:.65,arcX: 12,arcY: 7},
    {el:scene.querySelector('.hero-pong-hint'),    pull:1.00,z:-286,start:.14,end:.66,arcX:-8, arcY: 6},
    {el:scene.querySelector('.figma-star-bottom'), pull:1.03,z:-310,start:.08,end:.64,arcX:-15,arcY:10},
    {el:scene.querySelector('.figma-star-top'),    pull:1.07,z:-342,start:.12,end:.68,arcX: 18,arcY:-9},
    {el:musicRig,source:musicCard,                  pull:1.11,z:-310,start:.16,end:.72,arcX: 22,arcY:13}
  ].filter(item => item.el && (item.source || item.el));

  let geometry=[];
  let target=0;
  let current=0;
  let computerTarget=0;
  let computerCurrent=0;
  let raf=0;
  let introRunning=false;
  let introStarted=false;
  let introPhase='idle';
  let introPhaseStart=0;
  let introPhaseProgress=0;
  let introSpring=0;
  let introRevealStart=0;
  let introRevealTriggered=false;
  let introStaticTimer=0;
  let introCenterDx=0;
  let introCenterDy=0;

  /* V294 — one reversible scroll coordinate still owns the Hero handoff.
     `scrollTargetCollapse` is the exact document-position target;
     `scrollVisualCollapse` follows it with a tiny time constant only to smooth
     large input deltas. There is no queued direction-specific animation. */
  let transitionRunning=false; // retained for compatibility
  let transitionStart=0, transitionFrom=0, transitionTo=0, transitionDuration=0;
  let scrollState='open';
  let heroDocumentTop=0;
  let scrollTravel=1;
  let lastRaw=0;
  let thresholdReady=false;
  let scrollDirection=0;
  let directionAnchor=0;
  let scrollSyncDirty=false;
  let scrollSyncActive=false;
  let lastAppliedCollapse=-1;
  let scrollTargetCollapse=0;
  let scrollVisualCollapse=0;
  let scrollTargetRaw=0;
  let scrollLastFrame=0;

  /* Spatial range remains generous enough to read as a transition instead of
     a threshold. Temporal smoothing is deliberately short: at 60 Hz a sudden
     full-range jump reaches ~95% in about 300 ms, while ordinary incremental
     scrolling feels almost direct. */
  const SCROLL_SYNC_START=.04;
  const SCROLL_SYNC_END=.94;
  const SCROLL_SMOOTH_TAU=100;
  const SCROLL_SETTLE_EPS=.00065;

  /* V225: three strictly sequential desktop load stages.
     1. Macintosh only.
     2. Hero planes only after the Macintosh is fully settled.
     3. Navbar is triggered by hero:intro-complete after stage 2. */
  const INTRO_HOLD=120;
  const BOOT_POP_DURATION=760;
  const CRT_BLANK_HOLD=220;
  const CRT_POWER_DURATION=520;
  const BOOT_HOLD_DURATION=1050;
  const COMPUTER_SETTLE_DURATION=1640;
  const COMPUTER_REVEAL_PROGRESS=.05;
  const COMPONENT_DURATION=1050; // begins at 5% of the visible computer relocation

  const localCenter = el => {
    let x=el.offsetLeft+el.offsetWidth/2;
    let y=el.offsetTop+el.offsetHeight/2;
    let parent=el.offsetParent;
    while(parent && parent!==scene){
      x += parent.offsetLeft || 0;
      y += parent.offsetTop || 0;
      parent=parent.offsetParent;
    }
    return {x,y};
  };

  const measure = () => {
    const targetPoint=localCenter(computer);
    /* V266: first-load computer is centered in the hero viewport, not at its
       final Figma coordinates. These offsets collapse to zero during settle. */
    introCenterDx=scene.clientWidth*.5-targetPoint.x;
    introCenterDy=scene.clientHeight*.5-targetPoint.y;
    geometry=configs.map(cfg=>{
      const source=cfg.source||cfg.el;
      const c=localCenter(source);
      return {...cfg,dx:(targetPoint.x-c.x)*cfg.pull,dy:(targetPoint.y-c.y)*cfg.pull};
    });

    const rect=hero.getBoundingClientRect();
    heroDocumentTop=rect.top+(window.scrollY||window.pageYOffset||0);
    scrollTravel=Math.max(1,Math.min(hero.offsetHeight,innerHeight)*.88);
  };

  const applyItem = (item,p,spring=0) => {
    const local=clamp((p-item.start)/(item.end-item.start),0,1);
    const baseE=smooth(local);
    const e=clamp(baseE-spring,-0.045,1);
    const eForArc=clamp(e,0,1);
    const arc=Math.sin(Math.PI*eForArc);
    const scale=clamp(1-e,.001,1.045).toFixed(4);
    const opacity=clamp(1-e,0,1).toFixed(4);

    item.el.style.setProperty('--v208-exit-x',`${(item.dx*e+item.arcX*arc).toFixed(2)}px`);
    item.el.style.setProperty('--v208-exit-y',`${(item.dy*e+item.arcY*arc).toFixed(2)}px`);
    item.el.style.setProperty('--v208-exit-z',`${(item.z*easeOut(clamp(e,0,1))).toFixed(2)}px`);
    item.el.style.setProperty('--v208-exit-scale',scale);
    item.el.style.setProperty('--v208-exit-opacity',opacity);

    // Identity transforms keep text/cards on a composited layer in Chromium and
    // can look soft at 100% zoom. Once a plane is fully open, release `scale`
    // completely instead of leaving `scale:1` behind.
    const settled = e <= .00001 && Math.abs(spring) <= .00001;
    item.el.style.setProperty('scale', settled ? 'none' : scale, 'important');
    item.el.style.setProperty('opacity', settled ? '1' : opacity, 'important');
  };

  const applyComputer = (p,spring=0,isIntro=false) => {
    let computerScale;
    let computerOpacity;
    let y;
    let z;
    let shadowY;
    let shadowBlur;
    let shadowAlpha;

    if (isIntro) {
      /* V230: first-load scale is isolated on the Macintosh artboard itself.
         The outer .figma-computer remains the geometry/depth shell and is
         never scaled by another startup system. Because the artboard also has
         scale(0)+opacity:0 inline in the HTML markup, a full-size first paint
         is structurally impossible rather than merely hidden after the fact. */
      const open=clamp(1-p,0,1);
      computerScale=clamp(mix(0,1,open)+(spring*.78),0,1.028).toFixed(4);
      computerOpacity=clamp(open*1.55,0,1).toFixed(4);
      y=mix(-14,0,open)+(spring*30);
      z=mix(-43,0,open)-(spring*12);
      shadowY=mix(2,0,open);
      shadowBlur=mix(2.5,0,open);
      shadowAlpha=mix(.065,.105,open);
    } else {
      /* V236 — the Macintosh now participates in the collapse from the first
         scroll pixels instead of waiting on the old two-stage curve. The
         non-zero initial slope is deliberate: it makes the whole Hero read as
         one scene compressing away while Works takes over. */
      const collapse=clamp(p,0,1);
      const scaleEase=1-Math.pow(1-collapse,1.55);
      const fadeEase=smooth(clamp((collapse-.56)/.44,0,1));

      computerScale=clamp(mix(1,.66,scaleEase)+(spring*.16),.64,1.01).toFixed(4);
      computerOpacity=mix(1,.48,fadeEase).toFixed(4);
      y=mix(0,-18,scaleEase)+(spring*34);
      z=mix(0,-72,scaleEase)-(spring*16);
      shadowY=mix(0,1.5,scaleEase);
      shadowBlur=mix(0,4.5,scaleEase);
      shadowAlpha=mix(.105,.025,scaleEase);
    }

    computer.style.setProperty('--v208-exit-x','0px');
    computer.style.setProperty('--v208-exit-y',`${y.toFixed(2)}px`);
    computer.style.setProperty('--v208-exit-z',`${z.toFixed(2)}px`);
    const computerSettled = p <= .00001 && Math.abs(spring) <= .00001;

    if (isIntro) {
      /* Outer shell stays at native scale throughout Stage 1. Only its y/z
         depth path moves. The inner artboard owns the visible scale spring. */
      computer.style.setProperty('--v208-exit-scale','1');
      computer.style.setProperty('--v208-exit-opacity','1');
      computer.style.setProperty('scale','none','important');
      computer.style.setProperty('opacity','1','important');
      computerArtboard.style.setProperty('opacity', computerSettled ? '1' : computerOpacity, 'important');
      computerArtboard.style.setProperty(
        'transform',
        computerSettled ? 'none' : `scale(${computerScale})`,
        'important'
      );
      computerArtboard.style.setProperty('transform-origin','50% 50%','important');
      computerArtboard.style.setProperty('will-change', computerSettled ? 'auto' : 'transform,opacity', 'important');
    } else {
      /* Normal scroll exit/re-entry keeps the approved parent-scale system. */
      computerArtboard.style.setProperty('opacity','1','important');
      computerArtboard.style.setProperty('transform','none','important');
      computerArtboard.style.setProperty('will-change','auto','important');
      computer.style.setProperty('--v208-exit-scale',computerScale);
      computer.style.setProperty('--v208-exit-opacity',computerOpacity);
      computer.style.setProperty('scale', computerSettled ? 'none' : computerScale, 'important');
      computer.style.setProperty('opacity', computerSettled ? '1' : computerOpacity, 'important');
    }

    stage.style.setProperty('--v208-computer-shadow-y',`${shadowY.toFixed(2)}px`);
    stage.style.setProperty('--v208-computer-shadow-blur',`${shadowBlur.toFixed(2)}px`);
    stage.style.setProperty('--v208-computer-shadow-alpha',shadowAlpha.toFixed(3));
  };

  const setIntroComputer = ({x=0,y=0,z=0,scale=1,opacity=1,spring=0}={}) => {
    const safeScale=clamp(scale,0,1.04);
    const safeOpacity=clamp(opacity,0,1);
    computer.style.setProperty('--v208-exit-x',`${x.toFixed(2)}px`);
    computer.style.setProperty('--v208-exit-y',`${y.toFixed(2)}px`);
    computer.style.setProperty('--v208-exit-z',`${z.toFixed(2)}px`);
    computer.style.setProperty('--v208-exit-scale','1');
    computer.style.setProperty('--v208-exit-opacity','1');
    computer.style.setProperty('scale','none','important');
    computer.style.setProperty('opacity','1','important');
    computerArtboard.style.setProperty('opacity',safeOpacity.toFixed(4),'important');
    computerArtboard.style.setProperty('transform',Math.abs(safeScale-1)<.0001?'none':`scale(${safeScale.toFixed(4)})`,'important');
    computerArtboard.style.setProperty('transform-origin','50% 50%','important');
    computerArtboard.style.setProperty('will-change',Math.abs(safeScale-1)<.0001 && Math.abs(x)<.01 && Math.abs(y)<.01?'auto':'transform,opacity','important');
    stage.style.setProperty('--v208-computer-shadow-y',`${mix(1.8,0,safeScale).toFixed(2)}px`);
    stage.style.setProperty('--v208-computer-shadow-blur',`${mix(3.6,0,safeScale).toFixed(2)}px`);
    stage.style.setProperty('--v208-computer-shadow-alpha',mix(.07,.105,safeScale).toFixed(3));
  };

  const applyBootComputer = (open,spring=0) => {
    const t=clamp(open,0,1);
    const scale=clamp(mix(0,.72,t)+spring*.58,0,.748);
    setIntroComputer({
      x:introCenterDx,
      y:introCenterDy+mix(-12,0,t)+spring*24,
      z:mix(-38,0,t)-spring*10,
      scale,
      opacity:clamp(t*1.65,0,1),
      spring
    });
  };

  const applySettleComputer = (progress,rawProgress=progress) => {
    /* V266: the computer itself moves inside the fixed Hero viewport. X/Y are
       strictly monotonic, so the composition never reads as the page/camera
       scrolling. The only spring character is a small scale overshoot folded
       into the final part of this same uninterrupted relocation. */
    const t=clamp(progress,0,1);
    const raw=clamp(rawProgress,0,1);
    const q=clamp((raw-.72)/.28,0,1);
    const scaleOvershoot=q>0 ? Math.sin(Math.PI*q)*.021 : 0;
    setIntroComputer({
      x:mix(introCenterDx,0,t),
      y:mix(introCenterDy,0,t),
      z:-scaleOvershoot*7,
      scale:mix(.72,1,t)+scaleOvershoot,
      opacity:1,
      spring:0
    });
  };

  const applyItems = (p,spring=0) => {
    geometry.forEach(item=>applyItem(item,p,spring));
  };

  /* V293 — direct scroll scrubbing still uses the compositor-only fast path.
     Snapshot the resting parallax coordinates at handoff entry, then mutate only
     translate / scale / opacity. Canonical V208 variables are committed at the
     two scroll endpoints. */
  const numberVar = (style,name,fallback=0) => {
    const n=parseFloat(style.getPropertyValue(name));
    return Number.isFinite(n)?n:fallback;
  };

  const prepareFastTransition = () => {
    geometry.forEach(item => {
      const cs=getComputedStyle(item.el);
      if(item.el===musicRig){
        item.fastBaseX=numberVar(cs,'--v207-music-x',0);
        item.fastBaseY=numberVar(cs,'--v207-music-y',0);
        item.fastBaseZ=0; // V227 intentionally keeps the resting music rig on 2D.
      }else{
        item.fastBaseX=numberVar(cs,'--v207-plane-x',0);
        item.fastBaseY=numberVar(cs,'--v207-plane-y',0);
        item.fastBaseZ=numberVar(cs,'--v206-plane-z',0);
      }
      item.el.style.setProperty('will-change','translate,scale,opacity','important');
    });
    const cs=getComputedStyle(computer);
    computer.fastBaseX=numberVar(cs,'--v207-plane-x',0);
    computer.fastBaseY=numberVar(cs,'--v207-plane-y',0);
    computer.fastBaseZ=numberVar(cs,'--v206-plane-z',36);
    computer.style.setProperty('will-change','translate,scale,opacity','important');
  };

  const applyItemFast = (item,p,spring=0) => {
    const local=clamp((p-item.start)/(item.end-item.start),0,1);
    const e=clamp(smooth(local)-spring,-0.045,1);
    const arc=Math.sin(Math.PI*e);
    const x=(item.fastBaseX||0) + item.dx*e + item.arcX*arc;
    const y=(item.fastBaseY||0) + item.dy*e + item.arcY*arc;
    const z=(item.fastBaseZ||0) + item.z*easeOut(e);
    const scale=clamp(1-e,.001,1).toFixed(4);
    const opacity=clamp(1-e,0,1).toFixed(4);
    item.el.style.setProperty('translate',`${x.toFixed(2)}px ${y.toFixed(2)}px ${z.toFixed(2)}px`,'important');
    item.el.style.setProperty('scale',scale,'important');
    item.el.style.setProperty('opacity',opacity,'important');
  };

  const applyItemsFast = (p,spring=0) => geometry.forEach(item=>applyItemFast(item,p,spring));

  const applyComputerFast = p => {
    const collapse=clamp(p,0,1);
    const scaleEase=1-Math.pow(1-collapse,1.55);
    const fadeEase=smooth(clamp((collapse-.56)/.44,0,1));
    const computerScale=clamp(mix(1,.66,scaleEase),.64,1).toFixed(4);
    const computerOpacity=mix(1,.48,fadeEase).toFixed(4);
    const x=computer.fastBaseX||0;
    const y=(computer.fastBaseY||0)+mix(0,-18,scaleEase);
    const z=(computer.fastBaseZ||36)+mix(0,-72,scaleEase);
    computer.style.setProperty('translate',`${x.toFixed(2)}px ${y.toFixed(2)}px ${z.toFixed(2)}px`,'important');
    computer.style.setProperty('scale',computerScale,'important');
    computer.style.setProperty('opacity',computerOpacity,'important');
  };

  const clearFastTransition = () => {
    geometry.forEach(item => {
      item.el.style.removeProperty('translate');
      item.el.style.removeProperty('will-change');
    });
    computer.style.removeProperty('translate');
    computer.style.removeProperty('will-change');
  };

  const commitTransitionState = p => {
    applyItems(p,0);
    applyComputer(p,0);
    clearFastTransition();
  };

  const applyState = (p,spring=0,isIntro=false) => {
    applyItems(p,spring);
    applyComputer(p,spring,isIntro);
  };

  const introSpringFor = (t,start=.62,strength=.034) => {
    const q=clamp((t-start)/(1-start),0,1);
    return q>0 ? Math.sin(q*Math.PI*2)*Math.exp(-2.7*q)*strength : 0;
  };

  const clearIntroOwnership = () => {
    document.documentElement.classList.remove('hero-intro-pending');
    hero.classList.remove('v219-auto-intro');
    window.dispatchEvent(new CustomEvent('hero:intro-complete'));
  };

  const startIntroReveal = now => {
    if(introRevealTriggered) return;
    introRevealTriggered=true;
    introRevealStart=now;
    prepareFastTransition();
    window.dispatchEvent(new CustomEvent('hero:components-start', {
      detail:{ duration:COMPONENT_DURATION }
    }));
  };

  const applyIntroReveal = now => {
    if(!introRevealTriggered){
      // The planes were already collapsed once before relocation begins.
      // Avoid rewriting their styles every frame during the first 5%.
      return false;
    }
    const t=clamp((now-introRevealStart)/COMPONENT_DURATION,0,1);
    const eased=smoother(t);
    const p=1-eased;
    const spring=introSpringFor(t,.66,.034);
    introPhaseProgress=p;
    introSpring=spring;
    current=p;
    applyItemsFast(p,spring);
    return t>=1;
  };

  const emitTransitionState = active => {
    hero.classList.toggle('v242-hero-transitioning',active);
    window.dispatchEvent(new CustomEvent('hero:scroll-collapse-state',{detail:{active}}));
  };

  const rawScrollProgress = () => {
    const y=window.scrollY||window.pageYOffset||0;
    return clamp((y-heroDocumentTop)/scrollTravel,0,1);
  };

  const collapseForRawScroll = raw => {
    const local=clamp((raw-SCROLL_SYNC_START)/(SCROLL_SYNC_END-SCROLL_SYNC_START),0,1);
    return smoother(local);
  };

  const releasePongForScroll = () => {
    const pong = window.VijvalPong;
    if (pong?.isActive?.()) pong.exit();
    /* MutationObserver sync in V207 runs immediately after this stack, but the
       collapse must not wait a frame for the old focus-lock class to clear. */
    hero.classList.remove('v207-pong-lock');
  };

  const setScrollTransitionActive = active => {
    if(active===scrollSyncActive) return;
    scrollSyncActive=active;
    emitTransitionState(active);
    if(active) prepareFastTransition();
  };

  const applyVisualHandoff = (p, settled=false) => {
    const endpoint=p<=.0005?0:(p>=.9995?1:null);

    if(endpoint===null || !settled){
      setScrollTransitionActive(true);
      applyItemsFast(p,0);
      applyComputerFast(p);
      lastAppliedCollapse=p;
      scrollState='scrubbing';
    }else{
      current=target=endpoint;
      computerCurrent=computerTarget=endpoint;
      if(scrollSyncActive || Math.abs(lastAppliedCollapse-endpoint)>.0005){
        commitTransitionState(endpoint);
        lastAppliedCollapse=endpoint;
      }
      setScrollTransitionActive(false);
      scrollState=endpoint===1?'collapsed':'open';
    }

    current=p;
    computerCurrent=p;
    window.dispatchEvent(new CustomEvent('hero:scroll-handoff-progress',{
      detail:{progress:p,raw:scrollTargetRaw,target:scrollTargetCollapse}
    }));
  };

  const syncScrollTarget = (force=false) => {
    if(introRunning) return;
    const raw=rawScrollProgress();
    const p=collapseForRawScroll(raw);

    if(p>.001 && (hero.classList.contains('v207-pong-lock') || window.VijvalPong?.isActive?.())){
      releasePongForScroll();
    }

    scrollTargetRaw=raw;
    scrollTargetCollapse=p;
    target=p;
    computerTarget=p;
    lastRaw=raw;
    directionAnchor=raw;
    thresholdReady=true;

    if(force){
      scrollVisualCollapse=p;
      current=p;
      computerCurrent=p;
      scrollLastFrame=0;
      applyVisualHandoff(p,true);
      return;
    }

    if(Math.abs(scrollTargetCollapse-scrollVisualCollapse)>SCROLL_SETTLE_EPS){
      setScrollTransitionActive(true);
    }
  };

  const stepScrollSmoothing = now => {
    const delta=scrollTargetCollapse-scrollVisualCollapse;
    if(Math.abs(delta)<=SCROLL_SETTLE_EPS){
      scrollVisualCollapse=scrollTargetCollapse;
      scrollLastFrame=now;
      applyVisualHandoff(scrollVisualCollapse,true);
      return false;
    }

    const dt=scrollLastFrame ? clamp(now-scrollLastFrame,1,34) : 16.667;
    scrollLastFrame=now;
    const alpha=1-Math.exp(-dt/SCROLL_SMOOTH_TAU);
    scrollVisualCollapse += delta*alpha;

    /* Avoid asymptotic one-pixel drift at the end without ever waiting on a
       timer. Reversing scroll changes `scrollTargetCollapse` immediately, so
       the same frame loop simply heads back the other way. */
    if(Math.abs(scrollTargetCollapse-scrollVisualCollapse)<SCROLL_SETTLE_EPS){
      scrollVisualCollapse=scrollTargetCollapse;
    }

    applyVisualHandoff(scrollVisualCollapse,
      Math.abs(scrollTargetCollapse-scrollVisualCollapse)<=SCROLL_SETTLE_EPS);
    return Math.abs(scrollTargetCollapse-scrollVisualCollapse)>SCROLL_SETTLE_EPS;
  };

  const updateThreshold = () => {
    if(introRunning) return;
    scrollSyncDirty=true;
    requestRender();
  };

  const finishIntro = () => {
    introRunning=false;
    if(introStaticTimer){clearTimeout(introStaticTimer);introStaticTimer=0;}
    introPhase='done';
    document.documentElement.classList.remove('v266-intro-lock');
    current=0;
    target=0;
    computerCurrent=0;
    computerTarget=0;
    applyItems(0,0);
    clearFastTransition();
    applySettleComputer(1);
    computerArtboard.dataset.v264BootPhase='settled';
    clearIntroOwnership();

    scrollState='open';
    transitionRunning=false;
    scrollSyncActive=false;
    lastAppliedCollapse=-1;
    scrollDirection=0;
    /* The very first post-intro frame is reconciled directly to the actual
       document position. There is no delayed catch-up animation. */
    scrollSyncDirty=true;
    syncScrollTarget(true);
  };

  const render = (now=performance.now()) => {
    raf=0;

    if(introRunning){
      if(introPhase==='boot-delay') return;

      if(introPhase==='boot-pop'){
        const t=clamp((now-introPhaseStart)/BOOT_POP_DURATION,0,1);
        const eased=smoother(t);
        const spring=introSpringFor(t,.69,.045);
        introPhaseProgress=eased;
        introSpring=spring;
        applyBootComputer(eased,spring);

        if(t>=1){
          applyBootComputer(1,0);
          computerArtboard.dataset.v264BootPhase='blank';
          introPhase='crt-blank';
          introPhaseStart=now;
          introPhaseProgress=1;
          introSpring=0;

        }
        raf=requestAnimationFrame(render);
        return;
      }

      /* V266 power-on path: keep these short startup stages frame-driven.
         This is intentionally the proven v266 sequence rather than v268's
         timer-only optimization, so the CRT glow/open animation cannot miss
         frames or desynchronize from its WebGL texture. */
      if(introPhase==='crt-blank'){
        applyBootComputer(1,0);
        introPhaseProgress=1;
        introSpring=0;
        if(now-introPhaseStart>=CRT_BLANK_HOLD){
          computerArtboard.dataset.v264BootPhase='powering';
          window.dispatchEvent(new CustomEvent('hero:crt-power-on'));
          introPhase='crt-power';
          introPhaseStart=now;
        }
        raf=requestAnimationFrame(render);
        return;
      }

      if(introPhase==='crt-power'){
        applyBootComputer(1,0);
        introPhaseProgress=1;
        introSpring=0;
        if(now-introPhaseStart>=CRT_POWER_DURATION){
          computerArtboard.dataset.v264BootPhase='booting';
          window.dispatchEvent(new CustomEvent('hero:computer-boot-text-start'));
          introPhase='boot-hold';
          introPhaseStart=now;
        }
        raf=requestAnimationFrame(render);
        return;
      }

      if(introPhase==='boot-hold'){
        applyBootComputer(1,0);
        introPhaseProgress=1;
        introSpring=0;
        if(now-introPhaseStart>=BOOT_HOLD_DURATION){
          computerArtboard.dataset.v264BootPhase='settling';
          window.dispatchEvent(new CustomEvent('hero:computer-settle-start'));
          introPhase='computer-settle';
          introPhaseStart=now;
          introPhaseProgress=0;
        }
        raf=requestAnimationFrame(render);
        return;
      }

      if(introPhase==='computer-settle'){
        const t=clamp((now-introPhaseStart)/COMPUTER_SETTLE_DURATION,0,1);
        /* One continuous ease-in/out path for position + scale + yaw. */
        const eased=t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2;
        introPhaseProgress=eased;
        introSpring=0;

        /* Trigger from what the eye sees: the same eased relocation progress.
           Hero planes start emerging on the exact frame that visible progress
           reaches 5%, while the computer keeps moving uninterrupted. */
        if(!introRevealTriggered && eased>=COMPUTER_REVEAL_PROGRESS){
          startIntroReveal(now);
        }
        applyIntroReveal(now);
        applySettleComputer(eased,t);
        window.dispatchEvent(new CustomEvent('hero:computer-settle-progress',{detail:{progress:eased}}));

        if(t>=1){
          applySettleComputer(1,1);
          computerArtboard.dataset.v264BootPhase='settled';
          window.dispatchEvent(new CustomEvent('hero:computer-settle-progress',{detail:{progress:1}}));
          window.dispatchEvent(new CustomEvent('hero:computer-settled'));
          const revealDone=applyIntroReveal(now);
          if(revealDone){
            finishIntro();
            return;
          }
          introPhase='components';
          introPhaseStart=now;
          introPhaseProgress=1;
        }
        raf=requestAnimationFrame(render);
        return;
      }

      if(introPhase==='components'){
        const revealDone=applyIntroReveal(now);
        applySettleComputer(1,1);
        if(revealDone){
          finishIntro();
          return;
        }
        raf=requestAnimationFrame(render);
        return;
      }
    }

    if(scrollSyncDirty){
      scrollSyncDirty=false;
      syncScrollTarget(false);
    }

    /* V294: only keep ticking while the visual state is actually converging on
       the newest scroll-position target. This gives fast input a readable
       ~quarter-second settle without creating a permanent animation loop. */
    if(stepScrollSmoothing(now)){
      raf=requestAnimationFrame(render);
    }
  };

  const requestRender=()=>{if(!raf)raf=requestAnimationFrame(render)};

  const refresh=()=>{
    measure();
    if(introRunning){
      if(introPhase==='boot-delay'){
        applyItems(1,0);
        applyBootComputer(0,0);
      }else if(introPhase==='boot-pop' || introPhase==='crt-blank' || introPhase==='crt-power' || introPhase==='boot-hold'){
        applyItems(1,0);
        applyBootComputer(introPhaseProgress,introSpring);
      }else if(introPhase==='computer-settle'){
        applySettleComputer(introPhaseProgress,introPhaseProgress);
        applyIntroReveal(performance.now());
      }else if(introPhase==='components'){
        applySettleComputer(1,1);
        applyIntroReveal(performance.now());
      }
    }else{
      /* Resize/pageshow must resolve to the exact new scroll coordinate rather
         than replaying an old transition state. */
      scrollSyncDirty=false;
      syncScrollTarget(true);
    }
  };

  const startFinalHeroSequence = () => {
    if(introStarted) return;
    introStarted=true;
    measure();
    hero.classList.add('v208-exit-ready','v219-auto-intro');

    /* V266 first paint: all other planes stay collapsed while the computer
       enters centered with a genuinely blank CRT. Power-on and BOOTING happen
       only after the computer has visibly arrived. */
    current=1;
    target=1;
    computerCurrent=1;
    computerTarget=1;
    applyItems(1,0);
    applyBootComputer(0,0);
    computerArtboard.dataset.v264BootPhase='blank';

    document.documentElement.classList.remove('v230-hero-prepaint');
    window.dispatchEvent(new CustomEvent('hero:computer-ready'));

    introRunning=true;
    document.documentElement.classList.add('v266-intro-lock');
    document.documentElement.classList.remove('v286-3d-loading');
    introRevealStart=0;
    introRevealTriggered=false;
    if(introStaticTimer){clearTimeout(introStaticTimer);introStaticTimer=0;}
    introPhase='boot-delay';
    introPhaseProgress=0;
    introSpring=0;
    setTimeout(()=>{
      introPhase='boot-pop';
      introPhaseStart=performance.now();
      target=0;
      requestRender();
    },INTRO_HOLD);
  };

  addEventListener('scroll',updateThreshold,{passive:true});
  addEventListener('resize',refresh,{passive:true});
  addEventListener('pageshow',()=>{ if(!introRunning){ scrollSyncDirty=true; requestRender(); } },{passive:true});
  new MutationObserver(requestRender).observe(hero,{attributes:true,attributeFilter:['class']});

  let started=false;
  let baseReady=!!window.__heroDesktopBaseReady;
  let modelReady=!!window.__hero3DRuntimeReady;
  let modelFailed=!!window.__hero3DRuntimeFailed;

  const tryStart=()=>{
    if(started || !baseReady || !modelReady) return;
    started=true;
    startFinalHeroSequence();
  };

  const failOpen=()=>{
    if(started) return;
    started=true;
    /* Genuine WebGL/network failure only: never substitute a computer image.
       Release the page in a usable static state and leave the 3D status message
       available instead of hanging on a blank viewport forever. */
    if(introStaticTimer){clearTimeout(introStaticTimer);introStaticTimer=0;}
    document.documentElement.classList.remove('v286-3d-loading','v230-hero-prepaint','hero-intro-pending','v266-intro-lock','v221-nav-pending');
    measure();
    hero.classList.add('v208-exit-ready');
    current=0; target=0; computerCurrent=0; computerTarget=0;
    applyItems(0,0);
    applyComputer(0,0);
    computer.style.setProperty('opacity','0','important');
    window.dispatchEvent(new CustomEvent('hero:intro-complete'));
  };

  addEventListener('hero:desktop-base-ready',()=>{baseReady=true;tryStart();},{once:true});
  addEventListener('hero:3d-runtime-ready',()=>{modelReady=true;tryStart();},{once:true});
  addEventListener('hero:3d-runtime-failed',()=>{modelFailed=true;failOpen();},{once:true});

  // The V291 loader starts much earlier than this controller. If it already
  // resolved while the document was still parsing, consume the stored state
  // instead of depending on an event that has already fired.
  if(modelFailed) failOpen();
  else tryStart();

  /* Last-resort page-safety release only. The V291 loader has its own shorter
     retry budget, so this should almost never fire. It exists solely to make
     it impossible for a broken request to trap a visitor on the first frame. */
  setTimeout(()=>{ if(!started && !modelReady) failOpen(); },15000);
})();
