(() => {
  const projects = window.PORTFOLIO_PROJECTS || [];
  const listEl = document.querySelector('#work-list');
  const previewEl = document.querySelector('#work-preview');
  const moreBtn = document.querySelector('#show-more-work');
  const prevBtn = document.querySelector('#work-prev');
  const nextBtn = document.querySelector('#work-next');
  const navCurrent = document.querySelector('#work-nav-current');
  const navTotal = document.querySelector('#work-nav-total');
  const viewer = document.querySelector('#viewer');
  const viewerTitle = document.querySelector('#viewer-title');
  const viewerContent = document.querySelector('#viewer-content');
  const viewerClose = document.querySelector('#viewer-close');
  const viewerBackdrop = document.querySelector('.viewer-backdrop');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer:fine)').matches;

  let showMore = false;
  let activeId = projects.find(p => p.featured)?.id || projects[0]?.id;
  let previewTween = null;
  let hoverTimer = null;

  const actionIcon = kind => ({ figma:'◈', live:'↗', view:'◎', behance:'Bē' }[kind] || '↗');
  const visibleProjects = () => projects.filter(p => p.featured || showMore);
  const activeProject = () => projects.find(p => p.id === activeId) || visibleProjects()[0];

  function generatedArt(art) {
    const map = {
      edpi:`<div class="art art-edpi"><div class="edpi-dashboard"><div class="edpi-sidebar"></div><div class="edpi-navdots"></div><div class="edpi-topbar"></div><div class="edpi-stat s1"></div><div class="edpi-stat s2"></div><div class="edpi-stat s3"></div><div class="edpi-chart"></div><div class="edpi-list"></div></div></div>`,
      fittribe:`<div class="art art-fittribe">${[1,2,3].map(n=>`<div class="phone p${n}"><div class="phone-screen">${n===2?'<div class="fit-ring"></div>':'<div class="fit-hero"></div>'}<div class="fit-lines"></div></div></div>`).join('')}</div>`,
      wareiq:`<div class="art art-wareiq"><div class="warehouse-grid"></div><div class="package"></div><div class="scan-beam"></div></div>`,
      dior:`<div class="art art-dior"><div class="dior-halo"></div><div class="dior-bottle"></div></div>`,
      fasco:`<div class="art art-fasco"><div class="fasco-title">FASCO</div></div>`,
      logos:`<div class="art art-logos"><div class="logo-wall"><span>VA</span><span>M</span><span>∞</span><span>NO.</span><span>+</span><span>AI</span></div></div>`,
      fitagotchi:`<div class="art art-fitagotchi"><div class="pocket-device"><div class="pocket-screen"></div><div class="pocket-btn b1"></div><div class="pocket-btn b2"></div><div class="pocket-btn b3"></div></div></div>`,
      nippon:`<div class="art art-nippon"><div class="nippon-orbit"></div><div class="nippon-word">NIPPON</div></div>`,
      ads:`<div class="art art-ads"><div class="ads-reel"><span></span><span></span><span></span><span></span></div></div>`
    };
    return map[art] || `<div class="art"></div>`;
  }

  function thumbMarkup(p) {
    if (p.visual?.type === 'image') {
      return `<span class="work-thumb"><img src="${p.visual.src}" alt="" loading="lazy"></span>`;
    }
    return `<span class="work-thumb work-thumb-swatch swatch-${p.visual?.art || 'generic'}" aria-hidden="true"></span>`;
  }

  function renderVisual(p){
    if (p.visual?.type === 'image') {
      return `<img class="project-image" src="${p.visual.src}" alt="${p.title} project preview" style="object-position:${p.visual.position || 'center'}"/>`;
    }
    return generatedArt(p.visual?.art);
  }

  function renderActions(p){
    if(!p.actions?.length) return '';
    return p.actions.map((a,i)=>{
      const primary = i === 0 ? 'primary' : '';
      if(a.kind==='view') {
        return `<button class="project-action ${primary}" type="button" data-view-project="${p.id}"><span>${actionIcon(a.kind)}</span>${a.label}</button>`;
      }
      return `<a class="project-action ${primary}" href="${a.href}" target="_blank" rel="noopener"><span>${actionIcon(a.kind)}</span>${a.label}</a>`;
    }).join('');
  }

  function updateNav(){
    const visible = visibleProjects();
    const i = Math.max(0, visible.findIndex(p => p.id === activeId));
    if(navCurrent) navCurrent.textContent = String(i + 1).padStart(2,'0');
    if(navTotal) navTotal.textContent = String(visible.length).padStart(2,'0');
  }

  function syncActiveList() {
    listEl?.querySelectorAll('.work-item').forEach(item => {
      const active = item.dataset.project === activeId;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    updateNav();
  }

  function renderList(){
    if(!listEl) return;
    const visible = visibleProjects();
    listEl.innerHTML = visible.map((p,i)=>`
      <button class="work-item ${p.id===activeId?'active':''}" type="button" data-project="${p.id}" aria-pressed="${p.id===activeId}">
        <span class="work-item-index">${String(i+1).padStart(2,'0')}</span>
        ${thumbMarkup(p)}
        <span class="work-item-text"><strong>${p.title}</strong><span>${p.eyebrow}</span></span>
        <span class="work-item-year">${p.year}</span>
        <span class="work-item-arrow" aria-hidden="true">↗</span>
      </button>`).join('');

    listEl.querySelectorAll('.work-item').forEach(item => {
      const id = item.dataset.project;
      item.addEventListener('mouseenter', () => {
        clearTimeout(hoverTimer);
        hoverTimer = setTimeout(() => setActiveProject(id), 55);
      });
      item.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
      item.addEventListener('focus', () => setActiveProject(id));
      item.addEventListener('click', () => setActiveProject(id, true));
    });
    updateNav();
  }

  function previewMarkup(p) {
    return `
      <div class="project-visual ${p.visual?.type === 'image' ? 'has-image' : 'has-art'}">
        ${renderVisual(p)}
        ${(p.floaters||[]).map(f=>`<div class="project-floater"><small>${f.kicker}</small><strong>${f.value}</strong></div>`).join('')}
      </div>
      <div class="project-info">
        <div>
          <p class="eyebrow">${p.eyebrow.toUpperCase()} · ${p.year}</p>
          <h3>${p.title}</h3>
          <p class="summary">${p.summary}</p>
          <div class="project-tags">${(p.tags||[]).map(t=>`<span>${t}</span>`).join('')}</div>
        </div>
        <div class="project-actions">${renderActions(p)}</div>
      </div>`;
  }

  function bindPreviewInteractions(p) {
    previewEl?.querySelectorAll('[data-view-project]').forEach(btn => btn.addEventListener('click', () => openViewer(p)));

    const visual = previewEl?.querySelector('.project-visual');
    if (!visual || !finePointer || reducedMotion) return;
    const art = visual.querySelector('.art');
    const floaters = [...visual.querySelectorAll('.project-floater')];

    const reset = () => {
      visual.style.setProperty('--tilt-x', '0deg');
      visual.style.setProperty('--tilt-y', '0deg');
      floaters.forEach((f,i) => f.style.transform = `translate3d(0,0,0) rotate(${i ? -2 : 2}deg)`);
    };

    visual.addEventListener('pointermove', e => {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      visual.style.setProperty('--tilt-x', `${(-y * 2.2).toFixed(2)}deg`);
      visual.style.setProperty('--tilt-y', `${(x * 2.8).toFixed(2)}deg`);
      if (art) art.style.transform = `perspective(1000px) rotateX(${(-y*2.2).toFixed(2)}deg) rotateY(${(x*2.8).toFixed(2)}deg) scale(1.012)`;
      floaters.forEach((f,i) => {
        const depth = i ? 8 : 12;
        f.style.transform = `translate3d(${(x*depth).toFixed(1)}px,${(y*depth).toFixed(1)}px,0) rotate(${i ? -2 : 2}deg)`;
      });
    });
    visual.addEventListener('pointerleave', () => {
      if (art) art.style.transform = '';
      reset();
    });
  }

  function renderPreview(animate=false){
    if(!previewEl) return;
    const p = activeProject();
    if(!p) return;

    const replace = () => {
      previewEl.innerHTML = previewMarkup(p);
      bindPreviewInteractions(p);
      updateNav();
      if (animate && window.gsap && !reducedMotion) {
        const visual = previewEl.querySelector('.project-visual');
        const info = previewEl.querySelectorAll('.project-info > *, .project-floater');
        gsap.fromTo(visual,{opacity:.5,scale:.988,y:9},{opacity:1,scale:1,y:0,duration:.52,ease:'back.out(1.12)',overwrite:true});
        gsap.fromTo(info,{opacity:0,y:8},{opacity:1,y:0,duration:.34,stagger:.03,ease:'power3.out',overwrite:true});
      }
    };

    if (animate && window.gsap && !reducedMotion && previewEl.children.length) {
      if (previewTween) previewTween.kill();
      previewTween = gsap.to(previewEl.children,{opacity:.2,y:-5,duration:.14,ease:'power2.in',stagger:.01,onComplete:replace,overwrite:true});
    } else replace();
  }

  function setActiveProject(id, scrollPreview=false){
    if(!id || id===activeId) return;
    activeId = id;
    syncActiveList();
    renderPreview(true);
    if(scrollPreview && window.innerWidth<861) {
      document.querySelector('.work-preview-sticky')?.scrollIntoView({behavior:reducedMotion?'auto':'smooth', block:'start'});
    }
  }

  function moveProject(dir){
    const visible = visibleProjects();
    if(!visible.length) return;
    const i = Math.max(0, visible.findIndex(p => p.id === activeId));
    const next = (i + dir + visible.length) % visible.length;
    setActiveProject(visible[next].id);
    listEl?.querySelector('.work-item.active')?.scrollIntoView({block:'nearest', behavior:reducedMotion?'auto':'smooth'});
  }

  function generatedCase(project, art){
    const content = art === 'edpi' ? [
      ['01 / Product narrative','Website, brand and product visuals designed to make a complex B2B system easier to understand.'],
      ['02 / Design system','Reusable components, states and interaction rules that scale across dense organization-management workflows.'],
      ['03 / Product UI','Dashboards and software screens structured around hierarchy, progressive disclosure and predictable behaviour.']
    ] : [
      ['01 / Product story','A fitness mobile experience presented as a complete product story rather than a gallery of isolated screens.'],
      ['02 / UX + UI','Flows, interface patterns and progression are organised into one continuous mobile experience.'],
      ['03 / Case-study viewer','Replace this demo with your final FitTribe PDF or exported case-study images when you are ready.']
    ];
    return `<div class="generated-case"><div class="case-cover">${generatedArt(art)}</div>${content.map(([h,p])=>`<section class="case-block"><h4>${h}</h4><p>${p}</p></section>`).join('')}</div>`;
  }

  function openViewer(project){
    const action = project.actions?.find(a => a.kind === 'view');
    if(!action?.viewer || !viewer) return;
    const cfg = action.viewer;
    viewerTitle.textContent = project.title;
    if(cfg.type==='pdf') viewerContent.innerHTML = `<iframe src="${cfg.src}#view=FitH" title="${project.title} case study"></iframe>`;
    else if(cfg.type==='video') viewerContent.innerHTML = `<video src="${cfg.src}" ${cfg.poster?`poster="${cfg.poster}"`:''} controls playsinline autoplay></video>`;
    else if(cfg.type==='images') viewerContent.innerHTML = `<div class="viewer-images">${(cfg.images||[]).map(src=>`<img src="${src}" alt="${project.title} case study section"/>`).join('')}</div>`;
    else if(cfg.type==='generated') viewerContent.innerHTML = generatedCase(project,cfg.art);
    viewer.classList.add('open');
    viewer.setAttribute('aria-hidden','false');
    document.body.classList.add('viewer-open');
    viewerClose?.focus();
  }

  function closeViewer(){
    if(!viewer) return;
    viewerContent?.querySelector('video')?.pause();
    viewer.classList.remove('open');
    viewer.setAttribute('aria-hidden','true');
    document.body.classList.remove('viewer-open');
    setTimeout(() => { if(viewerContent) viewerContent.innerHTML=''; }, 260);
  }

  moreBtn?.addEventListener('click', () => {
    showMore = !showMore;
    if(!showMore && projects.find(p => p.id === activeId && !p.featured)) activeId = projects.find(p => p.featured)?.id || activeId;
    moreBtn.classList.toggle('open',showMore);
    moreBtn.querySelector('span:first-child').textContent = showMore ? 'Show less' : 'Show more designs';
    renderList();
    renderPreview(true);
    if (window.gsap && !reducedMotion) {
      gsap.from(listEl.querySelectorAll('.work-item'),{opacity:0,y:6,duration:.34,stagger:.025,ease:'power2.out',overwrite:true});
    }
  });

  prevBtn?.addEventListener('click', () => moveProject(-1));
  nextBtn?.addEventListener('click', () => moveProject(1));
  viewerClose?.addEventListener('click', closeViewer);
  viewerBackdrop?.addEventListener('click', closeViewer);
  document.addEventListener('keydown', e => {
    if(e.key==='Escape' && viewer?.classList.contains('open')) closeViewer();
    if((e.key==='ArrowLeft'||e.key==='ArrowRight') && document.activeElement?.closest('.modular-work')) moveProject(e.key==='ArrowRight'?1:-1);
  });

  // Preload real project thumbnails to make hover changes feel immediate.
  projects.forEach(p => {
    if(p.visual?.type === 'image') {
      const img = new Image();
      img.src = p.visual.src;
    }
  });

  renderList();
  renderPreview(false);

  // Horizontal process driven by normal vertical scroll.
  if(window.gsap && window.ScrollTrigger && !reducedMotion){
    gsap.registerPlugin(ScrollTrigger);
    const track = document.querySelector('#process-track');
    const pin = document.querySelector('.process-pin');
    const stories = gsap.utils.toArray('.process-story');
    const hudProgress = document.querySelector('#process-hud-progress');
    const hudLabel = document.querySelector('#process-hud-label');
    const hudDots = gsap.utils.toArray('.process-hud-dots i');
    const labels = ['Understand','Structure','Prototype','Ship + refine'];
    const mm = gsap.matchMedia();

    mm.add('(min-width: 861px)', () => {
      if(!track || !pin || !stories.length) return;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const duration = () => Math.max(distance() * 1.08, window.innerHeight * 3.05);

      const horizontal = gsap.to(track, {
        x: () => -distance(),
        ease:'none',
        scrollTrigger:{
          trigger:pin,
          start:'top top',
          end:() => `+=${duration()}`,
          pin:true,
          scrub:1.05,
          anticipatePin:1,
          invalidateOnRefresh:true,
          onUpdate:self => {
            if(hudProgress) gsap.set(hudProgress,{scaleX:self.progress});
            const idx = Math.min(stories.length-1, Math.max(0, Math.round(self.progress*(stories.length-1))));
            if(hudLabel) hudLabel.textContent = labels[idx];
            hudDots.forEach((dot,i) => dot.classList.toggle('active',i===idx));
          }
        }
      });

      stories.forEach((story, index) => {
        const copy = story.querySelector('.process-copy');
        const graphic = story.querySelector('.motion-graphic');
        gsap.fromTo(copy,{opacity:.48,y:26},{opacity:1,y:0,ease:'none',scrollTrigger:{trigger:story,containerAnimation:horizontal,start:'left 86%',end:'left 55%',scrub:.75}});
        if(graphic) gsap.fromTo(graphic,{opacity:.62,scale:.965,y:14,rotate:index%2?1:-1},{opacity:1,scale:1,y:0,rotate:0,ease:'none',scrollTrigger:{trigger:story,containerAnimation:horizontal,start:'left 90%',end:'left 53%',scrub:.8}});
      });

      // Story-specific motion. Each animation is restrained and either scroll-linked or slow looping.
      const [understand, structure, prototype, ship] = stories;
      if (understand) {
        gsap.to('.signal-card.s1',{x:76,y:48,rotate:1,ease:'none',scrollTrigger:{trigger:understand,containerAnimation:horizontal,start:'left 82%',end:'center center',scrub:.8}});
        gsap.to('.signal-card.s2',{x:82,y:-52,rotate:-1,ease:'none',scrollTrigger:{trigger:understand,containerAnimation:horizontal,start:'left 82%',end:'center center',scrub:.8}});
        gsap.to('.signal-card.s3',{x:-76,y:34,rotate:0,ease:'none',scrollTrigger:{trigger:understand,containerAnimation:horizontal,start:'left 82%',end:'center center',scrub:.8}});
        gsap.fromTo('.signal-lens',{scale:.92},{scale:1.04,ease:'none',scrollTrigger:{trigger:understand,containerAnimation:horizontal,start:'left 76%',end:'center center',scrub:.8}});
      }
      if (structure) {
        gsap.fromTo('.flow-path',{strokeDashoffset:150},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:structure,containerAnimation:horizontal,start:'left 78%',end:'center center',scrub:.8}});
        gsap.to('.tiny-runner',{x:'29vw',y:-3,duration:2.4,repeat:-1,yoyo:true,ease:'sine.inOut'});
      }
      if (prototype) {
        gsap.to('.wireframe-window',{x:-12,y:7,rotate:-6,duration:2.6,repeat:-1,yoyo:true,ease:'sine.inOut'});
        gsap.to('.polished-window',{x:11,y:-6,rotate:5,duration:2.3,repeat:-1,yoyo:true,ease:'sine.inOut'});
        gsap.to('.cursor-arrow',{x:-29,y:-24,rotate:-7,duration:1.8,repeat:-1,yoyo:true,ease:'power2.inOut'});
      }
      if (ship) {
        gsap.to('.launch-badge',{scale:1.045,rotate:12,duration:1.9,repeat:-1,yoyo:true,ease:'sine.inOut'});
        gsap.to('.ship-star',{rotate:160,scale:1.16,duration:2.5,repeat:-1,yoyo:true,ease:'sine.inOut',stagger:.28});
      }

      return () => {
        gsap.set(track,{clearProps:'transform'});
        if(hudProgress) gsap.set(hudProgress,{clearProps:'transform'});
      };
    });
  }

  // Keep every skill visible, but make the hovered category easier to scan.
  const skillsBoard = document.querySelector('.skills-board');
  if (skillsBoard && finePointer) {
    skillsBoard.querySelectorAll('.skill-row').forEach(row => {
      row.addEventListener('mouseenter', () => {
        skillsBoard.classList.add('is-focused');
        skillsBoard.querySelectorAll('.skill-row').forEach(r => r.classList.toggle('is-focused', r === row));
      });
    });
    skillsBoard.addEventListener('mouseleave', () => {
      skillsBoard.classList.remove('is-focused');
      skillsBoard.querySelectorAll('.skill-row').forEach(r => r.classList.remove('is-focused'));
    });
  }

  // Small magnetic feedback on primary tactile controls. Never strong enough to hurt usability.
  if (finePointer && !reducedMotion) {
    document.querySelectorAll('.button, .project-action, .show-more, .work-nav-btn').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width/2)) * .08;
        const y = (e.clientY - (r.top + r.height/2)) * .08;
        el.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });

    const portraitFrame = document.querySelector('.portrait-frame');
    const heroVisual = document.querySelector('.hero-visual');
    if (portraitFrame && heroVisual) {
      heroVisual.addEventListener('pointermove', e => {
        const r = heroVisual.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        portraitFrame.style.transform = `rotateX(${(-y*2.2).toFixed(2)}deg) rotateY(${(x*3).toFixed(2)}deg) translate3d(${(x*4).toFixed(1)}px,${(y*3).toFixed(1)}px,0)`;
      });
      heroVisual.addEventListener('pointerleave', () => { portraitFrame.style.transform = ''; });
    }
  }

  // Recalculate pinned distances after fonts/images settle and after orientation changes.
  if (window.ScrollTrigger) {
    window.addEventListener('load', () => setTimeout(() => ScrollTrigger.refresh(), 80));
    window.addEventListener('resize', () => clearTimeout(window.__portfolioRefresh) || (window.__portfolioRefresh = setTimeout(() => ScrollTrigger.refresh(), 180)), {passive:true});
  }
})();
