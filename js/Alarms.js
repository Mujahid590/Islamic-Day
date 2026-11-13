// ===== অ্যালার্ট (আযান + নামাজ আদায়) — হোম ও নামাজ পেজে শেয়ারড =====
// i18n.js আগে লোড হতে হবে। সেটিংস সেভ হয় localStorage 'deen_alarms_v2' এ।
(function(){
'use strict';
if(window.DeenAlarms)return;
const PN=['ফজর','যোহর','আসর','মাগরিব','ইশা'];
const IMG=['image/fozor.png','image/zohor.png','image/asor.png','image/magrib.png','image/isa.png'];
const DEF={ফজর:{start:'05:00',end:'06:20'},যোহর:{start:'12:00',end:'15:20'},আসর:{start:'15:20',end:'17:25'},মাগরিব:{start:'17:25',end:'18:45'},ইশা:{start:'18:45',end:'05:00'}};
const KEY='deen_alarms_v2',FIRED='deen_alarms_fired',TKEY='weeklyPrayerTracker';
const pad=n=>String(n).padStart(2,'0');
const keyOf=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const clean=s=>(s||'').split(' ')[0];
const mins=s=>{const m=clean(s).match(/(\d+):(\d+)/);return m?+m[1]*60+ +m[2]:0};
const atMs=(str,off)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+(off||0));return d.getTime()+mins(str)*60000};

/* ---------- সেটিংস ---------- */
function defaults(){return{adhan:{on:true,sound:'beep',items:{}},namaz:{on:true,sound:'bell',items:{}}}}
function load(){
  const d=defaults();let c=null;
  try{c=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  if(!c||typeof c!=='object')return d;
  ['adhan','namaz'].forEach(m=>{const x=c[m]||{};d[m].on=x.on!==false;
    if(['beep','bell','adhan'].indexOf(x.sound)>-1)d[m].sound=x.sound;
    if(x.items&&typeof x.items==='object')PN.forEach(n=>{if(typeof x.items[n]==='number'&&isFinite(x.items[n]))d[m].items[n]=Math.round(x.items[n])})});
  return d;
}
let cfg=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}}

/* ---------- নামাজের সময় (main.js এর ক্যাশ ব্যবহার, না থাকলে Aladhan) ---------- */
function ck(){
  const sc=localStorage.getItem('deen_school')||'1';let co=null;
  try{co=JSON.parse(localStorage.getItem('deen_coords')||'null')}catch(e){}
  const city=localStorage.getItem('userCity')||'Dhaka';
  return{co,sc,city,key:`pt_${co?co.lat.toFixed(2)+'_'+co.lon.toFixed(2):city}_${sc}_${keyOf(new Date())}`};
}
function timesSync(){
  const c=ck(),v=localStorage.getItem(c.key);
  if(v){try{return JSON.parse(v)}catch(e){}}
  const pre=c.co?`pt_${c.co.lat.toFixed(2)}_${c.co.lon.toFixed(2)}`:'pt_'+c.city+'_';
  const last=Object.keys(localStorage).filter(k=>k.indexOf(pre)===0).sort().pop();
  if(last){try{return JSON.parse(localStorage.getItem(last))}catch(e){}}
  return DEF;
}
async function api(path){const ac=new AbortController(),h=setTimeout(()=>ac.abort(),8000);try{const r=await fetch('https://api.aladhan.com/v1/'+path,{signal:ac.signal});const j=await r.json();if(j.code!==200)throw 0;return j.data}finally{clearTimeout(h)}}
async function getTimes(){
  const c=ck(),v=localStorage.getItem(c.key);
  if(v){try{return JSON.parse(v)}catch(e){}}
  try{
    const q=c.co?`latitude=${c.co.lat}&longitude=${c.co.lon}&method=1&school=${c.sc}`:`city=${c.city}&country=Bangladesh&method=1&school=${c.sc}`,ep=c.co?'timings':'timingsByCity';
    const tm=new Date();tm.setDate(tm.getDate()+1);
    const dd=`${pad(tm.getDate())}-${pad(tm.getMonth()+1)}-${tm.getFullYear()}`;
    const [a,b]=await Promise.all([api(`${ep}?${q}`),api(`${ep}/${dd}?${q}`)]);
    const T=a.timings;
    const times={ফজর:{start:clean(T.Fajr),end:clean(T.Sunrise)},যোহর:{start:clean(T.Dhuhr),end:clean(T.Asr)},আসর:{start:clean(T.Asr),end:clean(T.Maghrib)},মাগরিব:{start:clean(T.Maghrib),end:clean(T.Isha)},ইশা:{start:clean(T.Isha),end:clean(b.timings.Fajr)}};
    localStorage.setItem(c.key,JSON.stringify(times));
    return times;
  }catch(e){return timesSync()}
}

