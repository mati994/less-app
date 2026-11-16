const assert=require('node:assert/strict');
const {boot,fixture,original,KEY,LIVE}=require('./storage.cjs');
let scenarios=0;
const stages={
  welcome:()=>{},
  form:app=>app.click({action:'begin'}),
  demo:app=>app.click({action:'demo'}),
  'demo-form':app=>{app.click({action:'demo'});app.click({action:'begin'});},
  completed:app=>{app.click({action:'begin'});app.submit();},
  edited:app=>{app.click({action:'begin'});app.submit();app.click({quickCheck:'yes'});app.click({quickCheck:'no'});},
  modal:app=>{app.click({action:'demo'});app.click({day:'2020-01-01'});app.click({result:'yes'});}
};
(async()=>{
  for(const raw of [original,null,JSON.stringify({...fixture,isDemo:true}),'invalid']){
    for(const fault of [null,'failWrite','failRead']){
      for(const [name,reach] of Object.entries(stages)){
        const store=new Map([[LIVE,'live fixture']]);if(raw!==null)store.set(KEY,raw);
        const app=await boot(store);if(fault)app.state[fault]=true;
        for(let iteration=0;iteration<2;iteration++){
          app.click({action:'preview-start'});assert.equal(app.previewBar.hidden,false);
          assert.match(app.root.innerHTML,/welcome-heading/);reach(app);
          assert.equal(store.get(KEY)??null,raw,name);assert.equal(app.state.writeAttempts,0,name);
          // Reload terminates rehearsal, restoring only committed state.
          const reload=await boot(store);assert.equal(reload.previewBar.hidden,true);
          if(raw===null||raw.includes('"isDemo":true'))assert.match(reload.root.innerHTML,/welcome-heading/);
          else if(raw===original)assert.match(reload.root.innerHTML,/Mein Ziel/);
          app.click({action:'preview-end'});assert.equal(app.previewBar.hidden,true);assert.equal(app.modal.innerHTML,'');
          assert.equal(store.get(KEY)??null,raw);assert.equal(store.get(LIVE),'live fixture');
          assert.equal(app.state.writeAttempts,0);assert.equal(app.state.confirmCalls,0);
        }
        scenarios++;
      }
    }
  }
  // Every mutation remains ephemeral, including actions not offered in preview UI.
  const app=await boot();app.click({tab:'more'});assert.match(app.root.innerHTML,/Erststart erneut ansehen/);
  app.click({action:'preview-start'});app.click({action:'begin'});app.submit();
  assert.match(app.root.innerHTML,/class="metric-number">0</);
  app.click({day:'2020-01-01'});app.click({result:'yes'});app.click({action:'close'});
  app.click({day:'2020-01-01'});app.click({result:'clear'});
  app.click({action:'erase'});app.click({action:'new'});app.submit();
  app.click({action:'export'});app.click({action:'demo'});app.click({quickCheck:'yes'});
  app.click({action:'leave-demo'});assert.match(app.root.innerHTML,/Neues Ziel/);
  assert.equal(app.store.get(KEY),original);assert.equal(app.state.writeAttempts,0);
  app.click({action:'preview-end'});assert.match(app.root.innerHTML,/Mein Ziel/);
  app.click({quickCheck:'yes'});assert.equal(app.state.writeAttempts,1);scenarios++;
  // Exiting refreshes a newer commit instead of writing an old personal snapshot back.
  const shared=new Map([[KEY,original]]),first=await boot(shared),second=await boot(shared);
  first.click({action:'preview-start'});first.click({action:'begin'});first.submit();
  second.click({quickCheck:'yes'});const latest=shared.get(KEY);
  first.click({action:'preview-end'});assert.equal(shared.get(KEY),latest);
  assert.equal(first.state.writeAttempts,0);assert.match(first.root.innerHTML,/class="metric-number">2</);
  first.click({quickCheck:'no'});assert.equal(first.storage.storageIssue(),null);scenarios++;
  // A personal commit arriving after rehearsal exit still triggers Sprint-1 conflict protection.
  const third=await boot(shared);third.click({action:'preview-start'});third.click({action:'preview-end'});
  first.click({quickCheck:'yes'});const current=shared.get(KEY);third.click({quickCheck:'no'});
  assert.equal(third.storage.storageIssue(),'conflict');assert.equal(shared.get(KEY),current);scenarios++;
  // Explicit old demo opens welcome repeatedly; it is never silently discarded.
  const legacy=JSON.stringify({...fixture,isDemo:true}),old=await boot(new Map([[KEY,legacy]]));
  assert.match(old.root.innerHTML,/welcome-heading/);old.click({action:'demo'});old.click({action:'leave-demo'});
  assert.match(old.root.innerHTML,/welcome-heading/);assert.equal(old.store.get(KEY),legacy);scenarios++;
  console.log(`PASS: ${scenarios} preview/navigation scenarios — repeated entry/exit at seven stages, reload, no write attempts, malformed/legacy data, storage failures and parallel tabs.`);
})().catch(error=>{console.error(error.message);process.exitCode=1});
