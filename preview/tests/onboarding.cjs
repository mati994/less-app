const assert=require('node:assert/strict');
const {boot,fixture,original,KEY,LIVE}=require('./storage.cjs');
let scenarios=0;
function count(app,n){assert.match(app.root.innerHTML,new RegExp('class="metric-number">'+n+'<'));}
(async()=>{
  // Empty installs never materialize demo history, even through interrupted setup.
  for(const start of ['begin','demo']){
    const store=new Map([[LIVE,'live fixture']]),app=await boot(store);
    assert.match(app.root.innerHTML,/Du musst nicht alles auf einmal verändern/);
    assert.equal(store.has(KEY),false);app.click({action:start});
    if(start==='demo'){
      count(app,28);app.click({quickCheck:'yes'});count(app,29);
      app.click({quickCheck:'no'});count(app,28);
      app.click({day:'2020-01-01'});app.click({result:'yes'});app.click({action:'close'});
      assert.equal(store.has(KEY),false);
      app.click({action:'leave-demo'});assert.match(app.root.innerHTML,/welcome-heading/);
      app.click({action:'demo'});app.click({action:'begin'});
    }
    assert.match(app.root.innerHTML,/Was möchtest du verändern/);
    assert.equal(store.has(KEY),false);
    const interrupted=await boot(store);assert.match(interrupted.root.innerHTML,/welcome-heading/);
    app.click({action:'back'});assert.equal(store.has(KEY),false);
    app.click({action:'begin'});app.state.failWrite=true;app.submit();
    assert.match(app.root.innerHTML,/habit-form/);assert.equal(store.has(KEY),false);
    assert.match(app.messages.at(-1),/nicht gespeichert/);
    app.state.failWrite=false;app.submit();count(app,0);
    const saved=JSON.parse(store.get(KEY));assert.deepEqual(saved.checkins,{});assert.equal(saved.isDemo,false);
    assert.equal(store.get(LIVE),'live fixture');
    const reopened=await boot(store);count(reopened,0);assert.doesNotMatch(reopened.root.innerHTML,/welcome-heading/);
    reopened.click({quickCheck:'yes'});count(reopened,1);
    assert.equal(Object.keys(JSON.parse(store.get(KEY)).checkins).length,1);scenarios++;
  }
  // Optional fields absent, empty history, and old mixed histories must be preserved.
  for(const value of [fixture,{habit:'Legacy',checkins:{}},{...fixture,isDemo:false,checkins:{...fixture.checkins,'2020-01-03':'yes'}}]){
    const raw=JSON.stringify(value,null,2),store=new Map([[KEY,raw]]),app=await boot(store);
    assert.doesNotMatch(app.root.innerHTML,/welcome-heading/);assert.equal(store.get(KEY),raw);
    app.click({action:'demo'});app.click({quickCheck:'yes'});
    app.click({day:'2020-01-01'});app.click({result:'clear'});app.click({action:'close'});
    app.click({action:'demo'});assert.equal(store.get(KEY),raw);
    app.click({action:'leave-demo'});assert.match(app.root.innerHTML,new RegExp(value.habit));assert.equal(store.get(KEY),raw);
    app.click({action:'demo'});app.click({action:'begin'});assert.doesNotMatch(app.root.innerHTML,/habit-form/);assert.equal(store.get(KEY),raw);
    const reload=await boot(store);assert.match(reload.root.innerHTML,new RegExp(value.habit));scenarios++;
  }
  // A legacy explicit demo is retained byte-for-byte until an explicit personal start.
  const legacy=JSON.stringify({...fixture,isDemo:true}),store=new Map([[KEY,legacy]]),oldDemo=await boot(store);
  assert.match(oldDemo.root.innerHTML,/welcome-heading/);
  oldDemo.click({action:'demo'});oldDemo.click({quickCheck:'yes'});assert.equal(store.get(KEY),legacy);
  oldDemo.click({action:'begin'});oldDemo.state.confirm=false;oldDemo.submit();assert.equal(store.get(KEY),legacy);
  oldDemo.state.confirm=true;oldDemo.state.failWrite=true;oldDemo.submit();assert.equal(store.get(KEY),legacy);
  oldDemo.state.failWrite=false;oldDemo.submit();assert.deepEqual(JSON.parse(store.get(KEY)).checkins,{});count(oldDemo,0);scenarios++;
  // Demo can be explored even when writes fail, without any personal write attempt.
  const app=await boot();app.state.failWrite=true;app.click({action:'demo'});app.click({quickCheck:'yes'});
  assert.equal(app.store.get(KEY),original);assert.equal(app.messages.at(-1),'In der Demo ausprobiert.');
  app.click({action:'leave-demo'});app.click({quickCheck:'yes'});assert.equal(app.store.get(KEY),original);assert.match(app.messages.at(-1),/nicht gespeichert/);scenarios++;
  // Another tab can establish a personal goal while this tab explores the demo.
  const shared=new Map(),first=await boot(shared),second=await boot(shared);
  first.click({action:'demo'});second.click({action:'begin'});second.submit();const newest=shared.get(KEY);
  first.click({action:'begin'});first.submit();assert.equal(shared.get(KEY),newest);assert.equal(first.storage.storageIssue(),'conflict');scenarios++;
  // Startup corruption/read protection must not be bypassed by entering demo or setup.
  for(const raw of ['{bad','null',JSON.stringify({habit:'Broken',checkins:[]})]){
    const broken=await boot(new Map([[KEY,raw]]));broken.click({action:'demo'});
    assert.equal(broken.store.get(KEY),raw);assert.doesNotMatch(broken.root.innerHTML,/Weniger Scrollen/);
    broken.click({action:'new'});broken.submit();assert.equal(broken.store.get(KEY),raw);assert.equal(broken.storage.storageIssue(),'invalid');scenarios++;
  }
  for(const mode of ['reduce','abstain']){
    const app=await boot(new Map());app.click({action:'begin'});app.state.mode=mode;app.submit();assert.equal(JSON.parse(app.store.get(KEY)).mode,mode);scenarios++;
  }
  console.log(`PASS: ${scenarios} onboarding journeys — first start, interruption, demo isolation, existing/legacy data, save failures, restart, modes and stale-tab protection.`);
})().catch(e=>{console.error(e.message);process.exitCode=1});
