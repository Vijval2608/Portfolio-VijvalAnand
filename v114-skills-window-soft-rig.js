(function(){
  const root = document.querySelector('.figma-skills-window-custom');
  if(!root) return;

  const leftLine = root.querySelector('#skills-leg-left-line');
  const rightLine = root.querySelector('#skills-leg-right-line');
  const leftFoot = root.querySelector('#skills-leg-left-foot');
  const rightFoot = root.querySelector('#skills-leg-right-foot');
  const head = root.querySelector('#skills-head-group');
  const eyes = root.querySelector('#skills-eyes-group');
  const noteA = root.querySelector('#skills-music-note-a');
  const noteB = root.querySelector('#skills-music-note-b');
  if(!leftLine || !rightLine || !leftFoot || !rightFoot || !head || !eyes) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)');
  let live=false, raf=0, start=performance.now();
  let blink=1, blinkTimer=0, blinkReset=0;
  let hx=0,hy=0,ex=0,ey=0,thx=0,thy=0,tex=0,tey=0;

  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const lerp=(a,b,t)=>a+(b-a)*t;
  const smoothstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};

  /* Neutral leg curves are based directly on the user's two vector paths.
     Multiple invisible spline points create distal lag: hip moves almost none,
     lower leg moves more, foot moves most. That is the soft thread/spine feel. */
  const legs={
    left:{
      line:leftLine,foot:leftFoot,phase:Math.PI,
      base:[{x:343.411,y:408.743},{x:326.4,y:408.0},{x:310.2,y:421.2},{x:305.2,y:452.5},{x:309.029,y:487.138}],
      footAnchor:{x:309.029,y:487.138}
    },
    right:{
      line:rightLine,foot:rightFoot,phase:0,
      base:[{x:373.382,y:408.735},{x:356.4,y:408.0},{x:340.2,y:421.2},{x:335.2,y:452.5},{x:339.001,y:487.13}],
      footAnchor:{x:339.001,y:487.13}
    }
  };

  const footBoxes={
    left:leftFoot.getBBox(),
    right:rightFoot.getBBox()
  };
  const noteTypes={
    a:{
      d:noteA ? noteA.getAttribute('d') : '',
      fill:noteA ? (noteA.getAttribute('fill') || '#1e1e1e') : '#1e1e1e',
      box:noteA ? noteA.getBBox() : null
    },
    b:{
      d:noteB ? noteB.getAttribute('d') : '',
      fill:noteB ? (noteB.getAttribute('fill') || '#1e1e1e') : '#1e1e1e',
      box:noteB ? noteB.getBBox() : null
    }
  };

  /* Musical-note emission anchor stays close to the headphones. */
  const noteSpawnAnchor={x:437.5,y:268.5};

  /* Four reusable path slots let the stream remain continuous while only
     ~2–3 notes are visibly present at once. Two are the original Figma paths;
     two are lightweight clones. */
  const noteSlots=[];
  if(noteA && noteB && noteTypes.a.box && noteTypes.b.box){
    const parent=noteB.parentNode;
    const clone1=noteA.cloneNode(false);
    const clone2=noteB.cloneNode(false);
    clone1.removeAttribute('id');
    clone2.removeAttribute('id');
    clone1.classList.add('skills-music-note-clone');
    clone2.classList.add('skills-music-note-clone');
    parent.insertBefore(clone1,noteB.nextSibling);
    parent.insertBefore(clone2,clone1.nextSibling);

    [noteA,noteB,clone1,clone2].forEach((el,index)=>{
      noteSlots.push({
        el,
        index,
        active:false,
        typeKey:index%2===0?'a':'b',
        box:index%2===0?noteTypes.a.box:noteTypes.b.box,
        startAt:0,
        duration:1900,
        startX:0,startY:0,endX:0,endY:0,
        startRot:0,endRot:0,startScale:1,endScale:1,
        currentX:0,currentY:0,lane:0
      });
      el.style.opacity='0';
    });
  }

  const rand=(a,b)=>a+Math.random()*(b-a);
  const pick=(arr)=>arr[Math.floor(Math.random()*arr.length)];
  const NOTE_INTERVAL=680;
  const NOTE_DURATION=2350;
  let nextNoteSpawnAt=0;
  let noteLaneCursor=Math.random()<.5?-1:1;
  function catmullRomPath(points,tension=.88){
    let d=`M ${points[0].x.toFixed(3)} ${points[0].y.toFixed(3)}`;
    for(let i=0;i<points.length-1;i++){
      const p0=points[i-1] || points[i];
      const p1=points[i];
      const p2=points[i+1];
      const p3=points[i+2] || p2;
      const c1={x:p1.x+(p2.x-p0.x)/6*tension,y:p1.y+(p2.y-p0.y)/6*tension};
      const c2={x:p2.x-(p3.x-p1.x)/6*tension,y:p2.y-(p3.y-p1.y)/6*tension};
      d+=` C ${c1.x.toFixed(3)} ${c1.y.toFixed(3)} ${c2.x.toFixed(3)} ${c2.y.toFixed(3)} ${p2.x.toFixed(3)} ${p2.y.toFixed(3)}`;
    }
    return d;
  }

  function matrixAround(cx,cy,angleDeg,tx,ty,scaleX=1,scaleY=1){
    const r=angleDeg*Math.PI/180,c=Math.cos(r),s=Math.sin(r);
    const a=c*scaleX,b=s*scaleX,cc=-s*scaleY,d=c*scaleY;
    const e=tx+cx-a*cx-cc*cy;
    const f=ty+cy-b*cx-d*cy;
    return `matrix(${a.toFixed(6)} ${b.toFixed(6)} ${cc.toFixed(6)} ${d.toFixed(6)} ${e.toFixed(3)} ${f.toFixed(3)})`;
  }

  function updateLeg(key,time){
    const L=legs[key];
    const phase=(time/2050)*Math.PI*2 + L.phase;
    const pts=L.base.map((p,i)=>{
      if(i===0) return {x:p.x,y:p.y}; // hip stays planted
      const t=i/(L.base.length-1);
      const amp=22*Math.pow(t,1.72);
      const lag=.46*t;
      const wave=Math.sin(phase-lag);
      const harmonic=Math.sin((phase-lag)*2+.55)*.09;
      const dx=amp*(wave+harmonic);
      const dy=-Math.abs(wave)*2.7*Math.pow(t,1.28)+Math.cos(phase-lag)*.45*t;
      return {x:p.x+dx,y:p.y+dy};
    });
    L.line.setAttribute('d',catmullRomPath(pts));

    const foot=pts[pts.length-1],prev=pts[pts.length-2];
    const baseFoot=L.base[L.base.length-1],basePrev=L.base[L.base.length-2];
    const dynamicAngle=Math.atan2(foot.y-prev.y,foot.x-prev.x)*180/Math.PI;
    const baseAngle=Math.atan2(baseFoot.y-basePrev.y,baseFoot.x-basePrev.x)*180/Math.PI;
    const rot=clamp((dynamicAngle-baseAngle)*.34,-8,8);
    const dx=foot.x-L.footAnchor.x,dy=foot.y-L.footAnchor.y;
    const b=footBoxes[key],cx=b.x+b.width/2,cy=b.y+b.height/2;
    L.foot.setAttribute('transform',matrixAround(cx,cy,rot,dx,dy));
  }

  function scheduleBlink(){
    clearTimeout(blinkTimer);
    if(reduced.matches) return;
    blinkTimer=setTimeout(()=>{
      blink=.08;
      clearTimeout(blinkReset);
      blinkReset=setTimeout(()=>{
        blink=1;
        if(Math.random()<.18){
          setTimeout(()=>{blink=.1;setTimeout(()=>blink=1,100);},125);
        }
        scheduleBlink();
      },120);
    },2300+Math.random()*2600);
  }

  function updateHead(time){
    hx+=(thx-hx)*.12; hy+=(thy-hy)*.12;
    ex+=(tex-ex)*.12; ey+=(tey-ey)*.12;
    const phase=(time/2440)*Math.PI*2;
    const angle=Math.sin(phase-.35)*1.35+Math.sin(phase*2+.2)*.22;
    const nodY=((Math.sin(phase-.15)+1)*.5)*2.05;
    const neckX=374,neckY=327.3;
    head.setAttribute('transform',matrixAround(neckX,neckY,angle,hx,hy+nodY));

    const eyeX=362,eyeY=300;
    eyes.setAttribute('transform',matrixAround(eyeX,eyeY,0,ex,ey,1,blink));
  }

  function noteOpacity(p){
    /* Softer lo-fi envelope: each note breathes in on spawn, hangs for a beat,
       then fades away smoothly while the next note is already arriving. */
    const fadeIn=smoothstep(0,.16,p);
    const hold=1-smoothstep(.52,.86,p);
    return Math.min(fadeIn,hold)*.88;
  }

  function currentNoteCenter(slot){
    return {
      x:slot.box.x+slot.box.width/2+slot.currentX,
      y:slot.box.y+slot.box.height/2+slot.currentY
    };
  }

  function chooseNoteType(){
    return Math.random()<.5?'a':'b';
  }

  function applyNoteType(slot,typeKey){
    const type=noteTypes[typeKey];
    slot.typeKey=typeKey;
    slot.box=type.box;
    slot.el.setAttribute('d',type.d);
    slot.el.setAttribute('fill',type.fill);
  }

  function chooseLane(slot,others){
    /* Alternate preferred lanes for rhythm, but if that lane would be too
       close to another active note, use the lane with the most free space. */
    const preferred=noteLaneCursor;
    noteLaneCursor*=-1;

    const candidates=[preferred,-preferred];
    let bestLane=candidates[0],bestDistance=-Infinity;

    candidates.forEach(lane=>{
      const laneOffset=lane<0?-6.6:6.6;
      const cx=noteSpawnAnchor.x+laneOffset;
      const cy=noteSpawnAnchor.y+7;
      const minDistance=others.length
        ? Math.min(...others.map(other=>{
            const o=currentNoteCenter(other);
            return Math.hypot(cx-o.x,cy-o.y);
          }))
        : 999;
      if(minDistance>bestDistance){bestDistance=minDistance;bestLane=lane;}
    });
    return bestLane;
  }

  function spawnNote(slot,time,age=0){
    const others=noteSlots.filter(n=>n!==slot&&n.active);
    const typeKey=chooseNoteType();
    applyNoteType(slot,typeKey);

    const lane=chooseLane(slot,others);
    let startX=0,startY=0;

    /* Keep the current v112 headphone-adjacent positioning and size, but use
       only small jitter. Distance checks stop two fresh notes landing together. */
    for(let attempt=0;attempt<18;attempt++){
      const laneOffset=lane<0?rand(-8.5,-4.8):rand(4.8,8.5);
      const jitterX=rand(-1.4,1.4);
      const jitterY=rand(3,11);
      const candidateX=(noteSpawnAnchor.x-(slot.box.x+slot.box.width/2))+laneOffset+jitterX;
      const candidateY=(noteSpawnAnchor.y-(slot.box.y+slot.box.height/2))+jitterY;

      const cx=slot.box.x+slot.box.width/2+candidateX;
      const cy=slot.box.y+slot.box.height/2+candidateY;
      const clear=others.every(other=>{
        const o=currentNoteCenter(other);
        return Math.hypot(cx-o.x,cy-o.y)>25;
      });

      if(clear||attempt===17){
        startX=candidateX;
        startY=candidateY;
        break;
      }
    }

    slot.lane=lane;
    slot.active=true;
    slot.duration=NOTE_DURATION;
    slot.startAt=time-age;
    slot.startX=startX;
    slot.startY=startY;
    slot.endX=startX+(lane<0?rand(-6.5,-2.6):rand(2.6,6.5));
    slot.endY=startY-rand(24,34);
    slot.startRot=lane<0?rand(-5,-1):rand(1,5);
    slot.endRot=slot.startRot+(lane<0?rand(-4.5,-1.5):rand(1.5,4.5));
    slot.startScale=rand(.76,.84);
    slot.endScale=rand(.88,.96);
    slot.currentX=slot.startX;
    slot.currentY=slot.startY;
  }

  function primeNoteStream(time){
    if(!noteSlots.length)return;
    noteSlots.forEach(slot=>{
      slot.active=false;
      slot.el.style.opacity='0';
      slot.el.removeAttribute('transform');
    });

    /* Start as if the song was already playing: one note is fading, one is
       fully present, and one is just arriving. */
    spawnNote(noteSlots[0],time,NOTE_INTERVAL*2);
    spawnNote(noteSlots[1],time,NOTE_INTERVAL);
    spawnNote(noteSlots[2],time,0);
    nextNoteSpawnAt=time+NOTE_INTERVAL;
  }

  function updateNotes(time){
    if(!noteSlots.length)return;

    if(nextNoteSpawnAt===0){
      primeNoteStream(time);
    }

    /* Fixed emission cadence: every note is spawned at the same interval. */
    while(time>=nextNoteSpawnAt){
      let slot=noteSlots.find(s=>!s.active);
      if(!slot){
        /* Reuse the oldest fully-faded slot if timings ever drift after a tab
           suspension. This preserves cadence without creating clutter. */
        slot=noteSlots
          .slice()
          .sort((a,b)=>a.startAt-b.startAt)[0];
      }
      spawnNote(slot,nextNoteSpawnAt,0);
      nextNoteSpawnAt+=NOTE_INTERVAL;
    }

    noteSlots.forEach(slot=>{
      if(!slot.active){slot.el.style.opacity='0';return;}

      const p=clamp((time-slot.startAt)/slot.duration,0,1);
      if(p>=1){
        slot.active=false;
        slot.lane=0;
        slot.el.style.opacity='0';
        slot.el.removeAttribute('transform');
        return;
      }

      const move=.5-.5*Math.cos(Math.PI*p);
      const x=lerp(slot.startX,slot.endX,move);
      const y=lerp(slot.startY,slot.endY,move);
      const r=lerp(slot.startRot,slot.endRot,move);
      const s=lerp(slot.startScale,slot.endScale,move);
      slot.currentX=x;
      slot.currentY=y;

      const cx=slot.box.x+slot.box.width/2;
      const cy=slot.box.y+slot.box.height/2;
      slot.el.style.opacity=noteOpacity(p).toFixed(3);
      slot.el.setAttribute('transform',matrixAround(cx,cy,r,x,y,s,s));
    });
  }

  function frame(now){
    raf=0;
    const time=now-start;
    if(live&&!reduced.matches){
      updateLeg('left',time);
      updateLeg('right',time);
      updateHead(time);
      updateNotes(time);
    }else{
      hx+=(0-hx)*.12;hy+=(0-hy)*.12;ex+=(0-ex)*.12;ey+=(0-ey)*.12;
      if(!reduced.matches) updateHead(time);
    }
    if(live || Math.abs(hx)+Math.abs(hy)+Math.abs(ex)+Math.abs(ey)>.03) raf=requestAnimationFrame(frame);
  }
  function run(){if(!raf)raf=requestAnimationFrame(frame);}

  const observer=new IntersectionObserver(entries=>{
    const e=entries[0];
    live=Boolean(e&&e.isIntersecting&&e.intersectionRatio>=.16&&!reduced.matches);
    root.classList.toggle('is-live',live);
    if(live){
      nextNoteSpawnAt=0;
      run();
    }
  },{threshold:[0,.16,.4,.75],rootMargin:'15% 0px 15% 0px'});
  observer.observe(root);

  function pointerMove(ev){
    if(!finePointer.matches||reduced.matches||!live)return;
    const r=root.getBoundingClientRect();
    const pad=Math.min(180,r.width*.42);
    const near=ev.clientX>=r.left-pad&&ev.clientX<=r.right+pad&&ev.clientY>=r.top-pad&&ev.clientY<=r.bottom+pad;
    if(!near){thx=thy=tex=tey=0;run();return;}
    const nx=clamp((ev.clientX-(r.left+r.width/2))/(r.width/2),-1,1);
    const ny=clamp((ev.clientY-(r.top+r.height/2))/(r.height/2),-1,1);
    /* Same perceived cursor-follow strength as the approved v108 interaction,
       converted to the new SVG coordinate system. */
    thx=nx*4.6; thy=ny*3.45; tex=nx*7.45; tey=ny*4.45; run();
  }
  function pointerReset(){thx=thy=tex=tey=0;run();}
  window.addEventListener('pointermove',pointerMove,{passive:true});
  window.addEventListener('pointerleave',pointerReset,{passive:true});
  window.addEventListener('blur',pointerReset);

  const mediaChange=()=>{
    if(reduced.matches){
      live=false;root.classList.remove('is-live');blink=1;
      leftLine.setAttribute('d','M309.029 487.138C309.029 487.138 303.647 437.243 309.029 421.243C314.411 405.243 343.411 408.743 343.411 408.743');
      rightLine.setAttribute('d','M339.001 487.13C339.001 487.13 333.618 437.235 339 421.235C344.382 405.235 373.382 408.735 373.382 408.735');
      leftFoot.removeAttribute('transform');rightFoot.removeAttribute('transform');head.removeAttribute('transform');eyes.removeAttribute('transform');
      noteSlots.forEach((slot,index)=>{
        slot.active=false;
        slot.el.removeAttribute('transform');
        if(index===0){
          applyNoteType(slot,'a');
          slot.el.style.opacity='1';
        }else if(index===1){
          applyNoteType(slot,'b');
          slot.el.style.opacity='1';
        }else{
          slot.el.style.opacity='0';
        }
      });
      nextNoteSpawnAt=0;
    }else{scheduleBlink();run();}
  };
  if(reduced.addEventListener)reduced.addEventListener('change',mediaChange);else if(reduced.addListener)reduced.addListener(mediaChange);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)run();});
  scheduleBlink();
})();
