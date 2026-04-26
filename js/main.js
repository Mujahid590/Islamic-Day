// ===== PRAYER DATA =====
const prayerNames = ["ফজর", "যোহর", "আসর", "মাগরিব", "ইশা"];
const prayerImages = ["image/fozor.png", "image/zohor.png", "image/asor.png", "image/magrib.png", "image/isa.png"];

let prayerTimeList = [];
let currentTimerInterval = null;
let weeklyData = {};
let recordModalDateKey = null;
let currentAccurateTime = null;
let isOnline = navigator.onLine;
let lastSyncTime = null;

// ===== NTP TIME SYNC (Satellite Time) =====
async function fetchNTPTime() {
    const ntpServers = [
        'https://worldtimeapi.org/api/timezone/Asia/Dhaka',
        'https://timeapi.io/api/Time/current/zone?timeZone=Asia/Dhaka'
    ];
    
    for (const server of ntpServers) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(server, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (response.ok) {
                let data = await response.json();
                let datetime;
                
                if (data.datetime) datetime = data.datetime;
                else if (data.utc_datetime) datetime = data.utc_datetime;
                else continue;
                
                currentAccurateTime = new Date(datetime);
                lastSyncTime = Date.now();
                localStorage.setItem('last_sync_time', lastSyncTime);
                localStorage.setItem('cached_server_time', currentAccurateTime.toISOString());
                
                console.log('✅ Satellite time synced:', currentAccurateTime.toLocaleString());
                return true;
            }
        } catch (e) {
            console.log(`Time server failed:`, e.message);
            continue;
        }
    }
    
    const cachedTime = localStorage.getItem('cached_server_time');
    const cachedSyncTime = localStorage.getItem('last_sync_time');
    
    if (cachedTime && cachedSyncTime) {
        const cachedDate = new Date(cachedTime);
        const timeDiff = Date.now() - parseInt(cachedSyncTime);
        currentAccurateTime = new Date(cachedDate.getTime() + timeDiff);
        console.log('📱 Using cached time');
        return true;
    }
    
    currentAccurateTime = new Date();
    return false;
}

function getCurrentTime() {
    if (currentAccurateTime && lastSyncTime) {
        const elapsed = Date.now() - lastSyncTime;
        return new Date(currentAccurateTime.getTime() + elapsed);
    }
    return new Date();
}

// ===== DATE UTILS =====
function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function getTodayKey() { 
    const now = getCurrentTime();
    return formatDateKey(now); 
}

function getWeekStart(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
}

function getWeekDates() {
    const now = getCurrentTime();
    const start = getWeekStart(now);
    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return d;
    });
}

