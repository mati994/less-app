import {icons,dateKey,safeText} from './config.js';
import {demoData,load,persist,calculateMetrics} from './storage.js';
import {home,history,more,setupHtml} from './views.js';
import {ringArcLength,animateRingSvgProgress,finishIntroAnimation} from './ring.js';

let data=load(), tab='home', modal=null, toastTimer=null, pendingDate=null, celebratePending=false, pendingRingFrom=null, suppressAutoRing=false;
    const root=document.getElementById('app'), modalRoot=document.getElementById('modal-root');
function save(){if(!persist(data))toast('Speichern ist in diesem Browser nicht möglich.')}
function metrics(){return calculateMetrics(data)}
let formMode='abstain';
function setup(){tab='setup';root.innerHTML=setupHtml()}
function animateRingProgress(from,to,pulse){animateRingSvgProgress(root,from,to,pulse)}

function render(){
      const oldRing=root.querySelector('.orbit .ring-arc');
      const previousArc=oldRing?Number(oldRing.getAttribute('data-arc')):null;
      if(tab==='setup'){setup();return}
      root.innerHTML=tab==='history'?history(data,metrics,tab):tab==='more'?more(tab):home(data,metrics,tab);
      const page=root.querySelector('.screen');
      if(tab==='history'||tab==='more'){
        page.classList.add('screen-'+tab);
        const headerEl=page.querySelector('.brandrow'),nav=page.querySelector('.bottom-nav');
        if(headerEl&&nav){
          const scroller=document.createElement('div');scroller.className='page-scroll';
          let child=headerEl.nextSibling;
          while(child&&child!==nav){const next=child.nextSibling;scroller.appendChild(child);child=next}
          page.insertBefore(scroller,nav);
        }
      }
      const newRing=root.querySelector('.orbit .ring-arc');
      const currentArc=newRing?Number(newRing.getAttribute('data-arc')):null;
      // On a successful check-in the celebration waits for the result sheet to close.
      if(previousArc!==null&&currentArc!==null&&Math.abs(previousArc-currentArc)>.01&&!celebratePending&&!suppressAutoRing){
        const opacity=.24+.42*(1-Math.exp(-metrics().yes/45));
        const oldDays=opacity>0 ? -45*Math.log(Math.max(.0001,1-(1-previousArc/(2*Math.PI*130)-.24)/.42)) : metrics().yes;
        animateRingProgress(oldDays,metrics().yes,false);
      }
    }
    function sheet(content){modalRoot.innerHTML=`<div class="overlay" id="sheet-overlay"><div class="sheet" role="dialog" aria-modal="true" aria-label="Check-in"><div class="handle"></div><button class="sheet-close" aria-label="Schließen" data-action="close">×</button>${content}</div></div>`;modal='open'}
    function closeSheet(){modalRoot.innerHTML='';modal=null;pendingDate=null}
    function checkin(date){pendingDate=date;const d=new Date(`${date}T12:00:00`),dateLabel=new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long'}).format(d),current=data.checkins[date];const phrase=data.mode==='abstain'?'Heute darauf verzichtet':'Heute mein Ziel erreicht';sheet(`<div class="eyebrow" style="margin-top:42px">Ein bewusster Moment</div><h2>Wie lief dein Tag?</h2><p>${safeText(dateLabel)} · Ein ehrlicher Check-in reicht. Ohne weitere Fragen.</p><button class="choice" data-result="yes"><span class="choiceicon">${icons.check}</span><span><strong>${phrase}</strong><small>Du bist deinem Vorhaben treu geblieben.</small></span></button><button class="choice" data-result="no"><span class="choiceicon">${icons.close}</span><span><strong>Heute nicht erreicht</strong><small>Das ist ein Tag, nicht deine ganze Geschichte.</small></span></button>${current?'<button class="neutral-link" data-result="clear">Eintrag für diesen Tag entfernen</button>':'<button class="neutral-link" data-action="close">Später eintragen</button>'}`)}
    function showResult(type){const success=type==='yes';sheet(`<div class="success-panel"><div class="result-symbol"><svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="23" stroke="${success?'#ddc2f3':'#c2b6d3'}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="107 38" transform="rotate(-60 32 32)"/></svg></div><div class="eyebrow" style="justify-content:center">${success?'Ein Schritt nach vorn':'Ein Teil deines Weges'}</div><h2>${success?'Du hast Raum geschaffen.':'Morgen ist ein neuer Tag.'}</h2><p>${success?'Ein erfolgreicher Tag mehr. Du musst niemandem etwas beweisen.':'Deine bisherigen Erfolge bleiben. Du kannst einfach weitermachen.'}</p><button class="primary-button" data-action="close"><span>Weiter</span>${icons.arrow}</button></div>`)}
    function toast(message){document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.textContent=message;document.body.append(el);clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.remove(),2600)}
    document.addEventListener('click',e=>{
      const btn=e.target.closest('button');if(!btn){if(e.target.id==='sheet-overlay')closeSheet();return}
      if(btn.dataset.tab){tab=btn.dataset.tab;render();return}
      if(btn.dataset.quickCheck){
        const today=dateKey(new Date()),value=btn.dataset.quickCheck;
        const previous=data.checkins[today],wasDemo=data.isDemo,from=metrics().yes;
        if(value==='clear')delete data.checkins[today];else data.checkins[today]=value;
        data.isDemo=false;
        if(!persist(data)){
          if(previous===undefined)delete data.checkins[today];else data.checkins[today]=previous;
          data.isDemo=wasDemo;
          toast('Der Eintrag konnte nicht gespeichert werden.');
          return;
        }
        const to=metrics().yes;
        suppressAutoRing=true;
        try{render()}finally{suppressAutoRing=false}
        if(value==='clear'){
          if(from!==to)animateRingProgress(from,to,false);
          toast('Eintrag entfernt');
        }else{
          // Jeder Check-in erzeugt einen ruhigen Ringimpuls, auch an schwierigen Tagen.
          // Die Zahl verändert sich nur, wenn sich die Anzahl erfolgreicher Tage ändert.
          animateRingProgress(from,to,true);
          toast(value==='yes'?'Für heute gespeichert.':'Heute festgehalten. Morgen ist ein neuer Tag.');
        }
        return;
      }
      if(btn.dataset.day){checkin(btn.dataset.day);return}
      if(btn.dataset.result){const val=btn.dataset.result;if(!pendingDate)return;const before=data.checkins[pendingDate];pendingRingFrom=(val==='yes'&&before!=='yes')?metrics().yes:null;if(val==='clear')delete data.checkins[pendingDate];else data.checkins[pendingDate]=val;celebratePending=(pendingRingFrom!==null);data.isDemo=false;save();closeSheet();render();if(val==='clear')toast('Eintrag entfernt');else showResult(val);return}
      if(btn.dataset.mode){formMode=btn.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('selected',x.dataset.mode===formMode));document.getElementById('habit-goal').placeholder=formMode==='reduce'?'z. B. Maximal 30 Minuten pro Tag':'z. B. Jeden Tag ohne Zigarette';return}
      switch(btn.dataset.action){case 'close':closeSheet();if(celebratePending){celebratePending=false;const from=pendingRingFrom;pendingRingFrom=null;animateRingProgress(from,metrics().yes,true)}break;case 'back':tab='home';render();break;case 'new':formMode='abstain';setup();break;case 'demo':if(confirm('Die bisherigen Einträge werden durch Beispieldaten ersetzt. Fortfahren?')){data=demoData();save();tab='home';render();toast('Demo geladen')}break;case 'erase':if(confirm('Alle Einträge wirklich löschen?')){data.checkins={};data.isDemo=false;save();tab='home';render();toast('Einträge gelöscht')}break;case 'export':{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='less-meine-daten.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Datenexport gestartet');break}}
    });
    document.addEventListener('submit',e=>{if(e.target.id!=='habit-form')return;e.preventDefault();const habit=document.getElementById('habit-name').value.trim(),goal=document.getElementById('habit-goal').value.trim();if(!habit)return;const hadRecords=Object.keys(data.checkins).length;if(hadRecords&&!confirm('Damit beginnt ein neues Ziel. Die bisherigen Einträge werden ersetzt. Weiter?'))return;data={isDemo:false,habit,goal,mode:formMode,created:dateKey(new Date()),checkins:{}};save();tab='home';render();toast('Dein neues Ziel ist bereit')});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
    save();render();
const splash=document.getElementById('splash'),appShell=document.getElementById('app');
    const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
setTimeout(()=>finishIntroAnimation({splash,appShell,root,metrics,reduceMotion}),reduceMotion?100:1400);
