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
      const fallback=()=>{appShell.classList.remove('booting','morphing','entering');splash?.remove()};
      if(reduceMotion||!source||!target||typeof target.animate!=='function'){fallback();return}
      const from=source.getBoundingClientRect(),to=target.getBoundingClientRect();
      if(!from.width||!to.width){fallback();return}
      // Fly a clone of the actual ring SVG; at the final frame it is the very same shape.
      const flying=target.cloneNode(true),arc=flying.querySelector('.ring-arc');
      if(!arc){fallback();return}
      flying.removeAttribute('aria-hidden');flying.classList.add('flight-orbit');
      const cx=from.left+from.width/2,cy=from.top+from.height/2;
      const startSize=(from.width*46/64)/(260/400);
      const start={left:cx-startSize/2,top:cy-startSize/2,width:startSize,height:startSize};
      Object.assign(flying.style,{left:start.left+'px',top:start.top+'px',width:start.width+'px',height:start.height+'px',transform:'none',animation:'none'});
      document.body.appendChild(flying);
      const full=2*Math.PI*130,oldLength=full*107/145,newLength=ringArcLength(metrics().yes);
      arc.setAttribute('transform','rotate(-60 200 200)');
      arc.setAttribute('stroke-dasharray',oldLength.toFixed(2)+' '+full.toFixed(2));
      arc.style.strokeWidth='28px';
      source.style.visibility='hidden';splash.classList.add('traveling');
      let raf=0;const begin=performance.now(),duration=1060;
      function updateRing(now){
        if(!flying.isConnected)return;
        const t=Math.min(1,Math.max(0,(now-begin)/duration));
        const ease=1-Math.pow(1-t,3);
        arc.setAttribute('stroke-dasharray',(oldLength+(newLength-oldLength)*ease).toFixed(2)+' '+full.toFixed(2));
        arc.setAttribute('transform','rotate('+(-60-38*ease).toFixed(3)+' 200 200)');
        arc.style.strokeWidth=(28+(5.9-28)*ease).toFixed(2)+'px';
        if(t<1)raf=requestAnimationFrame(updateRing);
      }
      raf=requestAnimationFrame(updateRing);
      const flight=flying.animate([
        {left:start.left+'px',top:start.top+'px',width:start.width+'px',height:start.height+'px'},
        {left:to.left+'px',top:to.top+'px',width:to.width+'px',height:to.height+'px'}
      ],{duration,easing:'cubic-bezier(.22,.74,.2,1)',fill:'forwards'});
      setTimeout(()=>{splash.classList.add('out');appShell.classList.remove('booting');appShell.classList.add('entering')},280);
      const done=()=>{
        cancelAnimationFrame(raf);
        appShell.classList.remove('morphing','entering');
        requestAnimationFrame(()=>{flying.remove();splash.remove()});
      };
      flight.onfinish=done;flight.oncancel=done;
    }
