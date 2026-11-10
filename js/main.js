iv class="record-row"><div class="record-row-left"><img src="${prayerImages[i]}" alt=""><span class="record-row-name">${pnOf(p)}</span></div><div class="rec-btns">
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
    $('dailyAyah').innerHTML=`<div class="ar-text">${esc(d[0].t)}</div><div class="tr-text" ${L().dir==='rtl'?'dir=rtl':''}>${esc(d[1].t)}</div><div class="src">${esc(d[0].s)} · ${bn(d[0].n)}</div>`}catch(e){}
  try{const ed={bn:'ben-bukhari',ar:'ara-bukhari',ur:'urd-bukhari',en:'eng-bukhari'}[LANG],n=(day*13)%7000+1;
    const h=await cached(`hadith_${day}_${ed}`,async()=>(await(await fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/${ed}/${n}.json`)).json()).hadiths[0].text);
    $('dailyHadith').innerHTML=`<div class="tr-text" ${L().dir==='rtl'?'dir=rtl':''}>${esc(h.length>350?h.slice(0,350)+'…':h)}</div><div class="src">${t('hsrc')} · ${bn(n)}</div>`}catch(e){}
}
// ===== পরবর্তী নামাজ কখন শুরু (বার) =====
function renderNextBar(){
  const box=$('nextBar');if(!box)return;
  const en=LANG==='en',now=Date.now();
  let idx=prayerNames.findIndex(n=>atMs(times[n].start,0)>now),off=0;
  if(idx<0){idx=0;off=1}
  const n=prayerNames[idx],st=atMs(times[n].start,off);
  const pst=atMs(times[prayerNames[(idx+4)%5]].start,idx===0?(off?0:-1):0);
  const left=Math.max(0,Math.round((st-now)/60000));
  $('nbLabel').textContent=en?'Next prayer starts':'পরবর্তী নামাজ শুরু';
  $('nbName').textContent=pnOf(n);
  if($('nbIcon'))$('nbIcon').src=prayerImages[idx];
  $('nbTime').textContent=fmt(times[n].start);
  $('nbLeft').textContent=`${bn(Math.floor(left/60))}${en?'h ':' ঘণ্টা '}${bn(left%60)}${en?'m':' মিনিট'} ${en?'left':'বাকি'}`;
  $('nbFill').style.width=Math.max(0,Math.min(100,(now-pst)/(st-pst)*100))+'%';
}
function renderInsight(){try{renderNextBar()}catch(e){console.warn('nextbar',e)}try{renderInsightInner()}catch(e){console.warn('insight',e)}}
// ===== স্মার্ট সহায়ক (লোকাল ইনসাইট — ইন্টারনেট/এপিআই ছাড়াই) =====
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
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(o)],{type:'application/json'}));a.download='deen-time-backup.json';a.click()};
  $('importBtn').onclick=()=>$('importFile').click();
  $('importFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);for(const k in o)localStorage.setItem(k,o[k]);showToast('✅ '+t('restored'));setTimeout(()=>location.reload(),900)}catch(x){showToast(t('err'))}};r.readAsText(f)};
  $('shareBtn').onclick=async()=>{const txt=`🕌 দ্বীন টাইম\n${t('weekly')} (${$('weekCalRange').textContent})\n✅ ${$('totalCompleted').textContent}/${bn(35)}  📈 ${$('weeklyProgress').textContent}  🔥 ${$('streakCount').textContent}`;
    try{navigator.share?await navigator.share({text:txt}):(await navigator.clipboard.writeText(txt),showToast(t('copied')))}catch(e){}};
}
const openSettings=()=>{location.href='settings.html'};
const closeSettings=()=>{};

// ===== INIT =====
document.addEventListener('DOMContentLoaded',async()=>{
  loadData();setTheme(localStorage.getItem('deen_theme')||'dark');
  $('recordCloseBtn').onclick=closeRecord;
  $('recordModal').onclick=e=>{if(e.target.id==='recordModal')closeRecord()};
  document.querySelectorAll('.theme-opt').forEach(b=>b.onclick=()=>setTheme(b.dataset.theme));
  applyI18n();fillLangs();fillCities();
  renderAll();renderDates();loadDates();
  updateTimer();renderExtras();
  await loadTimes();updateTimer();renderExtras();loadDaily();setupSettings();
  setInterval(updateTimer,1000);setInterval(renderInsight,30000);setInterval(Reminders.check,20000);Reminders.check();
  if(location.hash==='#settings')location.replace('settings.html');
  // new day: refresh times + tracker
  let day=todayKey();setInterval(async()=>{if(todayKey()!==day){day=todayKey();await loadTimes();loadDates();renderAll()}},30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateTimer()});
});
