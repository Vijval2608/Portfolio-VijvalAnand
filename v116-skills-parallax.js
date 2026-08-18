(() => {
  const section=document.querySelector('.figma-skills-section');
  if(!section || !window.gsap || !window.ScrollTrigger) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const stage=section.querySelector('.figma-skills-stage');
  const kicker=section.querySelector('.figma-skills-kicker');
  const title=section.querySelector('.figma-skills-title');
  const notes=[...section.querySelectorAll('.figma-sticky-wrap')];
  const illustration=section.querySelector('.figma-skills-window');

  if(!stage || !kicker || !title || notes.length!==4 || !illustration) return;

  gsap.registerPlugin(ScrollTrigger);

  const proxy={p:0};
  const mobile=()=>window.innerWidth<=600;
  const tablet=()=>window.innerWidth<=1000;
  const lerp=(a,b,t)=>a+(b-a)*t;

  const setTranslate=(el,y)=>{
    el.style.translate=`0 ${y.toFixed(2)}px`;
  };

  const render=()=>{
    const p=proxy.p;

    /* SECTION-LEVEL PARALLAX:
       the whole designed scene moves together first, so the effect is visible
       against the surrounding page without making anything feel like it is
       entering independently. */
    const stageStart=mobile()?18:tablet()?22:28;
    const stageEnd=mobile()?-48:tablet()?-62:-78;
    setTranslate(stage,lerp(stageStart,stageEnd,p));

    /* HEADING: shallowest depth plane. It remains part of the scene while
       travelling slightly less than the objects below it. */
    const headingCounter=mobile()?16:tablet()?20:26;
    const headingLocal=lerp(-headingCounter,headingCounter,p);
    setTranslate(kicker,headingLocal);
    setTranslate(title,headingLocal);

    /* NOTES: all move simultaneously — no timing stagger. Small differences
       in distance create individual depth without breaking the 4-card group. */
    const noteDepthDesktop=[-18,-31,-23,-37];
    const noteDepthTablet=[-14,-24,-18,-28];
    const noteDepthMobile=[-10,-17,-13,-20];
    const depths=mobile()?noteDepthMobile:(tablet()?noteDepthTablet:noteDepthDesktop);

    notes.forEach((note,index)=>{
      const local=lerp(-depths[index]*0.34,depths[index],p);
      setTranslate(note,local);
    });

    /* ILLUSTRATION: deepest plane. Still begins at the exact same moment as
       every note, but travels farther so the depth separation is obvious. */
    const illustrationDepth=mobile()?-34:tablet()?-48:-64;
    setTranslate(
      illustration,
      lerp(-illustrationDepth*0.28,illustrationDepth,p)
    );
  };

  gsap.to(proxy,{
    p:1,
    ease:'none',
    scrollTrigger:{
      trigger:section,
      start:'top 90%',
      end:'bottom 12%',
      scrub:0.72,
      invalidateOnRefresh:true,
      refreshPriority:1,
      onRefresh:render
    },
    onUpdate:render
  });

  render();
})();
