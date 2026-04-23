// ========== SALAH PAGE SCRIPT ==========
const prayerNamesSalah = ["ফজর", "যোহর", "আসর", "মাগরিব", "ইশা"];
const prayerImagesSalah = [
  "image/fozor.png",
  "image/zohor.png",
  "image/asor.png",
  "image/magrib.png",
  "image/isa.png"
];

// Rakat information
const prayerRakatSalah = {
  "ফজর": "২ রাকাত ফরজ + ২ রাকাত সুন্নত",
  "যোহর": "৪ রাকাত ফরজ + ৪ রাকাত সুন্নত + ২ রাকাত নফল",
  "আসর": "৪ রাকাত ফরজ",
  "মাগরিব": "৩ রাকাত ফরজ + ২ রাকাত সুন্নত",
  "ইশা": "৪ রাকাত ফরজ + ৪ রাকাত সুন্নত + ৩ রাকাত বিতর"
};

let weeklyDataSalah = {};

// ========== DATE UTILITIES ==========
function formatDateKeySalah(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTodayKeySalah() {
  return formatDateKeySalah(new Date());
}

function getWeekStartSalah(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function getWeekDatesSalah() {
  const start = getWeekStartSalah(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function timeToMinutesSalah(t) {
  if (!t) return 0;
  const s = t.trim();
  if (s.includes("AM") || s.includes("PM")) {
    const m = s.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (m) {
      let h = parseInt(m[1]), mn = parseInt(m[2]);
      const p = m[3].toUpperCase();
      if (p === "PM" && h !== 12) h += 12;
      if (p === "AM" && h === 12) h = 0;
      return h * 60 + mn;
    }
  }
  const p = s.split(":");
  if (p.length >= 2) return parseInt(p[0]) * 60 + parseInt(p[1]);
  return 0;
}

function formatTimeDisplaySalah(t) {
  if (!t) return "--:--";
  if (t.includes("AM") || t.includes("PM")) return t;
  const p = t.split(":");
  if (p.length >= 2) {
    let h = parseInt(p[0]), m = parseInt(p[1]);
    let period = h >= 12 ? "PM" : "AM";
    let dh = h % 12 === 0 ? 12 : h % 12;
    return `${dh}:${m.toString().padStart(2, "0")} ${period}`;
  }
  return t;
}

function toArabicNumeralsSalah(number) {
  const arabicNumerals = {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
  };
  return number.toString().split('').map(d => arabicNumerals[d] || d).join('');
}

function getArabicMonthNameSalah(englishMonth) {
  const arabicMonths = {
    "Muharram": "ٱلْمُحَرَّم", "Safar": "صَفَر", "Rabi' al-Awwal": "رَبِيع ٱلْأَوَّل",
    "Rabi' al-Thani": "رَبِيع ٱلثَّانِي", "Jumada al-Ula": "جُمَادَىٰ ٱلْأُولَىٰ",
    "Jumada al-Thani": "جُمَادَىٰ ٱلثَّانِيَة", "Rajab": "رَجَب", "Sha'ban": "شَعْبَان",
    "Ramadan": "رَمَضَان", "Shawwal": "شَوَّال", "Dhu al-Qi'dah": "ذُو ٱلْقَعْدَة",
    "Dhu al-Hijjah": "ذُو ٱلْحِجَّة"
  };
  return arabicMonths[englishMonth] || englishMonth;
}

function calculatePrayerTimesFromApi(timings) {
  const fajrTime = timings.Fajr;
  const sunriseTime = timings.Sunrise;
  const dhuhrTime = timings.Dhuhr;
  const asrTime = timings.Asr;
  const maghribTime = timings.Maghrib;
  const ishaTime = timings.Isha;
  
  const fajrMinutes = timeToMinutesSalah(fajrTime);
  const sunriseMinutes = timeToMinutesSalah(sunriseTime);
  const dhuhrMinutes = timeToMinutesSalah(dhuhrTime);
  const asrMinutes = timeToMinutesSalah(asrTime);
  const maghribMinutes = timeToMinutesSalah(maghribTime);
  const ishaMinutes = timeToMinutesSalah(ishaTime);
  
  const fajrEndMinutes = sunriseMinutes - 5;
  const fajrEndTime = formatTimeDisplaySalah(new Date(0,0,0, Math.floor(fajrEndMinutes/60), fajrEndMinutes%60).toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit'}));
  
  const dhuhrEndMinutes = asrMinutes;
  const dhuhrEndTime = asrTime;
  
  const asrEndMinutes = maghribMinutes - 1;
  const asrEndTime = formatTimeDisplaySalah(new Date(0,0,0, Math.floor(asrEndMinutes/60), asrEndMinutes%60).toLocaleTimeString('en-US', {hour:'numeric', minute:'2-digit'}));
  
  const maghribEndMinutes = ishaMinutes - 1;
  const maghribEndTime = ishaTime;
  
  const ishaEndMinutes = 24 * 60;
  const ishaEndTime = "12:00 AM";
  
  return [
    { name: "ফজর", start: fajrTime, end: fajrEndTime, icon: "image/fozor.png" },
    { name: "যোহর", start: dhuhrTime, end: dhuhrEndTime, icon: "image/zohor.png" },
    { name: "আসর", start: asrTime, end: asrEndTime, icon: "image/asor.png" },
    { name: "মাগরিব", start: maghribTime, end: maghribEndTime, icon: "image/magrib.png" },
    { name: "ইশা", start: ishaTime, end: ishaEndTime, icon: "image/isa.png" }
  ];
}

// ========== WEEKLY DATA FUNCTIONS ==========
function loadWeeklyDataSalah() {
  const saved = localStorage.getItem('weeklyPrayerTracker_v2');
  if (saved) {
    try { weeklyDataSalah = JSON.parse(saved); }
    catch { weeklyDataSalah = {}; }
  }
  else weeklyDataSalah = {};
  
  const weekStartKey = formatDateKeySalah(getWeekStartSalah(new Date()));
  const cleaned = {};
  for (const [key, val] of Object.entries(weeklyDataSalah)) {
    if (key >= weekStartKey) cleaned[key] = val;
  }
  weeklyDataSalah = cleaned;
  saveWeeklyDataSalah();
}

function saveWeeklyDataSalah() {
  localStorage.setItem('weeklyPrayerTracker_v2', JSON.stringify(weeklyDataSalah));
}

function getDayPrayersSalah(dateKey) {
  if (!weeklyDataSalah[dateKey]) {
    weeklyDataSalah[dateKey] = {};
    prayerNamesSalah.forEach(p => weeklyDataSalah[dateKey][p] = 'pending');
    saveWeeklyDataSalah();
  }
  return weeklyDataSalah[dateKey];
}

function updatePrayerStatusSalah(dateKey, prayerName, status) {
  if (!weeklyDataSalah[dateKey]) getDayPrayersSalah(dateKey);
  weeklyDataSalah[dateKey][prayerName] = status;
  saveWeeklyDataSalah();
  renderWeeklyCalendarSalah();
  renderTodayCirclesSalah();
  renderWeeklyStatsSalah();
  if (recordModalDateKeySalah === dateKey) renderRecordModalSalah(dateKey);
}

function renderWeeklyCalendarSalah() {
  const container = document.getElementById('weekDaysStrip');
  const rangeElem = document.getElementById('weekCalRange');
  if (!container) return;
  
  const weekDates = getWeekDatesSalah();
  const todayStr = getTodayKeySalah();
  const dayNames = ['রবি', 'সোম', 'মঙ্গ', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
  
  if (rangeElem) {
    const s = weekDates[0], e = weekDates[6];
    rangeElem.textContent = `${s.getDate()}/${s.getMonth() + 1} – ${e.getDate()}/${e.getMonth() + 1}`;
  }
  
  container.innerHTML = weekDates.map(date => {
    const dk = formatDateKeySalah(date);
    const prayers = weeklyDataSalah[dk] || {};
    const completed = Object.values(prayers).filter(s => s === 'completed').length;
    const isToday = dk === todayStr;
    const isFuture = dk > todayStr;
    const pct = completed > 0 ? Math.round((completed / 5) * 100) : 0;
    const dots = prayerNamesSalah.map(p => {
      const st = prayers[p] || 'pending';
      return `<span class="cal-dot ${st}"></span>`;
    }).join('');
    
    return `
      <div class="cal-day${isToday ? ' cal-today' : ''}${isFuture ? ' cal-future' : ''}" data-date="${dk}">
        <div class="cal-day-name">${dayNames[date.getDay()]}</div>
        <div class="cal-day-num">${date.getDate()}</div>
        <div class="cal-dots">${dots}</div>
        <div class="cal-pct">${isFuture ? '–' : pct + '%'}</div>
      </div>`;
  }).join('');
  
  container.querySelectorAll('.cal-day').forEach(card => {
    card.addEventListener('click', () => openRecordModalSalah(card.dataset.date));
  });
  renderWeeklyStatsSalah();
}

function renderWeeklyStatsSalah() {
  const weekDates = getWeekDatesSalah();
  let totalCompletedPrayers = 0;
  let totalPossiblePrayers = weekDates.length * 5;
  
  const dailyStats = weekDates.map(date => {
    const dk = formatDateKeySalah(date);
    const prayers = weeklyDataSalah[dk] || {};
    const completed = Object.values(prayers).filter(s => s === 'completed').length;
    const isFullDay = (completed === 5);
    return {
      dateKey: dk,
      isFullDay: isFullDay,
      completedCount: completed,
      isFuture: dk > getTodayKeySalah()
    };
  });
  
  totalCompletedPrayers = dailyStats.filter(day => !day.isFuture).reduce((sum, day) => sum + day.completedCount, 0);
  
  let consecutiveDays = 0;
  for (let i = dailyStats.length - 1; i >= 0; i--) {
    const day = dailyStats[i];
    if (day.isFuture) continue;
    if (day.isFullDay) {
      consecutiveDays++;
    } else {
      break;
    }
  }
  
  const weekProgress = totalPossiblePrayers > 0 ? Math.round((totalCompletedPrayers / totalPossiblePrayers) * 100) : 0;
  
  const streakEl = document.getElementById('streakCount');
  const progressEl = document.getElementById('weeklyProgress');
  const statsRangeEl = document.getElementById('statsRange');
  
  if (streakEl) streakEl.textContent = consecutiveDays;
  if (progressEl) progressEl.textContent = `${weekProgress}%`;
  
  if (statsRangeEl) {
    const s = weekDates[0];
    const e = weekDates[6];
    statsRangeEl.textContent = `${s.getDate()}/${s.getMonth() + 1} – ${e.getDate()}/${e.getMonth() + 1}`;
  }
}

function renderTodayCirclesSalah() {
  const todayKey = getTodayKeySalah();
  const prayers = getDayPrayersSalah(todayKey);
  let done = 0;
  
  prayerNamesSalah.forEach((prayer, idx) => {
    const status = prayers[prayer] || 'pending';
    if (status === 'completed') done++;
    const btn = document.querySelector(`.circle-btn[data-prayer-index="${idx}"]`);
    if (btn) {
      btn.className = `circle-btn ${status}`;
    }
    const countSpan = document.getElementById(`circleCount${idx}`);
    if (countSpan) {
      let countText = "০/২";
      if (status === 'completed') countText = "১/২";
      else if (status === 'missed') countText = "২/২";
      else countText = "০/২";
      countSpan.textContent = countText;
    }
  });
  
  const totalEl = document.getElementById('trackerTotalCount');
  const fillBar = document.getElementById('progressFillBar');
  if (totalEl) totalEl.innerHTML = `${done}/৫ (${Math.round(done / 5 * 100)}%)`;
  if (fillBar) fillBar.style.width = `${(done / 5) * 100}%`;
}

// ========== RECORD MODAL ==========
let recordModalDateKeySalah = null;

function openRecordModalSalah(dateKey) {
  recordModalDateKeySalah = dateKey;
  renderRecordModalSalah(dateKey);
  document.getElementById('recordModal').classList.add('show');
}

function closeRecordModalSalah() {
  const m = document.getElementById('recordModal');
  if (m) m.classList.remove('show');
  recordModalDateKeySalah = null;
}

function renderRecordModalSalah(dateKey) {
  const prayers = getDayPrayersSalah(dateKey);
  const date = new Date(dateKey + 'T00:00:00');
  const dayNames = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const monthNames = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const todayStr = getTodayKeySalah();
  const isFuture = dateKey > todayStr;
  const dayNameEl = document.getElementById('recordModalDayName');
  const countEl = document.getElementById('recordModalCount');
  const listEl = document.getElementById('recordPrayerList');
  
  if (dayNameEl) dayNameEl.textContent = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
  const done = Object.values(prayers).filter(s => s === 'completed').length;
  if (countEl) countEl.textContent = `${done}/৫ সম্পন্ন`;
  if (!listEl) return;
  
  listEl.innerHTML = prayerNamesSalah.map((prayer, idx) => {
    const status = prayers[prayer] || 'pending';
    const icon = prayerImagesSalah[idx];
    return `
      <div class="record-prayer-row">
        <div class="record-prayer-left">
          <img src="${icon}" style="width:28px;height:28px;object-fit:contain;">
          <span class="record-prayer-name">${prayer}</span>
        </div>
        <div class="record-btns">
          <button class="rec-btn rbtn-done${status === 'completed' ? ' active-done' : ''}" data-prayer="${prayer}" data-val="completed" ${isFuture ? 'disabled' : ''}>✓ আদায়</button>
          <button class="rec-btn rbtn-miss${status === 'missed' ? ' active-missed' : ''}" data-prayer="${prayer}" data-val="missed" ${isFuture ? 'disabled' : ''}>✗ কাযা</button>
          <button class="rec-btn rbtn-pend${status === 'pending' ? ' active-pending' : ''}" data-prayer="${prayer}" data-val="pending" ${isFuture ? 'disabled' : ''}>○ বাকি</button>
        </div>
      </div>`;
  }).join('');
  
  listEl.querySelectorAll('.rec-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      updatePrayerStatusSalah(dateKey, btn.dataset.prayer, btn.dataset.val);
    });
  });
}

// ========== PRAYER DETAIL MODAL ==========
function openPrayerDetailModal(prayer) {
  const modal = document.getElementById('prayerDetailModal');
  const iconContainer = document.getElementById('prayerDetailIcon');
  const nameEl = document.getElementById('prayerDetailName');
  const startEl = document.getElementById('prayerDetailStart');
  const endEl = document.getElementById('prayerDetailEnd');
  const rakatEl = document.getElementById('prayerDetailRakat');
  
  let iconPath = "";
  switch(prayer.name) {
    case "ফজর": iconPath = "image/fozor.png"; break;
    case "যোহর": iconPath = "image/zohor.png"; break;
    case "আসর": iconPath = "image/asor.png"; break;
    case "মাগরিব": iconPath = "image/magrib.png"; break;
    case "ইশা": iconPath = "image/isa.png"; break;
  }
  iconContainer.innerHTML = `<img src="${iconPath}" alt="${prayer.name}">`;
  
  nameEl.textContent = prayer.name;
  startEl.textContent = prayer.start;
  endEl.textContent = prayer.end;
  rakatEl.textContent = prayerRakatSalah[prayer.name];
  
  modal.dataset.currentPrayer = prayer.name;
  modal.classList.add('show');
}

function closePrayerDetailModal() {
  const modal = document.getElementById('prayerDetailModal');
  modal.classList.remove('show');
}

function openRecordFromDetail() {
  const modal = document.getElementById('prayerDetailModal');
  const prayerName = modal.dataset.currentPrayer;
  closePrayerDetailModal();
  
  const today = getTodayKeySalah();
  openRecordModalSalah(today);
}

// ========== RENDER PRAYER TIMES ==========
function renderPrayerTimesSalah(times) {
  const container = document.getElementById('prayerTimingsList');
  container.innerHTML = times.map(prayer => `
    <div class="prayer-time-card" data-prayer-name="${prayer.name}" data-prayer-start="${prayer.start}" data-prayer-end="${prayer.end}">
      <div class="prayer-info-left">
        <div class="prayer-icon"><img src="${prayer.icon}" alt="${prayer.name}"></div>
        <div class="prayer-name-info">
          <h4>${prayer.name}</h4>
          <div class="prayer-time-range">শেষ: ${prayer.end}</div>
        </div>
      </div>
      <div class="prayer-times-right">
        <div class="start-time">${prayer.start}</div>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll('.prayer-time-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const prayerData = {
        name: card.dataset.prayerName,
        start: card.dataset.prayerStart,
        end: card.dataset.prayerEnd
      };
      openPrayerDetailModal(prayerData);
    });
  });
}

// ========== TIMER FUNCTIONS ==========
function updateSalahTimer() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const period = h >= 12 ? "PM" : "AM";
  const dh = h % 12 === 0 ? 12 : h % 12;
  
  const currentTimeDisplay = document.getElementById('currentPrayerTimeDisplay');
  if (currentTimeDisplay) {
    currentTimeDisplay.innerHTML = `${dh}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} <sub>${period}</sub>`;
  }
}

function startTimer() {
  updateSalahTimer();
  setInterval(updateSalahTimer, 1000);
}

// ========== THEME FUNCTIONS ==========
function setThemeModeSalah(mode) {
  if (mode === "dark") document.body.classList.add("dark");
  else if (mode === "light") document.body.classList.remove("dark");
  else {
    window.matchMedia("(prefers-color-scheme:dark)").matches ?
      document.body.classList.add("dark") : document.body.classList.remove("dark");
  }
  localStorage.setItem("deen_theme", mode);
  document.querySelectorAll(".theme-btn").forEach(b =>
    b.classList.toggle("active", b.dataset.theme === mode));
}

function initThemeSalah() {
  setThemeModeSalah(localStorage.getItem("deen_theme") || "light");
  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setThemeModeSalah(btn.dataset.theme);
      const msg = {
        dark: "🌙 ডার্ক মোড সক্রিয়",
        light: "☀️ লাইট মোড সক্রিয়",
        system: "📱 সিস্টেম থিম"
      }[btn.dataset.theme];
      showToastMessageSalah(msg);
    });
  });
}

function initModalSalah() {
  const modal = document.getElementById("settingsModal");
  const ob = document.getElementById("openSettingsBtn");
  const cb = document.getElementById("closeModalBtn");
  if (ob) ob.onclick = () => modal?.classList.add("show");
  if (cb) cb.onclick = () => modal?.classList.remove("show");
  if (modal) modal.onclick = e => { if (e.target === modal) modal.classList.remove("show"); };
}

function showToastMessageSalah(msg) {
  document.querySelector(".toast-msg")?.remove();
  const t = document.createElement("div");
  t.className = "toast-msg";
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(() => t?.parentNode?.removeChild(t), 2200);
}

// ========== FETCH PRAYER TIMES ==========
async function loadPrayerTimesSalah() {
  try {
    const res = await fetch("https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=2");
    const data = await res.json();
    
    if (data.code === 200 && data.data) {
      const timings = data.data.timings;
      const hijri = data.data.date.hijri;
      const greg = data.data.date.gregorian;
      
      const gregStr = `${greg.day} ${greg.month.en} ${greg.year}`;
      const arabicDay = toArabicNumeralsSalah(hijri.day);
      const arabicMonth = getArabicMonthNameSalah(hijri.month.en);
      const arabicYear = toArabicNumeralsSalah(hijri.year);
      const hijriStr = `${arabicDay} ${arabicMonth} ${arabicYear}`;
      
      document.getElementById('gregDateText').innerText = gregStr;
      document.getElementById('arabicMonthText').innerHTML = hijriStr;
      
      const prayerTimes = calculatePrayerTimesFromApi(timings);
      renderPrayerTimesSalah(prayerTimes);
    } else {
      throw new Error();
    }
  } catch (error) {
    console.error("Error loading prayer times:", error);
    showFallbackTimesSalah();
  }
}

function showFallbackTimesSalah() {
  const fallbackTimes = [
    { name: "ফজর", start: "4:26 AM", end: "5:26 AM", icon: "image/fozor.png" },
    { name: "যোহর", start: "11:57 AM", end: "3:23 PM", icon: "image/zohor.png" },
    { name: "আসর", start: "3:23 PM", end: "6:22 PM", icon: "image/asor.png" },
    { name: "মাগরিব", start: "6:23 PM", end: "7:28 PM", icon: "image/magrib.png" },
    { name: "ইশা", start: "7:28 PM", end: "12:00 AM", icon: "image/isa.png" }
  ];
  renderPrayerTimesSalah(fallbackTimes);
  document.getElementById('gregDateText').innerText = new Date().toLocaleDateString('bn-BD');
  document.getElementById('arabicMonthText').innerHTML = "٦ ذُو ٱلْقَعْدَة ١٤٤٧";
}

// ========== INITIALIZATION ==========
function initSalahPage() {
  initThemeSalah();
  initModalSalah();
  loadWeeklyDataSalah();
  renderWeeklyCalendarSalah();
  renderTodayCirclesSalah();
  renderWeeklyStatsSalah();
  loadPrayerTimesSalah();
  startTimer();
  
  document.querySelectorAll('.circle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.prayerIndex);
      const prayer = prayerNamesSalah[idx];
      const today = getTodayKeySalah();
      const prayers = getDayPrayersSalah(today);
      const cur = prayers[prayer] || 'pending';
      const next = cur === 'pending' ? 'completed' : cur === 'completed' ? 'missed' : 'pending';
      updatePrayerStatusSalah(today, prayer, next);
      const labels = {
        completed: `✅ ${prayer} আদায়`,
        missed: `❌ ${prayer} কাযা`,
        pending: `⭕ ${prayer} বাকি`
      };
      showToastMessageSalah(labels[next]);
    });
  });
  
  document.getElementById('recordCloseBtn')?.addEventListener('click', closeRecordModalSalah);
  document.getElementById('recordModal')?.addEventListener('click', e => {
    if (e.target.id === 'recordModal') closeRecordModalSalah();
  });
  
  document.getElementById('prayerDetailCloseBtn')?.addEventListener('click', closePrayerDetailModal);
  document.getElementById('prayerDetailModal')?.addEventListener('click', e => {
    if (e.target.id === 'prayerDetailModal') closePrayerDetailModal();
  });
  document.getElementById('prayerDetailRecordBtn')?.addEventListener('click', openRecordFromDetail);
}

document.addEventListener('DOMContentLoaded', initSalahPage);