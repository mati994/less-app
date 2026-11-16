import {KEY, dateKey, shifted} from './config.js';

export function demoData(){const checkins={};for(let i=1;i<=30;i++)checkins[dateKey(shifted(-i))]=i===8||i===19?'no':'yes';return {isDemo:true,habit:'Weniger Scrollen.',mode:'reduce',goal:'Maximal 45 Minuten Social Media am Tag',created:dateKey(shifted(-30)),checkins}}
// Keep the exact read snapshot: no migration, normalization or startup writes.
let baseline;
let blocked = null;
let issue = null;
const emptyData = () => ({habit:'Daten derzeit nicht verfügbar',checkins:{}});
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
function validDate(value){
  if(typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const date = new Date(value+'T12:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
}
export function validData(value){
  if(!record(value) || typeof value.habit !== 'string' || !record(value.checkins))return false;
  // Optional fields may be absent in older records. Unknown fields are preserved.
  if('goal' in value && typeof value.goal !== 'string')return false;
  if('mode' in value && !['abstain','reduce'].includes(value.mode))return false;
  if('isDemo' in value && typeof value.isDemo !== 'boolean')return false;
  if('created' in value && !validDate(value.created))return false;
  return Object.entries(value.checkins).every(([day,status])=>validDate(day) && (status==='yes'||status==='no'));
}
export function storageIssue(){return issue;}
export function load(){
  baseline=undefined;blocked=null;issue=null;
  try {
    baseline=localStorage.getItem(KEY) ?? null;
    if(baseline===null)return demoData();
    const value=JSON.parse(baseline);
    if(validData(value))return value;
    blocked=issue='invalid';
  } catch {
    blocked=issue=baseline===undefined?'read':'invalid';
  }
  return emptyData();
}
export function persist(candidate){
  if(blocked){issue=blocked;return false;}
  if(baseline===undefined){issue='read';return false;}
  if(!validData(candidate)){issue='candidate';return false;}
  let current,serialized;
  try {current=localStorage.getItem(KEY) ?? null;}
  catch {issue='read';return false;}
  // Optimistic stale-tab detection, not atomic compare-and-swap. Two writers
  // can still race between this read and setItem; no automatic merge or retry.
  if(current!==baseline){blocked=issue='conflict';return false;}
  try {
    serialized=JSON.stringify(candidate);
    localStorage.setItem(KEY,serialized);
  } catch {issue='write';return false;}
  baseline=serialized;
  issue=null;
  return true;
}

export function calculateMetrics(data){let yes=0,recorded=0,lastSuccess=0,lastRecorded=0,streak=0;Object.entries(data.checkins).forEach(([d,val])=>{if(d<=dateKey(new Date())&&val==='yes')yes++;if(d<=dateKey(new Date())&&(val==='yes'||val==='no'))recorded++});for(let i=0;i<30;i++){const v=data.checkins[dateKey(shifted(-i))];if(v==='yes'){lastSuccess++;lastRecorded++}else if(v==='no')lastRecorded++}let start=data.checkins[dateKey(shifted(0))]==='yes'?0:1;for(let i=start;i<12000;i++){if(data.checkins[dateKey(shifted(-i))]==='yes')streak++;else break}return {yes,recorded,lastSuccess,lastRecorded,streak,pct:lastRecorded?Math.round(lastSuccess/lastRecorded*100):null}}
