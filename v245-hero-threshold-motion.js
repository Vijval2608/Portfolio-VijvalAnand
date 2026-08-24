/* V245 — Robust threshold Hero motion: fast-scroll recovery + reversible autonomous transition. */
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

  /* V242 — threshold-triggered Hero transition. Scroll no longer scrubs the
     transform continuously. Crossing a breakpoint starts one autonomous
     animation that runs to completion on its own RAF timeline. */
  let transitionRunning=false;
  let transitionStart=0;
  let transitionFrom=0;
  let transitionTo=0;
  let transitionDuration=0;
  let scrollState='open';
  let heroDocumentTop=0;
  let scrollTravel=1;
  let lastRaw=0;
  let thresholdReady=false;
  let scrollDirection=0;
  let directionAnchor=0;

  const EXIT_TRIGGER=.11;
  const ENTRY_TRIGGER=.78;
  const REVERSE_TRAVEL=.075;
  const EXIT_DURATION=860;
  const ENTRY_DURATION=920;

  /* V225: three strictly sequential desktop load stages.
     1. Macintosh only.
     2. Hero planes only after the Macintosh is fully settled.
     3. Navbar is triggered by hero:intro-complete after stage 2. */
  const INTRO_HOLD=180;
  const COMPUTER_DURATION=1050;
  const COMPONENT_DURATION=2050; // shared with the synchronized navbar reveal

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

  const applyItems = (p,spring=0) => {
    geometry.forEach(item=>applyItem(item,p,spring));
  };

  /* V244 — the threshold transition is autonomous, so it does not need to
     mutate seven CSS properties/variables per plane on every frame. Snapshot
     the resting parallax coordinates once, then animate only compositor-friendly
     translate / scale / opacity. The canonical V208 variables are committed
     once at the end so the rest of the site's interaction model stays intact. */
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

  const applyItemFast = (item,p) => {
    const local=clamp((p-item.start)/(item.end-item.start),0,1);
    const e=smooth(local);
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

  const applyItemsFast = p => geometry.forEach(item=>applyItemFast(item,p));

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

  const emitTransitionState = active => {
    hero.classList.toggle('v242-hero-transitioning',active);
    window.dispatchEvent(new CustomEvent('hero:scroll-collapse-state',{detail:{active}}));
  };

  const rawScrollProgress = () => {
    const y=window.scrollY||window.pageYOffset||0;
    return clamp((y-heroDocumentTop)/scrollTravel,0,1);
  };

  const releasePongForScroll = () => {
    const pong = window.VijvalPong;
    if (pong?.isActive?.()) pong.exit();
    /* MutationObserver sync in V207 runs immediately after this stack, but the
       collapse must not wait a frame for the old focus-lock class to clear. */
    hero.classList.remove('v207-pong-lock');
  };

  const startScrollTransition = to => {
    if(introRunning) return;
    to=to>=.5?1:0;
    if (hero.classList.contains('v207-pong-lock') || window.VijvalPong?.isActive?.()) {
      releasePongForScroll();
    }
    if(transitionRunning && Math.abs(transitionTo-to)<.001) return;
    if(!transitionRunning && ((to===1 && scrollState==='collapsed') || (to===0 && scrollState==='open'))) return;

    transitionFrom=(current+computerCurrent)*.5;
    transitionTo=to;
    transitionStart=performance.now();
    const remaining=Math.max(.18,Math.abs(transitionTo-transitionFrom));
    transitionDuration=(to===1?EXIT_DURATION:ENTRY_DURATION)*Math.max(.58,remaining);
    transitionRunning=true;
    emitTransitionState(true);
    /* The event above synchronously freezes pointer-depth updates in V244.
       Snapshot those stable coordinates only after the lock is active. */
    prepareFastTransition();
    requestRender();
  };

  const reconcileMissedExit = () => {
    /* A very fast wheel/trackpad gesture can move the document beyond the Hero
       before the autonomous RAF visibly gets a chance to run. If we later see
       an upward re-entry while the logical state is still open, reconcile the
       off-screen scene to its collapsed endpoint first. This is intentionally
       done only near the bottom of the Hero where the user cannot see the snap. */
    current=1;
    computerCurrent=1;
    target=1;
    computerTarget=1;
    commitTransitionState(1);
    transitionRunning=false;
    scrollState='collapsed';
    emitTransitionState(false);
  };

  const updateThreshold = () => {
    if(introRunning) return;
    const raw=rawScrollProgress();
    if(!thresholdReady){
      thresholdReady=true;
      lastRaw=raw;
      directionAnchor=raw;
      return;
    }

    const delta=raw-lastRaw;
    const dir=delta>.001?1:(delta<-.001?-1:0);

    /* Scrolling away is always allowed to beat game focus. */
    if (dir>0 && (hero.classList.contains('v207-pong-lock') || window.VijvalPong?.isActive?.())) {
      releasePongForScroll();
    }

    if(dir && dir!==scrollDirection){
      scrollDirection=dir;
      directionAnchor=lastRaw;
    }

    if(dir>0){
      /* Trigger even after a large single-frame jump. Also allow an in-progress
         entry to reverse immediately instead of waiting for its state commit. */
      const needsExit = scrollState!=='collapsed' || (transitionRunning && transitionTo!==1);
      const crossed = lastRaw<EXIT_TRIGGER && raw>=EXIT_TRIGGER;
      const alreadyPast = raw>=EXIT_TRIGGER && (lastRaw>=EXIT_TRIGGER || raw-lastRaw>.025);
      const reversedEnough = raw-directionAnchor>=REVERSE_TRAVEL;
      if(needsExit && (crossed || alreadyPast || (directionAnchor>=EXIT_TRIGGER && reversedEnough))){
        startScrollTransition(1);
      }
    }else if(dir<0){
      /* If the user reversed while the exit is still running, reverse that exact
         transition from its current frame. This is the case the old state
         machine missed because scrollState remained `open` until onfinish. */
      const exitingNow = transitionRunning && transitionTo===1;
      const needsEntry = scrollState!=='open' || exitingNow;
      const crossed = lastRaw>ENTRY_TRIGGER && raw<=ENTRY_TRIGGER;
      const alreadyPast = raw<=ENTRY_TRIGGER && (lastRaw<=ENTRY_TRIGGER || lastRaw-raw>.025);
      const reversedEnough = directionAnchor-raw>=REVERSE_TRAVEL;

      /* Recovery path for a true skipped exit. Do this while virtually all of
         the Hero is offscreen, then the normal entry trigger can animate out. */
      if(!transitionRunning && scrollState==='open' && lastRaw>.94 && raw<lastRaw){
        reconcileMissedExit();
      }

      if((scrollState!=='open' || (transitionRunning && transitionTo===1)) &&
         (crossed || alreadyPast || (directionAnchor<=ENTRY_TRIGGER && reversedEnough))){
        startScrollTransition(0);
      }
    }

    lastRaw=raw;
  };

  const finishIntro = () => {
    introRunning=false;
    introPhase='done';
    current=0;
    target=0;
    computerCurrent=0;
    computerTarget=0;
    applyItems(0,0);
    applyComputer(0,0,true);
    clearIntroOwnership();

    scrollState='open';
    transitionRunning=false;
    const raw=rawScrollProgress();
    lastRaw=raw;
    directionAnchor=raw;
    thresholdReady=true;
    scrollDirection=0;

    /* If the visitor scrolled significantly during the intro, honor that
       intent once the intro relinquishes ownership. */
    if(raw>=EXIT_TRIGGER+.04) startScrollTransition(1);
  };

  const render = (now=performance.now()) => {
    raf=0;

    if(introRunning){
      if(introPhase==='computer'){
        const t=clamp((now-introPhaseStart)/COMPUTER_DURATION,0,1);
        const eased=smoother(t);
        const p=1-eased;
        const spring=introSpringFor(t,.76,.036);
        introPhaseProgress=p;
        introSpring=spring;

        /* Stage 1: every non-computer layer is held fully collapsed/invisible.
           The Macintosh is literally the only Hero object allowed to move. */
        applyItems(1,0);
        applyComputer(p,spring,true);

        if(t>=1){
          /* Hard settle at the exact approved final Macintosh state BEFORE
             stage 2 starts. No visual overlap between the two stages. */
          applyComputer(0,0,true);
          applyItems(1,0);
          introPhase='components';
          introPhaseStart=now;
          introPhaseProgress=1;
          introSpring=0;

          // Navbar and component reveal share the exact same start timestamp.
          window.dispatchEvent(new CustomEvent('hero:components-start', {
            detail:{ duration:COMPONENT_DURATION }
          }));
        }
        raf=requestAnimationFrame(render);
        return;
      }

      if(introPhase==='components'){
        const t=clamp((now-introPhaseStart)/COMPONENT_DURATION,0,1);
        const eased=smoother(t);
        const p=1-eased;
        const spring=introSpringFor(t,.66,.034);
        introPhaseProgress=p;
        introSpring=spring;
        current=p;

        /* Stage 2: Macintosh is frozen at 100% / final position. All other
           planes—including the complete music rig—replay the approved reverse
           scroll geometry out from behind it. */
        applyComputer(0,0,true);
        applyItems(p,spring);

        if(t>=1){
          finishIntro();
          return;
        }
        raf=requestAnimationFrame(render);
        return;
      }
    }

    if(transitionRunning){
      const t=clamp((now-transitionStart)/transitionDuration,0,1);
      /* Immediate response + long soft settle. Unlike smootherstep, this does
         not spend the first part of the animation barely moving, which can
         read as input lag after the threshold is crossed. */
      const eased=transitionEase(t);
      const p=mix(transitionFrom,transitionTo,eased);

      current=p;
      computerCurrent=p;
      applyItemsFast(current);
      applyComputerFast(computerCurrent);

      if(t<1){
        raf=requestAnimationFrame(render);
      }else{
        current=transitionTo;
        computerCurrent=transitionTo;
        target=transitionTo;
        computerTarget=transitionTo;
        /* Commit the exact original V208/V236 end state once, then release
           the direct compositor ownership. */
        commitTransitionState(transitionTo);
        transitionRunning=false;
        scrollState=transitionTo===1?'collapsed':'open';
        emitTransitionState(false);
      }
      return;
    }

    /* Outside the threshold animation, the Hero is truly static. Scroll
       events do not alter component transforms frame-by-frame anymore. */
  };

  const requestRender=()=>{if(!raf)raf=requestAnimationFrame(render)};

  const refresh=()=>{
    measure();
    if(introRunning){
      if(introPhase==='computer'){
        applyItems(1,0);
        applyComputer(introPhaseProgress,introSpring,true);
      }else if(introPhase==='components'){
        applyComputer(0,0,true);
        applyItems(introPhaseProgress,introSpring);
      }
    }else if(transitionRunning){
      prepareFastTransition();
      applyItemsFast(current);
      applyComputerFast(computerCurrent);
    }else{
      applyItems(scrollState==='collapsed'?1:0,0);
      applyComputer(scrollState==='collapsed'?1:0,0);
      lastRaw=rawScrollProgress();
      directionAnchor=lastRaw;
    }
  };

  const startFinalHeroSequence = () => {
    if(introStarted) return;
    introStarted=true;
    measure();
    hero.classList.add('v208-exit-ready','v219-auto-intro');

    /* Closed scene at first paint: Macintosh visible, every other layer hidden
       behind it. Navbar remains hidden by v221-nav-pending. */
    current=1;
    target=1;
    computerCurrent=1;
    computerTarget=1;
    applyItems(1,0);
    applyComputer(1,0,true);

    /* V230: the artboard was already scale(0)/opacity:0 in raw HTML before
       CSS or JS ran. The motion controller now owns those exact values too.
       Only at this point is the stage allowed to paint. */
    document.documentElement.classList.remove('v230-hero-prepaint');

    /* CRT can boot while the physical Macintosh performs stage 1. */
    window.dispatchEvent(new CustomEvent('hero:computer-ready'));

    setTimeout(()=>{
      introRunning=true;
      introPhase='computer';
      introPhaseStart=performance.now();
      introPhaseProgress=1;
      introSpring=0;
      target=0;
      requestRender();
    },INTRO_HOLD);
  };

  addEventListener('scroll',updateThreshold,{passive:true});
  addEventListener('resize',refresh,{passive:true});
  new MutationObserver(requestRender).observe(hero,{attributes:true,attributeFilter:['class']});

  let started=false;
  const start=()=>{
    if(started) return;
    started=true;
    startFinalHeroSequence();
  };
  addEventListener('hero:desktop-base-ready',start,{once:true});
  if (window.__heroDesktopBaseReady) {
    start();
  } else {
    /* Local base script should report readiness first. Safety start exists only
       for a failed/missed base-script load; the stage/artboard remain hidden at
       scale 0 until then, so even this fallback cannot produce a flash. */
    setTimeout(start,1200);
  }
})();
