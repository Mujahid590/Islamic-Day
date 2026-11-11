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

/* ---------- নিজস্ব অনুবাদ (bn / en; অন্য ভাষায় en) ---------- */
const TX={
bn:{back:'ফিরে যান',title:'সেটিংস',subtitle:'অ্যাপ আপনার মতো সাজিয়ে নিন',secLook:'চেহারা ও ভাষা',lang:'ভাষা',theme:'থিম',themeDark:'🌙 ডার্ক',themeLight:'☀️ লাইট',themeSystem:'📱 সিস্টেম',color:'অ্যাকসেন্ট রঙ',
secLoc:'লোকেশন',city:'শহর',gps:'📡 GPS দিয়ে লোকেশন নিন',gpsClear:'GPS মুছুন',gpsNote:'GPS চালু থাকলে শহরের বদলে আপনার সঠিক অবস্থানের সময় দেখানো হবে।',
secCalc:'নামাজের সময় হিসাব',school:'আসরের মাযহাব',hanafi:'হানাফী (আসর দেরিতে)',shafi:'শাফেয়ী/মালেকী/হাম্বলী (আসর আগে)',schoolNote:'বাংলাদেশে সাধারণত হানাফী ব্যবহৃত হয়। পদ্ধতি: Karachi (University of Islamic Sciences)।',
secAdhan:'আযান ও রিমাইন্ডার',adhanMode:'আযানের শব্দ',adhanOff:'বন্ধ',adhanBeep:'সাধারণ বিপ',adhanFile:'আযান অডিও (audio/adhan.mp3)',testSound:'▶ টেস্ট',
remBefore:'ওয়াক্ত শুরুর আগে রিমাইন্ডার',remAfter:'ওয়াক্ত শুরুর পরে রিমাইন্ডার',off:'বন্ধ',min:'{n} মিনিট',hour:'১ ঘণ্টা',
notif:'নোটিফিকেশন অনুমতি',notifBtn:'অনুমতি দিন',nGranted:'✅ অনুমতি দেওয়া আছে',nDenied:'🚫 ব্লক করা (ব্রাউজার সেটিংস থেকে চালু করুন)',nDefault:'⚠️ এখনও অনুমতি দেওয়া হয়নি',nNA:'এই ব্রাউজারে সমর্থিত নয়',
remNote:'রিমাইন্ডার সর্বোচ্চ ১ ঘণ্টা আগে বা পরে সেট করা যায়। অ্যাপ খোলা বা ব্যাকগ্রাউন্ডে থাকলে কাজ করে।',
secData:'ডেটা ও ব্যাকআপ',export:'⬇ ব্যাকআপ নিন',import:'⬆ রিস্টোর করুন',share:'🔗 অ্যাপ শেয়ার করুন',danger:'বিপদজনক এলাকা',resetTracker:'নামাজের হিসাব মুছুন',resetAll:'সব সেটিংস রিসেট',
secAbout:'অ্যাপ সম্পর্কে',appName:'অ্যাপ',version:'সংস্করণ',dataSrc:'সময়ের উৎস',
saved:'সংরক্ষিত ✓',cityUsed:'📍 {c}',gpsOn:'GPS চালু',gpsNA:'এই ডিভাইসে GPS নেই',gpsOk:'📍 লোকেশন আপডেট হয়েছে',gpsDenied:'লোকেশনের অনুমতি দেওয়া হয়নি',gpsFail:'লোকেশন পাওয়া যায়নি',gpsCleared:'GPS মুছে ফেলা হয়েছে',
days:'{n} দিনের হিসাব',confirmTracker:'নামাজের সব হিসাব মুছে যাবে। নিশ্চিত?',confirmAll:'সব সেটিংস ডিফল্টে ফিরবে (নামাজের হিসাব থাকবে)। নিশ্চিত?',trackerCleared:'নামাজের হিসাব মুছে ফেলা হয়েছে',resetDone:'সেটিংস রিসেট হয়েছে',
invalid:'ফাইলটি সঠিক নয়',restored:'ব্যাকআপ রিস্টোর হয়েছে ✓',copied:'লিংক কপি হয়েছে',shareText:'দ্বীন টাইম - নামাজের সময়সূচি অ্যাপ',soundNA:'আযানের শব্দ বন্ধ আছে',notifOk:'নোটিফিকেশন চালু হয়েছে',notifNo:'নোটিফিকেশনের অনুমতি পাওয়া যায়নি'},
en:{back:'Back',title:'Settings',subtitle:'Make the app yours',secLook:'Appearance & Language',lang:'Language',theme:'Theme',themeDark:'🌙 Dark',themeLight:'☀️ Light',themeSystem:'📱 System',color:'Accent color',
secLoc:'Location',city:'City',gps:'📡 Use GPS location',gpsClear:'Clear GPS',gpsNote:'When GPS is on, times are calculated for your exact position instead of the city.',
secCalc:'Prayer time calculation',school:'Asr juristic method',hanafi:'Hanafi (later Asr)',shafi:'Shafi/Maliki/Hanbali (earlier Asr)',schoolNote:'Hanafi is commonly used in Bangladesh. Method: Karachi (University of Islamic Sciences).',
secAdhan:'Adhan & Reminders',adhanMode:'Adhan sound',adhanOff:'Off',adhanBeep:'Simple beep',adhanFile:'Adhan audio (audio/adhan.mp3)',testSound:'▶ Test',
remBefore:'Reminder before prayer starts',remAfter:'Reminder after prayer starts',off:'Off',min:'{n} min',hour:'1 hour',
notif:'Notification permission',notifBtn:'Allow',nGranted:'✅ Allowed',nDenied:'🚫 Blocked (enable in browser settings)',nDefault:'⚠️ Not allowed yet',nNA:'Not supported in this browser',
remNote:'Reminders can be set up to 1 hour before or after. They work while the app is open or in the background.',
secData:'Data & Backup',export:'⬇ Back up',import:'⬆ Restore',share:'🔗 Share app',danger:'Danger zone',resetTracker:'Erase prayer records',resetAll:'Reset all settings',
secAbout:'About',appName:'App',version:'Version',dataSrc:'Times source',
saved:'Saved ✓',cityUsed:'📍 {c}',gpsOn:'GPS on',gpsNA:'GPS not available',gpsOk:'📍 Location updated',gpsDenied:'Location permission denied',gpsFail:'Could not get location',gpsCleared:'GPS cleared',
days:'{n} days tracked',confirmTracker:'All prayer records will be erased. Continue?',confirmAll:'All settings return to defaults (prayer records are kept). Continue?',trackerCleared:'Prayer records erased',resetDone:'Settings reset',
invalid:'Invalid backup file',restored:'Backup restored ✓',copied:'Link copied',shareText:'Deen Time - prayer times app',soundNA:'Adhan sound is off',notifOk:'Notifications enabled',notifNo:'Notification permission not granted'}
};
function tx(k,p){let s=(TX[lang()]||TX.en)[k];if(s==null)s=TX.en[k];if(s==null)s=k;
  if(p)for(const x in p)s=s.replace('{'+x+'}',p[x]);return s}

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
  const g=$('langGrid'),cur=lang(),all=langList();
  g.innerHTML=Object.keys(all).map(k=>`<button type="button" class="lang-opt ${k===cur?'active':''}" data-l="${esc(k)}" aria-pressed="${k===cur}"><span class="flag">${esc(all[k].flag)}</span>${esc(all[k].name)}</button>`).join('');
  g.querySelectorAll('.lang-opt').forEach(b=>b.onclick=()=>changeLang(b.dataset.l));
}
function changeLang(c){
  if(typeof setLang==='function'){try{setLang(c)}catch(e){}}
  else{ls.set('deen_lang',c)}
  applyLang();toast(tx('saved'));
}

