// ===== নামাজের হিসাব + আযান/নামাজ অ্যালার্ট =====
// ডেটা হোম পেজের সাথে একই জায়গায় থাকে: localStorage 'weeklyPrayerTracker' ({তারিখ:{ফজর:'completed'|'missed'|'pending',...}})
(function(){
'use strict';
const HAS_AL=!!window.DeenAlarms;
const A=window.DeenAlarms||(function(){ // alarms.js লোড না হলেও হিসাবের অংশ যেন চলে
  const PN=['ফজর','যোহর','আসর','মাগরিব','ইশা'],IMG=['image/fozor.png','image/zohor.png','image/asor.png','image/magrib.png','image/isa.png'];
  const DEF={ফজর:{start:'05:00',end:'06:20'},যোহর:{start:'12:00',end:'15:20'},আসর:{start:'15:20',end:'17:25'},মাগরিব:{start:'17:25',end:'18:45'},ইশা:{start:'18:45',end:'05:00'}};
  const cfg={adhan:{on:false,sound:'beep',items:{}},namaz:{on:false,sound:'bell',items:{}}};
  const pad=n=>String(n).padStart(2,'0');
  return{PN,IMG,cfg:()=>cfg,save(){},ask(){},playSound(){},timesSync:()=>DEF,getTimes:()=>Promise.resolve(DEF),
    mins:s=>{const m=String(s||'').match(/(\d+):(\d+)/);return m?+m[1]*60+ +m[2]:0},
    pname:(i,d)=>(i===1&&(d||new Date()).getDay()===5)?t('jumuah'):L().prayers[i],
    pimg:(i,d)=>(i===1&&(d||new Date()).getDay()===5)?'image/jumuah.svg':IMG[i],
    fmtMin:m=>{m=((Math.round(m)%1440)+1440)%1440;const h=Math.floor(m/60);return `${num(h%12||12)}:${num(pad(m%60))} ${h>=12?L().pm:L().am}`}};
})();
const $=id=>document.getElementById(id);
const PN=A.PN;
const TKEY='weeklyPrayerTracker',SINCE='deen_since_reset',DATE_RE=/^\d{4}-\d{2}-\d{2}$/;
const pad=n=>String(n).padStart(2,'0');
const keyOf=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data={},jam={},selKey=keyOf(new Date()),times=A.timesSync(),sh=null,viewY=new Date().getFullYear(),viewM=new Date().getMonth();
const JKEY='deen_jamaat'; // জামাতে আদায়: {তারিখ:{ফজর:true}} — হোমের হিসাব (completed) অপরিবর্তিত থাকে

/* ---------- ডেটা ---------- */
function loadData(){
  try{const d=JSON.parse(localStorage.getItem(TKEY));data=(d&&typeof d==='object'&&!Array.isArray(d))?d:{}}catch(e){data={}}
  try{const j=JSON.parse(localStorage.getItem(JKEY));jam=(j&&typeof j==='object'&&!Array.isArray(j))?j:{}}catch(e){jam={}}
}
function saveData(){try{localStorage.setItem(TKEY,JSON.stringify(data));localStorage.setItem(JKEY,JSON.stringify(jam))}catch(e){}}
function dayRec(k){if(!data[k]){data[k]={};PN.forEach(p=>data[k][p]='pending')}return data[k]}
// ৪টি অবস্থা: pending (আদায় হয়নি) / completed (একা আদায়) / jamaat (জামাতে আদায়) / missed (কাযা)
function stateOf(k,p){const s=(data[k]||{})[p]||'pending';return s==='completed'&&(jam[k]||{})[p]?'jamaat':s}
function toast(msg){const e=$('toast');e.textContent=msg;e.classList.add('show');clearTimeout(e._h);e._h=setTimeout(()=>e.classList.remove('show'),2000)}
function dateOf(k){return new Date(k+'T00:00:00')}
function dLabel(d){return `${L().days[d.getDay()]}, ${num(d.getDate())} ${L().months[d.getMonth()]}`}

/* ---------- থিম/রঙ (সেটিংসের deen_theme, deen_color) ---------- */
function applyTheme(){
  const th=localStorage.getItem('deen_theme')||'dark';let co=localStorage.getItem('deen_color')||'teal';
  if(['teal','green','blue','peach'].indexOf(co)<0)co='teal';
  const dark=th==='dark'||(th==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);
  document.body.classList.toggle('dark',dark);document.body.dataset.color=co;
  const m=document.querySelector('meta[name=theme-color]');if(m)m.content=dark?'#0b2428':'#0d9488';
}

/* ---------- ১) নির্বাচিত দিনের হিসাব ---------- */
const STATES=[['pending','○','notDone'],['completed','✓','aloneDone'],['jamaat','✓✓','jamaat'],['missed','✗','qaza']];
function setStatus(k,i,st){
  const p=PN[i],rec=dayRec(k);
  rec[p]=st==='jamaat'?'completed':st;
  if(st==='jamaat'){(jam[k]=jam[k]||{})[p]=true}
  else if(jam[k]){delete jam[k][p];if(!Object.keys(jam[k]).length)delete jam[k]}
  saveData();renderAll();
  toast(t(st==='jamaat'?'toastJamaat':st==='completed'?'toastDone':st==='missed'?'toastMissed':'toastPending',{p:A.pname(i,dateOf(k))}));
}
function renderTracker(){
  const d=dateOf(selKey),isToday=selKey===keyOf(new Date());let done=0;
  $('trkTitle').textContent='🕌 '+(isToday?t('recToday'):dLabel(d));
  $('trkList').innerHTML=PN.map((p,i)=>{const s=stateOf(selKey,p);if(s==='completed'||s==='jamaat')done++;
    const cls=s==='jamaat'?'completed jamaat':s;
    return `<div class="prayer-item" data-i="${i}" role="button" tabindex="0" aria-label="${esc(A.pname(i,d))}"><div class="p-circle ${cls}"><img src="${A.pimg(i,d)}" alt=""></div><div class="p-name">${esc(A.pname(i,d))}</div><div class="p-count">${s==='jamaat'?'✓✓':s==='completed'?'✓':s==='missed'?'✗':'○'}</div></div>`}).join('');
  $('trkBadge').textContent=`${num(done)}/${num(5)}`;
  $('trkBar').style.width=`${done*20}%`;
  $('trkList').querySelectorAll('.prayer-item').forEach(el=>{
    const go=()=>openStatus(+el.dataset.i);
    el.onclick=go;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}};
  });
  $('stLegend').innerHTML=legendHtml();
}
function legendHtml(){
  return [['jamaat','jamaat'],['done','aloneDone'],['missed','qaza'],['pending','notDone']]
    .map(r=>`<span class="legend-item"><span class="legend-dot ${r[0]}"></span> ${esc(t(r[1]))}</span>`).join('');
}
/* অবস্থা বাছাইয়ের শিট */
function openStatus(i){
  const d=dateOf(selKey),cur=stateOf(selKey,PN[i]);
  $('stTitle').textContent=`${A.pname(i,d)} · ${dLabel(d)}`;
  $('stGrid').innerHTML=STATES.map(o=>`<button type="button" class="st-opt st-${o[0]} ${cur===o[0]?'on':''}" data-v="${o[0]}"><span class="st-ic">${o[1]}</span><span class="st-tx">${esc(t(o[2]))}</span></button>`).join('');
  $('stGrid').querySelectorAll('.st-opt').forEach(b=>b.onclick=()=>{closeStatus();setStatus(selKey,i,b.dataset.v)});
  $('stSheet').classList.add('show');
}
function closeStatus(){$('stSheet').classList.remove('show')}

