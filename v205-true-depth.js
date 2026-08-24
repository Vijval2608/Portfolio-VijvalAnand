(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const desktop = matchMedia('(min-width:769px)').matches;

  /* Process: V204's one-time heading transform could briefly own `transform`
     while the original section spring/parallax was settling. Remove only that
     extra choreography from Process; all other V204 section entries stay. */
  const process = document.querySelector('#process');
  if (process) {
    process.querySelector('.figma-process-kicker')?.removeAttribute('data-v204-type');
    process.querySelector('.figma-process-title')?.removeAttribute('data-v204-type');
  }

  /* About: build actual side faces rather than a second offset rectangle. */
  const card = document.querySelector('[data-about-tilt]');
  if (!card || reduced || !fine || !desktop) return;

  if (!card.classList.contains('v205-true-3d')) {
    card.classList.add('v205-true-3d');
    ['right','left','bottom','top'].forEach(side => {
      const face = document.createElement('span');
      face.className = `v205-device-side v205-device-side--${side}`;
      face.setAttribute('aria-hidden','true');
      card.prepend(face);
    });
  }

  let tx=.10,tl=.045,tt=.12,tb=.025;
  let cx=tx,cl=tl,ct=tt,cb=tb;
  let raf=0;
  const render = () => {
    cx += (tx-cx)*.12;
    cl += (tl-cl)*.12;
    ct += (tt-ct)*.12;
    cb += (tb-cb)*.12;
    card.style.setProperty('--v205-edge-right',cx.toFixed(3));
    card.style.setProperty('--v205-edge-left',cl.toFixed(3));
    card.style.setProperty('--v205-edge-top',ct.toFixed(3));
    card.style.setProperty('--v205-edge-bottom',cb.toFixed(3));
    const moving = Math.abs(tx-cx)>.002 || Math.abs(tl-cl)>.002 || Math.abs(tt-ct)>.002 || Math.abs(tb-cb)>.002;
    raf = moving ? requestAnimationFrame(render) : 0;
  };
  const request = () => { if (!raf) raf=requestAnimationFrame(render); };

  card.addEventListener('pointermove', event => {
    const rect=card.getBoundingClientRect();
    const px=Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width));
    const py=Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height));
    /* Light the edge facing the virtual pointer and dim its opposite. */
    tx=.035 + (1-px)*.13;
    tl=.035 + px*.11;
    tt=.045 + (1-py)*.12;
    tb=.018 + py*.075;
    request();
  },{passive:true});

  card.addEventListener('pointerleave',()=>{
    tx=.10;tl=.045;tt=.12;tb=.025;
    request();
  },{passive:true});
})();
