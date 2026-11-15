import {KEY, dateKey, shifted} from './config.js';

export function demoData(){const checkins={};for(let i=1;i<=30;i++)checkins[dateKey(shifted(-i))]=i===8||i===19?'no':'yes';return {isDemo:true,habit:'Weniger Scrollen.',mode:'reduce',goal:'Maximal 45 Minuten Social Media am Tag',created:dateKey(shifted(-30)),checkins}}
    export function load(){try{const val=JSON.parse(localStorage.getItem(KEY));if(val&&typeof val.habit==='string'&&val.checkins&&typeof val.checkins==='object')return val}catch(e){}return demoData()}

export function persist(data){
  try { localStorage.setItem(KEY,JSON.stringify(data));return true; }
  catch(e){return false;}
}

export function calculateMetrics(data){let yes=0,recorded=0,lastSuccess=0,lastRecorded=0,streak=0;Object.entries(data.checkins).forEach(([d,val])=>{if(d<=dateKey(new Date())&&val==='yes')yes++;if(d<=dateKey(new Date())&&(val==='yes'||val==='no'))recorded++});for(let i=0;i<30;i++){const v=data.checkins[dateKey(shifted(-i))];if(v==='yes'){lastSuccess++;lastRecorded++}else if(v==='no')lastRecorded++}let start=data.checkins[dateKey(shifted(0))]==='yes'?0:1;for(let i=start;i<12000;i++){if(data.checkins[dateKey(shifted(-i))]==='yes')streak++;else break}return {yes,recorded,lastSuccess,lastRecorded,streak,pct:lastRecorded?Math.round(lastSuccess/lastRecorded*100):null}}
