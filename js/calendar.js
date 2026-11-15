// ===== ক্যালেন্ডার পেজ: মাসিক ক্যালেন্ডার + নির্বাচিত দিনের নামাজের হিসাব =====
// ডেটা হোম/নামাজ পেজের সাথে একই: 'weeklyPrayerTracker' + 'deen_jamaat'
(function(){
'use strict';
const $=id=>document.getElementById(id);
const PN=['ফজর','যোহর','আসর','মাগরিব','ইশা'],IMG=['image/fozor.png','image/zohor.png','image/asor.png','image/magrib.png','image/isa.png'];
const TKEY='weeklyPrayerTracker',JKEY='deen_jamaat',SINCE='deen_since_reset',DATE_RE=/^\d{4}-\d{2}-\d{2}$/;
const pad=n=>String(n).padStart(2,'0');
const keyOf=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pname=(i,d)=>(i===1&&(d||new Date()).getDay()===5)?t('jumuah'):L().prayers[i];
const pimg=(i,d)=>(i===1&&(d||new Date()).getDay()===5)?'image/jumuah.svg':IMG[i];
let data={},jam={},selKey=keyOf(new Date()),viewY=new Date().getFullYear(),viewM=new Date().getMonth();

function loadData(){
  try{const d=JSON.parse(localStorage.getItem(TKEY));data=(d&&typeof d==='object'&&!Array.isArray(d))?d:{}}catch(e){data={}}
  try{const j=JSON.parse(localStorage.getItem(JKEY));jam=(j&&typeof j==='object'&&!Array.isArray(j))?j:{}}catch(e){jam={}}
}
function saveData(){try{localStorage.setItem(TKEY,JSON.stringify(data));localStorage.setItem(JKEY,JSON.stringify(jam))}catch(e){}}
function dayRec(k){if(!data[k]){data[k]={};PN.forEach(p=>data[k][p]='pending')}return data[k]}
// pending (আদায় হয়নি) → completed (আদায়, সবুজ) → jamaat (জামাতে আদায়, নীল); পুরনো 'missed' = আদায় হয়নি
function stateOf(k,p){const s=(data[k]||{})[p];return s==='completed'?((jam[k]||{})[p]?'jamaat':'completed'):'pending'}
const NEXT={pending:'completed',completed:'jamaat',jamaat:'pending'};
const dateOf=k=>new Date(k+'T00:00:00');
const dLabel=d=>`${L().days[d.getDay()]}, ${num(d.getDate())} ${L().months[d.getMonth()]}`;
function toast(msg){const e=$('toast');e.textContent=msg;e.classList.add('show');clearTimeout(e._h);e._h=setTimeout(()=>e.classList.remove('show'),2000)}
function applyTheme(){
  const th=localStorage.getItem('deen_theme')||'dark';let co=localStorage.getItem('deen_color')||'teal';
  if(['teal','green','blue','peach'].indexOf(co)<0)co='teal';
  const dark=th==='dark'||(th==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);
  document.body.classList.toggle('dark',dark);document.body.dataset.color=co;
  const m=document.querySelector('meta[name=theme-color]');if(m)m.content=dark?'#0b2428':'#0d9488';
}
function sinceKey(){
  let s=localStorage.getItem(SINCE);const tk=keyOf(new Date());
  if(!s||!DATE_RE.test(s)){const ks=Object.keys(data).filter(k=>DATE_RE.test(k)).sort();s=ks[0]||tk}
  return s>tk?tk:s;
}
function legendHtml(){
  return [['jamaat','jamaat'],['done','aloneDone'],['pending','notDone']]
    .map(r=>`<span class="legend-item"><span class="legend-dot ${r[0]}"></span> ${esc(t(r[1]))}</span>`).join('');
}

/* ---------- নির্বাচিত দিনের হিসাব ---------- */
function setStatus(k,i,st){
  const p=PN[i],rec=dayRec(k);
  rec[p]=st==='pending'?'pending':'completed';
  if(st==='jamaat'){(jam[k]=jam[k]||{})[p]=true}
  else if(jam[k]){delete jam[k][p];if(!Object.keys(jam[k]).length)delete jam[k]}
  saveData();renderAll();
  toast(t(st==='jamaat'?'toastJamaat':st==='completed'?'toastDone':'toastPending',{p:pname(i,dateOf(k))}));
}
function renderTracker(){
  const d=dateOf(selKey),isToday=selKey===keyOf(new Date());let done=0;
  $('trkTitle').textContent='🕌 '+(isToday?t('recToday'):dLabel(d));
  $('trkList').innerHTML=PN.map((p,i)=>{const s=stateOf(selKey,p);if(s!=='pending')done++;
    const cls=s==='jamaat'?'completed jamaat':s;
    return `<div class="prayer-item" data-i="${i}" role="button" tabindex="0" aria-label="${esc(pname(i,d))}"><div class="p-circle ${cls}"><img src="${pimg(i,d)}" alt=""></div><div class="p-name">${esc(pname(i,d))}</div><div class="p-count">${s==='jamaat'?'✓✓':s==='completed'?'✓':'○'}</div></div>`}).join('');
  $('trkBadge').textContent=`${num(done)}/${num(5)}`;
  $('trkBar').style.width=`${done*20}%`;
  $('trkList').querySelectorAll('.prayer-item').forEach(el=>{
    const go=()=>{const i=+el.dataset.i;setStatus(selKey,i,NEXT[stateOf(selKey,PN[i])])};
    el.onclick=go;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}};
  });
  $('stLegend').innerHTML=legendHtml();
}