/* ---------- হিরো কার্ড (রঙ সেটিংস অনুযায়ী) ---------- */
function calcStreak(){
  const full=k=>PN.every(p=>{const s=(data[k]||{})[p];return s==='completed'});
  let n=0;const x=new Date();if(!full(keyOf(x)))x.setDate(x.getDate()-1);
  while(full(keyOf(x))&&n<3700){n++;x.setDate(x.getDate()-1)}
  return n;
}
function renderHero(){
  const tk=keyOf(new Date()),today=new Date();
  const done=PN.filter(p=>{const s=stateOf(tk,p);return s==='completed'||s==='jamaat'}).length,pct=done*20,C=2*Math.PI*48;
  $('heroChip').textContent=t('heroLbl');$('heroDate').textContent=dLabel(today);
  $('heroCount').textContent=`${num(done)}/${num(5)}`;
  $('heroSub').textContent=`🔥 ${num(calcStreak())} · ${t('streak')}`;
  $('heroPct').textContent=`${num(pct)}%`;$('heroPctLbl').textContent=t('success');
  const r=$('heroRing');r.style.strokeDasharray=C.toFixed(2);r.style.strokeDashoffset=(C*(1-pct/100)).toFixed(2);
}

/* ---------- ২) মোট ও প্রতি ওয়াক্তের হিসাব ---------- */
function sinceKey(){
  let s=localStorage.getItem(SINCE);const tk=keyOf(new Date());
  if(!s||!DATE_RE.test(s)){const ks=Object.keys(data).filter(k=>DATE_RE.test(k)).sort();s=ks[0]||tk}
  return s>tk?tk:s;
}
function renderStats(){
  const tk=keyOf(new Date()),since=sinceKey(),per=PN.map(()=>({j:0,d:0,m:0,p:0}));
  const it=dateOf(since);let n=0;
  while(keyOf(it)<=tk&&n<3700){const k=keyOf(it);
    PN.forEach((p,i)=>{const s=stateOf(k,p);if(s==='jamaat')per[i].j++;else if(s==='completed')per[i].d++;else if(s==='missed')per[i].m++;else if(k<tk)per[i].p++});
    it.setDate(it.getDate()+1);n++}
  const sum=f=>per.reduce((a,x)=>a+x[f],0),J=sum('j'),D=sum('d')+J,M=sum('m'),P=sum('p'),tot=D+M+P;
  const pct=tot?Math.round(D/tot*100):0,sd=dateOf(since);
  $('sinceBadge').textContent=t('since',{d:`${num(sd.getDate())} ${L().months[sd.getMonth()]}`});
  $('statGrid').innerHTML=[['✅',D,t('done')],['🕌',J,t('jamaat')],['❌',M,t('qaza')],['⭕',P,t('notDone')],['🔥',calcStreak(),t('streak')],['📈',num(pct)+'%',t('success')]]
    .map(r=>`<div class="stat-box"><div class="stat-icon-wrap">${r[0]}</div><div><div class="stat-value">${typeof r[1]==='number'?num(r[1]):r[1]}</div><div class="stat-label">${esc(r[2])}</div></div></div>`).join('');
  $('perList').innerHTML=PN.map((p,i)=>{const x=per[i],tt=x.j+x.d+x.m+x.p||1;
    return `<div class="pp-row"><div class="pp-top"><span class="pp-name"><img src="${A.IMG[i]}" alt="">${esc(L().prayers[i])}</span><span class="pp-nums">🕌 ${num(x.j)} · ✓ ${num(x.d)} · ✗ ${num(x.m)} · ○ ${num(x.p)}</span></div>`+
      `<div class="pp-bar"><i class="j" style="width:${x.j/tt*100}%"></i><i class="d" style="width:${x.d/tt*100}%"></i><i class="m" style="width:${x.m/tt*100}%"></i><i class="p" style="width:${x.p/tt*100}%"></i></div></div>`}).join('');
  $('stLegend2').innerHTML=legendHtml();
}

