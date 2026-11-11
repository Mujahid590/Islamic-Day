/* ===== সেটিংস পেজ — main.js এর সঙ্গে একই localStorage কী ব্যবহার করে =====
   কী: deen_lang(i18n), deen_theme, deen_color, userCity, deen_coords, deen_school,
       deen_adhan, deen_remind, deen_remind_after, weeklyPrayerTracker            */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const ls={
  get(k,d){try{const v=localStorage.getItem(k);return v===null?d:v}catch(e){return d}},
  set(k,v){try{localStorage.setItem(k,v);return true}catch(e){return false}},
  del(k){try{localStorage.removeItem(k)}catch(e){}}
};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lang=()=>(typeof LANG!=='undefined'&&LANG)||ls.get('deen_lang','bn');
const N=v=>typeof num==='function'?num(v):String(v);
const PRAYERS=['ফজর','যোহর','আসর','মাগরিব','ইশা'],STATUS=['completed','missed','pending'];
const SETTING_KEYS=['deen_theme','deen_color','userCity','deen_school','deen_adhan','deen_remind','deen_remind_after','deen_coords','deen_lang'];
const MINUTES=[0,5,10,15,20,30,45,60];

/* ---------- অনুবাদ: js/lang-pack.js (bn · en · ar · hi · ur) ---------- */
const tx=(k,p)=>tp(k,p);

