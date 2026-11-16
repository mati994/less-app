import {icons,dateKey,safeText} from './config.js';
import {demoData,load,persist,calculateMetrics,storageIssue} from './storage.js?v=20261116-storage1';
import {home,history,more,setupHtml} from './views.js?v=20261116-pearl21';
import {ringArcLength,animateRingSvgProgress,finishIntroAnimation,playPearlLight,stopPearlLight} from './ring.js?v=20261116-pearl21';

let data=load(), tab='home', modal=null, toastTimer=null, pendingDate=null, celebratePending=false, suppressAutoRing=false;
    const root=document.getElementById('app'), modalRoot=document.getElementById('modal-root');
const storageMessages={
  invalid:'Deine gespeicherten Daten konnten nicht sicher gelesen werden. Sie bleiben unverändert. Änderungen sind gesperrt. Bitte lösche keine Browserdaten und wende dich an das less.-Team.',
  read:'Der lokale Speicher ist nicht erreichbar. Es wurde nichts geändert. Bitte prüfe den Browserzugriff und lade die Seite neu.',
  conflict:'Die gespeicherten Daten wurden zwischenzeitlich geändert, möglicherweise in einem anderen Tab. Deine Änderung wurde nicht gespeichert. Bitte lade die Seite neu.',
  write:'Die Änderung konnte nicht gespeichert werden. Deine bisherigen Daten bleiben erhalten. Bitte versuche es erneut.',
  candidate:'Die Änderung enthält unerwartete Daten und wurde nicht gespeichert.'
};
function storageFeedback(){
  const message=storageMessages[storageIssue()] || '';
  const notice=document.getElementById('storage-notice');
  if(notice){notice.textContent=message;notice.hidden=!message;}
  return message;
}
function save(candidate){
  if(!persist(candidate)){toast(storageFeedback());return false;}
  data=candidate;
  storageFeedback();
  return true;
}
function metrics(){return calculateMetrics(data)}
let formMode='abstain';
function setup(){stopPearlLight(root);tab='setup';root.innerHTML=setupHtml()}

