(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const desktop = matchMedia('(min-width:769px)').matches;
  const hero = document.querySelector('.figma-hero-section');
  const stage = hero?.querySelector('.figma-hero-stage');
  if (!hero || !stage || !desktop) return;

  /* V244 runtime-clean version of the V207 pointer-depth system. */
  let scene = stage.querySelector('.v206-depth-scene');
  if (!scene) {
    scene = document.createElement('div');
    scene.className = 'v206-depth-scene';
    scene.setAttribute('aria-hidden','false');

    const selectors = [
      '.figma-role-label',
      '.figma-name-first',
      '.figma-name-last',
      '.figma-years',
      '.figma-intro',
      '.figma-actions',
      '.hero-pong-hint',
      '.figma-computer',
      '.figma-music-card',
      '.figma-music-hover-note',
      '.figma-star-bottom',
      '.figma-star-top'
    ];
    const nodes = selectors.map(s => stage.querySelector(`:scope > ${s}`)).filter(Boolean);
    if (!nodes.length) return;
    stage.insertBefore(scene,nodes[0]);
    nodes.forEach(node => scene.appendChild(node));
  }

  /* Treat the music player and its hover annotation as one foreground object. */
  const musicCard = scene.querySelector('.figma-music-card');
  const musicNote = scene.querySelector('.figma-music-hover-note');
  let musicRig = scene.querySelector('.v207-music-rig');
  if (!musicRig && musicCard) {
    musicRig = document.createElement('div');
    musicRig.className = 'v207-music-rig';
    scene.insertBefore(musicRig,musicCard);
    musicRig.appendChild(musicCard);
    if (musicNote) musicRig.appendChild(musicNote);
  }

  const artboard = scene.querySelector('.figma-computer-artboard');
  const screenWrap = artboard?.querySelector('.figma-computer-screen-wrap');

  /* Pong lock follows the existing V204 active class without changing Pong. */
  let pongLocked = !!artboard?.classList.contains('v204-pong-active');
  let transitionLocked = false;
  let motionRequest = null;
  const syncPongLock = () => {
    pongLocked = !!artboard?.classList.contains('v204-pong-active');
    hero.classList.toggle('v207-pong-lock',pongLocked);
    if (motionRequest) motionRequest(pongLocked);
  };
  if (artboard) {
    new MutationObserver(syncPongLock).observe(artboard,{attributes:true,attributeFilter:['class']});
    syncPongLock();
  }

  /* Make Escape global while Pong is active. The original V204 handler still
     owns the actual game exit, so this remains a narrow compatibility patch. */
  addEventListener('keydown',event => {
    if (!artboard?.classList.contains('v204-pong-active')) return;
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    event.preventDefault();
    artboard.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:false,cancelable:true}));
  });

  /* Clicking anywhere outside the Macintosh closes Pong. Clicking the computer
     body outside its screen is already handled by V204 itself. */
  document.addEventListener('click',event => {
    if (!artboard?.classList.contains('v204-pong-active')) return;
    if (artboard.contains(event.target)) return;
    artboard.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:false,cancelable:true}));
  });

  if (reduced || !fine) return;

  /* Depth hierarchy: the Macintosh is intentionally calmer than the music
     player. The foreground player therefore separates clearly from it. */
  const planes = [
    ['.figma-name-first',   1.0,  .65],
    ['.figma-name-last',    1.4,  .90],
    ['.figma-role-label',   1.9,  1.25],
    ['.figma-years',        2.4,  1.55],
    ['.figma-intro',        3.2,  2.10],
    ['.figma-actions',      4.2,  2.80],
    ['.hero-pong-hint',     5.0,  3.30],
    ['.figma-computer',     7.2,  4.80],
    ['.figma-star-bottom', 11.2,  7.40],
    ['.figma-star-top',    19.0, 12.40]
  ].map(([selector,x,y]) => ({el:scene.querySelector(selector),x,y})).filter(p => p.el);

  let tx=0,ty=0,cx=0,cy=0;
  let trx=0,try_=0,crx=0,cry=0;
  let musicScroll=0;
  let raf=0;

  const render = () => {
    raf=0;
    if (transitionLocked) return;

    const targetX = pongLocked ? 0 : tx;
    const targetY = pongLocked ? 0 : ty;
    const targetRx = pongLocked ? 0 : trx;
    const targetRy = pongLocked ? 0 : try_;

    cx += (targetX-cx)*.085;
    cy += (targetY-cy)*.085;
    crx += (targetRx-crx)*.075;
    cry += (targetRy-cry)*.075;

    scene.style.setProperty('--v206-scene-rx',`${crx.toFixed(3)}deg`);
    scene.style.setProperty('--v206-scene-ry',`${cry.toFixed(3)}deg`);

    planes.forEach(({el,x,y}) => {
      el.style.setProperty('--v207-plane-x',`${(cx*x).toFixed(2)}px`);
      el.style.setProperty('--v207-plane-y',`${(cy*y).toFixed(2)}px`);
    });

    if (musicRig) {
      musicRig.style.setProperty('--v207-music-x',`${(cx*17.8).toFixed(2)}px`);
      musicRig.style.setProperty('--v207-music-y',`${(cy*11.7).toFixed(2)}px`);
      musicRig.style.setProperty('--v207-music-scroll-y',`${pongLocked ? 0 : musicScroll.toFixed(2)}px`);
    }

    /* Shadows move opposite the virtual camera. Foreground separation is
       strongest on the music player, lighter on the Macintosh. */
    stage.style.setProperty('--v206-computer-shadow-x',`${(-cx*2.7).toFixed(2)}px`);
    stage.style.setProperty('--v206-computer-shadow-y',`${(13-cy*1.8).toFixed(2)}px`);
    stage.style.setProperty('--v206-music-shadow-x',`${(-cx*5.8).toFixed(2)}px`);
    stage.style.setProperty('--v206-music-shadow-y',`${(22-cy*3.8).toFixed(2)}px`);
    stage.style.setProperty('--v206-star-shadow-x',`${(-cx*3.2).toFixed(2)}px`);
    stage.style.setProperty('--v206-star-shadow-y',`${(10-cy*2.6).toFixed(2)}px`);

    const moving =
      Math.abs(targetX-cx)>.0015 || Math.abs(targetY-cy)>.0015 ||
      Math.abs(targetRx-crx)>.002 || Math.abs(targetRy-cry)>.002;

    const neutralTarget =
      Math.abs(targetX)<.0015 && Math.abs(targetY)<.0015 &&
      Math.abs(targetRx)<.002 && Math.abs(targetRy)<.002;
    const neutralCurrent =
      Math.abs(cx)<.0015 && Math.abs(cy)<.0015 &&
      Math.abs(crx)<.002 && Math.abs(cry)<.002;
    if (!moving && neutralTarget && neutralCurrent) {
      hero.classList.remove('v227-camera-active');
    }
    if (moving) raf=requestAnimationFrame(render);
  };
  const request = () => { if (!raf) raf=requestAnimationFrame(render); };
  motionRequest = lock => {
    if (lock) {
      tx=ty=trx=try_=0;
      hero.classList.remove('v227-camera-active');
    }
    request();
  };

  /* Listen on the full-width Hero, not the centered stage. In side margins the
     logical pointer simply clamps to the nearest stage edge, so there is no
     leave/reset/enter snap. */
  let stageRect = null;
  let stageRectAt = 0;
  const getStageRect = () => {
    const now = performance.now();
    if (!stageRect || now - stageRectAt > 180) {
      stageRect = stage.getBoundingClientRect();
      stageRectAt = now;
    }
    return stageRect;
  };
  const invalidateStageRect = () => { stageRect = null; };
  addEventListener('resize', invalidateStageRect, { passive:true });

  hero.addEventListener('pointermove',event => {
    if (pongLocked || transitionLocked || window.__v288SoftwareRenderer) return;
    hero.classList.add('v227-camera-active');
    const r=getStageRect();
    const px=Math.max(0,Math.min(1,(event.clientX-r.left)/r.width));
    const py=Math.max(0,Math.min(1,(event.clientY-r.top)/r.height));
    tx=(px-.5)*2;
    ty=(py-.5)*2;

    trx=(.5-py)*1.10;
    try_=(px-.5)*1.48;

    stage.style.setProperty('--v206-perspective-x',`${(52+px*12).toFixed(1)}%`);
    stage.style.setProperty('--v206-perspective-y',`${(48+py*10).toFixed(1)}%`);
    stage.style.setProperty('--v207-light-x',`${(42+px*34).toFixed(1)}%`);
    stage.style.setProperty('--v207-light-y',`${(38+py*34).toFixed(1)}%`);
    request();
  },{passive:true});

  hero.addEventListener('pointerleave',()=>{
    if (pongLocked || transitionLocked || window.__v288SoftwareRenderer) return;
    tx=ty=trx=try_=0;
    stage.style.setProperty('--v206-perspective-x','58%');
    stage.style.setProperty('--v206-perspective-y','52%');
    stage.style.setProperty('--v207-light-x','64%');
    stage.style.setProperty('--v207-light-y','56%');
    request();
  },{passive:true});

  /* V244 — the threshold Hero transition is autonomous, and V211/V227 force
     the music rig's legacy scroll offset to zero. The old per-scroll RAF here
     therefore did layout work without changing pixels. Keep the rig at zero
     and freeze pointer-depth writes while the Hero transition is running. */
  musicScroll=0;

  addEventListener('v288:renderer-mode',event => {
    if (!event.detail?.software) return;
    tx=ty=trx=try_=0;
    cx=cy=crx=cry=0;
    hero.classList.remove('v227-camera-active');
    scene.style.setProperty('--v206-scene-rx','0deg');
    scene.style.setProperty('--v206-scene-ry','0deg');
    planes.forEach(({el}) => {
      el.style.setProperty('--v207-plane-x','0px');
      el.style.setProperty('--v207-plane-y','0px');
    });
    if (musicRig) {
      musicRig.style.setProperty('--v207-music-x','0px');
      musicRig.style.setProperty('--v207-music-y','0px');
    }
  });

  addEventListener('hero:scroll-collapse-state',event => {
    transitionLocked=!!event.detail?.active;
    if (transitionLocked) {
      if (raf) cancelAnimationFrame(raf);
      raf=0;
      return;
    }
    /* Preserve the exact pointer position that existed before the transition.
       The next real pointer movement resumes normal parallax with no snap. */
  });
})();