/* ---------- টোস্ট ---------- */
function toast(msg){let t=$('toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1800)}

/* ---------- থিম ও রঙ ---------- */
function setTheme(m){
  if(!['dark','light','system'].includes(m))m='dark';
  let dark=m==='dark';
  try{if(m==='system')dark=matchMedia('(prefers-color-scheme:dark)').matches}catch(e){}
  document.body.classList.toggle('dark',dark);ls.set('deen_theme',m);
  const mt=document.querySelector('meta[name=theme-color]');if(mt)mt.content=dark?'#0b2428':'#0d9488';
  document.querySelectorAll('.theme-opt').forEach(b=>{const a=b.dataset.theme===m;b.classList.toggle('active',a);b.setAttribute('aria-pressed',a)});
}
function setColor(c){
  if(!['teal','green','blue','peach'].includes(c))c='teal';
  ls.set('deen_color',c);document.body.dataset.color=c;
  document.querySelectorAll('.dot').forEach(d=>{const a=d.dataset.c===c;d.classList.toggle('active',a);d.setAttribute('aria-pressed',a)});
}

/* ---------- ভাষা ---------- */
function langList(){return(typeof LANGS!=='undefined'&&LANGS)?LANGS:{bn:{name:'বাংলা',flag:'🇧🇩'},en:{name:'English',flag:'🇬🇧'}}}
function renderLangGrid(){
  const g=$('langGrid'),all=langList(),keys=Object.keys(all),cur=keys.includes(lang())?lang():keys[0],c=all[cur],open=g.classList.contains('open');
  g.innerHTML=`<button type="button" class="lang-current" id="langBtn" aria-haspopup="listbox" aria-expanded="${open}" aria-controls="langMenu"><span class="flag">${esc(c.flag)}</span><span class="lang-name">${esc(c.name)}</span><span class="chev" aria-hidden="true">▾</span></button>`
   +`<div class="lang-menu" id="langMenu" role="listbox" ${open?'':'hidden'}>`+keys.map(k=>`<button type="button" role="option" class="lang-opt ${k===cur?'active':''}" data-l="${esc(k)}" aria-selected="${k===cur}"><span class="flag">${esc(all[k].flag)}</span>${esc(all[k].name)}</button>`).join('')+`</div>`;
  $('langBtn').onclick=()=>toggleLangMenu();
  g.querySelectorAll('.lang-opt').forEach(b=>b.onclick=()=>changeLang(b.dataset.l));
}
function toggleLangMenu(force){
  const g=$('langGrid'),open=force!==undefined?force:!g.classList.contains('open');
  g.classList.toggle('open',open);$('langMenu').hidden=!open;$('langBtn').setAttribute('aria-expanded',open);
}
function changeLang(c){
  $('langGrid').classList.remove('open'); // বাছাইয়ের পর তালিকা বন্ধ
  if(typeof setLang==='function'){try{setLang(c)}catch(e){}}
  else{ls.set('deen_lang',c)}
  applyLang();toast(tx('saved'));
}

/* ---------- সিলেক্ট বক্স ---------- */
function fillSelect(id,opts,val){const s=$(id);s.innerHTML=opts.map(o=>`<option value="${esc(o[0])}">${esc(o[1])}</option>`).join('');s.value=String(val)}
function cityMap(){
  try{if(typeof L==='function'&&L().cities&&Object.keys(L().cities).length)return L().cities}catch(e){}
  return{Dhaka:'ঢাকা',Chittagong:'চট্টগ্রাম',Sylhet:'সিলেট',Rajshahi:'রাজশাহী',Khulna:'খুলনা',Barisal:'বরিশাল',Rangpur:'রংপুর',Mymensingh:'ময়মনসিংহ'};
}
function fillSelects(){
  const cities=cityMap();let city=ls.get('userCity','Dhaka');if(!(city in cities))city=Object.keys(cities)[0];
  fillSelect('citySelect',Object.keys(cities).map(k=>[k,cities[k]]),city);
  fillSelect('schoolSel',[['1',tx('hanafi')],['0',tx('shafi')]],ls.get('deen_school','1')==='0'?'0':'1');
}

/* ---------- লোকেশন ---------- */
function coords(){try{const c=JSON.parse(ls.get('deen_coords','null'));return c&&isFinite(c.lat)&&isFinite(c.lon)?c:null}catch(e){return null}}
function refreshLoc(){
  const c=coords(),cities=cityMap(),city=ls.get('userCity','Dhaka');
  $('locStatus').textContent=c?`${tx('gpsOn')} · ${(+c.lat).toFixed(2)}, ${(+c.lon).toFixed(2)}`:tx('cityUsed',{c:cities[city]||city});
  $('gpsClearBtn').disabled=!c;
}
function getGps(){
  const btn=$('gpsBtn');
  if(!navigator.geolocation)return toast(tx('gpsNA'));
  btn.disabled=true;
  navigator.geolocation.getCurrentPosition(p=>{
    ls.set('deen_coords',JSON.stringify({lat:p.coords.latitude,lon:p.coords.longitude}));
    btn.disabled=false;refreshLoc();toast(tx('gpsOk'));
  },err=>{btn.disabled=false;toast(tx(err&&err.code===1?'gpsDenied':'gpsFail'))},{timeout:10000,maximumAge:600000});
}

/* ---------- ব্যাকআপ / রিস্টোর ---------- */
function trackerData(){try{const d=JSON.parse(ls.get('weeklyPrayerTracker','{}'));return d&&typeof d==='object'&&!Array.isArray(d)?d:{}}catch(e){return{}}}
function cleanTracker(src){
  const out={};
  if(!src||typeof src!=='object'||Array.isArray(src))return null;
  for(const k of Object.keys(src)){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!src[k]||typeof src[k]!=='object')continue;
    const day={};PRAYERS.forEach(p=>{day[p]=STATUS.includes(src[k][p])?src[k][p]:'pending'});out[k]=day;
  }
  return out;
}
function refreshDataInfo(){$('dataInfo').textContent=tx('days',{n:N(Object.keys(trackerData()).length)})}
function exportData(){
  const settings={};SETTING_KEYS.forEach(k=>{const v=ls.get(k,null);if(v!==null)settings[k]=v});
  const blob=new Blob([JSON.stringify({app:'deen-time',version:1,exportedAt:new Date().toISOString(),tracker:trackerData(),settings},null,1)],{type:'application/json'});
  const a=document.createElement('a'),d=new Date(),p=n=>String(n).padStart(2,'0');
  a.href=URL.createObjectURL(blob);a.download=`deen-backup-${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}.json`;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);
}
function importData(file){
  const r=new FileReader();
  r.onload=()=>{
    try{
      const d=JSON.parse(r.result);
      if(!d||typeof d!=='object'||Array.isArray(d))throw 0;
      const tr=cleanTracker(d.tracker&&typeof d.tracker==='object'?d.tracker:d); // পুরোনো ফরম্যাট (শুধু ট্র্যাকার) ও নতুন—দুটোই
      if(!tr)throw 0;
      ls.set('weeklyPrayerTracker',JSON.stringify(tr));
      const s=d.settings;
      if(s&&typeof s==='object'){
        const ok={deen_theme:v=>['dark','light','system'].includes(v),deen_color:v=>['teal','green','blue','peach'].includes(v),deen_school:v=>v==='0'||v==='1',
          deen_adhan:v=>['off','beep','file'].includes(v),deen_remind:v=>MINUTES.includes(+v),deen_remind_after:v=>MINUTES.includes(+v),
          userCity:v=>typeof v==='string'&&/^[A-Za-z .'-]{2,40}$/.test(v),deen_lang:v=>typeof v==='string'&&v in langList(),
          deen_coords:v=>{try{const c=JSON.parse(v);return isFinite(c.lat)&&isFinite(c.lon)&&Math.abs(c.lat)<=90&&Math.abs(c.lon)<=180}catch(e){return false}}};
        Object.keys(ok).forEach(k=>{if(typeof s[k]==='string'&&ok[k](s[k]))ls.set(k,s[k])});
      }
      initUI();toast(tx('restored'));
    }catch(e){toast(tx('invalid'))}
    $('importFile').value='';
  };
  r.onerror=()=>toast(tx('invalid'));
  r.readAsText(file);
}
async function shareApp(){
  const data={title:tx('appName'),text:tx('shareText'),url:location.href.split('#')[0].replace(/[^/]*$/,'index.html')};
  try{
    if(navigator.share)await navigator.share(data);
    else if(navigator.clipboard){await navigator.clipboard.writeText(data.url);toast(tx('copied'))}
  }catch(e){}
}

/* ---------- ইভেন্ট ও চালু ---------- */
/* ---------- যোগাযোগ ---------- */
const CONTACT_EMAIL='Mujahid590@gmail.com',APP_VERSION='1.0';
function reportHref(){
  let city=ls.get('userCity','Dhaka');
  const body=[tx('mailGreeting'),'',tx('mailWrite'),'','',tx('mailInfo'),
    `App: Deen Time v${APP_VERSION}`,`${tx('langName')}: ${lang()}`,`Theme: ${ls.get('deen_theme','dark')}`,`City: ${coords()?'GPS':city}`,`School: ${ls.get('deen_school','1')}`,
    `Device: ${navigator.userAgent}`].join('\n');
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(tx('mailSubject'))}&body=${encodeURIComponent(body)}`;
}
function refreshContact(){const r=$('reportBtn');if(r)r.href=reportHref()}
async function copyEmail(){
  let done=false;
  try{if(navigator.clipboard){await navigator.clipboard.writeText(CONTACT_EMAIL);done=true}}catch(e){}
  if(!done){try{const t=document.createElement('textarea');t.value=CONTACT_EMAIL;t.style.cssText='position:fixed;opacity:0';document.body.appendChild(t);t.select();done=document.execCommand('copy');t.remove()}catch(e){}}
  toast(done?tx('emailCopied'):CONTACT_EMAIL);
}
function applyLang(){
  applyPack(); // lang, dir, title
  document.querySelectorAll('[data-k]').forEach(el=>{el.textContent=tx(el.dataset.k)});
  document.querySelectorAll('[data-aria]').forEach(el=>el.setAttribute('aria-label',tx(el.dataset.aria)));
  renderLangGrid();fillSelects();refreshLoc();refreshDataInfo();refreshContact();
}
function initUI(){
  setTheme(ls.get('deen_theme','dark'));setColor(ls.get('deen_color','teal'));applyLang();
}
function bind(){
  document.querySelectorAll('.theme-opt').forEach(b=>b.onclick=()=>{setTheme(b.dataset.theme);toast(tx('saved'))});
  document.querySelectorAll('.dot').forEach(d=>d.onclick=()=>{setColor(d.dataset.c);toast(tx('saved'))});
  try{matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{if(ls.get('deen_theme','dark')==='system')setTheme('system')})}catch(e){}
  $('citySelect').onchange=e=>{ls.set('userCity',e.target.value);ls.del('deen_coords');refreshLoc();toast(tx('saved'))}; // শহর বদলালে GPS বাতিল (main.js এর মতোই)
  $('gpsBtn').onclick=getGps;
  $('gpsClearBtn').onclick=()=>{ls.del('deen_coords');refreshLoc();toast(tx('gpsCleared'))};
  $('schoolSel').onchange=e=>{ls.set('deen_school',e.target.value==='0'?'0':'1');toast(tx('saved'))};
  $('exportBtn').onclick=exportData;
  $('importFile').onchange=e=>{const f=e.target.files&&e.target.files[0];if(f)importData(f)};
  $('shareBtn').onclick=shareApp;
  $('copyEmailBtn').onclick=copyEmail;
  $('reportBtn').addEventListener('click',refreshContact); // ক্লিকের মুহূর্তের সর্বশেষ তথ্য
  document.addEventListener('click',e=>{const g=$('langGrid');if(g.classList.contains('open')&&!g.contains(e.target))toggleLangMenu(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('langGrid').classList.contains('open')){toggleLangMenu(false);$('langBtn').focus()}});
  $('resetTrackerBtn').onclick=()=>{if(!confirm(tx('confirmTracker')))return;ls.del('weeklyPrayerTracker');refreshDataInfo();toast(tx('trackerCleared'))};
  $('resetAllBtn').onclick=()=>{if(!confirm(tx('confirmAll')))return;
    SETTING_KEYS.filter(k=>k!=='deen_lang').forEach(ls.del);
    Object.keys(localStorage).filter(k=>/^(pt_|hijri_)/.test(k)).forEach(ls.del); // সময়ের ক্যাশও মুছে নতুন সেটিংসে রিলোড হবে
    initUI();toast(tx('resetDone'))};
}
function start(){bind();initUI()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
