// ===== DATA =====
const prayerNames=["ফজর","যোহর","আসর","মাগরিব","ইশা"];
const prayerImages=["image/fozor.png","image/zohor.png","image/asor.png","image/magrib.png","image/isa.png"];
const cityBn={Dhaka:"ঢাকা",Chittagong:"চট্টগ্রাম",Sylhet:"সিলেট",Rajshahi:"রাজশাহী",Khulna:"খুলনা",Barisal:"বরিশাল",Rangpur:"রংপুর",Mymensingh:"ময়মনসিংহ",Comilla:"কুমিল্লা"};
// 24-hour defaults (offline fallback)
const defaultTimes={ফজর:{start:"05:00",end:"06:20"},যোহর:{start:"12:00",end:"15:20"},আসর:{start:"15:20",end:"17:25"},মাগরিব:{start:"17:25",end:"18:45"},ইশা:{start:"18:45",end:"05:00"}};
let weeklyData={},recordKey=null,times=defaultTimes,city=localStorage.getItem('userCity')||'Dhaka';
const $=id=>document.getElementById(id);
const bn=n=>String(n).replace(/\d/g,d=>'০১২৩৪৫৬৭৮৯'[d]);
const pad=n=>String(n).padStart(2,'0');
const keyOf=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const todayKey=()=>keyOf(new Date());
const ddmmyyyy=d=>`${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()}`;
const clean=s=>(s||'').split(' ')[0]; // "05:00 (+06)" -> "05:00"
function mins(s){const m=clean(s).match(/(\d+):(\d+)/);return m?+m[1]*60+ +m[2]:0}
function fmt(s){const t=mins(s),h=Math.floor(t/60),m=t%60;return `${bn(h%12||12)}:${bn(pad(m))} ${h>=12?'PM':'AM'}`}

// ===== TOAST =====
function showToast(msg){let t=$('toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t)}
t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1800)}

// ===== PRAYER TIMES (Hanafi / Karachi method for Bangladesh, cached daily) =====
async function api(path){const r=await fetch(`https://api.aladhan.com/v1/${path}`);const j=await r.json();if(j.code!==200)throw 0;return j.data}
async function loadTimes(){
  const key=`pt_${city}_${todayKey()}`,c=localStorage.getItem(key);
  if(c){times=JSON.parse(c);return}
  try{
    const q=`city=${city}&country=Bangladesh&method=1&school=1`;
    const tm=new Date();tm.setDate(tm.getDate()+1);
    const [a,b]=await Promise.all([api(`timingsByCity?${q}`),api(`timingsByCity/${ddmmyyyy(tm)}?${q}`)]);
    const t=a.timings;
    times={ফজর:{start:clean(t.Fajr),end:clean(t.Sunrise)},যোহর:{start:clean(t.Dhuhr),end:clean(t.Asr)},
      আসর:{start:clean(t.Asr),end:clean(t.Maghrib)},মাগরিব:{start:clean(t.Maghrib),end:clean(t.Isha)},
      ইশা:{start:clean(t.Isha),end:clean(b.timings.Fajr)}};
    localStorage.setItem(key,JSON.stringify(times));
  }catch(e){
    const last=Object.keys(localStorage).filter(k=>k.startsWith('pt_'+city)).sort().pop();
    times=last?JSON.parse(localStorage.getItem(last)):defaultTimes;
  }
}

