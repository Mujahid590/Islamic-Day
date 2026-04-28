// ===== PRAYER DATA =====
const prayerNames = ["ফজর", "যোহর", "আসর", "মাগরিব", "ইশা"];
const prayerImages = [
  "image/fozor.png",
  "image/zohor.png", 
  "image/asor.png",
  "image/magrib.png",
  "image/isa.png"
];

let weeklyData = {};
let recordModalDateKey = null;
let currentTimerInterval = null;
let currentPrayerTimes = null;
let isOnline = navigator.onLine;
let currentCity = "Dhaka";
let currentCountry = "Bangladesh";

// ===== DEFAULT PRAYER TIMES (Fallback for offline) =====
const defaultPrayerTimes = {
  ফজর: { start: "5:00 AM", end: "6:22 AM", iqamah: "5:30 AM" },
  যোহর: { start: "12:00 PM", end: "3:20 PM", iqamah: "1:00 PM" },
  আসর: { start: "3:20 PM", end: "5:25 PM", iqamah: "3:45 PM" },
  মাগরিব: { start: "5:25 PM", end: "6:47 PM", iqamah: "5:30 PM" },
  ইশা: { start: "7:30 PM", end: "5:00 AM", iqamah: "8:00 PM" }
};

// ===== FETCH LIVE PRAYER TIMES FROM API =====
async function fetchLivePrayerTimes(city = currentCity, country = currentCountry) {
  try {
    const method = 2;
    const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=${method}`);
    const data = await response.json();
    
    if (data.code === 200) {
      const timings = data.data.timings;
      
      let nextFajr = timings.Fajr;
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        const nextDayResponse = await fetch(`https://api.aladhan.com/v1/timings/${tomorrowStr}?city=${city}&country=${country}&method=${method}`);
        const nextDayData = await nextDayResponse.json();
        if (nextDayData.code === 200) {
          nextFajr = nextDayData.data.timings.Fajr;
        }
      } catch(e) {
        console.log("Could not fetch next day Fajr, using default");
        nextFajr = "5:00 AM";
      }
      
      const prayers = {
        ফজর: { start: timings.Fajr, end: timings.Sunrise, iqamah: timings.Fajr },
        যোহর: { start: timings.Dhuhr, end: timings.Asr, iqamah: timings.Dhuhr },
        আসর: { start: timings.Asr, end: timings.Maghrib, iqamah: timings.Asr },
        মাগরিব: { start: timings.Maghrib, end: timings.Isha, iqamah: timings.Maghrib },
        ইশা: { start: timings.Isha, end: nextFajr, iqamah: timings.Isha }
      };
      
      localStorage.setItem('cachedPrayerTimes', JSON.stringify({
        times: prayers, city, country,
        date: new Date().toDateString(),
        timestamp: Date.now()
      }));
      
      return prayers;
    }
    throw new Error('API response invalid');
  } catch (error) {
    console.log('Failed to fetch live prayer times:', error);
    return null;
  }
}

// ===== GET PRAYER TIMES (Live or Cached or Default) =====
async function getPrayerTimes() {
  if (navigator.onLine) {
    const liveTimes = await fetchLivePrayerTimes();
    if (liveTimes) {
      currentPrayerTimes = liveTimes;
      return liveTimes;
    }
  }
  
  const cached = localStorage.getItem('cachedPrayerTimes');
  if (cached) {
    const cachedData = JSON.parse(cached);
    if (Date.now() - cachedData.timestamp < 24 * 60 * 60 * 1000) {
      currentPrayerTimes = cachedData.times;
      return cachedData.times;
    }
  }
  
  currentPrayerTimes = defaultPrayerTimes;
  return defaultPrayerTimes;
}

// ===== DATE UTILS =====
function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getWeekDates() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

