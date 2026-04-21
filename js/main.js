// js/main.js
// ========== PRAYER TIMES CONFIGURATION ==========
const prayerNames = ["ফজর", "জোহর", "আসর", "মাগরিব", "ইশা"];
const prayerKeys  = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const prayerIcons = ["🌄", "☀️", "🌤️", "🌙", "🌌"];

let prayerTimeList        = [];
let currentPrayerInterval = null;
let weeklyData            = {};
let recordModalDateKey    = null;

// ========== DATE HELPERS ==========
function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
}

function getWeekStart(date) {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() - d.getDay());
    return d;
}

function getWeekDates() {
    const start = getWeekStart(new Date());
    return Array.from({length:7}, (_,i) => {
        const d = new Date(start);
        d.setDate(start.getDate()+i);
        return d;
    });
}

// ========== LOCAL STORAGE ==========
function loadWeeklyData() {
    const saved = localStorage.getItem('weeklyPrayerTracker_v2');
    if (saved) { try { weeklyData = JSON.parse(saved); } catch { weeklyData={}; } }
    else weeklyData = {};
    // অটো রিসেট: পুরনো সপ্তাহ মুছে ফেলো
    const weekStartKey = formatDateKey(getWeekStart(new Date()));
    const cleaned = {};
    for (const [key, val] of Object.entries(weeklyData)) {
        if (key >= weekStartKey) cleaned[key] = val;
    }
    weeklyData = cleaned;
    saveWeeklyData();
}

function saveWeeklyData() {
    localStorage.setItem('weeklyPrayerTracker_v2', JSON.stringify(weeklyData));
}

function getDayPrayers(dateKey) {
    if (!weeklyData[dateKey]) {
        weeklyData[dateKey] = {};
        prayerNames.forEach(p => weeklyData[dateKey][p] = 'pending');
        saveWeeklyData();
    }
    return weeklyData[dateKey];
}

function updatePrayerStatus(dateKey, prayerName, status) {
    if (!weeklyData[dateKey]) getDayPrayers(dateKey);
    weeklyData[dateKey][prayerName] = status;
    saveWeeklyData();
    renderWeeklyCalendar();
    renderTodayCircles();
    if (recordModalDateKey === dateKey) renderRecordModal(dateKey);
}

// ========== WEEKLY CALENDAR STRIP ==========
function renderWeeklyCalendar() {
    const container = document.getElementById('weekDaysStrip');
    const rangeElem  = document.getElementById('weekCalRange');
    if (!container) return;
    const weekDates = getWeekDates();
    const todayStr  = formatDateKey(new Date());
    const dayNames  = ['রবি','সোম','মঙ্গ','বুধ','বৃহ','শুক্র','শনি'];
    if (rangeElem) {
        const s=weekDates[0], e=weekDates[6];
        rangeElem.textContent = `${s.getDate()}/${s.getMonth()+1} – ${e.getDate()}/${e.getMonth()+1}`;
    }
    container.innerHTML = weekDates.map(date => {
        const dk        = formatDateKey(date);
        const prayers   = weeklyData[dk] || {};
        const completed = Object.values(prayers).filter(s=>s==='completed').length;
        const isToday   = dk===todayStr;
        const isFuture  = dk>todayStr;
        const pct       = completed>0 ? Math.round((completed/5)*100) : 0;
        const dots = prayerNames.map(p => {
            const st = prayers[p]||'pending';
            return `<span class="cal-dot ${st}"></span>`;
        }).join('');
        return `
        <div class="cal-day${isToday?' cal-today':''}${isFuture?' cal-future':''}" data-date="${dk}">
            <div class="cal-day-name">${dayNames[date.getDay()]}</div>
            <div class="cal-day-num">${date.getDate()}</div>
            <div class="cal-dots">${dots}</div>
            <div class="cal-pct">${isFuture?'–':pct+'%'}</div>
        </div>`;
    }).join('');
    container.querySelectorAll('.cal-day').forEach(card => {
        card.addEventListener('click', () => openRecordModal(card.dataset.date));
    });
}

