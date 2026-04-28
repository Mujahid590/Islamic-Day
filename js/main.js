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

// ===== DEFAULT PRAYER TIMES (Dhaka, Bangladesh - Fallback) =====
const defaultPrayerTimes = {
  ফজর: { start: "5:00 AM", end: "6:22 AM", iqamah: "5:30 AM" },
  যোহর: { start: "11:54 AM", end: "3:20 PM", iqamah: "1:00 PM" },
  আসর: { start: "3:20 PM", end: "5:25 PM", iqamah: "3:45 PM" },
  মাগরিব: { start: "5:25 PM", end: "6:47 PM", iqamah: "5:30 PM" },
  ইশা: { start: "6:47 PM", end: "5:00 AM", iqamah: "7:30 PM" }
};

// ===== FETCH LIVE PRAYER TIMES FROM API =====
async function fetchLivePrayerTimes() {
  try {
    // Using Aladhan API for Dhaka, Bangladesh
    const city = "Dhaka";
    const country = "Bangladesh";
    const method = 2; // Islamic Society of North America (ISNA)
    
    const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=${method}`);
    const data = await response.json();
    
    if (data.code === 200) {
      const timings = data.data.timings;
      
      // Map API times to our prayer structure with start/end times
      // For end times, we calculate based on next prayer's start
      const prayers = {
        ফজর: { 
          start: timings.Fajr, 
          end: timings.Sunrise,
          iqamah: timings.Fajr
        },
        যোহর: { 
          start: timings.Dhuhr, 
          end: timings.Asr,
          iqamah: timings.Dhuhr
        },
        আসর: { 
          start: timings.Asr, 
          end: timings.Maghrib,
          iqamah: timings.Asr
        },
        মাগরিব: { 
          start: timings.Maghrib, 
          end: timings.Isha,
          iqamah: timings.Maghrib
        },
        ইশা: { 
          start: timings.Isha, 
          end: timings.Fajr,
          iqamah: timings.Isha
        }
      };
      
      // Store in localStorage as backup
      localStorage.setItem('cachedPrayerTimes', JSON.stringify({
        times: prayers,
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
  // Try to get live times first
  if (navigator.onLine) {
    const liveTimes = await fetchLivePrayerTimes();
    if (liveTimes) {
      currentPrayerTimes = liveTimes;
      return liveTimes;
    }
  }
  
  // If offline or API failed, try cached times
  const cached = localStorage.getItem('cachedPrayerTimes');
  if (cached) {
    const cachedData = JSON.parse(cached);
    // Check if cache is from today (not older than 24 hours)
    const cacheAge = Date.now() - cachedData.timestamp;
    if (cacheAge < 24 * 60 * 60 * 1000) {
      currentPrayerTimes = cachedData.times;
      return cachedData.times;
    }
  }
  
  // Fallback to default times
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
  const hijriElement = document.getElementById('arabicMonthText');
  if (!hijriElement) return;
  
  try {
    if (navigator.onLine) {
      const response = await fetch('https://api.aladhan.com/v1/gToH?date=' + new Date().toLocaleDateString('en-CA'));
      const data = await response.json();
      if (data.code === 200) {
        const hijri = data.data.hijri;
        const arabicMonths = ['মুহররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শা\'বান', 'রমজান', 'শাওয়াল', 'জ্বিলকদ', 'জ্বিলহজ'];
        const arabicMonth = arabicMonths[parseInt(hijri.month.number) - 1];
        hijriElement.innerHTML = `${hijri.day} ${arabicMonth} ${hijri.year}`;
        
        // Cache hijri date
        localStorage.setItem('cachedHijriDate', JSON.stringify({
          date: `${hijri.day} ${arabicMonth} ${hijri.year}`,
          timestamp: Date.now()
        }));
        return;
      }
    }
    
    // Try cached hijri date
    const cached = localStorage.getItem('cachedHijriDate');
    if (cached) {
      const cachedData = JSON.parse(cached);
      hijriElement.innerHTML = cachedData.date;
      return;
    }
    
    hijriElement.innerHTML = 'হিজরি তারিখ';
  } catch (error) {
    console.log('Hijri date fetch failed:', error);
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

// ===== FORMAT TIME (12-hour format with AM/PM) =====
function formatTime(timeStr) {
  if (!timeStr) return '--:-- --';
  
  // Handle different time formats
  if (timeStr.includes('AM') || timeStr.includes('PM')) {
    return timeStr;
  }
  
  // Convert 24-hour to 12-hour format
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

// ===== TIMER FUNCTIONS =====
function parseTime(timeStr) {
  let cleanTime = timeStr;
  if (timeStr.includes('(')) {
    cleanTime = timeStr.split('(')[0].trim();
  }
  
  const match = cleanTime.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (match) {
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }
  return 0;
}

function updateTimer() {
  const times = currentPrayerTimes || defaultPrayerTimes;
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = hours * 60 + minutes;
  
  let activePrayer = null;
  let nextPrayer = null;
  let prayerList = Object.keys(times);
  
  // Find active prayer (within time range)
  for (let i = 0; i < prayerList.length; i++) {
    const prayer = prayerList[i];
    const startTime = parseTime(times[prayer].start);
    let endTime = parseTime(times[prayer].end);
    
    // Handle overnight prayers (like Isha ending after midnight)
    let endTimeAdjusted = endTime;
    if (endTime < startTime) endTimeAdjusted = endTime + 1440;
    let currentAdjusted = currentTime;
    if (currentAdjusted < startTime && endTimeAdjusted < startTime) currentAdjusted += 1440;
    
    if (currentAdjusted >= startTime && currentAdjusted < endTimeAdjusted) {
      activePrayer = { 
        name: prayer, 
        start: formatTime(times[prayer].start), 
        end: formatTime(times[prayer].end), 
        endMinutes: endTimeAdjusted 
      };
      break;
    }
  }
  
  // Find next prayer if no active prayer
  if (!activePrayer) {
    for (let i = 0; i < prayerList.length; i++) {
      const prayer = prayerList[i];
      let startTime = parseTime(times[prayer].start);
      if (startTime < currentTime) startTime += 1440;
      if (!nextPrayer || startTime < nextPrayer.startMinutes) {
        nextPrayer = { 
          name: prayer, 
          start: formatTime(times[prayer].start), 
          end: formatTime(times[prayer].end), 
          startMinutes: startTime 
        };
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
    
    // Calculate progress circle
    let totalDuration = activePrayer ? (targetPrayer.endMinutes - parseTime(times[targetPrayer.name].start)) * 60 : remainingSeconds;
    let elapsed = totalDuration > 0 ? Math.min(1, Math.max(0, (totalDuration - remainingSeconds) / totalDuration)) : 0;
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - elapsed);
    const progressCircle = document.getElementById('timerProgressCircle');
    if (progressCircle) {
      progressCircle.style.strokeDasharray = circumference.toFixed(2);
      progressCircle.style.strokeDashoffset = dashOffset.toFixed(2);
    }
    
    // Update UI
    const nameEl = document.getElementById('activePrayerName');
    if (nameEl) nameEl.textContent = targetPrayer.name;
    
    const startTimeEl = document.getElementById('currentPrayerStartTime');
    if (startTimeEl) startTimeEl.textContent = targetPrayer.start;
    
    const endTimeEl = document.getElementById('currentPrayerEndTime');
    if (endTimeEl) endTimeEl.textContent = targetPrayer.end;
    
    const chip = document.getElementById('prayerStateChip');
    const chipTxt = document.getElementById('prayerStateTxt');
    if (activePrayer) {
      if (chip) chip.className = 'prayer-state-chip active';
      if (chipTxt) chipTxt.textContent = 'নামাজের সময়';
      const sublabel = document.getElementById('timerSublabel');
      if (sublabel) sublabel.textContent = 'বাকি';
    } else {
      if (chip) chip.className = 'prayer-state-chip waiting';
      if (chipTxt) chipTxt.textContent = `পরবর্তী: ${targetPrayer.name}`;
      const sublabel = document.getElementById('timerSublabel');
      if (sublabel) sublabel.textContent = 'পরে';
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
      const countText = status === 'completed' ? '১/২' : (status === 'missed' ? '২/২' : '০/২');
      return `
        <div class="prayer-item" data-prayer-index="${idx}">
          <div class="p-circle ${status}" data-prayer-index="${idx}">
            <img src="${prayerImages[idx]}" alt="${prayer}">
          </div>
          <div class="p-name">${prayer}</div>
          <div class="p-count">${countText}</div>
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
  
  const totalCount = `${done}/৫ (${Math.round(done/5*100)}%)`;
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
  
  const weekProgress = Math.round((totalCompleted / 35) * 100);
  
  const streakEl = document.getElementById('streakCount');
  const weekEl = document.getElementById('weeklyProgress');
  const totalEl = document.getElementById('totalCompleted');
  if (streakEl) streakEl.textContent = consecutiveDays;
  if (weekEl) weekEl.textContent = `${weekProgress}%`;
  if (totalEl) totalEl.textContent = totalCompleted;
  
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

// ===== SERVICE WORKER UPDATE CHECK =====
function checkForAppUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
      console.log('Checking for app updates...');
    });
  }
}