/* ---------- ৩) মাসিক ক্যালেন্ডার: শনি → শুক্র, শুক্রবার লাল ---------- */
const WEEK=[6,0,1,2,3,4,5]; // শনিবার থেকে শুরু, শুক্রবার সবশেষে
function renderCal(){
  const now=new Date(),tk=keyOf(now),since=sinceKey();
  $('calMonth').textContent=`${L().months[viewM]} ${num(viewY)}`;
  $('calHead').innerHTML=WEEK.map(w=>`<div class="${w===5?'fri':''}">${esc(L().daysShort[w])}</div>`).join('');
  const first=new Date(viewY,viewM,1),lead=(first.getDay()+1)%7,days=new Date(viewY,viewM+1,0).getDate(),cells=[];
  for(let j=0;j<lead;j++)cells.push('<div class="cal-blank"></div>');
  for(let n=1;n<=days;n++){
    const d=new Date(viewY,viewM,n),k=keyOf(d),fut=k>tk;
    const dots=PN.map(p=>`<i class="${fut?'':stateOf(k,p)}"></i>`).join('');
    const full=!fut&&PN.every(p=>{const s=stateOf(k,p);return s==='completed'||s==='jamaat'});
    const cls=['cal-cell',d.getDay()===5?'fri':'',full?'full':'',k===tk?'now':'',k===selKey?'sel':'',fut?'fut':'',k<since?'pre':''].filter(Boolean).join(' ');
    cells.push(`<button type="button" class="${cls}" data-k="${k}" ${fut?'disabled':''} aria-label="${esc(dLabel(d))}"><b>${num(n)}</b><span class="dots">${dots}</span></button>`);
  }
  $('calGrid').innerHTML=cells.join('');
  $('calNext').disabled=(viewY===now.getFullYear()&&viewM===now.getMonth());
  $('calGrid').querySelectorAll('.cal-cell:not([disabled])').forEach(el=>el.onclick=()=>{selKey=el.dataset.k;renderTracker();renderHero();renderCal();$('trkCard').scrollIntoView({behavior:'smooth',block:'start'})});
}
function shiftMonth(d){
  const now=new Date();let m=viewM+d,y=viewY;if(m<0){m=11;y--}if(m>11){m=0;y++}
  if(y>now.getFullYear()||(y===now.getFullYear()&&m>now.getMonth()))return;
  if(y<now.getFullYear()-5)return;
  viewY=y;viewM=m;renderCal();
}

