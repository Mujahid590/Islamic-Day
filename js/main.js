// ===== DATA =====
const prayerNames=["ফজর","যোহর","আসর","মাগরিব","ইশা"];
const prayerImages=["image/fozor.png","image/zohor.png","image/asor.png","image/magrib.png","image/isa.png"];
// 24-hour defaults (offline fallback)
const defaultTimes={ফজর:{start:"05:00",end:"06:20"},যোহর:{start:"12:00",end:"15:20"},আসর:{start:"15:20",end:"17:25"},মাগরিব:{start:"17:25",end:"18:45"},ইশা:{start:"18:45",end:"05:00"}};
let weeklyData={},recordKey=null,times=defaultTimes,city=localStorage.getItem('userCity')||'Dhaka';
const $=id=>document.getElementById(id);
const bn=n=>num(n); // ভাষা অনুযায়ী অঙ্ক
const pad=n=>String(n).padStart(2,'0');
const keyOf=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const todayKey=()=>keyOf(new Date());
const ddmmyyyy=d=>`${pad(d.getDate())}-${pad(d.getMonth()+1)}-${d.getFullYear()}`;
const clean=s=>(s||'').split(' ')[0]; // "05:00 (+06)" -> "05:00"
function mins(s){const m=clean(s).match(/(\d+):(\d+)/);return m?+m[1]*60+ +m[2]:0}
function fmt(s){const t=mins(s),h=Math.floor(t/60),m=t%60;return `${bn(h%12||12)}:${bn(pad(m))} ${h>=12?L().pm:L().am}`}

// ===== TOAST =====
function showToast(msg){let t=$('toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t)}
t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),1800)}

// ===== PRAYER TIMES (Hanafi / Karachi method for Bangladesh, cached daily) =====
async function api(path){const ac=new AbortController(),h=setTimeout(()=>ac.abort(),8000);try{const r=await fetch(`https://api.aladhan.com/v1/${path}`,{signal:ac.signal});const j=await r.json();if(j.code!==200)throw 0;return j.data}finally{clearTimeout(h)}}
async function loadTimes(){
  const sc=localStorage.getItem('deen_school')||'1',co=JSON.parse(localStorage.getItem('deen_coords')||'null');
  const key=`pt_${co?co.lat.toFixed(2)+'_'+co.lon.toFixed(2):city}_${sc}_${todayKey()}`,c=localStorage.getItem(key);
  if(c){times=JSON.parse(c);return}
  try{
    const q=co?`latitude=${co.lat}&longitude=${co.lon}&method=1&school=${sc}`:`city=${city}&country=Bangladesh&method=1&school=${sc}`,ep=co?'timings':'timingsByCity';
    const tm=new Date();tm.setDate(tm.getDate()+1);
    const [a,b]=await Promise.all([api(`${ep}?${q}`),api(`${ep}/${ddmmyyyy(tm)}?${q}`)]);
    const t=a.timings;
    times={ফজর:{start:clean(t.Fajr),end:clean(t.Sunrise)},যোহর:{start:clean(t.Dhuhr),end:clean(t.Asr)},
      আসর:{start:clean(t.Asr),end:clean(t.Maghrib)},মাগরিব:{start:clean(t.Maghrib),end:clean(t.Isha)},
      ইশা:{start:clean(t.Isha),end:clean(b.timings.Fajr)}};
    localStorage.setItem(key,JSON.stringify(times));
  }catch(e){
    const last=Object.keys(localStorage).filter(k=>k.startsWith('pt_'+city)).sort().pop();
    times=last?JSON.parse(localStorage.getItem(last)):defaultTimes;
    if(!last){showToast(LANG==='en'?'Could not load prayer times (check internet). Showing approximate times.':'নামাজের সময় লোড হয়নি (ইন্টারনেট চেক করুন)। আনুমানিক সময় দেখানো হচ্ছে।');
      if(!window._ptRetry){window._ptRetry=1;addEventListener('online',async()=>{await loadTimes();updateTimer();renderExtras()})}}
  }
}