// ===== DATES =====
async function loadDates(){
  const now=new Date(),days=['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];
  const months=['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
  $('gregDateText').textContent=`${days[now.getDay()]}, ${bn(now.getDate())} ${months[now.getMonth()]}`;
  const hm=['মুহররম','সফর','রবিউল আউয়াল','রবিউস সানি','জমাদিউল আউয়াল','জমাদিউস সানি','রজব','শা\'বান','রমজান','শাওয়াল','জিলকদ','জিলহজ'];
  const k='hijri_'+todayKey(),c=localStorage.getItem(k);
  if(c){$('settingsHijriDate').textContent=c;return}
  try{const d=await api(`gToH/${ddmmyyyy(now)}`);const h=d.hijri;
    const txt=`${bn(h.day)} ${hm[+h.month.number-1]} ${bn(h.year)} হিজরি`;
    $('settingsHijriDate').textContent=txt;localStorage.setItem(k,txt)}catch(e){}
}

// ===== STORAGE =====
function loadData(){try{weeklyData=JSON.parse(localStorage.getItem('weeklyPrayerTracker'))||{}}catch(e){weeklyData={}}}
function saveData(){localStorage.setItem('weeklyPrayerTracker',JSON.stringify(weeklyData))}
function dayPrayers(k){if(!weeklyData[k]){weeklyData[k]={};prayerNames.forEach(p=>weeklyData[k][p]='pending');saveData()}return weeklyData[k]}
function setStatus(k,p,s){dayPrayers(k)[p]=s;saveData();renderAll();if(recordKey===k)renderRecord(k);
  showToast(s==='completed'?`✅ ${p} আদায় হয়েছে`:s==='missed'?`❌ ${p} কাযা`:`⭕ ${p} বাকি`)}
function weekDates(){const n=new Date(),s=new Date(n.getFullYear(),n.getMonth(),n.getDate()-n.getDay());
  return Array.from({length:7},(_,i)=>new Date(s.getFullYear(),s.getMonth(),s.getDate()+i))}

// ===== TIMER =====
function atMs(str,off){const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+off);return d.getTime()+mins(str)*60000}
function currentSlot(){
  const now=Date.now(),list=[];
  [-1,0,1].forEach(o=>prayerNames.forEach(n=>{let s=atMs(times[n].start,o),e=atMs(times[n].end,o);if(e<=s)e+=864e5;list.push({n,s,e})}));
  const act=list.find(p=>now>=p.s&&now<p.e);
  if(act)return{...act,active:true};
  return{...list.filter(p=>p.s>now).sort((a,b)=>a.s-b.s)[0],active:false};
}
function updateTimer(){
  const p=currentSlot(),now=Date.now(),target=p.active?p.e:p.s;
  let r=Math.max(0,Math.floor((target-now)/1000));
  $('timerCountdownText').textContent=`${pad(Math.floor(r/3600))}:${pad(Math.floor(r%3600/60))}:${pad(r%60)}`;
  const frac=p.active?Math.min(1,Math.max(0,(now-p.s)/(p.e-p.s))):0,C=2*Math.PI*48;
  const c=$('timerProgressCircle');c.style.strokeDasharray=C.toFixed(2);c.style.strokeDashoffset=(C*(1-frac)).toFixed(2);
  $('activePrayerName').textContent=p.n;
  $('currentPrayerStartTime').textContent=fmt(times[p.n].start);$('currentPrayerEndTime').textContent=fmt(times[p.n].end);
  $('prayerStateChip').className='prayer-state-chip '+(p.active?'active':'waiting');
  $('prayerStateTxt').textContent=p.active?'নামাজের সময়':`পরবর্তী: ${p.n}`;
  $('timerSublabel').textContent=p.active?'শেষ হতে বাকি':'শুরু হতে বাকি';
}

// ===== RENDER =====
function renderToday(){
  const k=todayKey(),pr=dayPrayers(k);let done=0;
  $('prayersRowContainer').innerHTML=prayerNames.map((p,i)=>{const s=pr[p]||'pending';if(s==='completed')done++;
    return `<div class="prayer-item" data-i="${i}"><div class="p-circle ${s}"><img src="${prayerImages[i]}" alt=""></div><div class="p-name">${p}</div><div class="p-count">${s==='completed'?'✓':s==='missed'?'✗':'○'}</div></div>`}).join('');
  document.querySelectorAll('.prayer-item').forEach(el=>el.onclick=()=>{
    const p=prayerNames[el.dataset.i],cur=dayPrayers(k)[p];
    setStatus(k,p,cur==='pending'?'completed':cur==='completed'?'missed':'pending')});
  $('trackerTotalCount').textContent=`${bn(done)}/৫`;$('todayDone').textContent=`${bn(done)}/৫`;
  $('progressFillBar').style.width=`${done*20}%`;
}
function renderWeek(){
  const wd=weekDates(),tk=todayKey(),dn=['রবি','সোম','মঙ্গল','বুধ','বৃহ','শুক্র','শনি'],C=2*Math.PI*10;
  $('weekCalRange').textContent=`${bn(wd[0].getDate())}/${bn(wd[0].getMonth()+1)} – ${bn(wd[6].getDate())}/${bn(wd[6].getMonth()+1)}`;
  $('weekDaysStrip').innerHTML=wd.map(d=>{const k=keyOf(d),n=Object.values(weeklyData[k]||{}).filter(s=>s==='completed').length,pct=n*20;
    return `<div class="cal-day ${k===tk?'cal-today':''} ${k>tk?'cal-future':''}" data-date="${k}"><div class="cal-day-name">${dn[d.getDay()]}</div><div class="cal-day-num">${bn(d.getDate())}</div>
    <div class="cal-ring"><svg viewBox="0 0 26 26"><circle class="cal-ring-bg" cx="13" cy="13" r="10" stroke-width="3"/><circle class="cal-ring-fill" cx="13" cy="13" r="10" stroke-width="3" style="stroke-dasharray:${C.toFixed(2)};stroke-dashoffset:${(C*(1-pct/100)).toFixed(2)};transform:rotate(-90deg);transform-origin:center"/></svg></div>
    <div class="cal-pct">${bn(pct)}%</div></div>`}).join('');
  document.querySelectorAll('.cal-day').forEach(el=>el.onclick=()=>openRecord(el.dataset.date));
}
function renderStats(){
  const wd=weekDates(),tk=todayKey();let total=0;
  wd.forEach(d=>{const k=keyOf(d);if(k<=tk)total+=Object.values(weeklyData[k]||{}).filter(s=>s==='completed').length});
  // streak: consecutive full days counting back from today (or yesterday if today not yet complete)
  let streak=0;const d=new Date();
  if(Object.values(weeklyData[keyOf(d)]||{}).filter(s=>s==='completed').length<5)d.setDate(d.getDate()-1);
  while(Object.values(weeklyData[keyOf(d)]||{}).filter(s=>s==='completed').length===5){streak++;d.setDate(d.getDate()-1)}
  $('streakCount').textContent=bn(streak);$('weeklyProgress').textContent=`${bn(Math.round(total/35*100))}%`;$('totalCompleted').textContent=bn(total);
  $('statsRange').textContent=$('weekCalRange').textContent;
}
function renderAll(){renderWeek();renderToday();renderStats()}

// ===== RECORD MODAL =====
function openRecord(k){recordKey=k;renderRecord(k);$('recordModal').classList.add('show')}
function closeRecord(){$('recordModal').classList.remove('show');recordKey=null}
function renderRecord(k){
  const pr=dayPrayers(k),d=new Date(k+'T00:00:00');
  const dn=['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];
  const mn=['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
  $('recordModalDayName').textContent=`${dn[d.getDay()]}, ${bn(d.getDate())} ${mn[d.getMonth()]}`;
  $('recordModalCount').textContent=`${bn(Object.values(pr).filter(s=>s==='completed').length)}/৫ সম্পন্ন`;
  $('recordPrayerList').innerHTML=prayerNames.map((p,i)=>{const s=pr[p]||'pending';
    return `<div class="record-row"><div class="record-row-left"><img src="${prayerImages[i]}" alt=""><span class="record-row-name">${p}</span></div><div class="rec-btns">
    <button class="rec-btn ${s==='completed'?'done-active':''}" data-p="${p}" data-v="completed">✓ আদায়</button>
    <button class="rec-btn ${s==='missed'?'missed-active':''}" data-p="${p}" data-v="missed">✗ কাযা</button>
    <button class="rec-btn ${s==='pending'?'pending-active':''}" data-p="${p}" data-v="pending">○ বাকি</button></div></div>`}).join('');
  document.querySelectorAll('.rec-btn').forEach(b=>b.onclick=()=>setStatus(k,b.dataset.p,b.dataset.v));
}

// ===== THEME & SETTINGS =====
function setTheme(m){
  const dark=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);
  document.body.classList.toggle('dark',dark);localStorage.setItem('deen_theme',m);
  document.querySelector('meta[name=theme-color]').content=dark?'#0b2428':'#0d9488';
  document.querySelectorAll('.theme-opt').forEach(b=>b.classList.toggle('active',b.dataset.theme===m));
}
async function changeCity(c){
  city=c;localStorage.setItem('userCity',c);$('cityLabel').textContent=cityBn[c]||c;
  await loadTimes();updateTimer();showToast(`📍 ${cityBn[c]||c}`);
}
const openSettings=()=>$('settingsModal').classList.add('show');
const closeSettings=()=>$('settingsModal').classList.remove('show');

// ===== INIT =====
document.addEventListener('DOMContentLoaded',async()=>{
  loadData();setTheme(localStorage.getItem('deen_theme')||'system');
  $('profileSettingsBtn').onclick=openSettings;$('topSettingsBtn').onclick=openSettings;
  $('closeModalBtn').onclick=closeSettings;$('recordCloseBtn').onclick=closeRecord;
  $('settingsModal').onclick=e=>{if(e.target.id==='settingsModal')closeSettings()};
  $('recordModal').onclick=e=>{if(e.target.id==='recordModal')closeRecord()};
  document.querySelectorAll('.theme-opt').forEach(b=>b.onclick=()=>setTheme(b.dataset.theme));
  const sel=$('citySelect');sel.value=city;sel.onchange=()=>changeCity(sel.value);
  $('cityLabel').textContent=cityBn[city]||city;
  renderAll();loadDates();
  await loadTimes();updateTimer();
  setInterval(updateTimer,1000);
  // new day: refresh times + tracker
  let day=todayKey();setInterval(async()=>{if(todayKey()!==day){day=todayKey();await loadTimes();loadDates();renderAll()}},30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateTimer()});
});