/* ---------- ৪/৫) অ্যালার্ট কার্ড ---------- */
const MODES={adhan:{box:'alAdhan',icon:'📢',title:'alAdhanT',desc:'alAdhanD'},namaz:{box:'alNamaz',icon:'⏰',title:'alNamazT',desc:'alNamazD'}};
function offDesc(mode,off){
  if(mode==='namaz')return t('afterS',{m:num(off)});
  return off<0?t('beforeA',{m:num(-off)}):off>0?t('afterA',{m:num(off)}):t('atA');
}
function renderAlarms(){
  if(!HAS_AL)return;
  const cfg=A.cfg();
  Object.keys(MODES).forEach(mode=>{
    const M=MODES[mode],c=cfg[mode],today=new Date();
    const rows=PN.map((p,i)=>{
      const off=c.items[p],set=typeof off==='number',st=A.mins(times[p].start);
      const sub=set?`${A.fmtMin(st+off)} — ${offDesc(mode,off)}`:t('notSet');
      return `<button type="button" class="al-row" data-m="${mode}" data-i="${i}"><img src="${A.pimg(i,today)}" alt=""><span class="al-info"><b>${esc(A.pname(i,today))}</b><small class="${set?'on':''}">${esc(sub)}</small></span><span class="al-plus" aria-hidden="true">${set?'✎':'＋'}</span></button>`}).join('');
    const opts=[['beep','sndBeep'],['bell','sndBell'],['adhan','sndAdhan']].map(o=>`<option value="${o[0]}" ${c.sound===o[0]?'selected':''}>${esc(t(o[1]))}</option>`).join('');
    const box=$(M.box);box.className='glass-card al-card'+(c.on?'':' off');
    box.innerHTML=`<div class="al-head"><div class="card-title">${M.icon} ${esc(t(M.title))}</div><button type="button" class="switch" role="switch" aria-checked="${c.on}" aria-label="${esc(c.on?t('on'):t('off'))}" data-m="${mode}"></button></div>`+
      `<div class="al-desc">${esc(t(M.desc))}</div><div class="al-list">${rows}</div>`+
      `<div class="al-sound"><label for="snd_${mode}">${esc(t('sound'))}</label><select class="city-select" id="snd_${mode}" data-m="${mode}">${opts}</select><button type="button" class="btn ghost" data-test="${mode}">${esc(t('test'))}</button></div>`;
    box.querySelector('.switch').onclick=()=>{const cf=A.cfg();cf[mode].on=!cf[mode].on;A.save();if(cf[mode].on)A.ask();renderAlarms()};
    box.querySelectorAll('.al-row').forEach(r=>r.onclick=()=>openSheet(mode,+r.dataset.i));
    box.querySelector('select').onchange=e=>{A.cfg()[mode].sound=e.target.value;A.save();A.playSound(e.target.value)};
    box.querySelector('[data-test]').onclick=()=>A.playSound(A.cfg()[mode].sound);
  });
}

/* ---------- অ্যালার্ট শিট (স্লাইডার) ---------- */
function openSheet(mode,i){
  const p=PN[i],st=A.mins(times[p].start),en=A.mins(times[p].end);let win=en-st;if(win<=0)win+=1440;
  const cur=A.cfg()[mode].items[p],set=typeof cur==='number';
  let min,max,def;
  if(mode==='adhan'){min=-60;max=60;def=-10}else{min=0;max=Math.max(1,Math.min(win-1,600));def=Math.min(15,max)}
  sh={mode,i,p,st,min,max,val:Math.min(max,Math.max(min,set?cur:def)),set};
  const r=$('shRange');r.min=min;r.max=max;r.value=sh.val;
  $('shTitle').textContent=A.pname(i,new Date());
  $('shLabel').textContent=t(mode==='adhan'?'pickAdhan':'pickNamaz');
  $('shMin').textContent=A.fmtMin(st+min);$('shMax').textContent=A.fmtMin(st+max);
  $('shCancel').textContent=t('cancel');$('shSave').textContent=t('save');$('shRemove').textContent=t('remove');$('shRemove').hidden=!set;
  updateSheet();$('alSheet').classList.add('show');
}
function updateSheet(){
  const r=$('shRange');sh.val=+r.value;
  r.style.setProperty('--p',((sh.val-sh.min)/(sh.max-sh.min)*100)+'%');
  $('shChip').textContent=`${t('alAt',{t:A.fmtMin(sh.st+sh.val)})} — ${offDesc(sh.mode,sh.val)}`;
  $('shVal').textContent=`${num(sh.val)} ${t('min')}`;
}
function closeSheet(){$('alSheet').classList.remove('show');sh=null}
function step(d){const r=$('shRange');r.value=Math.min(sh.max,Math.max(sh.min,+r.value+d));updateSheet()}

