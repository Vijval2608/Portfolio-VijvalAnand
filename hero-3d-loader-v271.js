(() => {
  const desktop=matchMedia('(min-width:769px)');
  const bundleURL=new URL('./hero-3d-v271.js',document.currentScript.src).href;
  let attempted=false;
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
      status(artboard,'error',/WebGL/.test(error.message)?'3D unavailable — enable browser graphics acceleration.':'3D could not load. Extract the complete folder and reload.');
    };
    const script=document.createElement('script');script.src=bundleURL;script.async=true;
    script.onerror=()=>fail(new Error('The packaged 3D script is missing or blocked.'));
    script.onload=()=>{
      if(!window.VijvalHero3DBundle?.mountHeroModel){fail(new Error('The 3D package did not initialize.'));return;}
      window.VijvalHero3DBundle.mountHeroModel().then(()=>{
        if(!artboard.classList.contains('v258-model-ready'))throw new Error('The 3D canvas did not become ready.');
        status(artboard,'ready','');
      }).catch(fail);
    };
    document.head.appendChild(script);
  };
  start();desktop.addEventListener('change',start);
})();
