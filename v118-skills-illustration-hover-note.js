(() => {
  const illustration=document.querySelector('.figma-skills-window-custom');
  const note=illustration?.querySelector('.skills-illustration-hover-note');
  const nav=document.querySelector('.figma-nav');
  if(!illustration || !note || !nav) return;

  const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)');
  const VIEWPORT_GAP=14;
  const NAV_GAP=12;
  const ART_GAP=14;

  let raf=0;
  let hoverReleaseTimer=0;

  const pinNote=()=>{
    clearTimeout(hoverReleaseTimer);
    illustration.classList.add('is-hover-note-pinned');
  };
  const releaseNote=()=>{
    clearTimeout(hoverReleaseTimer);
    hoverReleaseTimer=window.setTimeout(()=>{
      const focused=illustration.contains(document.activeElement);
      if(!illustration.matches(':hover')&&!note.matches(':hover')&&!focused){
        illustration.classList.remove('is-hover-note-pinned');
      }
    },180);
  };

  const positionNote=()=>{
    raf=0;
    if(!finePointer.matches) return;

    const art=illustration.getBoundingClientRect();
    const navRect=nav.getBoundingClientRect();

    /* Measure while hidden; opacity does not affect geometry. */
    const noteWidth=note.offsetWidth || 220;
    const noteHeight=note.offsetHeight || 48;

    /* Align annotation's RIGHT edge exactly with the navbar's RIGHT edge.
       Because the note lives inside the illustration, convert viewport X to
       the illustration's local coordinate space. */
    const desiredLeft=navRect.right-noteWidth;
    const clampedLeft=Math.max(
      VIEWPORT_GAP,
      Math.min(desiredLeft,window.innerWidth-noteWidth-VIEWPORT_GAP)
    );
    const localLeft=clampedLeft-art.left;

    const safeTop=Math.max(VIEWPORT_GAP,navRect.bottom+NAV_GAP);
    const aboveViewportTop=art.top-ART_GAP-noteHeight;
    const belowViewportTop=art.bottom+ART_GAP;

    const hasAbove=aboveViewportTop>=safeTop;
    const hasBelow=(belowViewportTop+noteHeight)<=window.innerHeight-VIEWPORT_GAP;

    let viewportTop;
    let below=false;

    if(hasAbove){
      viewportTop=aboveViewportTop;
    }else if(hasBelow){
      viewportTop=belowViewportTop;
      below=true;
    }else{
      /* Edge case: if neither side fully fits, use whichever side has more
         visible room and clamp the annotation inside the safe viewport. */
      const roomAbove=Math.max(0,art.top-safeTop);
      const roomBelow=Math.max(0,window.innerHeight-VIEWPORT_GAP-art.bottom);
      below=roomBelow>roomAbove;
      viewportTop=below
        ? Math.min(belowViewportTop,window.innerHeight-noteHeight-VIEWPORT_GAP)
        : Math.max(safeTop,aboveViewportTop);
    }

    const localTop=viewportTop-art.top;

    illustration.style.setProperty('--skills-hover-note-left',`${localLeft.toFixed(2)}px`);
    illustration.style.setProperty('--skills-hover-note-top',`${localTop.toFixed(2)}px`);
    illustration.classList.toggle('is-hover-note-below',below);
  };

  const schedule=()=>{
    if(raf) cancelAnimationFrame(raf);
    raf=requestAnimationFrame(positionNote);
  };

  illustration.addEventListener('pointerenter',()=>{pinNote();schedule();},{passive:true});
  illustration.addEventListener('pointerleave',releaseNote,{passive:true});
  note.addEventListener('pointerenter',pinNote,{passive:true});
  note.addEventListener('pointerleave',releaseNote,{passive:true});
  illustration.addEventListener('focusin',()=>{pinNote();schedule();});
  illustration.addEventListener('focusout',releaseNote);
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('scroll',()=>{
    if(illustration.matches(':hover') || illustration.contains(document.activeElement)){
      schedule();
    }
  },{passive:true});

  if(document.fonts?.ready){
    document.fonts.ready.then(schedule);
  }
})();