/* ---------- রিসেট ---------- */
function openConfirm(){$('cfTitle').textContent=t('resetQ');$('cfMsg').textContent=t('resetM');$('cfCancel').textContent=t('cancel');$('cfOk').textContent=t('resetOk');$('cfSheet').classList.add('show')}
function closeConfirm(){$('cfSheet').classList.remove('show')}
function doReset(){
  try{localStorage.removeItem(TKEY);localStorage.removeItem(JKEY);Object.keys(localStorage).filter(k=>/^deen_tracker_\d{4}-/.test(k)).forEach(k=>localStorage.removeItem(k));
    localStorage.setItem(SINCE,keyOf(new Date()))}catch(e){}
  data={};jam={};selKey=keyOf(new Date());closeConfirm();renderAll();toast(t('resetDone'));
}

/* ---------- রেন্ডার ও ইভেন্ট ---------- */
function renderAll(){renderHero();renderTracker();renderStats();renderCal();renderAlarms()}
function refresh(){applyTheme();applyI18n();loadData();renderAll()}
function init(){
  applyTheme();applyI18n();loadData();
  if(!HAS_AL){console.warn('alarms.js লোড হয়নি — অ্যালার্ট অংশ লুকানো হলো');['alAdhan','alNamaz'].forEach(id=>{$(id).hidden=true});const n=document.querySelector('.al-note');if(n)n.hidden=true}
  renderAll();
  // রাত পেরোলে (নতুন দিন) আজকের তারিখে ফিরে আসুন
  let curDay=keyOf(new Date());
  setInterval(()=>{const k=keyOf(new Date());if(k!==curDay){if(selKey===curDay)selKey=k;curDay=k;viewY=new Date().getFullYear();viewM=new Date().getMonth();times=A.timesSync();loadData();renderAll()}},30000);
  $('shRange').addEventListener('input',()=>{if(sh)updateSheet()});
  $('shMinus').onclick=()=>sh&&step(-1);$('shPlus').onclick=()=>sh&&step(1);
  $('shCancel').onclick=closeSheet;
  $('shSave').onclick=()=>{if(!sh)return;const cf=A.cfg();cf[sh.mode].items[sh.p]=sh.val;A.save();A.ask();closeSheet();renderAlarms();toast(t('saved'))};
  $('shRemove').onclick=()=>{if(!sh)return;const cf=A.cfg();delete cf[sh.mode].items[sh.p];A.save();closeSheet();renderAlarms();toast(t('removed'))};
  $('alSheet').addEventListener('click',e=>{if(e.target===$('alSheet'))closeSheet()});
  $('calPrev').onclick=()=>shiftMonth(-1);$('calNext').onclick=()=>shiftMonth(1);
  $('stSheet').addEventListener('click',e=>{if(e.target===$('stSheet'))closeStatus()});
  $('resetBtn').onclick=openConfirm;$('cfCancel').onclick=closeConfirm;$('cfOk').onclick=doReset;
  $('cfSheet').addEventListener('click',e=>{if(e.target===$('cfSheet'))closeConfirm()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeSheet();closeConfirm();closeStatus()}});
  A.getTimes().then(tm=>{times=tm;renderAlarms()});
  window.addEventListener('storage',e=>{if(e.key===TKEY||e.key===JKEY||e.key==='deen_lang'||e.key==='deen_color'||e.key==='deen_theme'||e.key===null)refresh()});
  window.addEventListener('deen-tracker',()=>{loadData();renderAll()});
  window.addEventListener('pageshow',e=>{if(e.persisted)refresh()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){times=A.timesSync();refresh()}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
