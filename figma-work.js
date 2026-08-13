(() => {
  const list = document.querySelector('#figma-work-list');
  const preview = document.querySelector('#figma-work-preview');
  if (!list || !preview) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ARROW = 'https://www.figma.com/api/mcp/asset/d17f0d89-137d-4827-969a-152e651d9ded.svg';
  const FIGMA_FITTRIBE = 'assets/figma-work/fittribe-thumbnail.webp';
  const WORK_STAR = `<svg width="20" height="25" viewBox="0 0 20 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M10 0C10 0 10.5518 7.58026 12.7009 9.73804C14.8501 11.8958 20 12.4498 20 12.4498C20 12.4498 14.8501 13.0038 12.7009 15.1616C10.5518 17.3193 10 25 10 25C10 25 9.44825 17.3193 7.29909 15.1616C5.14994 13.0038 0 12.4498 0 12.4498C0 12.4498 5.14994 11.8958 7.29909 9.73804C9.44825 7.58026 10 0 10 0Z" fill="#FC5134"/></svg>`;

  const projects = [
    {
      id:'fittribe',
      listTitle:'Fittribe App',
      listSubtitle:'Social fitness mobile app',
      title:'Fittribe App',
      summary:'A social fitness experience designed around consistency, guided workouts and progress without turning fitness into homework.',
      tags:['Mobile App','Product','UX Research','Design System','Case Study'],
      visual:{type:'image',src:FIGMA_FITTRIBE,position:'center center'},
      actions:[
        {
          kind:'figma',
          type:'external',
          href:'https://www.figma.com/design/ndWXZSCM1uaK5IqVdX4Jfg/fittribe?node-id=0-1&t=zX7H7iZE6JNqh9QX-1',
          label:'Figma'
        },
        {
          kind:'view',
          type:'pdf',
          src:'assets/case-studies/fittribe-case-study.pdf',
          label:'View'
        }
      ]
    },
    {
      id:'serene',
      listTitle:'Real Estate Website Design',
      listSubtitle:'Real estate marketing website',
      title:'Real Estate Website Design',
      summary:'A responsive real-estate experience designed to make discovery feel clearer, more premium and easier to trust across devices.',
      tags:['Website','UX/UI','Brand','Design System'],
      visual:{type:'image',src:'assets/figma-work/serene-homes-thumbnail.webp',position:'center top'},
      actions:[
        {
          kind:'figma',
          type:'external',
          href:'https://www.figma.com/design/jpMgKSoyqRkMLv39LaGLWb/Serene-Homes-Design?node-id=0-1&t=IFVdO4nIQXKaBrqk-1',
          label:'Figma'
        },
        {
          kind:'view',
          type:'external',
          href:'https://serenehomes.co.in/',
          label:'View'
        }
      ]
    },
    {
      id:'rupantaran',
      listTitle:'Rupantaran Website Design',
      listSubtitle:'NGO website & social impact',
      title:'Rupantaran Website Design',
      summary:'An accessible NGO website designed and built end-to-end to make the organisation easier to understand, trust and support.',
      tags:['Website','UX/UI','React','Social Impact'],
      visual:{type:'image',src:'assets/figma-work/rupantaran-thumbnail.webp',position:'center top'},
      actions:[
        {
          kind:'figma',
          type:'external',
          href:'https://www.figma.com/design/Vnzu98wlvWUYIGTVtAVl5n/Rupantaran-NGO-Web-Design?node-id=0-1&t=yOeDwOZAHVVC2xJj-1',
          label:'Figma'
        }
      ]
    },
    {
      id:'nippon',
      listTitle:'Nippon Graphic Design',
      listSubtitle:'Retro poster & graphic design',
      title:'Nippon Graphic Design',
      summary:'A graphic poster exploration built around Japanese visual references, expressive typography and controlled retro composition.',
      tags:['Graphic Design','Posters','Typography','Art Direction'],
      visual:{
        type:'image',
        src:'assets/figma-work/nippon-graphics.webp',
        position:'center center'
      },
      actions:[
        {
          kind:'figma',
          type:'external',
          href:'https://www.figma.com/design/QAQNPvVLG3KD1PlA8cNl1p/Nippon-Graphics?node-id=0-1&t=MQ8YQiGthxJkrUaE-1',
          label:'Figma'
        },
        {
          kind:'view',
          type:'image',
          src:'assets/figma-work/nippon-graphics.webp',
          label:'View'
        }
      ]
    },
    {
      id:'dior',
      listTitle:'Dior Sauvage Concept Ad',
      listSubtitle:'AI-generated luxury concept ad',
      title:'Dior Sauvage Concept Ad',
      summary:'A cinematic AI spec-ad exploring premium product storytelling through atmosphere, pacing and generative visual direction.',
      tags:['AI Video','Concept Ad','Motion','Art Direction'],
      visual:{
        type:'video',
        src:'assets/figma-work/dior-sauvage-ad-concept.mp4',
        poster:'assets/figma-work/dior-sauvage-poster.jpg',
        position:'center center'
      },
      actions:[
        {
          kind:'view',
          type:'video',
          src:'assets/figma-work/dior-sauvage-ad-concept.mp4',
          poster:'assets/figma-work/dior-sauvage-poster.jpg',
          label:'View'
        }
      ]
    }
  ];

  /* Fittribe is the first selected project after removing the Enterprise item. */
  let previewId = 'fittribe';
  let highlightId = 'fittribe';
  let hoverTimer = null;

  const generatedArt = (art) => {
    const map = {
      nippon:`<div class="art art-nippon"><div class="nippon-orbit"></div><div class="nippon-word">NIPPON</div></div>`,
      dior:`<div class="art art-dior"><div class="dior-halo"></div><div class="dior-bottle"></div></div>`,
      fittribe:`<div class="art art-fittribe">${[1,2,3].map(n=>`<div class="phone p${n}"><div class="phone-screen">${n===2?'<div class="fit-ring"></div>':'<div class="fit-hero"></div>'}<div class="fit-lines"></div></div></div>`).join('')}</div>`
    };
    return map[art] || '<div class="art"></div>';
  };

  const projectById = id => projects.find(p => p.id === id) || projects[0];

  function visualMarkup(p){
    if (p.visual.type === 'image') {
      const priority = p.id === 'fittribe' ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"';
      return `<img src="${p.visual.src}" alt="${p.title} preview" ${priority} decoding="async" style="object-position:${p.visual.position || 'center'}">`;
    }

    if (p.visual.type === 'video' && p.visual.src) {
      return `
        <video
          class="figma-work-video-preview"
          src="${p.visual.src}"
          ${p.visual.poster ? `poster="${p.visual.poster}"` : ''}
          muted
          loop
          playsinline
          preload="none"
          aria-label="${p.title} preview"
          style="object-position:${p.visual.position || 'center'}"
        ></video>`;
    }

    return generatedArt(p.visual.art);
  }

  const previewWrap = preview.closest('.figma-work-preview-wrap');

  /* Exact V43 stack slots, already baked to the portfolio's 90% scale.
     Slot 0 is the front card; slot 4 is the furthest/back card. */
  const STACK_BASE = { width:666.9, height:555.3 };
  const STACK_SLOTS = [
    { x:0,  y:57.6, z:50 },
    { x:18, y:43.2, z:40 },
    { x:36, y:28.8, z:30 },
    { x:54, y:14.4, z:20 },
    { x:72, y:0,    z:10 }
  ];

  let stackOrder = projects.map(p => p.id);
  let stackSerial = 0;
  let activeAnimations = new Set();
  const workSection = preview.closest('.figma-work-section');
  let workInView = workSection
    ? (workSection.getBoundingClientRect().bottom > 0 && workSection.getBoundingClientRect().top < window.innerHeight)
    : true;

  function renderList(){
    list.innerHTML = projects.map((p,i)=>`
      <button class="figma-work-item ${p.id===highlightId?'is-active':''}" type="button" data-project="${p.id}" aria-pressed="${p.id===highlightId}">
        <span class="figma-work-index">${String(i+1).padStart(2,'0')}</span>
        <span class="figma-work-main">
          <span class="figma-work-item-copy">
            <span class="figma-work-item-title">${p.listTitle}</span>
            <span class="figma-work-item-subtitle">${p.listSubtitle}</span>
          </span>
          <span class="figma-work-star" aria-hidden="true">${WORK_STAR}</span>
        </span>
      </button>`).join('');

    list.querySelectorAll('.figma-work-item').forEach(item => {
      const id = item.dataset.project;

      item.addEventListener('mouseenter',()=>{
        clearTimeout(hoverTimer);
        hoverTimer=setTimeout(()=>activate(id),38);
      });

      item.addEventListener('mouseleave',()=>clearTimeout(hoverTimer));
      item.addEventListener('focus',()=>activate(id));
      item.addEventListener('click',()=>activate(id));
    });
  }

  function actionMarkup(p){
    return (p.actions || []).map((action,index)=>{
      const baseClass = action.kind === 'figma'
        ? 'figma-work-action figma-work-figma'
        : 'figma-work-action figma-work-view';

      if (action.kind === 'figma') {
        return `
          <button
            class="${baseClass}"
            type="button"
            data-work-action-project="${p.id}"
            data-work-action-index="${index}"
            aria-label="Open ${p.title} in Figma"
          >
            <span>${action.label || 'Figma'}</span>
            <span class="figma-work-figma-icon">
              <img src="${ARROW}" alt="" aria-hidden="true">
            </span>
          </button>`;
      }

      return `
        <button
          class="${baseClass}"
          type="button"
          data-work-action-project="${p.id}"
          data-work-action-index="${index}"
        >
          <span>${action.label || 'View'}</span>
          <span class="figma-work-view-icon">
            <img src="${ARROW}" alt="" aria-hidden="true">
          </span>
        </button>`;
    }).join('');
  }

  function layerMarkup(p){
    return `
      <div class="figma-work-media-shell">
        <div class="figma-work-media">${visualMarkup(p)}</div>
      </div>
      <div class="figma-work-info">
        <div class="figma-work-copy">
          <h3 class="figma-work-preview-title">${p.title}</h3>
          <p class="figma-work-summary">${p.summary}</p>
        </div>
        <div class="figma-work-footer">
          <div class="figma-work-tags">${p.tags.map(t=>`<span class="figma-work-tag">${t}</span>`).join('')}</div>
          <div class="figma-work-actions">${actionMarkup(p)}</div>
        </div>
      </div>`;
  }

  function cardById(id){
    return preview.querySelector(`.figma-work-card[data-stack-project="${id}"]`);
  }

  function renderStack(){
    preview.innerHTML = projects.map((p,i)=>`
      <article
        class="figma-work-card"
        data-stack-project="${p.id}"
        data-stack-slot="${i}"
        aria-hidden="${i === 0 ? 'false' : 'true'}"
      >
        ${layerMarkup(p)}
      </article>
    `).join('');

    preview.querySelectorAll('.figma-work-card').forEach(card => {
      const p = projectById(card.dataset.stackProject);

      card.querySelectorAll('[data-work-action-index]').forEach(button=>{
        const actionIndex = Number(button.dataset.workActionIndex);
        const action = p.actions?.[actionIndex];
        button.addEventListener('click',()=>openProject(p,action));
      });
    });

    snapStack();
    syncStackScale();
  }

  function cancelStackAnimations(){
    activeAnimations.forEach(anim => {
      try { anim.cancel(); } catch (_) {}
    });
    activeAnimations.clear();

    preview.querySelectorAll('.figma-work-card').forEach(card => {
      card.classList.remove('is-phasing');
      card.style.filter = '';
      card.style.opacity = '';
    });
  }

  function setCardSlot(card, slotIndex){
    const slot = STACK_SLOTS[slotIndex];
    if (!card || !slot) return;

    card.dataset.stackSlot = String(slotIndex);
    card.style.transform = `translate3d(${slot.x}px, ${slot.y}px, 0)`;
    card.style.zIndex = String(slot.z);
  }

  function syncCardAccessibility(){
    stackOrder.forEach((id,index) => {
      const card = cardById(id);
      if (!card) return;

      const front = index === 0;
      card.classList.toggle('is-front',front);
      card.setAttribute('aria-hidden',String(!front));

      card.querySelectorAll('button,a').forEach(control => {
        if (front) control.removeAttribute('tabindex');
        else control.setAttribute('tabindex','-1');
      });

      card.querySelectorAll('video.figma-work-video-preview').forEach(video=>{
        if (front && workInView && document.visibilityState === 'visible') {
          video.play().catch(()=>{});
        } else {
          video.pause();
        }
      });
    });
  }

  function snapStack(){
    stackOrder.forEach((id,index) => {
      setCardSlot(cardById(id),index);
    });
    syncCardAccessibility();
  }

  function trackAnimation(animation){
    if (!animation) return animation;
    activeAnimations.add(animation);
    const clear = () => activeAnimations.delete(animation);
    animation.addEventListener?.('finish',clear,{once:true});
    animation.addEventListener?.('cancel',clear,{once:true});
    return animation;
  }

  function animateCard(card,keyframes,options){
    if (!card || reducedMotion) return null;

    card.style.willChange = 'transform, opacity';
    const animation = trackAnimation(card.animate(keyframes,options));

    const releaseLayer = () => {
      requestAnimationFrame(() => {
        const stillAnimating = card.getAnimations().some(anim =>
          anim !== animation && (anim.playState === 'running' || anim.playState === 'pending')
        );
        if (!stillAnimating) card.style.willChange = '';
      });
    };

    animation?.addEventListener('finish',releaseLayer,{once:true});
    animation?.addEventListener('cancel',releaseLayer,{once:true});
    return animation;
  }

  async function phaseToFront(targetId){
    const fromIndex = stackOrder.indexOf(targetId);
    if (fromIndex <= 0) {
      syncCardAccessibility();
      return;
    }

    const token = ++stackSerial;
    cancelStackAnimations();
    snapStack();

    const target = cardById(targetId);
    if (!target) return;

    if (reducedMotion) {
      stackOrder.splice(fromIndex,1);
      stackOrder.unshift(targetId);
      snapStack();
      return;
    }

    const fromSlot = STACK_SLOTS[fromIndex];
    const frontSlot = STACK_SLOTS[0];
    const oldOrder = [...stackOrder];
    const newOrder = [...stackOrder];
    newOrder.splice(fromIndex,1);
    newOrder.unshift(targetId);

    target.classList.add('is-phasing');

    /*
      Ultra-smooth model:
      - one continuous bezier trajectory
      - only a very light material softening at the crossing
      - displaced cards drift backward at the same time
      - z-index swap happens near the visual midpoint
      - final inline transforms already match the committed stack slots,
        so snapStack() causes no visible jump
    */

    const dx = frontSlot.x - fromSlot.x;
    const dy = frontSlot.y - fromSlot.y;

    const targetFrames = [
      {
        offset:0,
        transform:`translate3d(${fromSlot.x}px, ${fromSlot.y}px, 0) scale(1)`,
        opacity:1
      },
      {
        offset:.32,
        transform:`translate3d(${fromSlot.x + dx*.32}px, ${fromSlot.y + dy*.32}px, 0) scale(.997)`,
        opacity:.985
      },
      {
        offset:.54,
        transform:`translate3d(${fromSlot.x + dx*.54}px, ${fromSlot.y + dy*.54}px, 0) scale(.994)`,
        opacity:.955
      },
      {
        offset:.76,
        transform:`translate3d(${fromSlot.x + dx*.76}px, ${fromSlot.y + dy*.76}px, 0) scale(.998)`,
        opacity:.985
      },
      {
        offset:1,
        transform:`translate3d(${frontSlot.x}px, ${frontSlot.y}px, 0) scale(1)`,
        opacity:1
      }
    ];

    const targetAnim = animateCard(target,targetFrames,{
      duration:420,
      easing:'cubic-bezier(.16,.84,.22,1)',
      fill:'forwards'
    });

    const displacedAnimations = [];

    for (let oldIndex = 0; oldIndex < fromIndex; oldIndex++) {
      const id = oldOrder[oldIndex];
      const card = cardById(id);
      if (!card) continue;

      const from = STACK_SLOTS[oldIndex];
      const to = STACK_SLOTS[oldIndex + 1];

      const anim = animateCard(card,[
        {
          offset:0,
          transform:`translate3d(${from.x}px, ${from.y}px, 0) scale(1)`,
          opacity:1
        },
        {
          offset:.48,
          transform:`translate3d(${from.x + (to.x-from.x)*.48}px, ${from.y + (to.y-from.y)*.48}px, 0) scale(.999)`,
          opacity:.992
        },
        {
          offset:1,
          transform:`translate3d(${to.x}px, ${to.y}px, 0) scale(1)`,
          opacity:1
        }
      ],{
        duration:390,
        delay:oldIndex * 7,
        easing:'cubic-bezier(.2,.78,.24,1)',
        fill:'forwards'
      });

      displacedAnimations.push(anim);
    }

    /* Cross the z-plane only after the selected card has visually reached
       the softened midpoint. This makes the ordering change effectively
       invisible instead of reading like a pop. */
    const zSwapTimer = window.setTimeout(()=>{
      if (token !== stackSerial) return;

      target.style.zIndex = String(STACK_SLOTS[0].z + 4);

      for (let oldIndex = 0; oldIndex < fromIndex; oldIndex++) {
        const id = oldOrder[oldIndex];
        const card = cardById(id);
        if (card) card.style.zIndex = String(STACK_SLOTS[oldIndex + 1].z);
      }
    },218);

    try {
      await Promise.all([
        targetAnim?.finished || Promise.resolve(),
        ...displacedAnimations.map(anim => anim?.finished || Promise.resolve())
      ]);
    } catch (_) {}

    window.clearTimeout(zSwapTimer);

    if (token !== stackSerial) return;

    /* Commit order only after every card has physically arrived at the same
       coordinates snapStack() will use. There is therefore no end-frame snap. */
    stackOrder = newOrder;

    target.classList.remove('is-phasing');

    preview.querySelectorAll('.figma-work-card').forEach(card=>{
      card.style.filter = '';
      card.style.opacity = '';
    });

    snapStack();
  }

  function bringToFront(id){
    if (stackOrder[0] === id) {
      syncCardAccessibility();
      return;
    }
    phaseToFront(id);
  }

  function syncHighlight(){
    list.querySelectorAll('.figma-work-item').forEach(item => {
      const active = item.dataset.project === highlightId;
      item.classList.toggle('is-active',active);
      item.setAttribute('aria-pressed',String(active));
    });
  }

  function activate(id){
    if (!id) return;

    highlightId = id;
    previewId = id;
    syncHighlight();

    if (stackOrder[0] === id) {
      syncCardAccessibility();
      return;
    }

    bringToFront(id);
  }

  function syncStackScale(){
    if (!previewWrap) return;

    /* Desktop is exactly 1:1 with the baked Figma geometry. Smaller viewports
       scale the complete stack as one object, preserving all internal spacing. */
    const available = Math.min(STACK_BASE.width, previewWrap.clientWidth || STACK_BASE.width);
    const scale = Math.max(.01, available / STACK_BASE.width);

    preview.style.transform = `scale(${scale})`;
    previewWrap.style.height = `${STACK_BASE.height * scale}px`;
  }

  const stackResizeObserver = window.ResizeObserver
    ? new ResizeObserver(()=>syncStackScale())
    : null;

  if (stackResizeObserver && previewWrap) stackResizeObserver.observe(previewWrap);
  window.addEventListener('resize',syncStackScale,{passive:true});

  function openProject(p,action){
    action = action || p.actions?.[0] || {};

    if (action.type === 'external' && action.href) {
      window.open(action.href,'_blank','noopener,noreferrer');
      return;
    }

    const viewer = document.querySelector('#viewer');
    const viewerTitle = document.querySelector('#viewer-title');
    const viewerContent = document.querySelector('#viewer-content');
    const viewerClose = document.querySelector('#viewer-close');

    if (!viewer || !viewerContent) return;
    if (viewerTitle) viewerTitle.textContent = p.title;

    if (action.type === 'pdf' && action.src) {
      viewerContent.innerHTML = `
        <iframe
          class="viewer-pdf"
          src="${action.src}#view=FitH&toolbar=1&navpanes=0"
          title="${p.title} case study"
        ></iframe>`;
    } else if (action.type === 'image' && action.src) {
      viewerContent.innerHTML = `
        <div class="figma-work-viewer-media figma-work-viewer-image-wrap">
          <img
            class="figma-work-viewer-image"
            src="${action.src}"
            alt="${p.title} full preview"
          >
        </div>`;
    } else if (action.type === 'video' && action.src) {
      viewerContent.innerHTML = `
        <div class="figma-work-viewer-media figma-work-viewer-video-wrap">
          <video
            class="figma-work-viewer-video"
            src="${action.src}"
            ${action.poster ? `poster="${action.poster}"` : ''}
            controls
            autoplay
            playsinline
            preload="auto"
          ></video>
        </div>`;

      const video = viewerContent.querySelector('.figma-work-viewer-video');
      if (video) {
        video.currentTime = 0;
        video.play().catch(()=>{});
      }
    } else {
      return;
    }

    viewer.classList.add('open');
    viewer.setAttribute('aria-hidden','false');
    document.body.classList.add('viewer-open');
    viewerClose?.focus();
  }

  async function resolveDisplayFonts(){
    const root = document.documentElement;
    if (!document.fonts) return;

    let mexcellentReady = false;
    let talinaReady = false;
    try {
      await document.fonts.load('57.6px "MexcellentLocal"', 'Selected Works');
      mexcellentReady = document.fonts.check('57.6px "MexcellentLocal"', 'Selected Works');
    } catch (_) {}
    try {
      await document.fonts.load('21.6px "TalinaLocal"', 'Fittribe App');
      talinaReady = document.fonts.check('21.6px "TalinaLocal"', 'Fittribe App');
    } catch (_) {}

    root.classList.toggle('no-mexcellent-font', !mexcellentReady);
    root.classList.toggle('no-talina-font', !talinaReady);
  }

  if ('IntersectionObserver' in window && workSection) {
    const workObserver = new IntersectionObserver(entries => {
      const entry = entries[0];
      workInView = !!entry?.isIntersecting;
      syncCardAccessibility();
    }, {
      root:null,
      rootMargin:'160px 0px 160px 0px',
      threshold:0.01
    });
    workObserver.observe(workSection);
  }

  document.addEventListener('visibilitychange',syncCardAccessibility,{passive:true});

  renderList();
  renderStack();
  resolveDisplayFonts();
})();