// ===== TIME UTILS =====
function timeToMinutes(t) {
    if (!t) return 0;
    const match = t.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (match) {
        let h = parseInt(match[1]);
        const mn = parseInt(match[2]);
        const period = match[3].toUpperCase();
        if (period === 'PM' && h !== 12) h += 12;
        if (period === 'AM' && h === 12) h = 0;
        return h * 60 + mn;
    }
    const parts = t.split(':');
    if (parts.length >= 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    return 0;
}

function formatTimeDisplay(t) {
    if (!t) return '--:--';
    if (t.includes('AM') || t.includes('PM')) return t;
    const parts = t.split(':');
    if (parts.length >= 2) {
        let h = parseInt(parts[0]);
        const m = parseInt(parts[1]);
        const period = h >= 12 ? 'PM' : 'AM';
        const dh = h % 12 === 0 ? 12 : h % 12;
        return `${dh}:${m.toString().padStart(2, '0')} ${period}`;
    }
    return t;
}

function formatTimeFromMinutes(minutes) {
    const totalMinutes = minutes % 1440;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const dh = h % 12 === 0 ? 12 : h % 12;
    return `${dh}:${m.toString().padStart(2, '0')} ${period}`;
}

// ===== PRAYER CALCULATIONS =====
function calculatePrayerTimes(apiTimings) {
    const fajrMinutes = timeToMinutes(apiTimings.Fajr);
    const sunriseMinutes = timeToMinutes(apiTimings.Sunrise);
    const dhuhrMinutes = timeToMinutes(apiTimings.Dhuhr);
    const asrMinutes = timeToMinutes(apiTimings.Asr);
    const maghribMinutes = timeToMinutes(apiTimings.Maghrib);
    const ishaMinutes = timeToMinutes(apiTimings.Isha);

    return [
        { name: "ফজর", startMinutes: fajrMinutes, startRawTime: apiTimings.Fajr, endMinutes: sunriseMinutes - 5, endRawTime: formatTimeFromMinutes(sunriseMinutes - 5) },
        { name: "যোহর", startMinutes: dhuhrMinutes, startRawTime: apiTimings.Dhuhr, endMinutes: asrMinutes, endRawTime: apiTimings.Asr },
        { name: "আসর", startMinutes: asrMinutes, startRawTime: apiTimings.Asr, endMinutes: maghribMinutes - 1, endRawTime: formatTimeFromMinutes(maghribMinutes - 1) },
        { name: "মাগরিব", startMinutes: maghribMinutes, startRawTime: apiTimings.Maghrib, endMinutes: ishaMinutes - 1, endRawTime: formatTimeFromMinutes(ishaMinutes - 1) },
        { name: "ইশা", startMinutes: ishaMinutes, startRawTime: apiTimings.Isha, endMinutes: 1440, endRawTime: "12:00 AM" }
    ];
}

// ===== GET ACTIVE PRAYER =====
function getActivePrayerInfo() {
    if (!prayerTimeList.length) return null;
    const now = getCurrentTime();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < prayerTimeList.length; i++) {
        const prayer = prayerTimeList[i];
        if (currentMinutes >= prayer.startMinutes && currentMinutes < prayer.endMinutes) {
            return {
                type: 'active',
                currentPrayer: prayer,
                targetTime: prayer.endMinutes,
                targetRawTime: prayer.endRawTime,
                targetName: prayer.name,
                startRawTime: prayer.startRawTime
            };
        }
    }

    let nextPrayer = null;
    let minDiff = Infinity;
    for (let i = 0; i < prayerTimeList.length; i++) {
        const prayer = prayerTimeList[i];
        let startTime = prayer.startMinutes;
        if (startTime < currentMinutes) startTime += 1440;
        const diff = startTime - currentMinutes;
        if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            nextPrayer = { ...prayer, startMinutes: startTime };
        }
    }

    if (nextPrayer) {
        return {
            type: 'waiting',
            currentPrayer: null,
            nextPrayer: nextPrayer,
            targetTime: nextPrayer.startMinutes,
            targetRawTime: nextPrayer.startRawTime,
            targetName: nextPrayer.name,
            startRawTime: nextPrayer.startRawTime
        };
    }
    return null;
}

function getCurrentPrayerStartTime() {
    if (!prayerTimeList.length) return '--:-- --';
    const now = getCurrentTime();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < prayerTimeList.length; i++) {
        const prayer = prayerTimeList[i];
        if (currentMinutes >= prayer.startMinutes && currentMinutes < prayer.endMinutes) {
            return formatTimeDisplay(prayer.startRawTime);
        }
    }
    return '--:-- --';
}

function getCurrentPrayerEndTime() {
    if (!prayerTimeList.length) return '--:-- --';
    const now = getCurrentTime();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < prayerTimeList.length; i++) {
        const prayer = prayerTimeList[i];
        if (currentMinutes >= prayer.startMinutes && currentMinutes < prayer.endMinutes) {
            return formatTimeDisplay(prayer.endRawTime);
        }
    }
    return '--:-- --';
}