// ===== DATES =====
let hijriRaw=null;
function renderDates(){
  const now=new Date(),l=L();
  $('gregDateText').textContent=`${l.days[now.getDay()]}, ${bn(now.getDate())} ${l.months[now.getMonth()]}`;
  $('settingsHijriDate').textContent=hijriRaw?`${bn(hijriRaw.d)} ${l.hijri[hijriRaw.m-1]} ${bn(hijriRaw.y)} ${t('hijriWord')}`:'';
}
async function loadDates(){
  const k='hijri_'+todayKey(),c=localStorage.getItem(k);
  if(c){hijriRaw=JSON.parse(c)}
  else try{const h=(await api(`gToH/${ddmmyyyy(new Date())}`)).hijri;hijriRaw={d:+h.day,m:+h.month.number,y:+h.year};localStorage.setItem(k,JSON.stringify(hijriRaw))}catch(e){}
  renderDates();
}

// ===== STORAGE =====
function loadData(){try{weeklyData=JSON.parse(localStorage.getItem('weeklyPrayerTracker'))||{}}catch(e){weeklyData={}}}
function saveData(){localStorage.setItem('weeklyPrayerTracker',JSON.stringify(weeklyData))}
function dayPrayers(k){if(!weeklyData[k]){weeklyData[k]={};prayerNames.forEach(p=>weeklyData[k][p]='pending');saveData()}return weeklyData[k]}
function setStatus(k,p,s){dayPrayers(k)[p]=s;saveData();renderAll();if(recordKey===k)renderRecord(k);
  showToast(t(s==='completed'?'toastDone':s==='missed'?'toastMissed':'toastPending',{p:pnOf(p)}))}
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
  $('timerCountdownText').textContent=num(`${pad(Math.floor(r/3600))}:${pad(Math.floor(r%3600/60))}:${pad(r%60)}`);
  const frac=p.active?Math.min(1,Math.max(0,(now-p.s)/(p.e-p.s))):0,C=2*Math.PI*48;
  const c=$('timerProgressCircle');c.style.strokeDasharray=C.toFixed(2);c.style.strokeDashoffset=(C*(1-frac)).toFixed(2);
  $('activePrayerName').textContent=pnOf(p.n);
  $('currentPrayerStartTime').textContent=fmt(times[p.n].start);$('currentPrayerEndTime').textContent=fmt(times[p.n].end);
  $('prayerStateChip').className='prayer-state-chip '+(p.active?'active':'waiting');
  $('prayerStateTxt').textContent=p.active?t('inTime'):t('next',{p:pnOf(p.n)});
  $('timerSublabel').textContent=p.active?t('endsIn'):t('startsIn');
  document.querySelectorAll('.pchip').forEach(c=>c.classList.toggle('now',c.dataset.n===p.n));
}

// ===== RENDER =====
function renderToday(){
  const k=todayKey(),pr=dayPrayers(k);let done=0;
  $('prayersRowContainer').innerHTML=prayerNames.map((p,i)=>{const s=pr[p]||'pending';if(s==='completed')done++;
    return `<div class="prayer-item" data-i="${i}"><div class="p-circle ${s}"><img src="${prayerImages[i]}" alt=""></div><div class="p-name">${pnOf(p)}</div><div class="p-count">${s==='completed'?'✓':s==='missed'?'✗':'○'}</div></div>`}).join('');
  document.querySelectorAll('.prayer-item').forEach(el=>el.onclick=()=>{
    const p=prayerNames[el.dataset.i],cur=dayPrayers(k)[p];
    setStatus(k,p,cur==='pending'?'completed':cur==='completed'?'missed':'pending')});
  $('trackerTotalCount').textContent=`${bn(done)}/${bn(5)}`;$('todayDone').textContent=`${bn(done)}/${bn(5)}`;
  $('progressFillBar').style.width=`${done*20}%`;
}
function renderWeek(){
  const wd=weekDates(),tk=todayKey(),dn=L().daysShort,C=2*Math.PI*10;
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
  window.curStreak=streak;$('streakCount').textContent=bn(streak);$('weeklyProgress').textContent=`${bn(Math.round(total/35*100))}%`;$('totalCompleted').textContent=bn(total);
  $('statsRange').textContent=$('weekCalRange').textContent;renderBadges();renderInsight();
}
function renderAll(){renderWeek();renderToday();renderStats()}