// ===== INITIALIZATION =====
async function init() {
  initTheme();
  loadWeeklyData();
  initOfflineStatus();
  
  // Set gregorian date
  const today = new Date();
  const gregEl = document.getElementById('gregDateText');
  if (gregEl) {
    gregEl.textContent = today.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  
  // Fetch hijri date
  fetchHijriDate();
  
  // Get prayer times and render
  await getPrayerTimes();
  renderAll();
  updateTimer();
  
  // Start timer interval
  if (currentTimerInterval) clearInterval(currentTimerInterval);
  currentTimerInterval = setInterval(updateTimer, 1000);
  
  // Refresh prayer times every hour
  setInterval(async () => {
    if (navigator.onLine) {
      await getPrayerTimes();
      renderAll();
      updateTimer();
    }
  }, 60 * 60 * 1000);
  
  // Settings modal
  const settingsModal = document.getElementById('settingsModal');
  const openBtn = document.getElementById('openSettingsBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  if (openBtn) openBtn.onclick = () => settingsModal?.classList.add('show');
  if (closeBtn) closeBtn.onclick = () => settingsModal?.classList.remove('show');
  if (settingsModal) settingsModal.onclick = e => { if (e.target === settingsModal) settingsModal.classList.remove('show'); };
  
  // Record modal close
  document.getElementById('recordCloseBtn')?.addEventListener('click', closeRecordModal);
  const recModal = document.getElementById('recordModal');
  if (recModal) recModal.onclick = e => { if (e.target === recModal) closeRecordModal(); };
  
  // Quick action items
  document.querySelectorAll('.action-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const href = item.getAttribute('href');
      if (href) {
        window.location.href = href;
      } else {
        showToast(`✨ ${item.dataset.feature || item.querySelector('.action-label')?.textContent} শীঘ্রই আসছে`);
      }
    });
  });
  
  // Bottom navigation buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const href = btn.getAttribute('href');
      if (href && href !== '#') {
        window.location.href = href;
      } else if (btn.dataset.nav === 'home') {
        // Already on home
      } else {
        const label = btn.querySelector('.nav-label')?.textContent || '';
        showToast(`🔹 ${label} শীঘ্রই আসছে`);
      }
    });
  });
  
  // Auto update check every hour
  setInterval(checkForAppUpdates, 60 * 60 * 1000);
}

// Start the app
document.addEventListener('DOMContentLoaded', init);