// ===== নামাজের হিসাব + আযান/নামাজ অ্যালার্ট =====
// ডেটা হোম পেজের সাথে একই জায়গায় থাকে: localStorage 'weeklyPrayerTracker' ({তারিখ:{ফজর:'completed'|'missed'|'pending',...}})
(function(){
'use strict';
const A=window.DeenAlarms;
const $=id=>document.getElementById(id);
const PN=A.PN;
const TKEY='weeklyPrayerTracker',SINCE='deen_since_reset',DATE_RE=/^\d{4}-\d{2}-\d{2}$/;
const pad=n=>String(n).padStart(2,'0');
const keyOf=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data={},selKey=keyOf(new Date()),times=A.timesSync(),sh=null;

/* ---------- ডেটা ---------- */
function loadData(){try{const d=JSON.parse(localStorage.getItem(TKEY));data=(d&&typeof d==='object'&&!Array.isArray(d))?d:{}}catch(e){data={}}}
function saveData(){try{localStorage.setItem(TKEY,JSON.stringify(data))}catch(e){}}
function dayRec(k){if(!data[k]){data[k]={};PN.forEach(p=>data[k][p]='pending')}return data[k]}
function toast(msg){const e=$('toast');e.textContent=msg;e.classList.add('show');clearTimeout(e._h);e._h=setTimeout(()=>e.classList.remove('show'),2000)}
function dateOf(k){return new Date(k+'T00:00:00')}
function dLabel(d){return `${L().days[d.getDay()]}, ${num(d.getDate())} ${L().months[d.getMonth()]}`}

/* ---------- থিম/রঙ (অন্য পেজের মতো) ---------- */
function applyTheme(){
  const th=localStorage.getItem('deen_theme')||'dark',co=localStorage.getItem('deen_color')||'teal';
  const dark=th==='dark'||(th==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);
  document.body.classList.toggle('dark',dark);document.body.setAttribute('data-color',co);
  const m=document.querySelector('meta[name=theme-color]');if(m)m.content=dark?'#0b2428':'#0d9488';
}

/* ---------- ১) নির্বাচিত দিনের হিসাব ---------- */
function setStatus(k,i,s){
  dayRec(k)[PN[i]]=s;saveData();renderAll();
  toast(t(s==='completed'?'toastDone':s==='missed'?'toastMissed':'toastPending',{p:A.pname(i,dateOf(k))}));
}
function renderTracker(){
  const d=dateOf(selKey),rec=dayRec(selKey),isToday=selKey===keyOf(new Date());let done=0;
  $('trkTitle').textContent='🕌 '+(isToday?t('recToday'):dLabel(d));
  $('trkList').innerHTML=PN.map((p,i)=>{const s=rec[p]||'pending';if(s==='completed')done++;
    return `<div class="record-row"><div class="record-row-left"><img src="${A.pimg(i,d)}" alt=""><span class="record-row-name">${esc(A.pname(i,d))}</span></div><div class="rec-btns">`+
    `<button type="button" class="rec-btn ${s==='completed'?'done-active':''}" data-i="${i}" data-v="completed">✓ ${esc(t('done'))}</button>`+
    `<button type="button" class="rec-btn ${s==='missed'?'missed-active':''}" data-i="${i}" data-v="missed">✗ ${esc(t('qaza'))}</button>`+
    `<button type="button" class="rec-btn ${s==='pending'?'pending-active':''}" data-i="${i}" data-v="pending">○ ${esc(t('pending'))}</button></div></div>`}).join('');
  $('trkBadge').textContent=`${num(done)}/${num(5)}`;
  $('trkList').querySelectorAll('.rec-btn').forEach(b=>b.onclick=()=>setStatus(selKey,+b.dataset.i,b.dataset.v));
}

/* ---------- ২) মোট ও প্রতি ওয়াক্তের হিসাব ---------- */
function sinceKey(){
  let s=localStorage.getItem(SINCE);const tk=keyOf(new Date());
  if(!s||!DATE_RE.test(s)){const ks=Object.keys(data).filter(k=>DATE_RE.test(k)).sort();s=ks[0]||tk}
  return s>tk?tk:s;
}
function renderStats(){
  const tk=keyOf(new Date()),since=sinceKey(),per=PN.map(()=>({d:0,m:0,p:0}));
  const it=dateOf(since);let n=0;
  while(keyOf(it)<=tk&&n<3700){const k=keyOf(it),rec=data[k]||{};
    PN.forEach((p,i)=>{const s=rec[p]||'pending';if(s==='completed')per[i].d++;else if(s==='missed')per[i].m++;else if(k<tk)per[i].p++});
    it.setDate(it.getDate()+1);n++}
  const sum=f=>per.reduce((a,x)=>a+x[f],0),D=sum('d'),M=sum('m'),P=sum('p'),tot=D+M+P;
  const full=k=>PN.every(p=>(data[k]||{})[p]==='completed');
  let streak=0;const x=new Date();if(!full(keyOf(x)))x.setDate(x.getDate()-1);
  while(full(keyOf(x))&&streak<3700){streak++;x.setDate(x.getDate()-1)}
  const pct=tot?Math.round(D/tot*100):0,sd=dateOf(since);
  $('sinceBadge').textContent=t('since',{d:`${num(sd.getDate())} ${L().months[sd.getMonth()]}`});
  $('statGrid').innerHTML=[['✅',D,t('done')],['❌',M,t('qaza')],['🔥',streak,t('streak')],['📈',num(pct)+'%',t('success')]]
    .map(r=>`<div class="stat-box"><div class="stat-icon-wrap">${r[0]}</div><div><div class="stat-value">${typeof r[1]==='number'?num(r[1]):r[1]}</div><div class="stat-label">${esc(r[2])}</div></div></div>`).join('');
  $('perList').innerHTML=PN.map((p,i)=>{const x=per[i],tt=x.d+x.m+x.p||1;
    return `<div class="pp-row"><div class="pp-top"><span class="pp-name"><img src="${A.IMG[i]}" alt="">${esc(L().prayers[i])}</span><span class="pp-nums">✓ ${num(x.d)} · ✗ ${num(x.m)} · ○ ${num(x.p)}</span></div>`+
      `<div class="pp-bar"><i class="d" style="width:${x.d/tt*100}%"></i><i class="m" style="width:${x.m/tt*100}%"></i><i class="p" style="width:${x.p/tt*100}%"></i></div></div>`}).join('');
}

/* ---------- ৩) গত ৩০ দিন ---------- */
function renderCal(){
  const tk=keyOf(new Date()),since=sinceKey(),cells=[];
  for(let j=0;j<30;j++){const d=new Date();d.setDate(d.getDate()-29+j);const k=keyOf(d),rec=data[k]||{};
    const c=PN.filter(p=>rec[p]==='completed').length,miss=PN.some(p=>rec[p]==='missed');
    const cls=['cal-cell',c===5?'full':c>0?'part':'',miss?'miss':'',k===tk?'now':'',k===selKey?'sel':'',k<since?'pre':''].filter(Boolean).join(' ');
    cells.push(`<button type="button" class="${cls}" data-k="${k}" aria-label="${esc(dLabel(d))}"><b>${num(d.getDate())}</b><small>${num(c)}/${num(5)}</small></button>`)}
  $('cal30').innerHTML=cells.join('');
  const a=new Date();a.setDate(a.getDate()-29);const b=new Date();
  $('calRange').textContent=`${num(a.getDate())}/${num(a.getMonth()+1)} – ${num(b.getDate())}/${num(b.getMonth()+1)}`;
  $('cal30').querySelectorAll('.cal-cell').forEach(el=>el.onclick=()=>{selKey=el.dataset.k;renderTracker();renderCal();$('trkCard').scrollIntoView({behavior:'smooth',block:'start'})});
}

/* ---------- ৪/৫) অ্যালার্ট কার্ড ---------- */
const MODES={adhan:{box:'alAdhan',icon:'📢',title:'alAdhanT',desc:'alAdhanD'},namaz:{box:'alNamaz',icon:'⏰',title:'alNamazT',desc:'alNamazD'}};
function offDesc(mode,off){
  if(mode==='namaz')return t('afterS',{m:num(off)});
  return off<0?t('beforeA',{m:num(-off)}):off>0?t('afterA',{m:num(off)}):t('atA');
}
function renderAlarms(){
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
  try{localStorage.removeItem(TKEY);Object.keys(localStorage).filter(k=>/^deen_tracker_\d{4}-/.test(k)).forEach(k=>localStorage.removeItem(k));
    localStorage.setItem(SINCE,keyOf(new Date()))}catch(e){}
  data={};selKey=keyOf(new Date());closeConfirm();renderAll();toast(t('resetDone'));
}

/* ---------- রেন্ডার ও ইভেন্ট ---------- */
function renderAll(){renderTracker();renderStats();renderCal();renderAlarms()}
function refresh(){applyI18n();loadData();renderAll()}
function init(){
  applyTheme();applyI18n();loadData();renderAll();
  $('shRange').addEventListener('input',()=>{if(sh)updateSheet()});
  $('shMinus').onclick=()=>sh&&step(-1);$('shPlus').onclick=()=>sh&&step(1);
  $('shCancel').onclick=closeSheet;
  $('shSave').onclick=()=>{if(!sh)return;const cf=A.cfg();cf[sh.mode].items[sh.p]=sh.val;A.save();A.ask();closeSheet();renderAlarms();toast(t('saved'))};
  $('shRemove').onclick=()=>{if(!sh)return;const cf=A.cfg();delete cf[sh.mode].items[sh.p];A.save();closeSheet();renderAlarms();toast(t('removed'))};
  $('alSheet').addEventListener('click',e=>{if(e.target===$('alSheet'))closeSheet()});
  $('resetBtn').onclick=openConfirm;$('cfCancel').onclick=closeConfirm;$('cfOk').onclick=doReset;
  $('cfSheet').addEventListener('click',e=>{if(e.target===$('cfSheet'))closeConfirm()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeSheet();closeConfirm()}});
  A.getTimes().then(tm=>{times=tm;renderAlarms()});
  window.addEventListener('storage',e=>{if(e.key===TKEY||e.key==='deen_lang'||e.key===null)refresh()});
  window.addEventListener('deen-tracker',()=>{loadData();renderAll()});
  window.addEventListener('pageshow',e=>{if(e.persisted)refresh()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){times=A.timesSync();refresh()}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