// ===== RECORD MODAL =====
function openRecord(k){recordKey=k;renderRecord(k);$('recordModal').classList.add('show')}
function closeRecord(){$('recordModal').classList.remove('show');recordKey=null}
function renderRecord(k){
  const pr=dayPrayers(k),d=new Date(k+'T00:00:00');
  const dn=L().days,mn=L().months;
  $('recordModalDayName').textContent=`${dn[d.getDay()]}, ${bn(d.getDate())} ${mn[d.getMonth()]}`;
  $('recordModalCount').textContent=t('doneOf',{x:`${bn(Object.values(pr).filter(s=>s==='completed').length)}/${bn(5)}`});
  $('recordPrayerList').innerHTML=prayerNames.map((p,i)=>{const s=pr[p]||'pending';
    return `<div class="record-row"><div class="record-row-left"><img src="${prayerImages[i]}" alt=""><span class="record-row-name">${pnOf(p)}</span></div><div class="rec-btns">
    <button class="rec-btn ${s==='completed'?'done-active':''}" data-p="${p}" data-v="completed">✓ ${t('done')}</button>
    <button class="rec-btn ${s==='missed'?'missed-active':''}" data-p="${p}" data-v="missed">✗ ${t('qaza')}</button>
    <button class="rec-btn ${s==='pending'?'pending-active':''}" data-p="${p}" data-v="pending">○ ${t('pending')}</button></div></div>`}).join('');
  document.querySelectorAll('.rec-btn').forEach(b=>b.onclick=()=>setStatus(k,b.dataset.p,b.dataset.v));
}