// ===== HIJRI DATE =====
async function fetchHijriDate() {
  const hijriElement = document.getElementById('settingsHijriDate');
  if (!hijriElement) return;
  
  try {
    if (navigator.onLine) {
      const response = await fetch('https://api.aladhan.com/v1/gToH?date=' + new Date().toLocaleDateString('en-CA'));
      const data = await response.json();
      if (data.code === 200) {
        const hijri = data.data.hijri;
        const arabicMonths = ['মুহররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শা\'বান', 'রমজান', 'শাওয়াল', 'জ্বিলকদ', 'জ্বিলহজ'];
        const arabicMonth = arabicMonths[parseInt(hijri.month.number) - 1];
        const hijriText = `${hijri.day} ${arabicMonth} ${hijri.year}`;
        hijriElement.innerHTML = hijriText;
        localStorage.setItem('cachedHijriDate', JSON.stringify({ date: hijriText, timestamp: Date.now() }));
        return hijriText;
      }
    }
    
    const cached = localStorage.getItem('cachedHijriDate');
    if (cached) {
      const cachedData = JSON.parse(cached);
      hijriElement.innerHTML = cachedData.date;
      return cachedData.date;
    }
    
    hijriElement.innerHTML = 'হিজরি তারিখ';
    return 'হিজরি তারিখ';
  } catch (error) {
    const cached = localStorage.getItem('cachedHijriDate');
    if (cached) {
      const cachedData = JSON.parse(cached);
      hijriElement.innerHTML = cachedData.date;
    } else {
      hijriElement.innerHTML = 'হিজরি তারিখ';
    }
  }
}

// ===== STORAGE FUNCTIONS =====
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
    weeklyData[dateKey] = { "ফজর": "pending", "যোহর": "pending", "আসর": "pending", "মাগরিব": "pending", "ইশা": "pending" };
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
  
  let message = '';
  if (status === 'completed') message = `✅ ${prayerName} আদায় হয়েছে`;
  else if (status === 'missed') message = `❌ ${prayerName} কাজা`;
  else message = `⭕ ${prayerName} বাকি রাখা হয়েছে`;
  showToast(message);
}