// ========== RECORD MODAL ==========
function openRecordModal(dateKey) {
    recordModalDateKey = dateKey;
    renderRecordModal(dateKey);
    document.getElementById('recordModal').classList.add('show');
}

function closeRecordModal() {
    const m = document.getElementById('recordModal');
    if (m) m.classList.remove('show');
    recordModalDateKey = null;
}

function renderRecordModal(dateKey) {
    const prayers   = getDayPrayers(dateKey);
    const date      = new Date(dateKey+'T00:00:00');
    const dayNames  = ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];
    const monthNames= ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
    const todayStr  = formatDateKey(new Date());
    const isFuture  = dateKey>todayStr;
    const dayNameEl = document.getElementById('recordModalDayName');
    const countEl   = document.getElementById('recordModalCount');
    const listEl    = document.getElementById('recordPrayerList');
    if (dayNameEl) dayNameEl.textContent = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
    const done = Object.values(prayers).filter(s=>s==='completed').length;
    if (countEl) countEl.textContent = `${done}/৫ সম্পন্ন`;
    if (!listEl) return;
    listEl.innerHTML = prayerNames.map((prayer,idx) => {
        const status = prayers[prayer]||'pending';
        return `
        <div class="record-prayer-row">
            <div class="record-prayer-left">
                <span class="record-prayer-icon">${prayerIcons[idx]}</span>
                <span class="record-prayer-name">${prayer}</span>
            </div>
            <div class="record-btns">
                <button class="rec-btn rbtn-done${status==='completed'?' active-done':''}" data-prayer="${prayer}" data-val="completed" ${isFuture?'disabled':''}>✓ আদায়</button>
                <button class="rec-btn rbtn-miss${status==='missed'?' active-missed':''}" data-prayer="${prayer}" data-val="missed" ${isFuture?'disabled':''}>✗ কাযা</button>
                <button class="rec-btn rbtn-pend${status==='pending'?' active-pending':''}" data-prayer="${prayer}" data-val="pending" ${isFuture?'disabled':''}>○ বাকি</button>
            </div>
        </div>`;
    }).join('');
    listEl.querySelectorAll('.rec-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            updatePrayerStatus(dateKey, btn.dataset.prayer, btn.dataset.val);
        });
    });
}

// ========== TODAY CIRCLES ==========
function renderTodayCircles() {
    const todayKey = formatDateKey(new Date());
    const prayers  = getDayPrayers(todayKey);
    let done = 0;
    prayerNames.forEach((prayer, idx) => {
        const status = prayers[prayer]||'pending';
        if (status==='completed') done++;
        const btn = document.querySelector(`.circle-btn[data-prayer-index="${idx}"]`);
        if (btn) btn.className = `circle-btn ${status}`;
    });
    const totalEl = document.getElementById('trackerTotalCount');
    const fillBar = document.getElementById('progressFillBar');
    if (totalEl) totalEl.innerHTML = `${done}/৫ (${Math.round(done/5*100)}%)`;
    if (fillBar) fillBar.style.width = `${(done/5)*100}%`;
}

// ========== LEGACY STUBS ==========
function updatePrayerSummary() {}
function renderWeeklyView() { renderWeeklyCalendar(); }
function renderSelectedDay() {}

// ========== PRAYER TIME API ==========
function timeToMinutes(t) {
    if (!t) return 0;
    const s = t.trim();
    if (s.includes("AM")||s.includes("PM")) {
        const m = s.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (m) {
            let h=parseInt(m[1]),mn=parseInt(m[2]);
            const p=m[3].toUpperCase();
            if(p==="PM"&&h!==12)h+=12;
            if(p==="AM"&&h===12)h=0;
            return h*60+mn;
        }
    }
    const p=s.split(":");
    if(p.length>=2)return parseInt(p[0])*60+parseInt(p[1]);
    return 0;
}

