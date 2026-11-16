// Der leuchtende Fortschrittsring: Geometrie, Check-in-Animation und Intro.
export function ringArcLength(n){return 2*Math.PI*130*(1-(.24+.42*(1-Math.exp(-n/45))))}

const pearlAnimations=new WeakMap();

export function stopPearlLight(root){
  pearlAnimations.get(root)?.();
}

export function playPearlLight(root){
  stopPearlLight(root);
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(motion.matches||document.hidden||!root.isConnected)return;

  // Read geometry once; every light layer then moves through transform/opacity.
  const bounds=root.getBoundingClientRect();
  if(!bounds.width||!bounds.height)return;
  const stage=root.querySelector('.ring-stage');
  const ring=stage?.getBoundingClientRect();
  const x=ring ? ring.left+ring.width/2-bounds.left : bounds.width/2;
  const y=ring ? ring.top+ring.height/2-bounds.top : bounds.height*.42;
  const radius=Math.hypot(Math.max(x,bounds.width-x),Math.max(y,bounds.height-y));
  // 130 is the contour radius in the existing 400-unit SVG viewBox.
  const sourceRadius=ring ? ring.width*130/400 : 192*.68*.12;
  const launchDelay=ring ? 130 : 0;
  const effect=document.createElement('div');
  effect.className='pearl-light';
  effect.setAttribute('aria-hidden','true');
  effect.innerHTML='<div class="pearl-wave"></div><div class="pearl-depth"></div>'+
    '<div class="pearl-edge pearl-edge-left"></div><div class="pearl-edge pearl-edge-right"></div>'+
    '<div class="pearl-edge pearl-edge-top"></div><div class="pearl-edge pearl-edge-bottom"></div>';
  effect.style.setProperty('--pearl-x',x+'px');
  effect.style.setProperty('--pearl-y',y+'px');
  effect.style.setProperty('--pearl-scale',String(radius/(192*.68)));
  effect.style.setProperty('--pearl-start-scale',String(sourceRadius/(192*.68)));
  effect.style.setProperty('--pearl-launch-delay',launchDelay+'ms');
  effect.style.setProperty('--pearl-duration','2350ms');

  // Approximate the crest's cubic ease-out arrival at each edge. The small
  // overlap lets the broad wave brighten the edge before its centre arrives.
  const distances={left:x,right:bounds.width-x,top:y,bottom:bounds.height-y};
  for(const [side,distance] of Object.entries(distances)){
    const fraction=Math.min(1,Math.max(0,(distance-sourceRadius)/(radius-sourceRadius)));
    const arrival=launchDelay+(1950-launchDelay)*(1-Math.cbrt(1-fraction));
    effect.style.setProperty('--pearl-'+side+'-delay',Math.max(0,arrival-70)+'ms');
  }

  let timeout;
  const stop=()=>{
    if(pearlAnimations.get(root)!==stop)return;
    clearTimeout(timeout);
    effect.remove();
    stage?.classList.remove('pearl-emitting');
    motion.removeEventListener('change',stop);
    document.removeEventListener('visibilitychange',stop);
    window.removeEventListener('pagehide',stop);
    window.removeEventListener('resize',stop);
    pearlAnimations.delete(root);
  };
  effect.addEventListener('animationend',event=>{
    if(event.animationName==='pearlEdgeFade')stop();
  });
  motion.addEventListener('change',stop);
  document.addEventListener('visibilitychange',stop);
  window.addEventListener('pagehide',stop);
  window.addEventListener('resize',stop);
  pearlAnimations.set(root,stop);
  // Also clean up when CSS animations are interrupted or animationend is lost.
  timeout=setTimeout(stop,2450);
  stage?.classList.add('pearl-emitting');
  root.append(effect);
}

