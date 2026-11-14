import {icons, safeText, dateKey, shifted, weekdayShort} from './config.js';
import {ringArcLength} from './ring.js';

export function logo(){return `<div class="brand"><svg class="brandmark" viewBox="0 0 36 36" fill="none"><defs><linearGradient id="markgrad" x1="0" y1="0" x2="36" y2="36"><stop stop-color="#e8cfca"/><stop offset="1" stop-color="#aa90dd"/></linearGradient></defs><circle cx="18" cy="18" r="13" stroke="url(#markgrad)" stroke-width="3.2" stroke-dasharray="63 19" transform="rotate(-65 18 18)"/></svg>less.</div>`}
    export function header(){return `<header class="brandrow">${logo()}<button class="iconbutton" aria-label="Einstellungen" data-tab="more">${icons.settings}</button></header>`}
    export function bottom(tab){return `<nav class="bottom-nav" aria-label="Hauptnavigation">${[['home','Heute',icons.home],['history','Verlauf',icons.calendar],['more','Mehr',icons.more]].map(([name,title,icon])=>`<button class="tab ${name===tab?'active':''}" data-tab="${name}" aria-label="${title}" aria-current="${name===tab?'page':'false'}">${icon}<span>${title}</span><i class="dot"></i></button>`).join('')}</nav>`}
    
    export function home(data,metrics,tab){
      const m=metrics(),todayVal=data.checkins[dateKey(new Date())],done=!!todayVal;
      const total=(2*Math.PI*130).toFixed(2),arc=ringArcLength(m.yes).toFixed(2);
      const fmtDate=new Intl.DateTimeFormat('de-DE',{weekday:'long',day:'numeric',month:'long'}).format(new Date());
      const ringSvg='<svg class="orbit" viewBox="0 0 400 400" fill="none" aria-hidden="true"><defs>'+
        '<linearGradient id="ringGradient" x1="65" y1="65" x2="345" y2="340" gradientUnits="userSpaceOnUse">'+
          '<stop offset="0" stop-color="#f6dcd5"/><stop offset=".27" stop-color="#ecccf1"/><stop offset=".64" stop-color="#c6a4fa"/><stop offset="1" stop-color="#e9c7e7"/>'+
        '</linearGradient>'+
        '<filter id="trueBloom" x="-55%" y="-55%" width="210%" height="210%" color-interpolation-filters="sRGB">'+
          '<feGaussianBlur in="SourceGraphic" stdDeviation="13" result="wide"/>'+
          '<feComponentTransfer in="wide" result="wideDim"><feFuncA type="linear" slope=".70"/></feComponentTransfer>'+
          '<feGaussianBlur in="SourceGraphic" stdDeviation="4.7" result="near"/>'+
          '<feComponentTransfer in="near" result="nearDim"><feFuncA type="linear" slope=".97"/></feComponentTransfer>'+
          '<feMerge><feMergeNode in="wideDim"/><feMergeNode in="nearDim"/><feMergeNode in="SourceGraphic"/></feMerge>'+
        '</filter></defs>'+
        '<circle class="ring-arc" cx="200" cy="200" r="130" transform="rotate(-98 200 200)" stroke-dasharray="'+arc+' '+total+'" data-arc="'+arc+'"/>'+
        '</svg>';
      return '<section class="screen screen-home">'+header()+
        '<div class="home-body"><div class="home-date">'+safeText(fmtDate)+'</div>'+
        '<div class="home-center"><div class="quiet-landscape" aria-hidden="true"></div>'+
        '<div class="ring-stage" aria-label="'+m.yes+' bewusst gewonnene Tage">'+ringSvg+
          '<div class="metric-number">'+m.yes+'</div></div>'+
        '<div class="ring-copy"><div class="metric-label">bewusst gewonnene Tage</div><div class="metric-note">Jeder einzelne zählt.</div></div></div>'+
        '<div class="home-actions"><div class="habit-compact"><div class="habit-glyph" aria-hidden="true"><svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 22V11M13 17C6 18 3 13 4 6c6-1 10 3 9 11ZM13 15c0-7 4-10 10-10 1 7-3 11-10 10Z"/></svg></div>'+
        '<div class="habit-info"><div class="habit-eyebrow">Dein aktueller Fokus'+(data.isDemo?' · Demo':'')+'</div><h1>'+safeText(data.habit)+'</h1>'+(data.goal?'<div class="habit-goal">'+safeText(data.goal)+'</div>':'')+'</div></div>'+
        '<section class="check-container"><div class="today-label"><span>Dein täglicher Moment</span><strong>'+(done?(todayVal==='yes'?'HEUTE ERREICHT':'HEUTE EINGETRAGEN'):'NOCH OFFEN')+'</strong></div>'+
        '<button class="primary-button" data-check="today"><span>'+(done?'Check-in bearbeiten':'Check-in für heute')+'</span>'+(done?icons.check:icons.arrow)+'</button></section></div></div>'+bottom(tab)+'</section>';
    }
    export function history(data,metrics,tab){const m=metrics(),days=[],start=shifted(-29);for(let i=0;i<30;i++){const d=new Date(start);d.setDate(start.getDate()+i);days.push(d)}const leading=(start.getDay()+6)%7;let cal=weekdayShort.map(x=>`<div class="cal-day">${x}</div>`).join('');for(let i=0;i<leading;i++)cal+='<div></div>';
      cal+=days.map(d=>{const k=dateKey(d),s=data.checkins[k]||'',css=s==='yes'?'success':s==='no'?'miss':'',label=s==='yes'?'Ziel erreicht':s==='no'?'Ziel nicht erreicht':'Nicht erfasst';return `<button class="date-item ${css} ${k===dateKey(new Date())?'today':''}" data-day="${k}" title="${safeText(d.toLocaleDateString('de-DE'))} – ${label}" aria-label="${safeText(d.toLocaleDateString('de-DE'))}: ${label}">${d.getDate()}</button>`}).join('');
      return `<section class="screen">${header()}<h1 class="page-heading">Dein Weg.</h1><p class="page-intro">Nicht jeder Tag muss perfekt sein, damit du vorankommst. Tippe auf einen Tag, um ihn einzutragen oder zu ändern.</p><div class="panel"><div class="history-overview"><strong>${m.lastSuccess}</strong><span>erfolgreiche Tage<br>in den letzten 30 Tagen</span></div><div class="divider"></div><div class="calendar-grid">${cal}</div><div class="legend"><span><i class="yes"></i> Erreicht</span><span><i class="no"></i> Nicht erreicht</span><span><i></i> Ohne Eintrag</span></div></div><p class="history-note">Ein Tag ohne Check-in bleibt offen. Er wird nicht automatisch als Rückschritt gezählt.</p><div style="flex:1"></div>${bottom(tab)}</section>`}
    export function more(tab){return `<section class="screen">${header()}<h1 class="page-heading">Dein Raum.</h1><p class="page-intro">So viel wie nötig. So wenig wie möglich. Du bestimmst, wie du less. nutzt.</p><button class="settings-action" data-action="new"><span>Eigene Gewohnheit festlegen<small>Ein neues Ziel statt der Demo beginnen.</small></span>${icons.arrow}</button><button class="settings-action" data-action="demo"><span>Demo zurücksetzen<small>28 Beispieltage und die Startansicht laden.</small></span>${icons.arrow}</button><button class="settings-action" data-action="export"><span>Einträge exportieren<small>Deine Daten als JSON-Datei sichern.</small></span>${icons.arrow}</button><button class="settings-action" data-action="erase"><span>Einträge löschen<small>Alle lokalen Einträge entfernen.</small></span>${icons.arrow}</button><div class="notice" style="margin-top:18px">Deine Einträge bleiben in diesem Browser gespeichert. Es gibt keinen Account und keine Datenübertragung an einen Server. Benachrichtigungen sind für eine spätere Version vorgesehen.</div><div style="flex:1"></div>${bottom(tab)}</section>`}

