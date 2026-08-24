(() => {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  const desktopDepth = matchMedia('(min-width:769px)').matches;
  const clamp = (v,a,b) => Math.max(a,Math.min(b,v));

  /* ----------------------------------------------------------------------
     1. WORKS — reveal ROLE / YEAR / IMPACT in the subtitle lane.
     Content is intentionally concise so the original 53.1px row never moves.
     ---------------------------------------------------------------------- */
  const workMeta = {
    fittribe:   { role:'PRODUCT', year:'2026', impact:'END-TO-END CASE STUDY' },
    serene:     { role:'UX + BRAND', year:'2024', impact:'10 → 25+ WEEKLY CLIENTS' },
    rupantaran: { role:'UX + DEV', year:'2024', impact:'SHIPPED END-TO-END' },
    nippon:     { role:'ART DIRECTION', year:'2026', impact:'POSTER SYSTEM' },
    dior:       { role:'AI ART DIR.', year:'2026', impact:'CONCEPT FILM' }
  };

  const workList = document.querySelector('#figma-work-list');
  const enhanceWorkList = () => {
    if (!workList) return;
    workList.querySelectorAll('.figma-work-item').forEach(item => {
      if (item.querySelector('.v204-work-backstage')) return;
      const meta = workMeta[item.dataset.project];
      const copy = item.querySelector('.figma-work-item-copy');
      if (!meta || !copy) return;
      const row = document.createElement('span');
      row.className = 'v204-work-backstage';
      row.setAttribute('aria-hidden','true');
      row.innerHTML = `<b>${meta.role}</b><i></i><span>${meta.year}</span><i></i><span>${meta.impact}</span>`;
      copy.appendChild(row);
    });
  };
  enhanceWorkList();
  if (workList) new MutationObserver(enhanceWorkList).observe(workList,{childList:true,subtree:true});

  /* ----------------------------------------------------------------------
     2. HERO scroll parallax
     V244: intentionally no scroll RAF here. The old V204-derived loop was
     still measuring the Hero on every scroll even though later CSS forces
     its output to zero. Removing it lowers main-thread work during the
     autonomous Hero collapse/re-entry without changing any visible state.
     ---------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------
     3. MACINTOSH PONG — one-player, real Canvas 2D game.
     First click after the typed intro enters Pong. Mouse/touch follows Y;
     W/S and arrow keys also move. First screen click serves. Escape exits.
     ---------------------------------------------------------------------- */
  const artboard = document.querySelector('.figma-computer-artboard');
  const screenWrap = artboard?.querySelector('.figma-computer-screen-wrap');
  let pong = null;

  if (artboard && screenWrap) {
    const canvas = document.createElement('canvas');
    canvas.className = 'v204-pong-canvas v244-pong-safe-surface';
    const DPR = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const W = 234;
    const H = 203;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.setAttribute('aria-label','Playable Pong game. Move the pointer or use W and S.');
    screenWrap.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.setTransform(DPR,0,0,DPR,0,0);
    ctx.imageSmoothingEnabled = false;

    /* V244 — gameplay lives inside the same perspective-shaped CRT vector.
       CSS still masks the canvas, and Canvas clips to the identical path as a
       second safety layer. Physics uses an inset curved playfield so the ball
       and paddles never disappear into the rounded/trapezoid screen edges. */
    const SCREEN_PATH_D = 'M3.46171 21.908C4.0611 15.7074 7.07909 9.57649 13.1085 8.85777C32.2012 6.58186 76.8348 3.11319 119.775 1.24932C166.946 -0.798149 205.676 0.137094 223.234 0.796101C228.97 1.01141 233.457 5.81039 233.552 11.7022L234 102.91L232.953 191.051C232.763 196.707 227.635 201.173 222.135 201.564C206.48 202.678 172.743 203.277 128.789 202.875C82.411 202.451 35.3414 199.634 14.6791 198.038C8.49838 197.56 4.33429 193.617 3.6867 187.289C1.99423 170.75 -0.251706 138.046 0.0229734 107.747C0.27386 80.0733 2.33343 33.5801 3.46171 21.908Z';
    const screenPath = typeof Path2D === 'function' ? new Path2D(SCREEN_PATH_D) : null;

    const paddleW = 4;
    const paddleH = 34;
    const leftX = 13;
    const rightX = W - 17;

    const edgeCurve = x => {
      const edgeDistance = Math.min(clamp(x,0,W), W-clamp(x,0,W));
      const q = clamp((30-edgeDistance)/22,0,1);
      return q*q;
    };
    const topBoundaryAt = x => 6 + edgeCurve(x)*9;
    const bottomBoundaryAt = x => H - 7 - edgeCurve(x)*9;
    const paddleMinY = x => topBoundaryAt(x+paddleW/2) + 2;
    const paddleMaxY = x => bottomBoundaryAt(x+paddleW/2) - paddleH - 2;
    const clampPaddle = (y,x) => clamp(y,paddleMinY(x),paddleMaxY(x));
    let active = false;
    let running = false;
    let ended = false;
    let raf = 0;
    let last = 0;
    let playerY = (H-paddleH)/2;
    let aiY = playerY;
    let targetY = playerY;
    let ball = {x:W/2,y:H/2,vx:88,vy:46,r:2.4};
    let playerScore = 0;
    let aiScore = 0;
    let winner = '';
    const keys = new Set();

    const palette = {
      bg:'#111710',
      dim:'rgba(248,215,178,.72)',
      text:'rgba(255,228,194,.98)',
      accent:'#e59a5b',
      line:'rgba(248,215,178,.24)'
    };

    const resetBall = (towardPlayer = Math.random()>.5) => {
      ball.x = W/2;
      ball.y = clamp(H/2 + (Math.random()-.5)*36, topBoundaryAt(W/2)+8, bottomBoundaryAt(W/2)-8);
      const speed = 90 + (playerScore+aiScore)*3;
      ball.vx = (towardPlayer ? -1 : 1) * speed;
      ball.vy = (Math.random()>.5 ? 1 : -1) * (38 + Math.random()*30);
    };

    const resetGame = () => {
      playerScore = 0;
      aiScore = 0;
      winner = '';
      ended = false;
      running = false;
      playerY = clampPaddle((H-paddleH)/2,leftX);
      targetY = playerY;
      aiY = clampPaddle((H-paddleH)/2,rightX);
      resetBall(false);
      draw();
    };

    const roundRect = (x,y,w,h,r) => {
      ctx.beginPath();
      ctx.roundRect(x,y,w,h,r);
      ctx.fill();
    };

    const text = (value,x,y,size=8,align='left',color=palette.text) => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.font = `${size}px "Pixel Forge", "IBM Plex Mono", monospace`;
      ctx.textAlign = align;
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,.82)';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 1;
      ctx.fillText(value,x,y);
      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0,0,W,H);
      ctx.save();
      if (screenPath) ctx.clip(screenPath);
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0,0,W,H);

      // restrained CRT texture
      ctx.fillStyle = 'rgba(255,255,255,.018)';
      for (let y=1;y<H;y+=4) ctx.fillRect(0,y,W,1);

      ctx.fillStyle = palette.line;
      for (let y=14;y<H-10;y+=12) ctx.fillRect(W/2-.5,y,1,6);

      ctx.fillStyle = palette.text;
      roundRect(leftX,playerY,paddleW,paddleH,1);
      roundRect(rightX,aiY,paddleW,paddleH,1);
      ctx.beginPath();
      ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);
      ctx.fill();

      text(String(playerScore),W/2-24,18,13.5,'center');
      text(String(aiScore),W/2+24,18,13.5,'center');
      text('PONG',W/2,18,7.5,'center',palette.dim);

      if (!running) {
        ctx.fillStyle = 'rgba(12,17,11,.82)';
        ctx.fillRect(18,64,W-36,78);
        if (ended) {
          text(winner, W/2, 84, 12.5, 'center', palette.accent);
          text('CLICK TO RESTART', W/2, 108, 8.2, 'center');
        } else {
          text('READY?', W/2, 82, 13, 'center', palette.accent);
          text('CLICK TO SERVE', W/2, 105, 9.2, 'center');
          text('MOUSE / W S', W/2, 125, 7.4, 'center', palette.dim);
        }
      }
      text('ESC EXIT',W-12,H-12,6.2,'right',palette.dim);
      ctx.restore();
    };

    const scorePoint = (playerWon) => {
      if (playerWon) playerScore += 1;
      else aiScore += 1;

      if (playerScore >= 5 || aiScore >= 5) {
        running = false;
        ended = true;
        winner = playerScore > aiScore ? 'YOU WIN :)' : 'CPU WINS';
        draw();
        return;
      }
      running = false;
      resetBall(!playerWon);
      draw();
      setTimeout(() => {
        if (!active || ended) return;
        running = true;
        last = performance.now();
        if (!raf) raf = requestAnimationFrame(loop);
      }, 520);
    };

    const update = (dt) => {
      const speed = 112;
      if (keys.has('w') || keys.has('arrowup')) targetY -= speed*dt;
      if (keys.has('s') || keys.has('arrowdown')) targetY += speed*dt;
      targetY = clampPaddle(targetY,leftX);
      playerY += (targetY-playerY) * Math.min(1,dt*15);
      playerY = clampPaddle(playerY,leftX);

      const aiTarget = clampPaddle(ball.y-paddleH/2,rightX);
      const aiEase = Math.min(1,dt*(5.6 + Math.min(1.8,(playerScore+aiScore)*.18)));
      aiY += (aiTarget-aiY)*aiEase;
      aiY = clampPaddle(aiY,rightX);

      if (!running) return;
      ball.x += ball.vx*dt;
      ball.y += ball.vy*dt;

      const topWall = topBoundaryAt(ball.x) + 1;
      const bottomWall = bottomBoundaryAt(ball.x) - 1;
      if (ball.y-ball.r <= topWall && ball.vy < 0) {
        ball.y=topWall+ball.r;
        ball.vy*=-1;
      }
      if (ball.y+ball.r >= bottomWall && ball.vy > 0) {
        ball.y=bottomWall-ball.r;
        ball.vy*=-1;
      }

      const hitPaddle = (px,py,leftSide) => {
        const approaching = leftSide ? ball.vx < 0 : ball.vx > 0;
        if (!approaching) return false;
        const withinY = ball.y+ball.r >= py && ball.y-ball.r <= py+paddleH;
        const withinX = leftSide
          ? ball.x-ball.r <= px+paddleW && ball.x > px
          : ball.x+ball.r >= px && ball.x < px+paddleW;
        if (!withinY || !withinX) return false;
        const rel = clamp((ball.y-(py+paddleH/2))/(paddleH/2),-1,1);
        const speedNow = Math.min(155,Math.abs(ball.vx)*1.055);
        ball.vx = (leftSide ? 1 : -1)*speedNow;
        ball.vy = rel*82 + ball.vy*.28;
        ball.x = leftSide ? px+paddleW+ball.r+.5 : px-ball.r-.5;
        return true;
      };

      hitPaddle(leftX,playerY,true);
      hitPaddle(rightX,aiY,false);

      if (ball.x+ball.r < 7) scorePoint(false);
      else if (ball.x-ball.r > W-7) scorePoint(true);
    };

    const loop = (now) => {
      raf = 0;
      if (!active) return;
      const dt = Math.min(.032, Math.max(.001,(now-last)/1000 || .016));
      last = now;
      update(dt);
      draw();
      raf = requestAnimationFrame(loop);
    };

    const startRound = () => {
      if (ended) resetGame();
      if (!running) {
        running = true;
        ended = false;
        last = performance.now();
        if (!raf) raf=requestAnimationFrame(loop);
      }
    };

    const enter = () => {
      if (active) return;
      const api = window.VijvalHeroComputer;
      if (api && !api.isReady()) return;
      active = true;
      artboard.classList.add('v204-pong-active');
      artboard.setAttribute('aria-label','Macintosh Pong. Click the screen to start; Escape exits.');
      resetGame();
      if (document.fonts?.load) {
        Promise.race([
          document.fonts.load('10px "Pixel Forge"'),
          new Promise(resolve => setTimeout(resolve,120))
        ]).then(() => { if (active) draw(); });
      }
      last = performance.now();
      if (!raf) raf=requestAnimationFrame(loop);
    };

    const exit = () => {
      if (!active) return;
      active = false;
      running = false;
      keys.clear();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      artboard.classList.remove('v204-pong-active');
      artboard.setAttribute('aria-label','Open Pong on the Macintosh');
    };

    const setPointerPaddle = e => {
      if (!active) return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.height) return;
      const y = (e.clientY-rect.top)/rect.height*H;
      targetY = clampPaddle(y-paddleH/2,leftX);
    };

    canvas.addEventListener('pointermove',setPointerPaddle,{passive:true});
    canvas.addEventListener('pointerdown',e=>{
      if (!active) return;
      setPointerPaddle(e);
      e.preventDefault();
    });

    // Capture beats the V203 replay handler without removing any of V203's
    // other depth/cursor behavior.
    artboard.addEventListener('click', e => {
      if (!active) {
        e.preventDefault();
        e.stopImmediatePropagation();
        enter();
        return;
      }

      const inScreen = !!e.target.closest('.figma-computer-screen-wrap');
      e.preventDefault();
      e.stopImmediatePropagation();
      if (inScreen) startRound();
      else exit();
    }, true);

    artboard.addEventListener('keydown', e => {
      const key = e.key.toLowerCase();
      if (!active && (key === 'enter' || key === ' ')) {
        e.preventDefault();
        e.stopImmediatePropagation();
        enter();
        return;
      }
      if (!active) return;
      if (key === 'escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        exit();
      } else if (key === 'enter' || key === ' ') {
        e.preventDefault();
        e.stopImmediatePropagation();
        startRound();
      } else if (['w','s','arrowup','arrowdown'].includes(key)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        keys.add(key);
      }
    }, true);

    addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()),{passive:true});

    pong = { enter, exit, isActive:()=>active };
    window.VijvalPong = pong;
  }

  /* Cursor language: V203 creates the cursor; this pass only changes the
     contextual micro-labels to match the new interactions. */
  if (fine) {
    document.addEventListener('pointerover', e => {
      const label = document.querySelector('.v203-cursor-label');
      const ring = document.querySelector('.v203-cursor-ring');
      if (!label || !ring) return;
      const computer = e.target.closest('.figma-computer-artboard');
      const exe = e.target.closest('.v204-about-trigger');
      if (computer) {
        label.textContent = pong?.isActive() ? 'PLAY' : 'PONG';
        label.style.opacity = '1';
        ring.classList.add('is-feature');
      } else if (exe) {
        label.textContent = 'RUN';
        label.style.opacity = '1';
        ring.classList.add('is-interactive');
      }
    }, {passive:true});
  }

  /* ----------------------------------------------------------------------
     4. ABOUT / VIJVAL.EXE — lightweight status cycling.
     ---------------------------------------------------------------------- */
  const aboutDevice = document.querySelector('.about-device');
  const aboutTopbar = aboutDevice?.querySelector('.about-device-topbar');
  const exe = aboutTopbar?.querySelector(':scope > span:first-child');
  const live = aboutTopbar?.querySelector('.about-device-live');
  const photoScreen = aboutDevice?.querySelector('.about-photo-screen');

  if (aboutDevice && exe && live && photoScreen) {
    const modes = [
      ['OBSERVING','PATTERN SCAN / ON'],
      ['DESIGNING','SYSTEM MODE / ACTIVE'],
      ['BUILDING','SHIP MODE / READY'],
      ['CURIOUS','INPUT BUFFER / FULL']
    ];
    let index = -1;
    let hideTimer = 0;
    const originalLive = live.innerHTML;

    exe.classList.add('v204-about-trigger');
    exe.setAttribute('role','button');
    exe.setAttribute('tabindex','0');
    exe.setAttribute('aria-label','Cycle VIJVAL.EXE status');

    const status = document.createElement('div');
    status.className = 'v204-about-status';
    status.setAttribute('aria-live','polite');
    photoScreen.appendChild(status);

    const runMode = () => {
      index = (index+1)%modes.length;
      const [name,detail] = modes[index];
      status.innerHTML = `<strong>&gt; ${name}</strong><span>${detail}</span>`;
      live.innerHTML = `<i></i> ${name}`;
      status.classList.add('is-visible');
      aboutDevice.classList.remove('v204-os-tick');
      void aboutDevice.offsetWidth;
      aboutDevice.classList.add('v204-os-tick');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(()=>status.classList.remove('is-visible'),1900);
      setTimeout(()=>aboutDevice.classList.remove('v204-os-tick'),420);
    };

    exe.addEventListener('click',e=>{
      e.preventDefault();
      e.stopPropagation();
      runMode();
    });
    exe.addEventListener('keydown',e=>{
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        runMode();
      } else if (e.key === 'Escape') {
        live.innerHTML = originalLive;
        status.classList.remove('is-visible');
        exe.blur();
      }
    });
  }

  /* ----------------------------------------------------------------------
     5. SECTION TYPOGRAPHY — kicker appears first, heading follows 82ms later.
     This is deliberately one-time; the established spring still handles
     repeat viewport entries/exits.
     ---------------------------------------------------------------------- */
  if (!reduced && 'IntersectionObserver' in window) {
    const typePairs = [
      ['#work','.figma-work-kicker','.figma-work-title'],
      ['#skills','.figma-skills-kicker','.figma-skills-title'],
      ['#experience','.section-heading .section-kicker','.section-heading h2'],
      ['#about','.about-head-main .section-kicker','.about-head-main h2'],
      ['#contact','.contact-top .section-kicker','.contact-card h2']
    ];
    const sections = [];
    typePairs.forEach(([rootSel,kickerSel,headingSel])=>{
      const section = document.querySelector(rootSel);
      const kicker = section?.querySelector(kickerSel);
      const heading = section?.querySelector(headingSel);
      if (!section || !kicker || !heading) return;
      kicker.dataset.v204Type = 'kicker';
      heading.dataset.v204Type = 'heading';
      sections.push(section);
    });

    document.documentElement.classList.add('v204-type-ready');
    const io = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if (!entry.isIntersecting || entry.intersectionRatio < .12) return;
        entry.target.classList.add('v204-type-in');
        io.unobserve(entry.target);
      });
    },{threshold:[0,.12,.24],rootMargin:'0px 0px -8% 0px'});
    sections.forEach(section=>io.observe(section));
  }
})();