function render(){
      stopPearlLight(root);
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
      if(previousArc!==null&&currentArc!==null&&Math.abs(previousArc-currentArc)>.01&&!suppressAutoRing){
        const opacity=.24+.42*(1-Math.exp(-metrics().yes/45));
        const oldDays=opacity>0 ? -45*Math.log(Math.max(.0001,1-(1-previousArc/(2*Math.PI*130)-.24)/.42)) : metrics().yes;
        animateRingSvgProgress(root,oldDays,metrics().yes);
      }
    }
    function sheet(content){modalRoot.innerHTML=`<div class="overlay" id="sheet-overlay"><div class="sheet" role="dialog" aria-modal="true" aria-label="Check-in"><div class="handle"></div><button class="sheet-close" aria-label="Schließen" data-action="close">×</button>${content}</div></div>`;modal='open'}
    function closeSheet(){
      modalRoot.innerHTML='';modal=null;pendingDate=null;
      if(celebratePending){
        celebratePending=false;
        playPearlLight(root);
      }
    }
    function checkin(date){pendingDate=date;const d=new Date(`${date}T12:00:00`),dateLabel=new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long'}).format(d),current=data.checkins[date];const phrase=data.mode==='abstain'?'Heute darauf verzichtet':'Heute mein Ziel erreicht';sheet(`<div class="eyebrow" style="margin-top:42px">Ein bewusster Moment</div><h2>Wie lief dein Tag?</h2><p>${safeText(dateLabel)} · Ein ehrlicher Check-in reicht. Ohne weitere Fragen.</p><button class="choice" data-result="yes"><span class="choiceicon">${icons.check}</span><span><strong>${phrase}</strong><small>Du bist deinem Vorhaben treu geblieben.</small></span></button><button class="choice" data-result="no"><span class="choiceicon">${icons.close}</span><span><strong>Heute nicht erreicht</strong><small>Das ist ein Tag, nicht deine ganze Geschichte.</small></span></button>${current?'<button class="neutral-link" data-result="clear">Eintrag für diesen Tag entfernen</button>':'<button class="neutral-link" data-action="close">Später eintragen</button>'}`)}
    function showResult(type){const success=type==='yes';sheet(`<div class="success-panel"><div class="result-symbol"><svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="23" stroke="${success?'#ddc2f3':'#c2b6d3'}" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="107 38" transform="rotate(-60 32 32)"/></svg></div><div class="eyebrow" style="justify-content:center">${success?'Ein Schritt nach vorn':'Ein Teil deines Weges'}</div><h2>${success?'Du hast Raum geschaffen.':'Morgen ist ein neuer Tag.'}</h2><p>${success?'Ein erfolgreicher Tag mehr. Du musst niemandem etwas beweisen.':'Deine bisherigen Erfolge bleiben. Du kannst einfach weitermachen.'}</p><button class="primary-button" data-action="close"><span>Weiter</span>${icons.arrow}</button></div>`)}
    function toast(message){document.querySelector('.toast')?.remove();const el=document.createElement('div');el.className='toast';el.textContent=message;document.body.append(el);clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.remove(),2600)}
    document.addEventListener('click',e=>{
      const btn=e.target.closest('button');if(!btn){if(e.target.id==='sheet-overlay')closeSheet();return}
      if(btn.dataset.tab){tab=btn.dataset.tab;render();return}
      if(btn.dataset.quickCheck){
        const today=dateKey(new Date()),value=btn.dataset.quickCheck;
        if(value!=='yes'&&value!=='no')return;
        const from=metrics().yes;
        const candidate={...data,isDemo:false,checkins:{...data.checkins,[today]:value}};
        if(!save(candidate))return;
        const to=metrics().yes;
        suppressAutoRing=true;
        try{render()}finally{suppressAutoRing=false}
        animateRingSvgProgress(root,from,to);
        if(value==='yes')playPearlLight(root);
        toast(value==='yes'?'Für heute gespeichert.':'Heute festgehalten. Morgen ist ein neuer Tag.');
        return;
      }
      if(btn.dataset.day){checkin(btn.dataset.day);return}
      if(btn.dataset.result){
        const value=btn.dataset.result,date=pendingDate;
        if(!date)return;
        if(!['yes','no','clear'].includes(value))return;
        const candidate={...data,isDemo:false,checkins:{...data.checkins}};
        if(value==='clear')delete candidate.checkins[date];else candidate.checkins[date]=value;
        if(!save(candidate))return;
        closeSheet();
        render();
        if(value==='clear')toast('Eintrag entfernt');
        else {
          celebratePending=value==='yes';
          showResult(value);
        }
        return;
      }
      if(btn.dataset.mode){formMode=btn.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('selected',x.dataset.mode===formMode));document.getElementById('habit-goal').placeholder=formMode==='reduce'?'z. B. Maximal 30 Minuten pro Tag':'z. B. Jeden Tag ohne Zigarette';return}
      switch(btn.dataset.action){
        case 'close':closeSheet();break;
        case 'back':tab='home';render();break;
        case 'new':formMode='abstain';setup();break;
        case 'demo':
          if(!confirm('Die bisherigen Einträge werden durch Beispieldaten ersetzt. Fortfahren?'))return;
          if(!save(demoData()))return;
          tab='home';render();toast('Demo geladen');
          break;
        case 'erase':
          if(!confirm('Alle Einträge wirklich löschen?'))return;
          if(!save({...data,checkins:{},isDemo:false}))return;
          tab='home';render();toast('Einträge gelöscht');
          break;
        case 'export':{
          // Never export the unavailable-data placeholder as a personal backup.
          if(['invalid','read','conflict'].includes(storageIssue())){toast(storageFeedback());return;}
          const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
          const url=URL.createObjectURL(blob),a=document.createElement('a');
          a.href=url;a.download='less-meine-daten.json';a.click();
          setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Datenexport gestartet');
          break;
        }
      }
    });
    document.addEventListener('submit',e=>{
      if(e.target.id!=='habit-form')return;
      e.preventDefault();
      const habit=document.getElementById('habit-name').value.trim();
      const goal=document.getElementById('habit-goal').value.trim();
      if(!habit)return;
      const hadRecords=Object.keys(data.checkins).length;
      if(hadRecords&&!confirm('Damit beginnt ein neues Ziel. Die bisherigen Einträge werden ersetzt. Weiter?'))return;
      if(!save({isDemo:false,habit,goal,mode:formMode,created:dateKey(new Date()),checkins:{}}))return;
      tab='home';render();toast('Dein neues Ziel ist bereit');
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeSheet()});
    storageFeedback();
    render(); // Beim Start nur lesen. Erst nach einer Nutzeraktion speichern.
const splash=document.getElementById('splash'),appShell=document.getElementById('app');
    const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
setTimeout(()=>finishIntroAnimation({splash,appShell,root,metrics,reduceMotion}),reduceMotion?100:1400);