export function setupHtml(){return `<section class="screen onboarding">${logo()}<div class="eyebrow">Ein Anfang genügt</div><h1>Was möchtest du loslassen?</h1><p>Eine Gewohnheit. Ein klarer Fokus. Du musst nicht alles auf einmal verändern.</p><form id="habit-form"><label for="habit-name" class="field">DEIN FOKUS</label><input id="habit-name" class="field-input" maxlength="48" required placeholder="z. B. Nicht mehr rauchen" autocomplete="off"><label class="field">DEIN WEG</label><div class="mode-group"><button type="button" class="mode-option selected" data-mode="abstain">Ganz verzichten</button><button type="button" class="mode-option" data-mode="reduce">Bewusst reduzieren</button></div><label for="habit-goal" class="field">DEIN ZIEL (OPTIONAL)</label><input id="habit-goal" class="field-input" maxlength="100" placeholder="z. B. Jeden Tag ohne Zigarette" autocomplete="off"><p class="helper">Einmal täglich hältst du fest, ob du dein Ziel erreicht hast. Keine Stimmungstests, kein Urteil.</p><button type="submit" class="primary-button"><span>Meinen Weg beginnen</span>${icons.arrow}</button></form><button class="back-link" data-action="back">Zurück zur Ansicht</button></section>`}