/* ---------- নাম / সময় ফরম্যাট (শুক্রবারে যোহর = জুমা) ---------- */
function pname(i,d){d=d||new Date();return(i===1&&d.getDay()===5)?t('jumuah'):L().prayers[i]}
function pimg(i,d){d=d||new Date();return(i===1&&d.getDay()===5)?'image/jumuah.svg':IMG[i]}
function fmtMin(m){m=((Math.round(m)%1440)+1440)%1440;const h=Math.floor(m/60),mm=m%60;return `${num(h%12||12)}:${num(pad(mm))} ${h>=12?L().pm:L().am}`}

/* ---------- শব্দ ---------- */
function tone(freq,start,dur,vol,ctx){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;o.connect(g);g.connect(ctx.destination);
  g.gain.setValueAtTime(0.0001,ctx.currentTime+start);g.gain.exponentialRampToValueAtTime(vol,ctx.currentTime+start+0.02);g.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+start+dur);o.start(ctx.currentTime+start);o.stop(ctx.currentTime+start+dur+0.05)}
function synth(kind){
  try{const ctx=new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==='suspended')ctx.resume();
    if(kind==='bell'){tone(880,0,1.4,.25,ctx);tone(1320,0.05,1.2,.12,ctx);tone(880,1.5,1.4,.22,ctx)}
    else{[0,0.5,1.0].forEach(s=>tone(660,s,0.35,.3,ctx))}
    setTimeout(()=>{try{ctx.close()}catch(e){}},3500)}catch(e){}
}
function playSound(kind){
  if(kind==='adhan'){try{const a=new Audio('audio/adhan.mp3');a.play().catch(()=>synth('beep'))}catch(e){synth('beep')}}
  else synth(kind==='bell'?'bell':'beep');
}