function formatTimeDisplay(t) {
    if(!t)return"--:--";
    if(t.includes("AM")||t.includes("PM"))return t;
    const p=t.split(":");
    if(p.length>=2){
        const h=parseInt(p[0]),m=parseInt(p[1]);
        const period=h>=12?"PM":"AM";
        const dh=h%12===0?12:h%12;
        return `${dh}:${m.toString().padStart(2,"0")} ${period}`;
    }
    return t;
}

const fallbackTimings={Fajr:"04:11",Dhuhr:"11:58",Asr:"15:31",Maghrib:"18:22",Isha:"19:46"};

async function fetchPrayerTimes() {
    try {
        const res=await fetch("https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=4");
        const data=await res.json();
        if(data.code===200&&data.data){
            const timings=data.data.timings,hijri=data.data.date.hijri,greg=data.data.date.gregorian;
            const hEl=document.getElementById("hijriDateText");
            if(hEl)hEl.innerText=`${hijri.day} ${hijri.month.en} ${hijri.year}`;
            const gEl=document.getElementById("gregDateText");
            if(gEl)gEl.innerText=`${greg.day} ${greg.month.en} ${greg.year}`;
            const sEl=document.getElementById("sehriTimeVal");
            if(sEl)sEl.innerText=formatTimeDisplay(timings.Fajr);
            const iEl=document.getElementById("iftarTimeVal");
            if(iEl)iEl.innerText=formatTimeDisplay(timings.Maghrib);
            prayerTimeList=prayerKeys.map((key,idx)=>({name:prayerNames[idx],minutes:timeToMinutes(timings[key]),rawTime:timings[key]}));
        } else throw new Error();
    } catch {
        prayerTimeList=prayerKeys.map((key,idx)=>({name:prayerNames[idx],minutes:timeToMinutes(fallbackTimings[key]),rawTime:fallbackTimings[key]}));
        const sEl=document.getElementById("sehriTimeVal");if(sEl)sEl.innerText=formatTimeDisplay(fallbackTimings.Fajr);
        const iEl=document.getElementById("iftarTimeVal");if(iEl)iEl.innerText=formatTimeDisplay(fallbackTimings.Maghrib);
        showToastMessage("ডিফল্ট সময় দেখানো হচ্ছে");
    }
    updateCurrentPrayer();
    if(currentPrayerInterval)clearInterval(currentPrayerInterval);
    currentPrayerInterval=setInterval(updateCurrentPrayer,1000);
}

function updateCurrentPrayer() {
    if(!prayerTimeList.length)return;
    const now=new Date(),cm=now.getHours()*60+now.getMinutes();
    const cEl=document.getElementById("currentPrayerTimeDisplay");
    if(cEl){
        const h=now.getHours(),m=now.getMinutes(),s=now.getSeconds();
        const p=h>=12?"PM":"AM",dh=h%12===0?12:h%12;
        cEl.innerHTML=`${dh}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')} <sub>${p}</sub>`;
    }
    let ci=prayerTimeList.length-1,ni=0;
    for(let i=0;i<prayerTimeList.length;i++){
        if(cm>=prayerTimeList[i].minutes)ci=i;
        if(cm<prayerTimeList[i].minutes){ni=i;break;}
    }
    const cur=prayerTimeList[ci],nxt=prayerTimeList[ni];
    const nEl=document.getElementById("currentPrayerNameUI");if(nEl)nEl.innerText=cur.name;
    const stEl=document.getElementById("remainingTimeDisplay");if(stEl)stEl.innerHTML=`🕌 শুরুর সময়: ${formatTimeDisplay(cur.rawTime)}`;
    const enEl=document.getElementById("endTimeDisplay");if(enEl)enEl.innerHTML=`⏰ শেষ সময়: ${formatTimeDisplay(nxt.rawTime)}`;
}

