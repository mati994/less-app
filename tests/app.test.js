import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dateKey,shifted,safeText,KEY} from '../src/config.js';
import {demoData,calculateMetrics} from '../src/storage.js';
import {ringArcLength} from '../src/ring.js';
import {home,history,more} from '../src/views.js';

test('existing storage key remains unchanged',()=>{assert.equal(KEY,'less.prototype.v1')});
test('HTML escaping covers user-defined habit names',()=>{assert.equal(safeText('<script>&'), '&lt;script&gt;&amp;')});
test('ring opens with successful days',()=>{assert.ok(ringArcLength(60)<ringArcLength(30));assert.ok(ringArcLength(30)<ringArcLength(0))});
test('unrecorded days do not count as failures',()=>{
  const records={habit:'Test',mode:'reduce',goal:'',isDemo:false,checkins:{[dateKey(shifted(-1))]:'yes',[dateKey(shifted(-2))]:'no'}};
  const m=calculateMetrics(records);
  assert.equal(m.yes,1);assert.equal(m.recorded,2);assert.equal(m.pct,50);assert.equal(m.lastRecorded,2);
});
test('demo and main screens keep expected controls',()=>{
  const data=demoData(),metrics=()=>calculateMetrics(data);
  assert.match(home(data,metrics,'home'),/ring-arc/);
  assert.match(home(data,metrics,'home'),/data-check="today"/);
  assert.match(history(data,metrics,'history'),/calendar-grid/);
  assert.match(more('more'),/data-action="export"/);
});
test('local browser entry uses relative module paths',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/\.\/src\/app\.js/);
  assert.match(html,/\.\/styles\/ring\.css/);
});
