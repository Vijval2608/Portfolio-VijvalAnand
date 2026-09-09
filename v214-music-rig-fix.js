(() => {
  'use strict';
  const scene=document.querySelector('.v206-depth-scene');
  if(!scene)return;
  const card=scene.querySelector('.figma-music-card');
  const note=scene.querySelector('.figma-music-hover-note');
  if(!card||!note)return;
  let rig=scene.querySelector('.v207-music-rig');
  if(!rig){
    rig=document.createElement('div');
    rig.className='v207-music-rig';
    scene.insertBefore(rig,card);
  }
  if(card.parentElement!==rig)rig.appendChild(card);
  if(note.parentElement!==rig)rig.appendChild(note);
  if(card.nextElementSibling!==note)rig.insertBefore(note,card.nextElementSibling);
})();