// ========== THEME ==========
function setThemeMode(mode){
    if(mode==="dark")document.body.classList.add("dark");
    else if(mode==="light")document.body.classList.remove("dark");
    else{window.matchMedia("(prefers-color-scheme:dark)").matches?document.body.classList.add("dark"):document.body.classList.remove("dark");}
    localStorage.setItem("deen_theme",mode);
    document.querySelectorAll(".theme-btn").forEach(b=>b.classList.toggle("active",b.dataset.theme===mode));
}
function initTheme(){
    setThemeMode(localStorage.getItem("deen_theme")||"light");
    document.querySelectorAll(".theme-btn").forEach(btn=>{
        btn.addEventListener("click",()=>{
            setThemeMode(btn.dataset.theme);
            showToastMessage({dark:"🌙 ডার্ক মোড সক্রিয়",light:"☀️ লাইট মোড সক্রিয়",system:"📱 সিস্টেম থিম"}[btn.dataset.theme]);
        });
    });
    window.matchMedia("(prefers-color-scheme:dark)").addEventListener("change",()=>{if(localStorage.getItem("deen_theme")==="system")setThemeMode("system");});
}

// ========== MODAL ==========
function initModal(){
    const modal=document.getElementById("settingsModal");
    const ob=document.getElementById("openSettingsBtn");
    const cb=document.getElementById("closeModalBtn");
    if(ob)ob.onclick=()=>modal?.classList.add("show");
    if(cb)cb.onclick=()=>modal?.classList.remove("show");
    if(modal)modal.onclick=e=>{if(e.target===modal)modal.classList.remove("show");};
}

// ========== TOAST ==========
function showToastMessage(msg){
    document.querySelector(".toast-msg")?.remove();
    const t=document.createElement("div");
    t.className="toast-msg";t.innerText=msg;
    document.body.appendChild(t);
    setTimeout(()=>t?.parentNode?.removeChild(t),2200);
}

// ========== QUICK ACTIONS ==========
function initQuickActions(){
    document.querySelectorAll(".action-item").forEach(item=>{
        item.addEventListener("click",()=>showToastMessage(`✨ ${item.dataset.feature||'বৈশিষ্ট্য'} শীঘ্রই আসছে`));
    });
    const navBtns=document.querySelectorAll(".nav-icon-btn");
    navBtns.forEach(btn=>{
        btn.addEventListener("click",()=>{
            navBtns.forEach(b=>b.classList.remove("active"));
            btn.classList.add("active");
            showToastMessage(`🔹 ${btn.querySelector(".nav-text")?.innerText||'পৃষ্ঠা'} শীঘ্রই আসছে`);
        });
    });
}

// ========== INIT ==========
document.addEventListener("DOMContentLoaded",()=>{
    initTheme();
    initModal();
    initQuickActions();
    loadWeeklyData();
    renderWeeklyCalendar();
    renderTodayCircles();

    // Circle click → toggle status
    document.querySelectorAll('.circle-btn').forEach(btn=>{
        btn.addEventListener('click',()=>{
            const idx=parseInt(btn.dataset.prayerIndex);
            const prayer=prayerNames[idx];
            const today=formatDateKey(new Date());
            const prayers=getDayPrayers(today);
            const cur=prayers[prayer]||'pending';
            const next=cur==='pending'?'completed':cur==='completed'?'missed':'pending';
            updatePrayerStatus(today,prayer,next);
            const labels={completed:`✅ ${prayer} আদায়`,missed:`❌ ${prayer} কাযা`,pending:`⭕ ${prayer} বাকি`};
            showToastMessage(labels[next]);
        });
    });

    // Record modal close
    document.getElementById('recordCloseBtn')?.addEventListener('click',closeRecordModal);
    document.getElementById('recordModal')?.addEventListener('click',e=>{if(e.target.id==='recordModal')closeRecordModal();});

    fetchPrayerTimes();
});
