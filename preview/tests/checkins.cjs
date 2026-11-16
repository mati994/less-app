const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');

(async () => {
  const store = new Map([['less.prototype.v1', 'live fixture']]);
  const previewKey = 'less.preview.v1';
  const fixture = { habit: 'Fixture', goal: '', mode: 'reduce', checkins: {'2020-01-01':'yes','2020-01-02':'no'} };
  const initial = JSON.stringify(fixture, null, 2);
  store.set(previewKey, initial);
  const handlers = {};
  const eventHandlers = new Map();
  const addEventListener=(name,fn)=>eventHandlers.set(name,fn);
  const removeEventListener=(name,fn)=>{if(eventHandlers.get(name)===fn)eventHandlers.delete(name)};
  const rect = {left:0, top:0, width:390, height:844};
  let frame, reduced = false, blockWrite = false, effect, activeStage, modal;
  const createStage = () => {
    const number = {textContent:''};
    const values = {};
    const ring = {setAttribute:(key,value)=>values[key]=value, getAttribute:key=>values[key]};
    return {isConnected:true, ring, number, getBoundingClientRect:()=>({left:65,top:145,width:260,height:260}),
      querySelector:sel=>sel.startsWith('.ring-arc') ? ring : number};
  };
  const root = {
    isConnected:true,
    set innerHTML(markup){
      activeStage && (activeStage.isConnected=false);
      activeStage = markup.includes('ring-stage') ? createStage() : null;
      if(activeStage){
        activeStage.number.textContent=markup.match(/class="metric-number">(\d+)</)[1];
        activeStage.ring.setAttribute('data-arc',markup.match(/data-arc="([^"]+)/)[1]);
      }
      effect?.remove();
    },
    querySelector(sel){
      if(sel==='.pearl-light')return effect;
      if(sel==='.ring-stage')return activeStage;
      if(sel==='.orbit .ring-arc')return activeStage?.ring;
      return {classList:{add(){}},querySelector(){return null}};
    },
    getBoundingClientRect:()=>rect,
    append(el){effect=el}
  };
  const date=new Date();
  const today=[date.getFullYear(),date.getMonth()+1,date.getDate()].map(n=>String(n).padStart(2,'0')).join('-');
  const context=vm.createContext({
    document:{hidden:false, removeEventListener,
      getElementById:id=>id==='app'?root:id==='modal-root'?{set innerHTML(value){modal=value}}:null,
      querySelector:()=>null,body:{append(){}},
      addEventListener:(name,fn)=>{handlers[name]=fn;addEventListener(name,fn)},
      createElement:()=>({addEventListener:(name,fn)=>{if(name==='animationend')handlers.effectEnd=()=>fn({animationName:'pearlEdgeFade'})},style:{setProperty(){}},setAttribute(){},
        lastElementChild:{addEventListener:(name,fn)=>{if(name==='animationend')handlers.effectEnd=fn}},
        remove(){if(effect===this)effect=undefined}})
    },
    window:{addEventListener,removeEventListener,matchMedia:()=>({matches:reduced,addEventListener,removeEventListener})},
    localStorage:{getItem:k=>store.get(k),setItem(k,v){if(blockWrite)throw Error('Full');store.set(k,v)}},
    requestAnimationFrame:fn=>frame=fn, performance:{now:()=>0},
    setTimeout(){}, clearTimeout(){}, console
  });
  const modules=new Map();
  const read=file=>{
    if(!modules.has(file))modules.set(file,new vm.SourceTextModule(fs.readFileSync(file,'utf8'),{context,identifier:file}));
    return modules.get(file);
  };
  const app=read(path.resolve(__dirname, '../src/app.js'));
  await app.link((specifier,parent)=>read(path.resolve(path.dirname(parent.identifier),specifier.split('?')[0])));
  await app.evaluate();
  const click=dataset=>handlers.click({target:{closest:()=>({dataset})}});
  const data=()=>JSON.parse(store.get(previewKey));
  assert.equal(store.get(previewKey),initial);
  click({quickCheck:'yes'});
  assert.equal(data().checkins[today],'yes');
  assert.ok(effect);
  frame(760);
  assert.equal(activeStage.number.textContent,'2');
  const first=effect;
  const finishFirst=handlers.effectEnd;
  click({quickCheck:'yes'});
  assert.notEqual(effect,first);
  const second=effect;
  finishFirst();
  assert.equal(effect,second);
  assert.equal(activeStage.number.textContent,'2');
  handlers.effectEnd();
  assert.equal(effect,undefined);
  click({quickCheck:'no'});
  assert.equal(effect,undefined);
  assert.equal(data().checkins[today],'no');
  blockWrite=true;
  click({quickCheck:'yes'});
  assert.equal(data().checkins[today],'no');
  assert.equal(effect,undefined);
  blockWrite=false;
  click({quickCheck:'yes'});
  assert.ok(effect);
  eventHandlers.get('resize')();
  assert.equal(effect,undefined);
  click({quickCheck:'no'});
  click({tab:'history'});
  click({day:today});
  click({result:'yes'});
  assert.match(modal,/Du hast Raum geschaffen/);
  assert.equal(effect,undefined);
  handlers.keydown({key:'Escape'});
  assert.ok(effect);
  click({tab:'home'});
  reduced=true;
  click({quickCheck:'no'});
  assert.equal(activeStage.number.textContent,'1');
  click({quickCheck:'yes'});
  assert.equal(activeStage.number.textContent,'2');
  assert.equal(effect,undefined);
  assert.equal(eventHandlers.has('change'),false);
  assert.equal(eventHandlers.has('visibilitychange'),false);
  assert.equal(eventHandlers.has('pagehide'),false);
  assert.equal(eventHandlers.has('resize'),false);
  assert.equal(store.get('less.prototype.v1'),'live fixture');
  assert.deepEqual(data().checkins,{...fixture.checkins,[today]:'yes'});
  console.log('PASS: legacy test data, check-in counting, duplicate, negative, failure, calendar, effect cleanup, reduced motion, live-key isolation.');
})().catch(error=>{console.error(error);process.exitCode=1});