/* ---------- সিলেক্ট বক্স ---------- */
function minLabel(n){return n===0?tx('off'):n===60?tx('hour'):tx('min',{n:N(n)})}
function fillSelect(id,opts,val){const s=$(id);s.innerHTML=opts.map(o=>`<option value="${esc(o[0])}">${esc(o[1])}</option>`).join('');s.value=String(val)}
function cityMap(){
  try{if(typeof L==='function'&&L().cities&&Object.keys(L().cities).length)return L().cities}catch(e){}
  return{Dhaka:'ঢাকা',Chittagong:'চট্টগ্রাম',Sylhet:'সিলেট',Rajshahi:'রাজশাহী',Khulna:'খুলনা',Barisal:'বরিশাল',Rangpur:'রংপুর',Mymensingh:'ময়মনসিংহ'};
}
function fillSelects(){
  const cities=cityMap();let city=ls.get('userCity','Dhaka');if(!(city in cities))city=Object.keys(cities)[0];
  fillSelect('citySelect',Object.keys(cities).map(k=>[k,cities[k]]),city);
  fillSelect('schoolSel',[['1',tx('hanafi')],['0',tx('shafi')]],ls.get('deen_school','1')==='0'?'0':'1');
  fillSelect('adhanSel',[['off',tx('adhanOff')],['beep',tx('adhanBeep')],['file',tx('adhanFile')]],['off','beep','file'].includes(ls.get('deen_adhan','off'))?ls.get('deen_adhan','off'):'off');
  const opts=MINUTES.map(m=>[String(m),minLabel(m)]);
  const clamp=k=>{const v=parseInt(ls.get(k,'0'),10);return MINUTES.includes(v)?v:0};
  fillSelect('remindSel',opts,clamp('deen_remind'));fillSelect('remindAfterSel',opts,clamp('deen_remind_after'));
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

/* ---------- আযান / রিমাইন্ডার / নোটিফিকেশন ---------- */
function beep(){try{const c=new (window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=660;
  g.gain.setValueAtTime(.3,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+1.2);if(c.state==='suspended')c.resume();o.start();o.stop(c.currentTime+1.2);o.onended=()=>{try{c.close()}catch(_){}}}catch(e){}}
function testSound(){
  const m=ls.get('deen_adhan','off');
  if(m==='beep')beep();
  else if(m==='file'){const a=new Audio('audio/adhan.mp3');a.play().catch(beep);setTimeout(()=>{try{a.pause()}catch(_){}},8000)}
  else toast(tx('soundNA'));
}
function notifSupported(){return 'Notification' in window}
function refreshNotif(){
  const el=$('notifStatus'),btn=$('notifBtn');el.className='status-pill';
  if(!notifSupported()){el.textContent=tx('nNA');btn.disabled=true;return}
  const p=Notification.permission;
  el.textContent=tx(p==='granted'?'nGranted':p==='denied'?'nDenied':'nDefault');
  el.classList.add(p==='granted'?'ok':p==='denied'?'bad':'x');
  btn.disabled=p!=='default';
}
async function askNotif(silent){
  if(!notifSupported()||Notification.permission!=='default'){refreshNotif();return}
  try{await Notification.requestPermission()}catch(e){}
  refreshNotif();
  if(!silent)toast(tx(Notification.permission==='granted'?'notifOk':'notifNo'));
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
  const data={title:'দ্বীন টাইম',text:tx('shareText'),url:location.href.split('#')[0].replace(/[^/]*$/,'index.html')};
  try{
    if(navigator.share)await navigator.share(data);
    else if(navigator.clipboard){await navigator.clipboard.writeText(data.url);toast(tx('copied'))}
  }catch(e){}
}

/* ---------- ইভেন্ট ও চালু ---------- */
function applyLang(){
  const l=lang();document.documentElement.lang=l;
  try{document.documentElement.dir=(typeof L==='function'&&L().dir)||'ltr'}catch(e){}
  document.title=tx('title')+' - দ্বীন টাইম';
  document.querySelectorAll('[data-k]').forEach(el=>{el.textContent=tx(el.dataset.k)});
  document.querySelectorAll('[data-aria]').forEach(el=>el.setAttribute('aria-label',tx(el.dataset.aria)));
  renderLangGrid();fillSelects();refreshLoc();refreshNotif();refreshDataInfo();
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
  $('adhanSel').onchange=e=>{ls.set('deen_adhan',e.target.value);toast(tx('saved'));if(e.target.value!=='off')askNotif(true)};
  $('remindSel').onchange=e=>{ls.set('deen_remind',e.target.value);toast(tx('saved'));if(+e.target.value)askNotif(true)};
  $('remindAfterSel').onchange=e=>{ls.set('deen_remind_after',e.target.value);toast(tx('saved'));if(+e.target.value)askNotif(true)};
  $('testSoundBtn').onclick=testSound;
  $('notifBtn').onclick=()=>askNotif(false);
  $('exportBtn').onclick=exportData;
  $('importFile').onchange=e=>{const f=e.target.files&&e.target.files[0];if(f)importData(f)};
  $('shareBtn').onclick=shareApp;
  $('resetTrackerBtn').onclick=()=>{if(!confirm(tx('confirmTracker')))return;ls.del('weeklyPrayerTracker');refreshDataInfo();toast(tx('trackerCleared'))};
  $('resetAllBtn').onclick=()=>{if(!confirm(tx('confirmAll')))return;
    SETTING_KEYS.filter(k=>k!=='deen_lang').forEach(ls.del);
    Object.keys(localStorage).filter(k=>/^(pt_|hijri_)/.test(k)).forEach(ls.del); // সময়ের ক্যাশও মুছে নতুন সেটিংসে রিলোড হবে
    initUI();toast(tx('resetDone'))};
}
function start(){bind();initUI()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