// ===== TIMER UPDATE =====
function updateTimer() {
    if (!prayerTimeList.length) return;
    const prayerInfo = getActivePrayerInfo();
    if (!prayerInfo) return;

    const now = getCurrentTime();
    const currentSeconds = (now.getHours() * 60 + now.getMinutes()) * 60 + now.getSeconds();
    let targetSeconds = prayerInfo.targetTime * 60;
    if (targetSeconds < currentSeconds) targetSeconds += 86400;
    let remainingSeconds = targetSeconds - currentSeconds;
    if (remainingSeconds < 0) remainingSeconds = 0;

    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = remainingSeconds % 60;
    const countEl = document.getElementById('timerCountdownText');
    if (countEl) countEl.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;

    let totalDuration;
    if (prayerInfo.type === 'active') {
        totalDuration = (prayerInfo.targetTime - prayerInfo.currentPrayer.startMinutes) * 60;
        if (totalDuration <= 0) totalDuration = remainingSeconds;
    } else {
        totalDuration = remainingSeconds;
    }
    const elapsed = totalDuration > 0 ? Math.min(1, Math.max(0, (totalDuration - remainingSeconds) / totalDuration)) : 0;
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - elapsed);
    const progressCircle = document.getElementById('timerProgressCircle');
    if (progressCircle) {
        progressCircle.style.strokeDasharray = circumference.toFixed(2);
        progressCircle.style.strokeDashoffset = dashOffset.toFixed(2);
    }

    // Update UI
    if (prayerInfo.type === 'active') {
        const chip = document.getElementById('prayerStateChip');
        const chipTxt = document.getElementById('prayerStateTxt');
        if (chip) { chip.className = 'prayer-state-chip active'; }
        if (chipTxt) chipTxt.textContent = 'নামাজের সময়';
        
        const nameEl = document.getElementById('activePrayerName');
        if (nameEl) nameEl.textContent = prayerInfo.targetName;
        
        const startEl = document.getElementById('startTimePill');
        const endEl = document.getElementById('endTimePill');
        if (startEl) startEl.textContent = `🕌 শুরু: ${formatTimeDisplay(prayerInfo.currentPrayer.startRawTime)}`;
        if (endEl) endEl.textContent = `🔚 শেষ: ${formatTimeDisplay(prayerInfo.targetRawTime)}`;

        const sublabel = document.getElementById('timerSublabel');
        if (sublabel) sublabel.textContent = 'বাকি';
    } else {
        const chip = document.getElementById('prayerStateChip');
        const chipTxt = document.getElementById('prayerStateTxt');
        if (chip) { chip.className = 'prayer-state-chip waiting'; }
        if (chipTxt) chipTxt.textContent = 'পরবর্তী: ' + prayerInfo.targetName;
        
        const nameEl = document.getElementById('activePrayerName');
        if (nameEl) nameEl.textContent = prayerInfo.targetName;
        
        const startEl = document.getElementById('startTimePill');
        const endEl = document.getElementById('endTimePill');
        if (startEl) startEl.textContent = `🕌 শুরু: ${formatTimeDisplay(prayerInfo.targetRawTime)}`;
        if (endEl && prayerInfo.nextPrayer) endEl.textContent = `🔚 শেষ: ${formatTimeDisplay(prayerInfo.nextPrayer.endRawTime)}`;

        const sublabel = document.getElementById('timerSublabel');
        if (sublabel) sublabel.textContent = 'পরে';
    }

    // Update prayer times display
    const startTimeEl = document.getElementById('currentPrayerStartTime');
    if (startTimeEl) {
        startTimeEl.textContent = getCurrentPrayerStartTime();
    }
    
    const endTimeEl = document.getElementById('currentPrayerEndTime');
    if (endTimeEl) {
        endTimeEl.textContent = getCurrentPrayerEndTime();
    }
}

// ===== STORAGE FUNCTIONS =====
function savePrayerTimes(pt) {
    const cacheData = {
        prayerTimes: pt,
        date: getTodayKey(),
        timestamp: Date.now()
    };
    localStorage.setItem('deen_prayer_times', JSON.stringify(cacheData));
}

function loadPrayerTimes() {
    const saved = localStorage.getItem('deen_prayer_times');
    if (saved) {
        const data = JSON.parse(saved);
        if (data.prayerTimes) {
            prayerTimeList = data.prayerTimes;
            return true;
        }
    }
    return false;
}

const fallbackTimings = { 
    Fajr: "5:00 AM", 
    Sunrise: "6:22 AM", 
    Dhuhr: "11:54 AM", 
    Asr: "3:20 PM", 
    Maghrib: "5:25 PM", 
    Isha: "6:47 PM" 
};

