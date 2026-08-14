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
      action:{type:'pdf',src:'assets/case-studies/fittribe-case-study.pdf',label:'View'}
    },
    {
      id:'serene',
      listTitle:'Real Estate Website Design',
      listSubtitle:'Real estate marketing website',
      title:'Real Estate Website Design',
      summary:'A responsive real-estate experience designed to make discovery feel clearer, more premium and easier to trust across devices.',
      tags:['Website','UX/UI','Brand','Design System'],
      visual:{type:'image',src:'assets/serene-homes.png',position:'center top'},
      action:{type:'external',href:'https://serenehomes.co.in/',label:'View'}
    },
    {
      id:'rupantaran',
      listTitle:'Rupantaran Website Design',
      listSubtitle:'NGO website & social impact',
      title:'Rupantaran Website Design',
      summary:'An accessible NGO website designed and built end-to-end to make the organisation easier to understand, trust and support.',
      tags:['Website','UX/UI','React','Social Impact'],
      visual:{type:'image',src:'assets/rupantaran.png',position:'center top'},
      action:{type:'external',href:'https://rupantaran.co.in/',label:'View'}
    },
    {
      id:'nippon',
      listTitle:'Nippon Graphic Design',
      listSubtitle:'Retro poster & graphic design',
      title:'Nippon Graphic Design',
      summary:'A graphic poster exploration built around Japanese visual references, expressive typography and controlled retro composition.',
      tags:['Graphic Design','Posters','Typography','Art Direction'],
      visual:{type:'art',art:'nippon'},
      action:{type:'external',href:'https://www.behance.net/vijvalanand',label:'View'}
    },
    {
      id:'dior',
      listTitle:'Dior Sauvage Concept Ad',
      listSubtitle:'AI-generated luxury concept ad',
      title:'Dior Sauvage Concept Ad',
      summary:'A cinematic AI spec-ad exploring premium product storytelling through atmosphere, pacing and generative visual direction.',
      tags:['AI Video','Concept Ad','Motion','Art Direction'],
      visual:{type:'art',art:'dior'},
      action:{type:'viewer',art:'dior',label:'View'}
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
    return generatedArt(p.visual.art);
  }

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
        hoverTimer=setTimeout(()=>activate(id),45);
      });
      item.addEventListener('mouseleave',()=>clearTimeout(hoverTimer));
      item.addEventListener('focus',()=>activate(id));
      item.addEventListener('click',()=>activate(id));
    });
  }

  let transitionSerial = 0;

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
          <button class="figma-work-view" type="button" data-work-view="${p.id}">
            <span>${p.action.label || 'View'}</span>
            <span class="figma-work-view-icon"><img src="${ARROW}" alt="" aria-hidden="true"></span>
          </button>
        </div>
      </div>`;
  }

  function ensureLayer(){
    let layer = preview.querySelector('.figma-work-content-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'figma-work-content-layer';
      preview.replaceChildren(layer);
    }
    return layer;
  }

  function bindLayerAction(layer,p){
    layer.querySelector('[data-work-view]')?.addEventListener('click',()=>openProject(p));
  }

  function populateLayer(layer,p){
    layer.dataset.projectLayer = p.id;
    layer.innerHTML = layerMarkup(p);
    bindLayerAction(layer,p);
  }

  function cancelLayerAnimations(layer){
    if (!layer) return;
    layer.getAnimations({subtree:true}).forEach(anim=>{
      try { anim.cancel(); } catch (_) {}
    });
    layer.style.opacity = '';
    layer.style.transform = '';
  }

  async function renderPreview(animate=false){
    const p = projectById(previewId);
    const layer = ensureLayer();
    const token = ++transitionSerial;

    cancelLayerAnimations(layer);

    if (!layer.dataset.projectLayer || !animate || reducedMotion) {
      populateLayer(layer,p);
      preview.classList.remove('is-transitioning');
      return;
    }

    preview.classList.add('is-transitioning');
    const easeOut = 'cubic-bezier(.4,0,.2,1)';
    const easeIn = 'cubic-bezier(.22,1,.36,1)';

    /* Single-layer swap: the previous project's DOM is removed before the next
       project is inserted. This makes overlap impossible, even when the user
       scrubs rapidly across the project list. */
    const exitAnim = layer.animate([
      {opacity:1},
      {opacity:0}
    ], {duration:150, easing:easeOut, fill:'forwards'});

    try { await exitAnim.finished; } catch (_) {}
    if (token !== transitionSerial) return;

    cancelLayerAnimations(layer);
    populateLayer(layer,p);

    const enterAnim = layer.animate([
      {opacity:0},
      {opacity:1}
    ], {duration:430, easing:easeIn, fill:'both'});

    const media = layer.querySelector('.figma-work-media > img, .figma-work-media .art');
    if (media) {
      media.animate([
        {opacity:.82, transform:'scale(1.012)'},
        {opacity:1, transform:'scale(1)'}
      ], {duration:520, easing:easeIn, fill:'both'});
    }

    const details = layer.querySelectorAll('.figma-work-preview-title, .figma-work-summary, .figma-work-tag, .figma-work-view');
    details.forEach((el,i)=>{
      el.animate([
        {opacity:0},
        {opacity:1}
      ], {
        duration:300,
        delay:55 + Math.min(i,7)*18,
        easing:easeIn,
        fill:'both'
      });
    });

    try { await enterAnim.finished; } catch (_) {}
    if (token !== transitionSerial) return;

    cancelLayerAnimations(layer);
    preview.classList.remove('is-transitioning');
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
    syncHighlight();
    if (previewId === id) return;
    previewId = id;
    renderPreview(true);
  }

  function openProject(p){
    const action = p.action || {};
    if (action.type === 'external' && action.href) {
      window.open(action.href,'_blank','noopener,noreferrer');
      return;
    }

    const viewer = document.querySelector('#viewer');
    const viewerTitle = document.querySelector('#viewer-title');
    const viewerContent = document.querySelector('#viewer-content');
    if (!viewer || !viewerContent) return;
    if (viewerTitle) viewerTitle.textContent = p.title;

    if (action.type === 'pdf' && action.src) {
      viewerContent.innerHTML = `<iframe class="viewer-pdf" src="${action.src}#view=FitH&toolbar=1&navpanes=0" title="${p.title} case study"></iframe>`;
    } else if (action.art === 'fittribe') {
      viewerContent.innerHTML=`<div class="generated-case"><div class="case-cover">${generatedArt('fittribe')}</div></div>`;
    } else if (action.art === 'dior') {
      viewerContent.innerHTML=`<div class="generated-case"><div class="case-cover">${generatedArt('dior')}</div><section class="case-block"><h4>Dior Sauvage concept ad</h4><p>The video viewer is ready for the final MP4 when the concept ad asset is added.</p></section></div>`;
    }

    viewer.classList.add('open');
    viewer.setAttribute('aria-hidden','false');
    document.body.classList.add('viewer-open');
  }

  async function resolveDisplayFonts(){
    const root = document.documentElement;
    if (!document.fonts) return;

    let mexcellentReady = false;
    let talinaReady = false;
    try {
      await document.fonts.load('64px "MexcellentLocal"', 'Selected Works');
      mexcellentReady = document.fonts.check('64px "MexcellentLocal"', 'Selected Works');
    } catch (_) {}
    try {
      await document.fonts.load('24px "TalinaLocal"', 'Fittribe App');
      talinaReady = document.fonts.check('24px "TalinaLocal"', 'Fittribe App');
    } catch (_) {}

    root.classList.toggle('no-mexcellent-font', !mexcellentReady);
    root.classList.toggle('no-talina-font', !talinaReady);
  }

  renderList();
  renderPreview(false);
  resolveDisplayFonts();
})();
