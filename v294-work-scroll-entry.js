/* V294 — Selected Works entry remains anchored to document scroll but uses
   the same short reversible visual catch-up as the Hero handoff. Fast input is
   readable instead of snappy; slow input remains nearly 1:1. */
(() => {
  'use strict';
  const section=document.querySelector('.figma-work-section');
  if(!section) return;
  const desktop=matchMedia('(min-width:769px)');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const targets=[
    {el:section.querySelector('.figma-work-heading'), y:12, delay:0},
    {el:section.querySelector('.figma-work-list'), y:18, delay:.045},
    {el:section.querySelector('.figma-work-preview-wrap'), y:24, delay:.085}
  ].filter(x=>x.el);
  if(!targets.length) return;

  const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
  const smoother=t=>t*t*t*(t*(t*6-15)+10);
  const TAU=105;
  const EPS=.0007;
  let sectionTop=0,startY=0,endY=1,raf=0;
  let targetRaw=0,currentRaw=0,lastFrame=0,lastProgress=-1,lastActive=false;

  const reset=()=>{
    targets.forEach(({el})=>{
      el.style.removeProperty('translate');
      el.style.removeProperty('scale');
      el.style.removeProperty('will-change');
    });
    section.classList.remove('v293-work-scroll-entering');
    targetRaw=currentRaw=1;
    lastProgress=-1;
    if(lastActive){
      lastActive=false;
      dispatchEvent(new CustomEvent('work:scroll-entry-state',{detail:{active:false,progress:1}}));
    }
  };

  const measure=()=>{
    const rect=section.getBoundingClientRect();
    sectionTop=rect.top+(scrollY||pageYOffset||0);
    const vh=Math.max(1,innerHeight);
    /* Slightly longer spatial runway than V293. The temporal smoothing below
       handles wheel/trackpad spikes; this range keeps ordinary scrolling airy. */
    startY=sectionTop-vh*.98;
    endY=sectionTop-vh*.44;
    if(endY<=startY) endY=startY+1;
  };

  const rawFromScroll=()=>clamp(((scrollY||pageYOffset||0)-startY)/(endY-startY));

  const applyState=(raw,settled=false)=>{
    const progress=smoother(raw);
    if(Math.abs(progress-lastProgress)>.00015 || settled){
      lastProgress=progress;
      targets.forEach(({el,y:distance,delay})=>{
        const local=clamp((raw-delay)/(1-delay));
        const e=smoother(local);
        if(e>=.9995 && settled){
          el.style.setProperty('translate','none','important');
          el.style.setProperty('scale','none','important');
          el.style.setProperty('will-change','auto','important');
        }else{
          const ty=distance*(1-e);
          const scale=.958+(.042*e);
          el.style.setProperty('translate',`0 ${ty.toFixed(2)}px 0`,'important');
          el.style.setProperty('scale',scale.toFixed(4),'important');
          el.style.setProperty('will-change','translate,scale','important');
        }
      });
    }

    const active=!settled || (raw>.0005 && raw<.9995);
    section.classList.toggle('v293-work-scroll-entering',active);
    if(active!==lastActive){
      lastActive=active;
      dispatchEvent(new CustomEvent('work:scroll-entry-state',{detail:{active,progress}}));
    }
  };

  const step=now=>{
    raf=0;
    if(!desktop.matches || reduced.matches){ reset(); return; }
    const delta=targetRaw-currentRaw;
    if(Math.abs(delta)<=EPS){
      currentRaw=targetRaw;
      lastFrame=now;
      applyState(currentRaw,true);
      return;
    }
    const dt=lastFrame?clamp(now-lastFrame,1,34):16.667;
    lastFrame=now;
    const alpha=1-Math.exp(-dt/TAU);
    currentRaw+=delta*alpha;
    if(Math.abs(targetRaw-currentRaw)<EPS) currentRaw=targetRaw;
    const settled=Math.abs(targetRaw-currentRaw)<=EPS;
    applyState(currentRaw,settled);
    if(!settled) raf=requestAnimationFrame(step);
  };

  const request=()=>{ if(!raf) raf=requestAnimationFrame(step); };
  const updateTarget=()=>{
    if(!desktop.matches || reduced.matches){ reset(); return; }
    targetRaw=rawFromScroll();
    request();
  };
  const refresh=(force=true)=>{
    measure();
    targetRaw=rawFromScroll();
    if(force){ currentRaw=targetRaw; lastFrame=0; applyState(currentRaw,true); }
    else request();
  };

  addEventListener('scroll',updateTarget,{passive:true});
  addEventListener('resize',()=>refresh(true),{passive:true});
  addEventListener('pageshow',()=>refresh(true),{passive:true});
  desktop.addEventListener?.('change',()=>refresh(true));
  measure();
  targetRaw=currentRaw=rawFromScroll();
  applyState(currentRaw,true);
})();