async function fetchPrayerTimes() {
    try {
        const response = await fetch("https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=2");
        if (response.ok) {
            const data = await response.json();
            if (data.code === 200 && data.data) {
                prayerTimeList = calculatePrayerTimes(data.data.timings);
                savePrayerTimes(prayerTimeList);
                
                const greg = data.data.date.gregorian;
                const hijri = data.data.date.hijri;
                const gregEl = document.getElementById('gregDateText');
                if (gregEl) gregEl.innerText = `${greg.day} ${greg.month.en} ${greg.year}`;
                const hijriEl = document.getElementById('arabicMonthText');
                if (hijriEl) hijriEl.innerHTML = `${hijri.day} ${hijri.month.ar} ${hijri.year}`;
                
                isOnline = true;
                updateNetworkStatus(true);
                return true;
            }
        }
        throw new Error('API failed');
    } catch (e) {
        console.log('Offline mode - using cached data');
        isOnline = false;
        updateNetworkStatus(false);
        
        if (!loadPrayerTimes()) {
            prayerTimeList = calculatePrayerTimes(fallbackTimings);
            savePrayerTimes(prayerTimeList);
        }
        
        const gregEl = document.getElementById('gregDateText');
        if (gregEl) gregEl.innerText = new Date(getCurrentTime()).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
        const hijriEl = document.getElementById('arabicMonthText');
        if (hijriEl) hijriEl.innerHTML = '২৭ শাওয়াল ১৪৪৬';
        return false;
    }
}

function updateNetworkStatus(isConnected) {
    const locationSpan = document.querySelector('.status-location span');
    if (locationSpan) {
        if (!isConnected) {
            locationSpan.innerHTML = '📱 অফলাইন মোড';
        } else {
            locationSpan.innerHTML = 'ঢাকা, বাংলাদেশ 🛰️';
        }
    }
}

// ===== WEEKLY DATA =====
function loadWeeklyData() {
    const saved = localStorage.getItem('weeklyPrayerTracker');
    if (saved) { 
        try { 
            weeklyData = JSON.parse(saved); 
        } catch(e) { 
            weeklyData = {}; 
        } 
    }
    if (!weeklyData || Object.keys(weeklyData).length === 0) {
        weeklyData = {};
    }
}

function saveWeeklyData() {
    localStorage.setItem('weeklyPrayerTracker', JSON.stringify(weeklyData));
}

function getDayPrayers(dateKey) {
    if (!weeklyData[dateKey]) {
        weeklyData[dateKey] = { "ফজর":"pending","যোহর":"pending","আসর":"pending","মাগরিব":"pending","ইশা":"pending" };
        saveWeeklyData();
    }
    return weeklyData[dateKey];
}

function updatePrayerStatus(dateKey, prayerName, status) {
    if (!weeklyData[dateKey]) getDayPrayers(dateKey);
    weeklyData[dateKey][prayerName] = status;
    saveWeeklyData();
    renderAll();
    if (recordModalDateKey === dateKey) renderRecordModal(dateKey);
    showToast(status === 'completed' ? `✅ ${prayerName} আদায় হয়েছে` : status === 'missed' ? `❌ ${prayerName} কাযা` : `⭕ ${prayerName} বাকি`);
}

function renderAll() {
    renderWeeklyCalendar();
    renderTodayCircles();
    renderWeeklyStats();
}

