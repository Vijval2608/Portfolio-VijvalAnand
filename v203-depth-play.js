(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));

  /* ----------------------------------------------------------------------
     1. Cursor — native cursor is hidden only after this system initializes.
     ---------------------------------------------------------------------- */
  /* V232 owns the cursor from scratch. Keep this legacy cursor initializer
     disabled while preserving the rest of V203 (Hero depth, replay, etc.). */
  if (false && fine && !reduced) {
    document.documentElement.classList.add('v203-cursor-on');

    const dot = document.createElement('span');
    const ring = document.createElement('span');
    const label = document.createElement('span');
    dot.className = 'v203-cursor-dot';
    ring.className = 'v203-cursor-ring';
    label.className = 'v203-cursor-label';
    dot.setAttribute('aria-hidden','true');
    ring.setAttribute('aria-hidden','true');
    label.setAttribute('aria-hidden','true');
    document.body.append(dot,ring,label);

    let x = innerWidth/2, y = innerHeight/2;
    let rx = x, ry = y;
    let visible = false;
    let labelText = '';

    const render = () => {
      rx += (x-rx)*.19;
      ry += (y-ry)*.19;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      label.style.left = `${rx}px`;
      label.style.top = `${ry}px`;
      requestAnimationFrame(render);
    };
    render();

    addEventListener('pointermove', e => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        visible = true;
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
    }, {passive:true});

    document.addEventListener('pointerover', e => {
      const target = e.target.closest('a,button,[role="button"],.figma-computer-artboard,.figma-work-card,.figma-sticky-wrap');
      const feature = e.target.closest('.figma-computer-artboard');
      ring.classList.toggle('is-interactive', !!target && !feature);
      ring.classList.toggle('is-feature', !!feature);

      const next = feature ? 'REPLAY' : '';
      if (next !== labelText) {
        labelText = next;
        label.textContent = next;
      }
      label.style.opacity = next ? '1' : '0';
    }, {passive:true});

    document.addEventListener('pointerleave', () => {
      visible = false;
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      label.style.opacity = '0';
    });
  }

  if (reduced) return;

  /* ----------------------------------------------------------------------
     2. Hero — subtle multi-plane pointer parallax + light field.
     Activates only after the existing V199 intro has had control.
     ---------------------------------------------------------------------- */
  const hero = document.querySelector('.figma-hero-section');
  const heroStage = hero?.querySelector('.figma-hero-stage');
  if (hero && heroStage && fine) {
    const layers = [
      // Keep the giant typography closest to the canvas while the physical
      // workstation elements travel farther. The wider spacing between these
      // depth values is what makes the composition read as multiple planes.
      ['.figma-name-first', .04],
      ['.figma-name-last', .07],
      ['.figma-role-label', .12],
      ['.figma-years', .16],
      ['.figma-intro', .20],
      ['.figma-actions', .28],
      ['.figma-computer-shadow', .34],
      ['.figma-lower-shadow', .42],
      ['.figma-computer', .64],
      ['.figma-star-bottom', .72],
      ['.figma-star-top', .88],
      ['.figma-music-card', 1.00]
    ].map(([selector,depth]) => ({el:hero.querySelector(selector),depth})).filter(x => x.el);

    let tx=0,ty=0,cx=0,cy=0,raf=0;
    const settle = () => {
      cx += (tx-cx)*.09;
      cy += (ty-cy)*.09;
      layers.forEach(({el,depth}) => {
        el.style.setProperty('--v203-depth-x', `${(cx*depth*15).toFixed(2)}px`);
        el.style.setProperty('--v203-depth-y', `${(cy*depth*11).toFixed(2)}px`);
      });
      if (Math.abs(tx-cx)>.002 || Math.abs(ty-cy)>.002) raf=requestAnimationFrame(settle);
      else raf=0;
    };

    const activateDepth = () => hero.classList.add('v203-depth-ready');
    if (!document.documentElement.classList.contains('hero-intro-pending')) activateDepth();
    else {
      addEventListener('hero:intro-complete', activateDepth, {once:true});
      setTimeout(activateDepth, 4500);
    }

    heroStage.addEventListener('pointermove', e => {
      const r = heroStage.getBoundingClientRect();
      const px = clamp((e.clientX-r.left)/r.width,0,1);
      const py = clamp((e.clientY-r.top)/r.height,0,1);
      tx = (px-.5)*2;
      ty = (py-.5)*2;
      heroStage.style.setProperty('--v203-hero-light-x', `${(px*100).toFixed(1)}%`);
      heroStage.style.setProperty('--v203-hero-light-y', `${(py*100).toFixed(1)}%`);
      if (!raf) raf=requestAnimationFrame(settle);
    }, {passive:true});

    heroStage.addEventListener('pointerleave', () => {
      tx=0;ty=0;
      heroStage.style.setProperty('--v203-hero-light-x','64%');
      heroStage.style.setProperty('--v203-hero-light-y','58%');
      if (!raf) raf=requestAnimationFrame(settle);
    }, {passive:true});
  }

  /* ----------------------------------------------------------------------
     3. Macintosh replay easter egg — click the computer to restart its typing.
     The existing V135 typing engine exposes replay() in this build.
     ---------------------------------------------------------------------- */
  const artboard = document.querySelector('.figma-computer-artboard');
  if (artboard && fine) {
    const computer = artboard.closest('.figma-computer');
    if (computer) computer.removeAttribute('aria-hidden');
    artboard.setAttribute('role','button');
    artboard.setAttribute('tabindex','0');
    artboard.setAttribute('aria-label','Replay the Macintosh typing animation');

    const replay = () => {
      const api = window.VijvalHeroComputer;
      if (!api?.replay) return;
      artboard.classList.remove('v203-replaying');
      void artboard.offsetWidth;
      artboard.classList.add('v203-replaying');
      api.replay();
      setTimeout(() => artboard.classList.remove('v203-replaying'), 650);
    };
    artboard.addEventListener('click', replay);
    artboard.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        replay();
      }
    });
  }

  /* ----------------------------------------------------------------------
     4. Work stack — each existing card lives on a slightly different plane.
     ---------------------------------------------------------------------- */
  const workWrap = document.querySelector('.figma-work-preview-wrap');
  const workPreview = document.querySelector('#figma-work-preview');
  if (workWrap && workPreview && fine) {
    let tx=0,ty=0,cx=0,cy=0,raf=0;
    const render = () => {
      cx += (tx-cx)*.10;
      cy += (ty-cy)*.10;
      [...workPreview.querySelectorAll('.figma-work-card')].forEach(card => {
        const slot = Number(card.dataset.stackSlot || 0);
        const depth = Math.max(.28, 1 - slot*.14);
        card.style.translate = `${(cx*depth*6.5).toFixed(2)}px ${(cy*depth*4.5).toFixed(2)}px`;
      });
      if (Math.abs(tx-cx)>.002 || Math.abs(ty-cy)>.002) raf=requestAnimationFrame(render);
      else raf=0;
    };
    workWrap.addEventListener('pointermove', e => {
      const r = workWrap.getBoundingClientRect();
      tx = clamp(((e.clientX-r.left)/r.width-.5)*2,-1,1);
      ty = clamp(((e.clientY-r.top)/r.height-.5)*2,-1,1);
      if(!raf)raf=requestAnimationFrame(render);
    }, {passive:true});
    workWrap.addEventListener('pointerleave', () => {
      tx=0;ty=0;
      if(!raf)raf=requestAnimationFrame(render);
    }, {passive:true});

    /* figma-work.js re-renders cards as projects change. MutationObserver
       ensures freshly-created cards inherit the current physical state. */
    new MutationObserver(() => { if(!raf)raf=requestAnimationFrame(render); })
      .observe(workPreview,{childList:true,subtree:false});
  }

  /* ----------------------------------------------------------------------
     5. Process film scrub — ±14px maximum, independent from scroll transform.
     ---------------------------------------------------------------------- */
  const processStage = document.querySelector('.figma-process-stage');
  const film = document.querySelector('#figma-process-film');
  if (processStage && film && fine) {
    let target=0,current=0,raf=0;
    const animate = () => {
      current += (target-current)*.11;
      film.style.translate = `${current.toFixed(2)}px 0`;
      if(Math.abs(target-current)>.03) raf=requestAnimationFrame(animate);
      else raf=0;
    };
    processStage.addEventListener('pointermove', e => {
      const r=processStage.getBoundingClientRect();
      const n=clamp(((e.clientX-r.left)/r.width-.5)*2,-1,1);
      target=n*14;
      if(!raf)raf=requestAnimationFrame(animate);
    },{passive:true});
    processStage.addEventListener('pointerleave',()=>{
      target=0;
      if(!raf)raf=requestAnimationFrame(animate);
    },{passive:true});
  }
})();
