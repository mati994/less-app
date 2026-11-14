// Der leuchtende Fortschrittsring: Geometrie, Check-in-Animation und Intro.
export function ringArcLength(n){return 2*Math.PI*130*(1-(.24+.42*(1-Math.exp(-n/45))))}

export function animateRingSvgProgress(root,from,to,pulse){
      const stage=root.querySelector('.ring-stage'),ring=stage?.querySelector('.ring-arc'),num=stage?.querySelector('.metric-number');
      if(!stage||!ring||!num)return;
      const total=(2*Math.PI*130).toFixed(2);
      const paint=v=>{
        const length=ringArcLength(v).toFixed(2);
        ring.setAttribute('stroke-dasharray',length+' '+total);
        num.textContent=String(Math.round(v));
      };
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){paint(to);return}
      const fromValue=Number.isFinite(from)?from:to;
      const toValue=Number.isFinite(to)?to:fromValue;
      paint(fromValue);
      const begin=performance.now(),duration=1040;
      function frame(now){
        // Guard against navigation and replacing the ring during the animation.
        if(!stage.isConnected)return;
        const t=Math.max(0,Math.min(1,(now-begin)/duration)),ease=1-Math.pow(1-t,3);
        paint(fromValue+(toValue-fromValue)*ease);
        if(t<1)requestAnimationFrame(frame);
        else if(pulse){stage.classList.remove('celebrate');void stage.offsetWidth;stage.classList.add('celebrate');setTimeout(()=>stage.classList.remove('celebrate'),1450)}
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
    const strokeWidth=interpolate(28,5.9);
    arc.setAttribute('stroke-dasharray',length.toFixed(2)+' '+full.toFixed(2));
    arc.setAttribute('transform','rotate('+rotation.toFixed(3)+' 200 200)');
    arc.style.strokeWidth=strokeWidth.toFixed(2)+'px';
    if(t<1)frameId=requestAnimationFrame(frame);
    else complete();
  };
  frameId=requestAnimationFrame(frame);
}