// ===== RENDER FUNCTIONS =====
function renderWeeklyCalendar() {
    const container = document.getElementById('weekDaysStrip');
    const rangeElem = document.getElementById('weekCalRange');
    if (!container) return;
    const weekDates = getWeekDates();
    const todayStr = getTodayKey();
    const dayNames = ['রবি', 'সোম', 'মঙ্গ', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
    if (rangeElem) rangeElem.textContent = `${weekDates[0].getDate()}/${weekDates[0].getMonth()+1} – ${weekDates[6].getDate()}/${weekDates[6].getMonth()+1}`;

    container.innerHTML = weekDates.map(date => {
        const dk = formatDateKey(date);
        const prayers = weeklyData[dk] || {};
        const completed = Object.values(prayers).filter(s => s === 'completed').length;
        const isToday = dk === todayStr;
        const isFuture = dk > todayStr;
        const pct = completed > 0 ? Math.round((completed / 5) * 100) : 0;
        const circumference = 2 * Math.PI * 10;
        const dashOffset = circumference * (1 - pct / 100);
        return `
            <div class="cal-day${isToday ? ' cal-today' : ''}${isFuture ? ' cal-future' : ''}" data-date="${dk}">
                <div class="cal-day-name">${dayNames[date.getDay()]}</div>
                <div class="cal-day-num">${date.getDate()}</div>
                <div class="cal-ring">
                    <svg viewBox="0 0 26 26">
                        <circle class="cal-ring-bg" cx="13" cy="13" r="10" stroke-width="3"/>
                        <circle class="cal-ring-fill" cx="13" cy="13" r="10" stroke-width="3"
                            style="stroke-dasharray:${circumference.toFixed(2)};stroke-dashoffset:${dashOffset.toFixed(2)};transform:rotate(-90deg);transform-origin:center;${isFuture?'stroke:transparent':''}"/>
                    </svg>
                </div>
                <div class="cal-pct">${isFuture ? '–' : pct + '%'}</div>
            </div>
        `;
    }).join('');

    container.querySelectorAll('.cal-day:not(.cal-future)').forEach(card => {
        card.addEventListener('click', () => openRecordModal(card.dataset.date));
    });
}

function renderTodayCircles() {
    const todayKey = getTodayKey();
    const prayers = getDayPrayers(todayKey);
    let done = 0;

    prayerNames.forEach((prayer, idx) => {
        const status = prayers[prayer] || 'pending';
        if (status === 'completed') done++;
        const btn = document.querySelector(`.p-circle[data-prayer-index="${idx}"]`);
        if (btn) btn.className = `p-circle ${status}`;
        const countSpan = document.getElementById(`circleCount${idx}`);
        if (countSpan) {
            if (status === 'completed') countSpan.textContent = '১/২';
            else if (status === 'missed') countSpan.textContent = '২/২';
            else countSpan.textContent = '০/২';
        }
    });

    const badge = document.getElementById('trackerTotalCount');
    if (badge) badge.textContent = `${done}/৫ (${Math.round(done/5*100)}%)`;
    const bar = document.getElementById('progressFillBar');
    if (bar) bar.style.width = `${(done/5)*100}%`;

    const todayDoneEl = document.getElementById('todayDone');
    if (todayDoneEl) todayDoneEl.textContent = `${done}/৫`;
}

function renderWeeklyStats() {
    const weekDates = getWeekDates();
    let totalCompleted = 0;
    let consecutiveDays = 0;

    for (let i = 0; i < weekDates.length; i++) {
        const dk = formatDateKey(weekDates[i]);
        if (dk > getTodayKey()) continue;
        const prayers = weeklyData[dk] || {};
        const completed = Object.values(prayers).filter(s => s === 'completed').length;
        totalCompleted += completed;
        if (completed === 5) consecutiveDays++;
        else consecutiveDays = 0;
    }

    const weekProgress = Math.round((totalCompleted / 35) * 100);
    const streakEl = document.getElementById('streakCount');
    const weekEl = document.getElementById('weeklyProgress');
    const totalEl = document.getElementById('totalCompleted');
    if (streakEl) streakEl.textContent = consecutiveDays;
    if (weekEl) weekEl.textContent = `${weekProgress}%`;
    if (totalEl) totalEl.textContent = totalCompleted;

    const statsRange = document.getElementById('statsRange');
    if (statsRange) statsRange.textContent = `${weekDates[0].getDate()}/${weekDates[0].getMonth()+1} – ${weekDates[6].getDate()}/${weekDates[6].getMonth()+1}`;
}

// ===== RECORD MODAL =====
function openRecordModal(dateKey) {
    recordModalDateKey = dateKey;
    renderRecordModal(dateKey);
    document.getElementById('recordModal').classList.add('show');
}

function closeRecordModal() {
    document.getElementById('recordModal').classList.remove('show');
    recordModalDateKey = null;
}

function renderRecordModal(dateKey) {
    const prayers = getDayPrayers(dateKey);
    const date = new Date(dateKey + 'T00:00:00');
    const dayNames = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const monthNames = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    const isFuture = dateKey > getTodayKey();

    const dayNameEl = document.getElementById('recordModalDayName');
    if (dayNameEl) dayNameEl.textContent = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
    const doneCount = Object.values(prayers).filter(s => s === 'completed').length;
    const countEl = document.getElementById('recordModalCount');
    if (countEl) countEl.textContent = `${doneCount}/৫ সম্পন্ন`;

    const listEl = document.getElementById('recordPrayerList');
    if (!listEl) return;

    listEl.innerHTML = prayerNames.map((prayer, idx) => {
        const status = prayers[prayer] || 'pending';
        const disabled = isFuture ? 'disabled' : '';
        return `
            <div class="record-row">
                <div class="record-row-left">
                    <img src="${prayerImages[idx]}" alt="${prayer}">
                    <span class="record-row-name">${prayer}</span>
                </div>
                <div class="rec-btns">
                    <button class="rec-btn ${status === 'completed' ? 'done-active' : ''}" data-prayer="${prayer}" data-val="completed" ${disabled}>✓ আদায়</button>
                    <button class="rec-btn ${status === 'missed' ? 'missed-active' : ''}" data-prayer="${prayer}" data-val="missed" ${disabled}>✗ কাযা</button>
                    <button class="rec-btn ${status === 'pending' ? 'pending-active' : ''}" data-prayer="${prayer}" data-val="pending" ${disabled}>○ বাকি</button>
                </div>
            </div>
        `;
    }).join('');

    listEl.querySelectorAll('.rec-btn:not([disabled])').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            updatePrayerStatus(dateKey, btn.dataset.prayer, btn.dataset.val);
        });
    });
}

