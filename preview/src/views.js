import {icons, safeText, dateKey, shifted, weekdayShort} from './config.js';
import {ringArcLength} from './ring.js?v=20261116-pearl21';

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
      // Separate image surfaces keep the bloom independent of per-frame SVG arc updates.
      const glowSource='data:image/svg+xml,'+encodeURIComponent(ringSvg.replace(
        'class="ring-arc"',
        'stroke="url(#ringGradient)" stroke-width="14.5" stroke-linecap="round" filter="url(#trueBloom)"'
      ).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
      const emissionSource='data:image/svg+xml,'+encodeURIComponent(ringSvg.replace(
        'class="ring-arc"',
        'stroke="#fff0f6" stroke-width="5" stroke-linecap="round" filter="url(#trueBloom)"'
      ).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
      const ringLights='<img class="ring-light ring-aura" src="'+glowSource+'" alt="" aria-hidden="true">'+
        '<img class="ring-light ring-emission" src="'+emissionSource+'" alt="" aria-hidden="true">';
      return '<section class="screen screen-home">'+header()+
        '<div class="home-body"><div class="home-date">'+safeText(fmtDate)+'</div>'+
        '<div class="home-center"><div class="quiet-landscape" aria-hidden="true"></div>'+
        '<div class="ring-stage" aria-label="'+m.yes+' bewusst gewonnene Tage">'+ringSvg+ringLights+
          '<div class="metric-number">'+m.yes+'</div></div>'+
        '<div class="ring-copy"><div class="metric-label">bewusst gewonnene Tage</div><div class="metric-note">Insgesamt. Keine Serie nötig.</div></div></div>'+
        '<div class="home-actions"><div class="habit-compact"><div class="habit-glyph" aria-hidden="true"><svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 22V11M13 17C6 18 3 13 4 6c6-1 10 3 9 11ZM13 15c0-7 4-10 10-10 1 7-3 11-10 10Z"/></svg></div>'+
        '<div class="habit-info"><div class="habit-eyebrow">Dein aktueller Fokus'+(data.isDemo?' · Demo':'')+'</div><h1>'+safeText(data.habit)+'</h1>'+(data.goal?'<div class="habit-goal">'+safeText(data.goal)+'</div>':'')+'</div></div>'+
        '<section class="check-container"><div class="today-label"><span>Dein täglicher Moment</span><strong>'+(done?(todayVal==='yes'?'HEUTE ERREICHT':'HEUTE EINGETRAGEN'):'NOCH OFFEN')+'</strong></div>'+
        '<div class="quick-check-actions"><button type="button" class="primary-button quick-check-yes '+(todayVal==='yes'?'is-selected':'')+'" data-quick-check="yes" aria-pressed="'+(todayVal==='yes')+'"><span>Heute geschafft</span>'+icons.check+'</button>'+
        '<button type="button" class="quick-check-no '+(todayVal==='no'?'is-selected':'')+'" data-quick-check="no" aria-pressed="'+(todayVal==='no')+'"><span>Heute war es schwer</span></button></div>'+
        '<p class="check-note">Ein Tag ohne Eintrag bleibt offen.</p></section></div></div>'+bottom(tab)+'</section>';
    }
    export function history(data,metrics,tab){const m=metrics(),days=[],start=shifted(-29);for(let i=0;i<30;i++){const d=new Date(start);d.setDate(start.getDate()+i);days.push(d)}const leading=(start.getDay()+6)%7;let cal=weekdayShort.map(x=>`<div class="cal-day">${x}</div>`).join('');for(let i=0;i<leading;i++)cal+='<div></div>';
      cal+=days.map(d=>{const k=dateKey(d),s=data.checkins[k]||'',css=s==='yes'?'success':s==='no'?'miss':'',label=s==='yes'?'Ziel erreicht':s==='no'?'Ziel nicht erreicht':'Nicht erfasst';return `<button class="date-item ${css} ${k===dateKey(new Date())?'today':''}" data-day="${k}" title="${safeText(d.toLocaleDateString('de-DE'))} – ${label}" aria-label="${safeText(d.toLocaleDateString('de-DE'))}: ${label}">${d.getDate()}</button>`}).join('');
      return `<section class="screen">${header()}<h1 class="page-heading">Dein Weg.</h1><p class="page-intro">Nicht jeder Tag muss perfekt sein, damit du vorankommst. Tippe auf einen Tag, um ihn einzutragen oder zu ändern.</p><div class="panel"><div class="history-overview"><strong>${m.lastSuccess}</strong><span>erfolgreiche Tage<br>in den letzten 30 Tagen</span></div><div class="divider"></div><div class="calendar-grid">${cal}</div><div class="legend"><span><i class="yes"></i> Erreicht</span><span><i class="no"></i> Nicht erreicht</span><span><i></i> Ohne Eintrag</span></div></div><p class="history-note">Ein Tag ohne Check-in bleibt offen. Er wird nicht automatisch als Rückschritt gezählt.</p><div style="flex:1"></div>${bottom(tab)}</section>`}
export function more(tab,isDemo=false,hasPersonal=false){
  const action=(key,title,note)=>`<button class="settings-action" data-action="${key}"><span>${title}<small>${note}</small></span>${icons.arrow}</button>`;
  return `<section class="screen">${header()}<h1 class="page-heading">Dein Raum.</h1><p class="page-intro">So viel wie nötig. So wenig wie möglich. Du bestimmst, wie du less. nutzt.</p>${isDemo
    ?action(hasPersonal?'leave-demo':'begin',hasPersonal?'Zurück zu meinem Weg':'Meinen Weg beginnen',hasPersonal?'Deine persönlichen Einträge sind unverändert.':'Dein persönlicher Start beginnt ohne Beispieltage.')+action('demo','Demo neu ansehen','Nur die Demo wird neu geladen.')
    :action('new','Neues Ziel beginnen','Beginne bewusst neu. Bisherige Einträge werden nach Rückfrage ersetzt.')+action('demo','Demo ansehen','Unverbindlich erkunden. Deine Einträge bleiben erhalten.')+action('export','Einträge exportieren','Deine Daten als JSON-Datei sichern.')+action('erase','Einträge löschen','Alle lokalen Einträge entfernen.')}
    <div class="notice" style="margin-top:18px">${isDemo?'Du erkundest die Demo. Änderungen werden nicht dauerhaft gespeichert.':'Deine Einträge bleiben in diesem Browser gespeichert. Es gibt keinen Account und keine Datenübertragung an einen Server.'}</div><div style="flex:1"></div>${bottom(tab)}</section>`;
}

export function demoBanner(hasPersonal){return `<aside class="demo-banner" aria-label="Demo"><span>Demo · nur zum Ansehen</span><button type="button" data-action="${hasPersonal?'leave-demo':'begin'}">${hasPersonal?'Zurück zu meinem Weg':'Meinen Weg beginnen'}</button>${hasPersonal?'':'<button type="button" class="demo-exit" data-action="leave-demo" aria-label="Demo verlassen">×</button>'}</aside>`;}

export function welcomeHtml(){return `<section class="screen welcome-screen" aria-labelledby="welcome-heading">
  <div class="entry-brand">${logo()}<span>Ein Anfang genügt</span></div>
  <div class="welcome-content">
    <svg class="welcome-ring" viewBox="0 0 200 200" fill="none" aria-hidden="true"><defs><linearGradient id="welcome-pearl" x1="40" y1="25" x2="170" y2="170" gradientUnits="userSpaceOnUse"><stop stop-color="#f6dcd5"/><stop offset=".5" stop-color="#c6a4fa"/><stop offset="1" stop-color="#ecccf1"/></linearGradient></defs><circle cx="100" cy="100" r="64" stroke="url(#welcome-pearl)" stroke-width="2" stroke-linecap="round" stroke-dasharray="302 101" transform="rotate(-95 100 100)"/></svg>
    <h1 id="welcome-heading" tabindex="-1">Du musst nicht alles auf einmal verändern.</h1>
    <p class="welcome-lead">Manchmal beginnt Veränderung damit, einer Sache weniger Raum zu geben.</p>
    <p class="welcome-reassurance">In deinem Tempo. Ohne Druck.<br>Ein Tag nach dem anderen.</p>
  </div>
  <div class="entry-actions"><button type="button" class="primary-button" data-action="begin">Meinen Weg beginnen</button><button type="button" class="entry-secondary" data-action="demo">Erst einmal ansehen</button></div>
</section>`;}

export function setupHtml(returnTo='welcome'){return `<section class="screen onboarding" aria-labelledby="setup-heading">
  <div class="entry-brand">${logo()}<span>Dein erster Schritt</span></div>
  <h1 id="setup-heading" tabindex="-1">Was möchtest du verändern?</h1>
  <form id="habit-form">
    <label for="habit-name" class="field">Mein Fokus</label><input id="habit-name" name="habit" class="field-input" maxlength="48" required placeholder="z. B. Weniger am Handy sein" autocomplete="off" enterkeyhint="next">
    <fieldset class="mode-field"><legend class="field">Mein Weg</legend><div class="mode-group">
      <label class="mode-choice"><input type="radio" name="mode" value="reduce" checked><span>Bewusst reduzieren</span></label>
      <label class="mode-choice"><input type="radio" name="mode" value="abstain"><span>Ganz verzichten</span></label>
    </div></fieldset>
    <label for="habit-goal" class="field">Mein persönliches Ziel <span>(optional)</span></label><input id="habit-goal" name="goal" class="field-input" maxlength="100" placeholder="z. B. Abends eine Stunde ohne Handy" autocomplete="off" enterkeyhint="done" aria-describedby="goal-explanation">
    <p id="goal-explanation" class="helper">Du entscheidest täglich selbst, ob du dein Ziel erreicht hast. less. misst nichts automatisch.</p>
    <button type="submit" class="primary-button">Meinen Weg starten</button>
  </form>
  <button type="button" class="entry-secondary" data-action="back">${returnTo==='welcome'?'Zurück':'Zurück zur Ansicht'}</button>
</section>`;}