// ===== FORMAT TIME =====
function formatTime(timeStr) {
  if (!timeStr) return '--:-- --';
  if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
  const match = timeStr.match(/(\d+):(\d+)/);
  if (match) {
    let hour = parseInt(match[1]);
    const minute = match[2];
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${ampm}`;
  }
  return timeStr;
}

function parseTime(timeStr) {
  if (!timeStr) return 0;
  let cleanTime = timeStr.split('(')[0].trim();
  const match = cleanTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match) {
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }
  const match24 = cleanTime.match(/(\d+):(\d+)/);
  if (match24) return parseInt(match24[1]) * 60 + parseInt(match24[2]);
  return 0;
}

// ===== TIMER FUNCTION =====
function updateTimer() {
  const times = currentPrayerTimes || defaultPrayerTimes;
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  let activePrayer = null;
  let nextPrayer = null;
  let prayerList = Object.keys(times);
  
  for (let i = 0; i < prayerList.length; i++) {
    const prayer = prayerList[i];
    const startTime = parseTime(times[prayer].start);
    let endTime = parseTime(times[prayer].end);
    
    let endTimeAdjusted = endTime;
    let startTimeAdjusted = startTime;
    let currentAdjusted = currentTime;
    
    if (endTime < startTime) endTimeAdjusted = endTime + 1440;
    if (currentAdjusted < startTime && endTimeAdjusted >= startTime) currentAdjusted += 1440;
    
    if (currentAdjusted >= startTime && currentAdjusted < endTimeAdjusted) {
      activePrayer = { name: prayer, start: times[prayer].start, end: times[prayer].end, endMinutes: endTimeAdjusted, startMinutes: startTime };
      break;
    }
  }
  
  if (!activePrayer) {
    for (let i = 0; i < prayerList.length; i++) {
      const prayer = prayerList[i];
      let startTime = parseTime(times[prayer].start);
      let startTimeAdjusted = startTime;
      if (startTimeAdjusted < currentTime) startTimeAdjusted += 1440;
      if (!nextPrayer || startTimeAdjusted < nextPrayer.startMinutes) {
        nextPrayer = { name: prayer, start: times[prayer].start, end: times[prayer].end, startMinutes: startTimeAdjusted };
      }
    }
  }
  
  const targetPrayer = activePrayer || nextPrayer;
  if (targetPrayer) {
    let targetTime = activePrayer ? targetPrayer.endMinutes : targetPrayer.startMinutes;
    let currentTotal = currentTime;
    if (targetTime < currentTotal && !activePrayer) targetTime += 1440;
    if (currentTotal < targetPrayer.startMinutes && !activePrayer) currentTotal += 1440;
    
    let remainingSeconds = (targetTime - currentTotal) * 60 - now.getSeconds();
    if (remainingSeconds < 0) remainingSeconds = 0;
    
    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = remainingSeconds % 60;
    
    const countEl = document.getElementById('timerCountdownText');
    if (countEl) countEl.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    
    let totalDuration = 0, elapsed = 0;
    if (activePrayer) {
      totalDuration = (targetPrayer.endMinutes - targetPrayer.startMinutes) * 60;
      const elapsedSeconds = totalDuration - remainingSeconds;
      elapsed = totalDuration > 0 ? Math.min(1, Math.max(0, elapsedSeconds / totalDuration)) : 0;
    }
    
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - elapsed);
    const progressCircle = document.getElementById('timerProgressCircle');
    if (progressCircle) {
      progressCircle.style.strokeDasharray = circumference.toFixed(2);
      progressCircle.style.strokeDashoffset = dashOffset.toFixed(2);
    }
    
    const nameEl = document.getElementById('activePrayerName');
    if (nameEl) nameEl.textContent = targetPrayer.name;
    const startTimeEl = document.getElementById('currentPrayerStartTime');
    if (startTimeEl) startTimeEl.textContent = formatTime(targetPrayer.start);
    const endTimeEl = document.getElementById('currentPrayerEndTime');
    if (endTimeEl) endTimeEl.textContent = formatTime(targetPrayer.end);
    
    const chip = document.getElementById('prayerStateChip');
    const chipTxt = document.getElementById('prayerStateTxt');
    if (activePrayer) {
      if (chip) chip.className = 'prayer-state-chip active';
      if (chipTxt) chipTxt.textContent = 'নামাজের সময়';
      const sublabel = document.getElementById('timerSublabel');
      if (sublabel) sublabel.textContent = 'বাকি';
    } else if (nextPrayer) {
      if (chip) chip.className = 'prayer-state-chip waiting';
      if (chipTxt) chipTxt.textContent = `পরবর্তী: ${targetPrayer.name}`;
      const sublabel = document.getElementById('timerSublabel');
      if (sublabel) sublabel.textContent = 'বাকি';
    }
  }
}

// ===== RENDER FUNCTIONS =====
function renderTodayCircles() {
  const todayKey = getTodayKey();
  const prayers = getDayPrayers(todayKey);
  let done = 0;
  
  const container = document.getElementById('prayersRowContainer');
  if (container) {
    container.innerHTML = prayerNames.map((prayer, idx) => {
      const status = prayers[prayer] || 'pending';
      if (status === 'completed') done++;
      return `
        <div class="prayer-item" data-prayer-index="${idx}">
          <div class="p-circle ${status}" data-prayer-index="${idx}">
            <img src="${prayerImages[idx]}" alt="${prayer}">
          </div>
          <div class="p-name">${prayer}</div>
          <div class="p-count">${status === 'completed' ? '✓' : (status === 'missed' ? '✗' : '○')}</div>
        </div>
      `;
    }).join('');
    
    document.querySelectorAll('.p-circle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const prayerItem = btn.closest('.prayer-item');
        const idx = parseInt(prayerItem.dataset.prayerIndex);
        const prayer = prayerNames[idx];
        const today = getTodayKey();
        const prayersToday = getDayPrayers(today);
        const cur = prayersToday[prayer] || 'pending';
        const next = cur === 'pending' ? 'completed' : cur === 'completed' ? 'missed' : 'pending';
        updatePrayerStatus(today, prayer, next);
        btn.style.transform = 'scale(1.2)';
        setTimeout(() => { btn.style.transform = ''; }, 300);
      });
    });
  }
  
  const totalCount = `${done}/৫`;
  const badge = document.getElementById('trackerTotalCount');
  if (badge) badge.textContent = totalCount;
  
  const bar = document.getElementById('progressFillBar');
  if (bar) bar.style.width = `${(done / 5) * 100}%`;
  
  const todayDoneEl = document.getElementById('todayDone');
  if (todayDoneEl) todayDoneEl.textContent = `${done}/৫`;
}

function renderWeeklyCalendar() {
  const container = document.getElementById('weekDaysStrip');
  const rangeElem = document.getElementById('weekCalRange');
  if (!container) return;
  
  const weekDates = getWeekDates();
  const todayStr = getTodayKey();
  const dayNames = ['রবি', 'সোম', 'মঙ্গ', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
  
  if (rangeElem) {
    rangeElem.textContent = `${weekDates[0].getDate()}/${weekDates[0].getMonth() + 1} – ${weekDates[6].getDate()}/${weekDates[6].getMonth() + 1}`;
  }
  
  container.innerHTML = weekDates.map(date => {
    const dk = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const prayers = weeklyData[dk] || {};
    const completed = Object.values(prayers).filter(s => s === 'completed').length;
    const isToday = dk === todayStr;
    const isFuture = date > new Date();
    const pct = Math.round((completed / 5) * 100);
    const circumference = 2 * Math.PI * 10;
    const dashOffset = circumference * (1 - pct / 100);
    
    return `
      <div class="cal-day ${isToday ? 'cal-today' : ''} ${isFuture ? 'cal-future' : ''}" data-date="${dk}">
        <div class="cal-day-name">${dayNames[date.getDay()]}</div>
        <div class="cal-day-num">${date.getDate()}</div>
        <div class="cal-ring">
          <svg viewBox="0 0 26 26">
            <circle class="cal-ring-bg" cx="13" cy="13" r="10" stroke-width="3"/>
            <circle class="cal-ring-fill" cx="13" cy="13" r="10" stroke-width="3"
              style="stroke-dasharray:${circumference.toFixed(2)};stroke-dashoffset:${dashOffset.toFixed(2)};transform:rotate(-90deg);transform-origin:center;"/>
          </svg>
        </div>
        <div class="cal-pct">${pct}%</div>
      </div>
    `;
  }).join('');
  
  container.querySelectorAll('.cal-day:not(.cal-future)').forEach(card => {
    card.addEventListener('click', () => openRecordModal(card.dataset.date));
  });
}

function renderWeeklyStats() {
  const weekDates = getWeekDates();
  let totalCompleted = 0;
  let consecutiveDays = 0;
  const todayStr = getTodayKey();
  
  for (let i = 0; i < weekDates.length; i++) {
    const dk = `${weekDates[i].getFullYear()}-${String(weekDates[i].getMonth() + 1).padStart(2, '0')}-${String(weekDates[i].getDate()).padStart(2, '0')}`;
    if (dk > todayStr) continue;
    const prayers = weeklyData[dk] || {};
    const completed = Object.values(prayers).filter(s => s === 'completed').length;
    totalCompleted += completed;
    if (completed === 5) consecutiveDays++;
    else consecutiveDays = 0;
  }
  
  const weekProgress = totalCompleted > 0 ? Math.round((totalCompleted / 35) * 100) : 0;
  
  const streakEl = document.getElementById('streakCount');
  const weekEl = document.getElementById('weeklyProgress');
  const totalEl = document.getElementById('totalCompleted');
  
  if (streakEl) streakEl.textContent = isNaN(consecutiveDays) ? '0' : consecutiveDays;
  if (weekEl) weekEl.textContent = isNaN(weekProgress) ? '0%' : `${weekProgress}%`;
  if (totalEl) totalEl.textContent = isNaN(totalCompleted) ? '0' : totalCompleted;
  
  const statsRange = document.getElementById('statsRange');
  if (statsRange) {
    statsRange.textContent = `${weekDates[0].getDate()}/${weekDates[0].getMonth() + 1} – ${weekDates[6].getDate()}/${weekDates[6].getMonth() + 1}`;
  }
}

async function renderAll() {
  await getPrayerTimes();
  renderWeeklyCalendar();
  renderTodayCircles();
  renderWeeklyStats();
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
  
  const dayNameEl = document.getElementById('recordModalDayName');
  if (dayNameEl) {
    dayNameEl.textContent = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
  }
  
  const doneCount = Object.values(prayers).filter(s => s === 'completed').length;
  const countEl = document.getElementById('recordModalCount');
  if (countEl) countEl.textContent = `${doneCount}/৫ সম্পন্ন`;
  
  const listEl = document.getElementById('recordPrayerList');
  if (!listEl) return;
  
  listEl.innerHTML = prayerNames.map((prayer, idx) => {
    const status = prayers[prayer] || 'pending';
    return `
      <div class="record-row">
        <div class="record-row-left">
          <img src="${prayerImages[idx]}" alt="${prayer}">
          <span class="record-row-name">${prayer}</span>
        </div>
        <div class="rec-btns">
          <button class="rec-btn ${status === 'completed' ? 'done-active' : ''}" data-prayer="${prayer}" data-val="completed">✓ আদায়</button>
          <button class="rec-btn ${status === 'missed' ? 'missed-active' : ''}" data-prayer="${prayer}" data-val="missed">✗ কাজা</button>
          <button class="rec-btn ${status === 'pending' ? 'pending-active' : ''}" data-prayer="${prayer}" data-val="pending">○ বাকি</button>
        </div>
      </div>
    `;
  }).join('');
  
  listEl.querySelectorAll('.rec-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      updatePrayerStatus(dateKey, btn.dataset.prayer, btn.dataset.val);
    });
  });
}

// ===== LOCATION CHANGE =====
async function changeLocation(city) {
  currentCity = city;
  showToast(`📍 অবস্থান পরিবর্তন: ${city}`);
  await getPrayerTimes();
  renderAll();
  updateTimer();
  localStorage.setItem('userCity', city);
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

// ===== OFFLINE STATUS =====
function initOfflineStatus() {
  window.addEventListener('online', async () => {
    showToast('📶 ইন্টারনেট সংযুক্ত হয়েছে। লাইভ সময় লোড হচ্ছে...');
    await getPrayerTimes();
    updateTimer();
    renderAll();
  });
  window.addEventListener('offline', () => {
    showToast('📴 অফলাইন মোড। সংরক্ষিত সময় দেখানো হচ্ছে।');
  });
}

function checkForAppUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
    });
  }
}

// ===== INITIALIZATION =====
async function init() {
  initTheme();
  loadWeeklyData();
  initOfflineStatus();
  
  const savedCity = localStorage.getItem('userCity');
  if (savedCity) {
    currentCity = savedCity;
    const citySelect = document.getElementById('citySelect');
    if (citySelect) citySelect.value = savedCity;
  }
  
  const today = new Date();
  const gregEl = document.getElementById('gregDateText');
  if (gregEl) {
    gregEl.textContent = today.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  
  fetchHijriDate();
  await getPrayerTimes();
  renderAll();
  updateTimer();
  
  if (currentTimerInterval) clearInterval(currentTimerInterval);
  currentTimerInterval = setInterval(updateTimer, 1000);
  
  setInterval(async () => {
    if (navigator.onLine) {
      await getPrayerTimes();
      renderAll();
      updateTimer();
    }
  }, 60 * 60 * 1000);
  
  const settingsModal = document.getElementById('settingsModal');
  const profileBtn = document.getElementById('profileSettingsBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  
  if (profileBtn) {
    const labelSpan = profileBtn.querySelector('.nav-label');
    if (labelSpan) labelSpan.textContent = 'সেটিংস';
    profileBtn.onclick = (e) => {
      e.preventDefault();
      settingsModal?.classList.add('show');
    };
  }
  
  if (closeBtn) closeBtn.onclick = () => settingsModal?.classList.remove('show');
  if (settingsModal) settingsModal.onclick = e => { if (e.target === settingsModal) settingsModal.classList.remove('show'); };
  
  const citySelect = document.getElementById('citySelect');
  if (citySelect) {
    citySelect.addEventListener('change', (e) => {
      changeLocation(e.target.value);
    });
  }
  
  document.getElementById('recordCloseBtn')?.addEventListener('click', closeRecordModal);
  const recModal = document.getElementById('recordModal');
  if (recModal) recModal.onclick = e => { if (e.target === recModal) closeRecordModal(); };
  
  document.querySelectorAll('.action-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const href = item.getAttribute('href');
      if (href && href !== '#') {
        // allow navigation
      } else {
        e.preventDefault();
        showToast(`✨ ${item.dataset.feature || item.querySelector('.action-label')?.textContent} শীঘ্রই আসছে`);
      }
    });
  });
  
  setInterval(checkForAppUpdates, 60 * 60 * 1000);
}

document.addEventListener('DOMContentLoaded', init);