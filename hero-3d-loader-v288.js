/* V288 — v286 3D-first startup gate; loads memory-optimized renderer. */
(() => {
  const root=document.documentElement;
  const desktop=matchMedia('(min-width:769px)');
  const bundleURL=new URL('./hero-3d-v288.js',document.currentScript.src).href;
  let attempted=false;
  let signalled=false;
  const signalReady=()=>{
    if(signalled)return;
    signalled=true;
    window.__hero3DRuntimeReady=true;
    root.classList.add('v286-3d-ready');
    window.dispatchEvent(new CustomEvent('hero:3d-runtime-ready'));
  };
  const signalFailed=error=>{
    if(signalled)return;
    signalled=true;
    window.__hero3DRuntimeFailed=true;
    root.classList.remove('v286-3d-loading');
    window.dispatchEvent(new CustomEvent('hero:3d-runtime-failed',{detail:{message:error?.message||String(error||'3D failed')}}));
  };
  function status(artboard,state,message){
    artboard.dataset.modelStatus=state;
    let label=artboard.querySelector('.v258-model-status');
    if(!label){label=document.createElement('span');label.className='v258-model-status';label.setAttribute('role','status');artboard.appendChild(label);}
    label.textContent=message;
    label.hidden=state==='ready';
  }
  const start=()=>{
    if(!desktop.matches||attempted)return;
    const artboard=document.querySelector('.figma-computer-artboard');
    if(!artboard)return;
    attempted=true;
    status(artboard,'loading','Booting 3D computer…');
    const fail=error=>{
      console.error('3D hero startup failed:',error);
      artboard.dataset.modelError=error.message||String(error);
      artboard.classList.remove('v258-model-ready');
      window.VijvalHero3D=null;
      status(artboard,'error',/WebGL/.test(error.message)?'3D unavailable — enable browser graphics acceleration.':'3D could not load. Please reload.');
      signalFailed(error);
    };
    const script=document.createElement('script');script.src=bundleURL;script.async=true;
    script.onerror=()=>fail(new Error('The packaged 3D script is missing or blocked.'));
    script.onload=()=>{
      if(!window.VijvalHero3DBundle?.mountHeroModel){fail(new Error('The 3D package did not initialize.'));return;}
      window.VijvalHero3DBundle.mountHeroModel().then(()=>{
        if(!artboard.classList.contains('v258-model-ready'))throw new Error('The 3D canvas did not become ready.');
        status(artboard,'ready','');
        /* The model bundle has already rendered its first frame at this point.
           Two rAFs give the browser a paint/compositor turn before the Hero
           motion controller is allowed to reveal the stage. */
        requestAnimationFrame(()=>requestAnimationFrame(signalReady));
      }).catch(fail);
    };
    document.head.appendChild(script);
  };
  if(!desktop.matches)root.classList.remove('v286-3d-loading');
  start();desktop.addEventListener('change',start);
})();