/* ---------- নোটিফিকেশন ও ব্যানার ---------- */
function ask(){try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission()}catch(e){}}
function notify(body){
  try{
    if(!('Notification' in window)||Notification.permission!=='granted')return;
    const direct=()=>{try{new Notification('দ্বীন টাইম',{body,icon:'image/Logo.png'})}catch(e){}};
    if(navigator.serviceWorker&&navigator.serviceWorker.ready){
      Promise.race([navigator.serviceWorker.ready.then(r=>r.showNotification('দ্বীন টাইম',{body,icon:'image/Logo.png',vibrate:[200,100,200]})),new Promise((_,rej)=>setTimeout(rej,1500))]).catch(direct);
    }else direct();
  }catch(e){}
}
function injectCss(){
  if(document.getElementById('alCss'))return;
  const st=document.createElement('style');st.id='alCss';
  st.textContent='.al-banner{position:fixed;left:50%;top:calc(12px + env(safe-area-inset-top,0px));transform:translate(-50%,-140%);width:calc(100% - 28px);max-width:440px;z-index:3000;background:var(--bg-solid,#fff);color:var(--text,#16303a);border:1px solid var(--accent,#0d9488);border-radius:18px;padding:14px 16px;box-shadow:0 14px 36px rgba(0,0,0,.28);transition:transform .4s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;gap:10px;-webkit-user-select:none;user-select:none}.al-banner.show{transform:translate(-50%,0)}.al-banner .al-msg{font-weight:700;font-size:.92rem;line-height:1.55}.al-banner .al-btns{display:flex;gap:8px;justify-content:flex-end}.al-banner button{border:none;border-radius:12px;padding:8px 14px;font-weight:700;font-family:inherit;cursor:pointer;background:var(--accent-l,rgba(13,148,136,.13));color:var(--accent,#0d9488)}.al-banner button.pri{background:var(--accent,#0d9488);color:#fff}';
  document.head.appendChild(st);
}
function banner(msg,prayerName){
  injectCss();
  const old=document.getElementById('alBanner');if(old)old.remove();
  const b=document.createElement('div');b.id='alBanner';b.className='al-banner';b.setAttribute('role','alert');
  const m=document.createElement('div');m.className='al-msg';m.textContent=msg;b.appendChild(m);
  const bt=document.createElement('div');bt.className='al-btns';
  const close=()=>{b.classList.remove('show');setTimeout(()=>b.remove(),450)};
  if(prayerName){
    const d=document.createElement('button');d.className='pri';d.textContent=t('markDone');
    d.onclick=()=>{try{const k=keyOf(new Date());const all=JSON.parse(localStorage.getItem(TKEY)||'{}');if(!all[k]){all[k]={};PN.forEach(p=>all[k][p]='pending')}all[k][prayerName]='completed';localStorage.setItem(TKEY,JSON.stringify(all));window.dispatchEvent(new CustomEvent('deen-tracker'))}catch(e){}
      try{if(typeof loadData==='function'){loadData();renderAll();renderInsight()}}catch(e){}close()};
    bt.appendChild(d);
  }
  const ok=document.createElement('button');ok.textContent=t('ok');ok.onclick=close;bt.appendChild(ok);
  b.appendChild(bt);document.body.appendChild(b);
  requestAnimationFrame(()=>requestAnimationFrame(()=>b.classList.add('show')));
  setTimeout(close,20000);
}

/* ---------- শিডিউলার ---------- */
function firedState(){let f=null;try{f=JSON.parse(localStorage.getItem(FIRED))}catch(e){}const k=keyOf(new Date());return(f&&f.d===k&&Array.isArray(f.k))?f:{d:k,k:[]}}
function isDone(n){try{const all=JSON.parse(localStorage.getItem(TKEY)||'{}');return(all[keyOf(new Date())]||{})[n]==='completed'}catch(e){return false}}
function tick(){
  cfg=load(); // অন্য ট্যাব/পেজের পরিবর্তন ধরতে
  const now=Date.now(),T=timesSync(),f=firedState();let changed=false;
  ['adhan','namaz'].forEach(mode=>{
    const c=cfg[mode];if(!c.on)return;
    PN.forEach((n,i)=>{
      const off=c.items[n];if(typeof off!=='number'||!T[n])return;
      const ts=atMs(T[n].start,0)+off*60000,k=mode+'|'+n;
      if(now<ts||now-ts>3*60000||f.k.indexOf(k)>-1)return;
      if(mode==='namaz'&&isDone(n))return;
      f.k.push(k);changed=true;
      const d=new Date(),name=pname(i,d);
      let msg,pn=null;
      if(mode==='adhan')msg=t('alMsgAdhan',{p:name,t:fmtMin(mins(T[n].start))});
      else{msg=t('alMsgNamaz',{p:name,e:fmtMin(mins(T[n].end))});pn=n}
      playSound(c.sound);notify(msg);banner(msg,pn);
    });
  });
  if(changed){try{localStorage.setItem(FIRED,JSON.stringify(f))}catch(e){}}
}
function start(){injectCss();setTimeout(tick,2500);setInterval(tick,15000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();

window.DeenAlarms={PN,IMG,cfg:()=>cfg,reload:()=>{cfg=load();return cfg},save,timesSync,getTimes,pname,pimg,fmtMin,mins,playSound,ask,tick,keyOf};
})();