// ===== THEME =====
function setThemeMode(mode) {
    if (mode === 'dark') document.body.classList.add('dark');
    else if (mode === 'light') document.body.classList.remove('dark');
    else {
        window.matchMedia('(prefers-color-scheme:dark)').matches
            ? document.body.classList.add('dark')
            : document.body.classList.remove('dark');
    }
    localStorage.setItem('deen_theme', mode);
    document.querySelectorAll('.theme-opt').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === mode);
    });
}

function initTheme() {
    const saved = localStorage.getItem('deen_theme') || 'light';
    setThemeMode(saved);
    document.querySelectorAll('.theme-opt').forEach(btn => {
        btn.addEventListener('click', () => {
            setThemeMode(btn.dataset.theme);
            showToast(btn.dataset.theme === 'dark' ? '🌙 ডার্ক মোড সক্রিয়' : btn.dataset.theme === 'light' ? '☀️ লাইট মোড সক্রিয়' : '📱 সিস্টেম থিম সক্রিয়');
        });
    });
}

// ===== TOAST =====
function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
}

// ===== INITIALIZATION =====
async function init() {
    initTheme();
    loadWeeklyData();
    
    showToast('🛰️ স্যাটেলাইট সময় সিঙ্ক হচ্ছে...');
    await fetchNTPTime();
    await fetchPrayerTimes();
    
    renderWeeklyCalendar();
    renderTodayCircles();
    renderWeeklyStats();
    
    if (currentTimerInterval) clearInterval(currentTimerInterval);
    updateTimer();
    currentTimerInterval = setInterval(updateTimer, 1000);

    // Settings modal
    const settingsModal = document.getElementById('settingsModal');
    const openBtn = document.getElementById('openSettingsBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    if (openBtn) openBtn.onclick = () => settingsModal?.classList.add('show');
    if (closeBtn) closeBtn.onclick = () => settingsModal?.classList.remove('show');
    if (settingsModal) settingsModal.onclick = e => { if (e.target === settingsModal) settingsModal.classList.remove('show'); };

    // Record modal
    document.getElementById('recordCloseBtn')?.addEventListener('click', closeRecordModal);
    const recModal = document.getElementById('recordModal');
    if (recModal) recModal.onclick = e => { if (e.target === recModal) closeRecordModal(); };

    // Prayer circles
    document.querySelectorAll('.p-circle').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.prayerIndex);
            const prayer = prayerNames[idx];
            const today = getTodayKey();
            const prayers = getDayPrayers(today);
            const cur = prayers[prayer] || 'pending';
            const next = cur === 'pending' ? 'completed' : cur === 'completed' ? 'missed' : 'pending';
            updatePrayerStatus(today, prayer, next);
            btn.style.transform = 'scale(1.2)';
            setTimeout(() => { btn.style.transform = ''; }, 300);
        });
    });

    // Action items
    document.querySelectorAll('.action-item').forEach(item => {
        item.addEventListener('click', () => showToast(`✨ ${item.dataset.feature} শীঘ্রই আসছে`));
    });

    // Nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const label = btn.querySelector('.nav-label')?.textContent || '';
            showToast(`🔹 ${label}`);
        });
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', init);