export function animateRingSvgProgress(root,from,to){
  const stage=root.querySelector('.ring-stage');
  const ring=stage?.querySelector('.ring-arc');
  const number=stage?.querySelector('.metric-number');
  if(!stage||!ring||!number)return;

  const total=(2*Math.PI*130).toFixed(2);
  const paint=value=>{
    ring.setAttribute('stroke-dasharray',ringArcLength(value).toFixed(2)+' '+total);
    const label=String(Math.round(value));
    if(number.textContent!==label)number.textContent=label;
  };
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||Math.abs(from-to)<.001){
    paint(to);
    return;
  }

  paint(from);
  const begin=performance.now();
  function frame(now){
    if(!stage.isConnected)return;
    const progress=Math.max(0,Math.min(1,(now-begin)/760));
    paint(from+(to-from)*(1-Math.pow(1-progress,3)));
    if(progress<1)requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

export function finishIntroAnimation({splash,appShell,root,metrics,reduceMotion}){
  const source=splash?.querySelector('.splash-logo svg');
  const target=root.querySelector('.ring-stage .orbit');
  const finishWithoutFlight=()=>{
    appShell.classList.remove('booting','morphing','entering');
    splash?.remove();
  };
  if(reduceMotion||!source||!target||typeof requestAnimationFrame!=='function'){
    finishWithoutFlight();
    return;
  }

  // Safari kann beim Reload eine alte Scrollposition übernehmen.
  // Die Vorschau beginnt ausdrücklich oben. Das Ziel wird dennoch in JEDEM Frame
  // frisch gemessen, falls die Safari-Adressleiste oder der Viewport sich bewegt.
  if(typeof window.scrollTo==='function')window.scrollTo(0,0);
  const from=source.getBoundingClientRect();
  const initialTarget=target.getBoundingClientRect();
  if(!from.width||!initialTarget.width){
    finishWithoutFlight();
    return;
  }
  const flying=target.cloneNode(true);
  const arc=flying.querySelector('.ring-arc');
  if(!arc){
    finishWithoutFlight();
    return;
  }
  flying.removeAttribute('aria-hidden');
  flying.classList.add('flight-orbit');
  // Der fliegende Ring muss trotz der ausgeblendeten Dashboard-SVG sichtbar bleiben.
  flying.style.visibility='visible';
  flying.style.opacity='1';
  const startDiameter=(from.width*46/64)/(260/400);
  const start={
    left:from.left+from.width/2-startDiameter/2,
    top:from.top+from.height/2-startDiameter/2,
    width:startDiameter,
    height:startDiameter
  };
  Object.assign(flying.style,{
    left:start.left+'px',top:start.top+'px',
    width:start.width+'px',height:start.height+'px',
    transform:'none',animation:'none'
  });
  document.body.appendChild(flying);

  const full=2*Math.PI*130;
  const previousLength=full*107/145;
  const nextLength=ringArcLength(metrics().yes);
  const duration=1060;
  let finished=false,frameId=0;
  source.style.visibility='hidden';
  splash.classList.add('traveling');
  setTimeout(()=>{
    if(finished)return;
    splash.classList.add('out');
    appShell.classList.remove('booting');
    appShell.classList.add('entering');
  },280);

  const complete=()=>{
    if(finished)return;
    finished=true;
    cancelAnimationFrame(frameId);
    // Die tatsächliche Dashboard-SVG wird im selben Frame sichtbar,
    // in dem die Flug-SVG verschwindet: keine Doppelbelichtung oder Sprünge.
    appShell.classList.remove('booting','morphing','entering');
    flying.remove();
    splash.remove();
  };

  const startedAt=performance.now();
  const frame=now=>{
    if(finished)return;
    if(!flying.isConnected || !target.isConnected){
      complete();
      return;
    }
    const t=Math.max(0,Math.min(1,(now-startedAt)/duration));
    const eased=1-Math.pow(1-t,3);
    const destination=target.getBoundingClientRect();
    if(!destination.width){
      complete();
      return;
    }
    const interpolate=(a,b)=>a+(b-a)*eased;
    Object.assign(flying.style,{
      left:interpolate(start.left,destination.left)+'px',
      top:interpolate(start.top,destination.top)+'px',
      width:interpolate(start.width,destination.width)+'px',
      height:interpolate(start.height,destination.height)+'px'
    });
    const length=interpolate(previousLength,nextLength);
    const rotation=interpolate(-60,-98);
    const strokeWidth=interpolate(28,14.5);
    arc.setAttribute('stroke-dasharray',length.toFixed(2)+' '+full.toFixed(2));
    arc.setAttribute('transform','rotate('+rotation.toFixed(3)+' 200 200)');
    arc.style.strokeWidth=strokeWidth.toFixed(2)+'px';
    if(t<1)frameId=requestAnimationFrame(frame);
    else complete();
  };
  frameId=requestAnimationFrame(frame);
}