// ===== THEME & SETTINGS =====
function setTheme(m){
  const dark=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);
  document.body.classList.toggle('dark',dark);localStorage.setItem('deen_theme',m);
  document.querySelector('meta[name=theme-color]').content=dark?'#0b2428':'#0d9488';
  document.querySelectorAll('.theme-opt').forEach(b=>b.classList.toggle('active',b.dataset.theme===m));
}
function fillCities(){const sel=$('citySelect');if(sel){sel.innerHTML=Object.keys(L().cities).map(k=>`<option value="${k}">${L().cities[k]}</option>`).join('');sel.value=city}$('cityLabel').textContent=L().cities[city]}
async function changeCity(c){
  city=c;localStorage.setItem('userCity',c);localStorage.removeItem('deen_coords');$('cityLabel').textContent=L().cities[c];
  await loadTimes();updateTimer();renderExtras();showToast(`📍 ${L().cities[c]}`);
}
function fillLangs(){
  if(!$('langGrid'))return;
  $('langGrid').innerHTML=Object.keys(LANGS).map(k=>`<button class="lang-opt ${k===LANG?'active':''}" data-l="${k}"><span class="flag">${LANGS[k].flag}</span>${LANGS[k].name}</button>`).join('');
  document.querySelectorAll('.lang-opt').forEach(b=>b.onclick=()=>changeLang(b.dataset.l));
}
function changeLang(c){
  setLang(c);fillLangs();fillCities();renderDates();renderAll();updateTimer();renderExtras();loadDaily();
  if(recordKey)renderRecord(recordKey);
}
// ===== অতিরিক্ত সময় (সাহরি/ইফতার/ইশরাক/চাশত/তাহাজ্জুদ/নিষিদ্ধ) =====
function hm(m){m=((m%1440)+1440)%1440;return fmt(`${pad(Math.floor(m/60))}:${pad(m%60)}`)}
function renderExtras(){
  const T=times,fj=mins(T['ফজর'].start),sr=mins(T['ফজর'].end),dh=mins(T['যোহর'].start),mg=mins(T['মাগরিব'].start),nf=mins(T['ইশা'].end);
  const tj=mg+Math.floor(((nf+1440)-mg)*2/3);
  const rows=prayerNames.map((n,i)=>`<div class="trow"><span>${n==='ফজর'?'🌙':n==='যোহর'?'☀️':n==='আসর'?'🌤️':n==='মাগরিব'?'🌇':'🌌'} ${pnOf(n)}</span><b>${hm(mins(T[n].start))}</b></div>`).join('')
   +[['🍽️','sehri',hm(fj)],['🌅','sunrise',hm(sr)],['✨','ishraq',hm(sr+15)],['☀️','chasht',`${hm(sr+20)} – ${hm(dh-10)}`],['🌇','iftar',hm(mg)],['🌃','tahajjud',hm(tj)]]
     .map(r=>`<div class="trow"><span>${r[0]} ${t(r[1])}</span><b>${r[2]}</b></div>`).join('')
   +`<div class="trow" style="flex-direction:column;gap:4px"><span>⛔ ${t('forbid')}</span><b style="font-size:.8rem">${hm(sr)}–${hm(sr+15)} · ${hm(dh-6)}–${hm(dh)} · ${hm(mg-15)}–${hm(mg)}</b></div>`;
  if($('timesList'))$('timesList').innerHTML=rows;
  renderPrayerBar();renderInsight();
}
// ===== হোমের নামাজ বার (আইকন + নাম + সময়) =====
function renderPrayerBar(){
  if(!$('prayerBar'))return;
  const cur=currentSlot();
  $('prayerBar').innerHTML=prayerNames.map((n,i)=>`<div class="pchip ${cur.n===n?'now':''}" data-n="${n}"><img src="${prayerImages[i]}" alt=""><div class="pn">${pnOf(n)}</div><div class="pt">${fmt(times[n].start)}</div></div>`).join('');
}
// ===== আজকের আয়াত ও হাদিস =====
async function cached(k,fn){const c=localStorage.getItem(k);if(c)return JSON.parse(c);const v=await fn();localStorage.setItem(k,JSON.stringify(v));return v}
async function loadDaily(){
  const day=Math.floor(Date.now()/864e5);
  Object.keys(localStorage).filter(k=>/^(ayah|hadith)_/.test(k)&&!k.includes('_'+day+'_')).forEach(k=>localStorage.removeItem(k));
  try{const ed={bn:'bn.bengali',en:'en.sahih',ur:'ur.jalandhry',ar:'ar.muyassar'}[LANG],n=(day*7)%6236+1;
    const d=await cached(`ayah_${day}_${ed}`,async()=>(await(await fetch(`https://api.alquran.cloud/v1/ayah/${n}/editions/quran-uthmani,${ed}`)).json()).data.map(x=>({t:x.text,s:x.surah.englishName,n:x.numberInSurah})));
    $('dailyAyah').innerHTML=`<div class="ar-text">${d[0].t}</div><div class="tr-text" ${L().dir==='rtl'?'dir=rtl':''}>${d[1].t}</div><div class="src">${d[0].s} · ${bn(d[0].n)}</div>`}catch(e){}
  try{const ed={bn:'ben-bukhari',ar:'ara-bukhari',ur:'urd-bukhari',en:'eng-bukhari'}[LANG],n=(day*13)%7000+1;
    const h=await cached(`hadith_${day}_${ed}`,async()=>(await(await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${ed}/${n}.json`)).json()).hadiths[0].text);
    $('dailyHadith').innerHTML=`<div class="tr-text" ${L().dir==='rtl'?'dir=rtl':''}>${h.length>350?h.slice(0,350)+'…':h}</div><div class="src">${t('hsrc')} · ${bn(n)}</div>`}catch(e){}
}
// ===== স্মার্ট সহায়ক (লোকাল ইনসাইট — ইন্টারনেট/এপিআই ছাড়াই) =====
function renderInsight(){try{renderInsightInner()}catch(e){console.warn('insight',e)}}
function renderInsightInner(){
  const box=$('aiInsights');if(!box)return;
  const en=LANG==='en',now=Date.now(),cur=currentSlot(),pr=dayPrayers(todayKey());
  const ttl=$('aiTitle'),sub=$('aiSub');
  if(ttl)ttl.textContent=en?'Deen Smart Assistant':'দ্বীন স্মার্ট সহায়ক';
  if(sub)sub.textContent=en?'Live insights for your day':'আপনার আজকের ইবাদতের লাইভ ইনসাইট';
  const left=Math.max(0,Math.round(((cur.active?cur.e:cur.s)-now)/60000));
  const dur=`${bn(Math.floor(left/60))}${en?'h ':' ঘণ্টা '}${bn(left%60)}${en?'m':' মিনিট'}`;
  const rows=[];
  rows.push(['⏳',cur.active
    ?(en?`${pnOf(cur.n)} time is running — ${dur} left`:`${pnOf(cur.n)} এর ওয়াক্ত চলছে — ${dur} বাকি`)
    :(en?`Next prayer ${pnOf(cur.n)} in ${dur}`:`পরবর্তী ওয়াক্ত ${pnOf(cur.n)} — ${dur} পরে`)]);
  const done=prayerNames.filter(n=>pr[n]==='completed').length;
  const past=prayerNames.filter(n=>pr[n]==='pending'&&atMs(times[n].start,0)<=now&&!(cur.active&&cur.n===n));
  if(past.length){
    const names=past.map(pnOf).join(en?', ':'، ');
    rows.push(['📝',en?`Not marked yet: ${names}. Tap below to update your tracker.`:`এখনও চিহ্নিত করা হয়নি: ${names}। নিচের ট্র্যাকারে আপডেট করুন।`]);
  }else if(done===5){
    rows.push(['🎉',en?'All five prayers done today. Alhamdulillah!':'আলহামদুলিল্লাহ! আজকের পাঁচ ওয়াক্তই আদায় হয়েছে।']);
  }else{
    rows.push(['✅',en?`${bn(done)} of ${bn(5)} prayers done today`:`আজ ${bn(done)}/${bn(5)} ওয়াক্ত আদায় হয়েছে`]);
  }
  const st=window.curStreak||0;
  rows.push([st>0?'🔥':'🌱',st>0
    ?(en?`${bn(st)}-day streak — keep it going!`:`টানা ${bn(st)} দিনের ধারাবাহিকতা — চালিয়ে যান!`)
    :(en?'Complete all five today to start a streak':'আজ পাঁচ ওয়াক্ত পূর্ণ করলেই ধারাবাহিকতা শুরু হবে')]);
  box.innerHTML=rows.map(r=>`<div class="ai-row"><span class="ai-ic">${r[0]}</span><span class="ai-tx">${r[1]}</span></div>`).join('');
}
// ===== অর্জন =====
function renderBadges(){
  const all=Object.values(weeklyData).reduce((a,d)=>a+Object.values(d).filter(s=>s==='completed').length,0),st=window.curStreak||0;
  $('badges').innerHTML=[['🌱',all>=1,'b1'],['🔥',st>=3,'b2'],['🏅',st>=7,'b3'],['👑',st>=30,'b4'],['🕌',all>=100,'b5']].map(b=>`<span class="badge ${b[1]?'':'locked'}">${b[0]} ${t(b[2])}</span>`).join('');
}
// ===== নোটিফিকেশন / আযান =====
const fired={};
function beep(){try{const c=new (window.AudioContext||window.webkitAudioContext)(),o=c.createOscillator(),g=c.createGain();o.connect(g);g.connect(c.destination);o.frequency.value=660;g.gain.setValueAtTime(.3,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+1.2);o.start();o.stop(c.currentTime+1.2)}catch(e){}}
function sound(){const m=localStorage.getItem('deen_adhan')||'off';if(m==='beep')beep();else if(m==='file')new Audio('audio/adhan.mp3').play().catch(beep)}
function notifyTick(){
  const mode=localStorage.getItem('deen_adhan')||'off',rem=+(localStorage.getItem('deen_remind')||0);
  if(mode==='off'&&!rem)return;const now=Math.floor(Date.now()/60000);
  prayerNames.forEach(n=>{const s=Math.floor(atMs(times[n].start,0)/60000);
    [[s,0],[s-rem,1]].forEach(([m,pre])=>{const k=n+m+pre;if((pre&&!rem)||m!==now||fired[k])return;fired[k]=1;
      const body=pre?t('remindMsg',{p:pnOf(n),m:rem}):t('prayerNow',{p:pnOf(n)});if(!pre)sound();
      if('Notification' in window&&Notification.permission==='granted'){
        (navigator.serviceWorker&&navigator.serviceWorker.ready?navigator.serviceWorker.ready.then(r=>r.showNotification('দ্বীন টাইম',{body,icon:'image/Logo.png',vibrate:[200,100,200]})):Promise.reject()).catch(()=>{try{new Notification('দ্বীন টাইম',{body})}catch(e){}})}
      else showToast(body)})})
}
// ===== সেটিংস: GPS, মাযহাব, রঙ, ব্যাকআপ, শেয়ার =====
function setColor(c){localStorage.setItem('deen_color',c);document.body.dataset.color=c;document.querySelectorAll('.dot').forEach(d=>d.classList.toggle('active',d.dataset.c===c))}
function setupSettings(){
  setColor(localStorage.getItem('deen_color')||'teal');
  document.querySelectorAll('.dot').forEach(d=>d.onclick=()=>setColor(d.dataset.c));
  if(!$('schoolSel'))return; // সেটিংস এখন আলাদা পেজে
  const sch=$('schoolSel');sch.value=localStorage.getItem('deen_school')||'1';
  sch.onchange=async()=>{localStorage.setItem('deen_school',sch.value);await loadTimes();updateTimer();renderExtras()};
  const ad=$('adhanSel'),rm=$('remindSel');ad.value=localStorage.getItem('deen_adhan')||'off';rm.value=localStorage.getItem('deen_remind')||'0';
  const ask=async()=>{if('Notification' in window&&Notification.permission==='default')try{await Notification.requestPermission()}catch(e){}};
  ad.onchange=()=>{localStorage.setItem('deen_adhan',ad.value);if(ad.value!=='off'){ask();sound()}};
  rm.onchange=()=>{localStorage.setItem('deen_remind',rm.value);if(+rm.value)ask()};
  $('gpsBtn').onclick=()=>navigator.geolocation?navigator.geolocation.getCurrentPosition(async p=>{
    localStorage.setItem('deen_coords',JSON.stringify({lat:p.coords.latitude,lon:p.coords.longitude}));$('cityLabel').textContent='GPS';
    await loadTimes();updateTimer();renderExtras();showToast('📍 '+t('gpsOk'))},()=>showToast(t('gpsErr')),{timeout:10000}):showToast(t('gpsErr'));
  $('exportBtn').onclick=()=>{const o={};Object.keys(localStorage).filter(k=>!/^(pt_|hijri_|ayah_|hadith_|cal_|asma_cache|q_list)/.test(k)).forEach(k=>o[k]=localStorage.getItem(k));
    const a=document.createElement('a');a.href=URL.