/* ---------- মাসিক ক্যালেন্ডার: শনি → শুক্র, শুক্রবার লাল ---------- */
const WEEK=[6,0,1,2,3,4,5];
function renderCal(){
  const now=new Date(),tk=keyOf(now),since=sinceKey();
  $('calMonth').textContent=`${L().months[viewM]} ${num(viewY)}`;
  $('calHead').innerHTML=WEEK.map(w=>`<div class="${w===5?'fri':''}">${esc(L().daysShort[w])}</div>`).join('');
  const first=new Date(viewY,viewM,1),lead=(first.getDay()+1)%7,days=new Date(viewY,viewM+1,0).getDate(),cells=[];
  for(let j=0;j<lead;j++)cells.push('<div class="cal-blank"></div>');
  for(let n=1;n<=days;n++){
    const d=new Date(viewY,viewM,n),k=keyOf(d),fut=k>tk;
    const dots=PN.map(p=>`<i class="${fut?'':stateOf(k,p)}"></i>`).join('');
    const full=!fut&&PN.every(p=>stateOf(k,p)!=='pending');
    const cls=['cal-cell',d.getDay()===5?'fri':'',full?'full':'',k===tk?'now':'',k===selKey?'sel':'',fut?'fut':'',k<since?'pre':''].filter(Boolean).join(' ');
    cells.push(`<button type="button" class="${cls}" data-k="${k}" ${fut?'disabled':''} aria-label="${esc(dLabel(d))}"><b>${num(n)}</b><span class="dots">${dots}</span></button>`);
  }
  $('calGrid').innerHTML=cells.join('');
  $('calNext').disabled=(viewY===now.getFullYear()&&viewM===now.getMonth());
  $('calLegend').innerHTML=legendHtml();
  $('calGrid').querySelectorAll('.cal-cell:not([disabled])').forEach(el=>el.onclick=()=>{selKey=el.dataset.k;renderTracker();renderCal();$('trkCard').scrollIntoView({behavior:'smooth',block:'start'})});
}
function shiftMonth(d){
  const now=new Date();let m=viewM+d,y=viewY;if(m<0){m=11;y--}if(m>11){m=0;y++}
  if(y>now.getFullYear()||(y===now.getFullYear()&&m>now.getMonth()))return;
  if(y<now.getFullYear()-5)return;
  viewY=y;viewM=m;renderCal();renderMonth();
}

/* ---------- দেখা মাসের সারাংশ ---------- */
function renderMonth(){
  const tk=keyOf(new Date()),days=new Date(viewY,viewM+1,0).getDate();let J=0,A1=0,P=0;
  for(let n=1;n<=days;n++){const k=keyOf(new Date(viewY,viewM,n));if(k>tk)break;
    PN.forEach(p=>{const s=stateOf(k,p);if(s==='jamaat')J++;else if(s==='completed')A1++;else if(k<tk)P++})}
  const D=A1+J,tot=D+P,pct=tot?Math.round(D/tot*100):0;
  $('monthBadge').textContent=`${L().months[viewM]} ${num(viewY)}`;
  $('monthStats').innerHTML=[['✅',D,t('done')],['🕌',J,t('jamaat')],['☑️',A1,t('aloneDone')],['⭕',P,t('notDone')],['📈',num(pct)+'%',t('success')]]
    .map(r=>`<div class="stat-box"><div class="stat-icon-wrap">${r[0]}</div><div><div class="stat-value">${typeof r[1]==='number'?num(r[1]):r[1]}</div><div class="stat-label">${esc(r[2])}</div></div></div>`).join('');
}

function renderAll(){renderTracker();renderCal();renderMonth()}
function refresh(){applyTheme();applyI18n();loadData();renderAll()}
function init(){
  applyTheme();applyI18n();loadData();renderAll();
  let curDay=keyOf(new Date());
  setInterval(()=>{const k=keyOf(new Date());if(k!==curDay){if(selKey===curDay)selKey=k;curDay=k;viewY=new Date().getFullYear();viewM=new Date().getMonth();loadData();renderAll()}},30000);
  $('calPrev').onclick=()=>shiftMonth(-1);$('calNext').onclick=()=>shiftMonth(1);
  window.addEventListener('storage',e=>{if(e.key===TKEY||e.key===JKEY||e.key==='deen_lang'||e.key==='deen_color'||e.key==='deen_theme'||e.key===null)refresh()});
  window.addEventListener('pageshow',e=>{if(e.persisted)refresh()});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
