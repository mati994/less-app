// Run: node --experimental-vm-modules preview/tests/storage.cjs
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const KEY='less.preview.v1';
const LIVE='less.prototype.v1';
const fixture={habit:'Mein Ziel',goal:'Ein Schritt',mode:'reduce',created:'2020-01-01',isDemo:false,checkins:{'2020-01-01':'yes','2020-01-02':'no'},extra:{keep:true}};
const original=JSON.stringify(fixture,null,2);
let assertions=0;
async function boot(store=new Map([[KEY,original],[LIVE,'untouched']]),options={}){
  const events={},messages=[];
  const state={failRead:false,failWrite:false,confirm:true,writeAttempts:0,confirmCalls:0,...options};
  const notice={hidden:true,textContent:''},previewBar={hidden:true},modal={innerHTML:''};
  const fields={'habit-name':{value:'Neues Ziel'},'habit-goal':{value:'Mein neuer Fokus'}};
  const root={innerHTML:'',querySelector(sel){
    if(sel==='.screen')return {classList:{add(){}},querySelector(){return null}};
    return null;
  }};
  const storage={getItem(key){if(state.failRead)throw Error('read denied');return store.get(key)??null;},setItem(key,val){state.writeAttempts++;if(state.failWrite)throw Error('quota exceeded');store.set(key,val)}};
  const context=vm.createContext({console,localStorage:storage,confirm:()=>{state.confirmCalls++;return state.confirm},
    setTimeout(){},clearTimeout(){},performance:{now:()=>0},requestAnimationFrame(){},
    window:{matchMedia:()=>({matches:false})},
    document:{getElementById:id=>id==='app'?root:id==='modal-root'?modal:id==='storage-notice'?notice:id==='onboarding-preview'?previewBar:fields[id]||null,
      querySelector:sel=>sel==='input[name="mode"]:checked'?{value:state.mode||'reduce'}:null,addEventListener:(name,fn)=>events[name]=fn,
      createElement:()=>({remove(){}}),body:{append:el=>messages.push(el.textContent)}}});
  const modules=new Map();
  function read(file){if(!modules.has(file))modules.set(file,new vm.SourceTextModule(fs.readFileSync(file,'utf8'),{context,identifier:file}));return modules.get(file);}
  const app=read(path.resolve(__dirname,'../src/app.js'));
  await app.link((specifier,parent)=>read(path.resolve(path.dirname(parent.identifier),specifier.split('?')[0])));
  await app.evaluate();
  return {store,state,root,modal,notice,previewBar,messages,
    click:dataset=>events.click({target:{closest:()=>({dataset})}}),
    submit:()=>events.submit({target:{id:'habit-form'},preventDefault(){}}),
    storage:modules.get(path.resolve(__dirname,'../src/storage.js')).namespace};
}
const actions={
  'positive check-in':app=>app.click({quickCheck:'yes'}),
  'negative check-in':app=>app.click({quickCheck:'no'}),
  'historical positive':app=>app.click({result:'yes'}),
  'historical negative':app=>app.click({result:'no'}),
  'historical removal':app=>app.click({result:'clear'}),
  'erase all':app=>app.click({action:'erase'}),
  'new goal':app=>app.submit()
};
async function prepare(name,store,options){
  const app=await boot(store,options);
  if(name.startsWith('historical'))app.click({day:'2020-01-01'});
  if(name==='new goal')app.click({action:'new'});
  return app;
}
module.exports={boot,fixture,original,KEY,LIVE};
if(require.main===module)(async()=>{
  for(const [name,act] of Object.entries(actions)){
    for(const fault of ['failWrite','failRead']){
      const app=await prepare(name);
      const html=app.root.innerHTML,modal=app.modal.innerHTML;
      app.state[fault]=true;act(app);
      assert.equal(app.store.get(KEY),original,name);
      assert.equal(app.root.innerHTML,html,name+' view rollback');
      assert.equal(app.modal.innerHTML,modal,name+' dialog/form retained');
      assert.equal(app.messages.length,1,name+' only failure message');
      assert.match(app.messages[0],/nicht|unerwartet/);
      assert.equal(app.notice.hidden,false);
      assert.equal(app.store.get(LIVE),'untouched');
      app.state[fault]=false;act(app);
      assert.notEqual(app.store.get(KEY),original,name+' retry succeeds');
      assert.equal(app.notice.hidden,true);
      const saved=JSON.parse(app.store.get(KEY));
      if(name==='erase all')assert.deepEqual(saved.checkins,{});
      else if(name==='demo replacement')assert.equal(saved.isDemo,true);
      else if(name==='new goal'){assert.equal(saved.habit,'Neues Ziel');assert.deepEqual(saved.checkins,{});}
      else {assert.deepEqual(saved.extra,{keep:true});assert.equal(saved.checkins['2020-01-02'],'no');}
      const reload=await boot(app.store);
      assert.equal(reload.storage.storageIssue(),null);
      assertions++;
    }
  }
  for(const name of ['erase all','new goal']){
    const app=await prepare(name);app.state.confirm=false;actions[name](app);
    assert.equal(app.store.get(KEY),original);assert.equal(app.messages.length,0);assertions++;
  }
  const invalid=['{','', 'null','[]',JSON.stringify({habit:'X',checkins:null}),JSON.stringify({habit:'X',checkins:[]}),
    ...[{checkins:{'2026-02-30':'yes'}},{checkins:{'bad':'yes'}},{checkins:{'2020-01-01':'maybe'}},{mode:'unknown'},{goal:5},{created:'yesterday'},{isDemo:'false'}].map(patch=>JSON.stringify({...fixture,...patch}))];
  for(const raw of invalid){
    for(const [name,act] of Object.entries(actions)){
      const app=await prepare(name,new Map([[KEY,raw],[LIVE,'untouched']]));
      assert.equal(app.storage.storageIssue(),'invalid');assert.equal(app.notice.hidden,false);
      act(app);assert.equal(app.store.get(KEY),raw);assert.equal(app.store.get(LIVE),'untouched');
      assert.ok(!app.root.innerHTML.includes('Weniger Scrollen.'));
      assert.match(app.messages.at(-1),/unverändert/);assertions++;
    }
  }
  const inaccessible=await boot(undefined,{failRead:true});
  inaccessible.state.failRead=false;inaccessible.click({quickCheck:'yes'});
  assert.equal(inaccessible.store.get(KEY),original);assert.equal(inaccessible.storage.storageIssue(),'read');assertions++;
  // Older records without optional fields remain supported; startup does not rewrite bytes.
  for(const value of [{habit:'Legacy',checkins:{}},{habit:'Legacy',checkins:{'2024-02-29':'yes'},unknown:{nested:[1,2]}}]){
    const raw=JSON.stringify(value,null,4),app=await boot(new Map([[KEY,raw]]));
    assert.equal(app.store.get(KEY),raw);assert.equal(app.storage.storageIssue(),null);
    app.click({quickCheck:'yes'});const after=JSON.parse(app.store.get(KEY));
    for(const [key,v] of Object.entries(value)){if(key!=='checkins')assert.deepEqual(after[key],v);}
    for(const [key,v] of Object.entries(value.checkins))assert.equal(after.checkins[key],v);
    assertions++;
  }
  const fresh=await boot(new Map());assert.equal(fresh.store.has(KEY),false);assert.match(fresh.root.innerHTML,/Du musst nicht alles/);fresh.click({action:'begin'});fresh.submit();assert.ok(fresh.store.has(KEY));assertions++;
  // Two independent app/module instances share the origin's storage.
  for(const [name,act] of Object.entries(actions)){
    const shared=new Map([[KEY,original],[LIVE,'untouched']]);
    const first=await boot(shared),stale=await prepare(name,shared);
    first.click({quickCheck:'yes'});const latest=shared.get(KEY),html=stale.root.innerHTML;
    act(stale);assert.equal(shared.get(KEY),latest);assert.equal(stale.root.innerHTML,html);
    assert.equal(stale.storage.storageIssue(),'conflict');assert.match(stale.messages.at(-1),/neu/);
    act(stale);assert.equal(shared.get(KEY),latest);
    const reloaded=await boot(shared);reloaded.click({quickCheck:'no'});assert.notEqual(shared.get(KEY),latest);assertions++;
  }
  for(const replacement of [null,'broken',JSON.stringify({...fixture,habit:'Other goal'})]){
    const app=await boot();replacement===null?app.store.delete(KEY):app.store.set(KEY,replacement);
    app.click({action:'erase'});assert.equal(app.store.get(KEY)??null,replacement);assert.equal(app.storage.storageIssue(),'conflict');assertions++;
  }
  console.log(`PASS: ${assertions} scenarios — all mutation failures/retries, cancellation, corrupt/read-blocked data, legacy fields, fresh start, two-tab conflicts and reload.`);
})().catch(error=>{console.error(error);process.exitCode=1});
