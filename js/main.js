// ========== CIRCULAR TIMER WITH UNIFORM TICK MARKS ==========
(function() {
  const CX = 74, CY = 74, R = 64, TICKS = 60;
  const svgNS = "http://www.w3.org/2000/svg";
  let tickEls = [];

  function buildTimer() {
    const svg = document.getElementById('timerSvg');
    if (!svg) return;
    svg.innerHTML = '';

    const bgCirc = document.createElementNS(svgNS, 'circle');
    bgCirc.setAttribute('cx', CX); bgCirc.setAttribute('cy', CY);
    bgCirc.setAttribute('r', CX); bgCirc.setAttribute('fill', '#0d2d45');
    svg.appendChild(bgCirc);

    const innerCirc = document.createElementNS(svgNS, 'circle');
    innerCirc.setAttribute('cx', CX); innerCirc.setAttribute('cy', CY);
    innerCirc.setAttribute('r', 52); innerCirc.setAttribute('fill', 'none');
    innerCirc.setAttribute('stroke', 'rgba(255,255,255,0.04)');
    innerCirc.setAttribute('stroke-width', '1');
    svg.appendChild(innerCirc);

    tickEls = [];
    for (let i = 0; i < TICKS; i++) {
      const angleDeg = (i * 360 / TICKS) - 90;
      const angleRad = angleDeg * Math.PI / 180;
      
      const r1 = R - 2;
      const r2 = R - 8;
      
      const x1 = CX + r1 * Math.cos(angleRad);
      const y1 = CY + r1 * Math.sin(angleRad);
      const x2 = CX + r2 * Math.cos(angleRad);
      const y2 = CY + r2 * Math.sin(angleRad);
      
      const line = document.createElementNS(svgNS, 'line');
      line.setAttribute('x1', x1.toFixed(2));
      line.setAttribute('y1', y1.toFixed(2));
      line.setAttribute('x2', x2.toFixed(2));
      line.setAttribute('y2', y2.toFixed(2));
      line.setAttribute('stroke', '#1e4a6a');
      line.setAttribute('stroke-width', '1.4');
      line.setAttribute('stroke-linecap', 'round');
      line.classList.add('timer-tick');
      svg.appendChild(line);
      tickEls.push(line);
    }
  }

  function updateTimerDisplay(remainingSeconds, totalSecs) {
    const countEl = document.getElementById('timerCountdownText');
    if (!countEl) return;

    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = remainingSeconds % 60;
    countEl.textContent = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;

    const elapsed = totalSecs > 0 ? (totalSecs - remainingSeconds) / totalSecs : 0;
    const filledTicks = Math.round(elapsed * TICKS);

    tickEls.forEach((tick, i) => {
      if (i < filledTicks) {
        tick.setAttribute('stroke', '#27ae60');
        tick.setAttribute('opacity', '0.9');
        tick.setAttribute('stroke-width', '1.6');
      } else {
        tick.setAttribute('stroke', '#1e4a6a');
        tick.setAttribute('opacity', '0.55');
        tick.setAttribute('stroke-width', '1.4');
      }
    });
  }

  window._updateCircularTimer = function(remaining, total) {
    updateTimerDisplay(remaining, total);
  };

  document.addEventListener('DOMContentLoaded', buildTimer);
})();

// ========== PRAYER DATA ==========
const prayerNames = ["ফজর", "যোহর", "আসর", "মাগরিব", "ইশা"];
const prayerKeys = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const prayerImages = [
  "image/fozor.png",
  "image/zohor.png",
  "image/asor.png",
  "image/magrib.png",
  "image/isa.png"
];

let prayerTimeList = [];
let currentTimerInterval = null;
let weeklyData = {};
let recordModalDateKey = null;

// Storage keys
const STORAGE_KEYS = {
  PRAYER_TIMES: 'deen_prayer_times',
  PRAYER_TIMES_DATE: 'deen_prayer_times_date',
  GREG_DATE: 'deen_greg_date',
  ARABIC_MONTH: 'deen_arabic_month'
};

// ========== DATE UTILITIES ==========
function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTodayKey() {
  return formatDateKey(new Date());
}

function getWeekStart(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

function getWeekDates() {
  const start = getWeekStart(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

// ========== TIME UTILITIES ==========
function timeToMinutes(t) {
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

function formatTimeDisplay(t) {
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

function formatTimeFromMinutes(minutes) {
  const totalMinutes = minutes % 1440;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const dh = h % 12 === 0 ? 12 : h % 12;
  return `${dh}:${m.toString().padStart(2, "0")} ${period}`;
}

// ========== ARABIC MONTH HELPER FUNCTIONS ==========
function getArabicMonthName(englishMonth) {
  const arabicMonths = {
    "Muharram": "ٱلْمُحَرَّم",
    "Safar": "صَفَر",
    "Rabi' al-Awwal": "رَبِيع ٱلْأَوَّل",
    "Rabi' al-Thani": "رَبِيع ٱلثَّانِي",
    "Jumada al-Ula": "جُمَادَىٰ ٱلْأُولَىٰ",
    "Jumada al-Thani": "جُمَادَىٰ ٱلثَّانِيَة",
    "Rajab": "رَجَب",
    "Sha'ban": "شَعْبَان",
    "Ramadan": "رَمَضَان",
    "Shawwal": "شَوَّال",
    "Dhu al-Qi'dah": "ذُو ٱلْقَعْدَة",
    "Dhu al-Hijjah": "ذُو ٱلْحِجَّة"
  };
  return arabicMonths[englishMonth] || englishMonth;
}

function toArabicNumerals(number) {
  const arabicNumerals = {
    '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
    '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
  };
  return number.toString().split('').map(digit => arabicNumerals[digit] || digit).join('');
}

// ========== CALCULATE PRAYER END TIMES ==========
function calculateEndTime(prayerName, startMinutes, startRawTime, sunriseMinutes, sunsetMinutes, ishaMinutes, midnightMinutes) {
  let endMinutes = startMinutes;
  let endRawTime = startRawTime;
  
  switch (prayerName) {
    case "ফজর":
      if (sunriseMinutes) {
        endMinutes = sunriseMinutes;
        endRawTime = formatTimeFromMinutes(sunriseMinutes);
      } else {
        endMinutes = startMinutes + 90;
        endRawTime = formatTimeFromMinutes(endMinutes);
      }
      break;
    case "যোহর":
      endMinutes = startMinutes + 180;
      endRawTime = formatTimeFromMinutes(endMinutes);
      break;
    case "আসর":
      if (sunsetMinutes) {
        endMinutes = sunsetMinutes;
        endRawTime = formatTimeFromMinutes(sunsetMinutes);
      } else {
        endMinutes = startMinutes + 180;
        endRawTime = formatTimeFromMinutes(endMinutes);
      }
      break;
    case "মাগরিব":
      if (ishaMinutes) {
        endMinutes = ishaMinutes;
        endRawTime = formatTimeFromMinutes(ishaMinutes);
      } else {
        endMinutes = startMinutes + 90;
        endRawTime = formatTimeFromMinutes(endMinutes);
      }
      break;
    case "ইশা":
      if (midnightMinutes) {
        endMinutes = midnightMinutes;
        endRawTime = formatTimeFromMinutes(midnightMinutes);
      } else {
        endMinutes = startMinutes + 120;
        endRawTime = formatTimeFromMinutes(endMinutes);
      }
      break;
  }
  return { endMinutes, endRawTime };
}

// ========== GET CURRENT OR NEXT PRAYER ==========
function getActivePrayerInfo() {
  if (!prayerTimeList.length) return null;
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();
  
  // Check if any prayer is currently active (between start and end time)
  for (let i = 0; i < prayerTimeList.length; i++) {
    const prayer = prayerTimeList[i];
    const endTime = prayer.endMinutes;
    
    if (currentMinutes >= prayer.minutes && currentMinutes < endTime) {
      // Active prayer found
      let nextPrayer = null;
      if (i + 1 < prayerTimeList.length) {
        nextPrayer = prayerTimeList[i + 1];
      } else {
        nextPrayer = prayerTimeList[0];
        nextPrayer = {
          ...nextPrayer,
          minutes: nextPrayer.minutes + 1440,
          endMinutes: nextPrayer.endMinutes + 1440
        };
      }
      
      return {
        type: 'active',
        currentPrayer: prayer,
        targetPrayer: prayer,
        targetTime: endTime,
        targetRawTime: prayer.endRawTime,
        targetName: prayer.name,
        isEndTime: true,
        nextPrayer: nextPrayer
      };
    }
  }
  
  // No active prayer - find next prayer start time
  let nextPrayer = null;
  let minDiff = Infinity;
  
  for (let i = 0; i < prayerTimeList.length; i++) {
    const prayer = prayerTimeList[i];
    let startTime = prayer.minutes;
    
    // For next day prayers
    if (startTime < currentMinutes) {
      startTime += 1440;
    }
    
    const diff = startTime - currentMinutes;
    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextPrayer = { ...prayer, minutes: startTime };
    }
  }
  
  if (nextPrayer) {
    return {
      type: 'waiting',
      currentPrayer: null,
      targetPrayer: nextPrayer,
      targetTime: nextPrayer.minutes,
      targetRawTime: nextPrayer.rawTime,
      targetName: nextPrayer.name,
      isEndTime: false
    };
  }
  
  return null;
}

// ========== UPDATE TIMER ==========
function updateEndTimeTimer() {
  if (!prayerTimeList.length) return;
  
  const prayerInfo = getActivePrayerInfo();
  
  const currentPrayerTimeDisplay = document.getElementById('currentPrayerTimeDisplay');
  const timerLabelTop = document.getElementById('timerLabelTop');
  const remainingTimeDisplay = document.getElementById('remainingTimeDisplay');
  const endTimeDisplayText = document.getElementById('endTimeDisplayText');
  
  if (!prayerInfo) {
    if (timerLabelTop) timerLabelTop.textContent = '--';
    return;
  }
  
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSeconds = now.getSeconds();
  const currentTotalSeconds = currentMinutes * 60 + currentSeconds;
  
  let targetTotalSeconds = prayerInfo.targetTime * 60;
  
  // Handle next day target
  if (targetTotalSeconds < currentTotalSeconds) {
    targetTotalSeconds += 24 * 3600;
  }
  
  let remainingSeconds = targetTotalSeconds - currentTotalSeconds;
  if (remainingSeconds < 0) remainingSeconds = 0;
  
  // Set timer label top
  if (timerLabelTop) {
    if (prayerInfo.type === 'active') {
      timerLabelTop.textContent = prayerInfo.targetName;
    } else {
      timerLabelTop.textContent = `${prayerInfo.targetName} শুরু`;
    }
  }
  
  // Set remaining time display
  if (remainingTimeDisplay) {
    if (prayerInfo.type === 'active') {
      remainingTimeDisplay.innerHTML = `🕌 শুরু: ${formatTimeDisplay(prayerInfo.currentPrayer.rawTime)}`;
    } else {
      remainingTimeDisplay.innerHTML = `🕌 পরবর্তী: ${formatTimeDisplay(prayerInfo.targetRawTime)}`;
    }
  }
  
  // Set end time display
  if (endTimeDisplayText) {
    if (prayerInfo.type === 'active') {
      endTimeDisplayText.innerHTML = `🔚 শেষ: ${formatTimeDisplay(prayerInfo.targetRawTime)}`;
    } else {
      endTimeDisplayText.innerHTML = `🕐 শুরু হতে বাকি`;
    }
  }
  
  // Current time display
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const period = h >= 12 ? "PM" : "AM";
  const dh = h % 12 === 0 ? 12 : h % 12;
  if (currentPrayerTimeDisplay) {
    currentPrayerTimeDisplay.innerHTML = `${dh}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} <sub>${period}</sub>`;
  }
  
  // Calculate max total for progress bar
  let maxTotal = 7200;
  if (prayerInfo.type === 'active') {
    if (prayerInfo.targetName === "ইশা") maxTotal = 14400;
    if (prayerInfo.targetName === "ফজর") maxTotal = 5400;
  } else {
    maxTotal = remainingSeconds;
  }
  
  if (window._updateCircularTimer) {
    window._updateCircularTimer(Math.max(0, remainingSeconds), maxTotal);
  }
}

// ========== SAVE & LOAD PRAYER TIMES ==========
function savePrayerTimesToStorage(prayerTimes, gregDate, arabicMonth) {
  try {
    const data = {
      prayerTimes: prayerTimes,
      savedDate: getTodayKey(),
      gregDate: gregDate,
      arabicMonth: arabicMonth
    };
    localStorage.setItem(STORAGE_KEYS.PRAYER_TIMES, JSON.stringify(data));
    localStorage.setItem(STORAGE_KEYS.PRAYER_TIMES_DATE, getTodayKey());
    if (gregDate) localStorage.setItem(STORAGE_KEYS.GREG_DATE, gregDate);
    if (arabicMonth) localStorage.setItem(STORAGE_KEYS.ARABIC_MONTH, arabicMonth);
    return true;
  } catch (e) {
    console.error("Error saving prayer times:", e);
    return false;
  }
}

function loadPrayerTimesFromStorage() {
  try {
    const savedData = localStorage.getItem(STORAGE_KEYS.PRAYER_TIMES);
    if (!savedData) return null;
    
    const data = JSON.parse(savedData);
    const savedDate = data.savedDate;
    const todayKey = getTodayKey();
    
    if (savedDate === todayKey) {
      return data;
    }
    return null;
  } catch (e) {
    console.error("Error loading prayer times:", e);
    return null;
  }
}

function loadStoredDates() {
  const gregEl = document.getElementById("gregDateText");
  const arabicMonthEl = document.getElementById("arabicMonthText");
  
  const savedGreg = localStorage.getItem(STORAGE_KEYS.GREG_DATE);
  const savedArabicMonth = localStorage.getItem(STORAGE_KEYS.ARABIC_MONTH);
  
  if (gregEl && savedGreg) gregEl.innerText = savedGreg;
  if (arabicMonthEl && savedArabicMonth) arabicMonthEl.innerText = savedArabicMonth;
}

// ========== FETCH PRAYER TIMES FROM API ==========
const fallbackTimings = { Fajr: "05:00", Dhuhr: "12:00", Asr: "15:30", Maghrib: "17:45", Isha: "19:00" };

async function fetchPrayerTimes() {
  const storedData = loadPrayerTimesFromStorage();
  
  if (storedData && storedData.prayerTimes) {
    prayerTimeList = storedData.prayerTimes;
    loadStoredDates();
    showToastMessage("📱 অফলাইন মোড: সংরক্ষিত সময় দেখানো হচ্ছে");
    
    if (currentTimerInterval) clearInterval(currentTimerInterval);
    updateEndTimeTimer();
    currentTimerInterval = setInterval(updateEndTimeTimer, 1000);
    
    updatePrayerTimesInBackground();
  } else {
    showToastMessage("⏳ সময় লোড হচ্ছে...");
    await fetchPrayerTimesFromAPI();
  }
}

async function updatePrayerTimesInBackground() {
  try {
    const res = await fetch("https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=4");
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();
    
    if (data.code === 200 && data.data) {
      const timings = data.data.timings;
      const hijri = data.data.date.hijri;
      const greg = data.data.date.gregorian;
      
      const sunriseMinutes = timeToMinutes(timings.Sunrise || "");
      const sunsetMinutes = timeToMinutes(timings.Sunset || "");
      const ishaMinutes = timeToMinutes(timings.Isha || "");
      const midnightMinutes = timeToMinutes(timings.Midnight || timings.Lastthird || "");
      
      const newPrayerTimes = prayerKeys.map((key, idx) => {
        const startMinutes = timeToMinutes(timings[key]);
        const startRawTime = timings[key];
        const { endMinutes, endRawTime } = calculateEndTime(
          prayerNames[idx], startMinutes, startRawTime,
          sunriseMinutes, sunsetMinutes, ishaMinutes, midnightMinutes
        );
        return {
          name: prayerNames[idx],
          minutes: startMinutes,
          rawTime: startRawTime,
          endMinutes: endMinutes,
          endRawTime: endRawTime
        };
      });
      
      newPrayerTimes.sort((a, b) => a.minutes - b.minutes);
      
      const gregDay = greg.day;
      const gregMonth = greg.month.en;
      const gregYear = greg.year;
      const gregStr = `${gregDay} ${gregMonth} ${gregYear}`;
      
      const hijriDay = hijri.day;
      const hijriMonth = hijri.month.en;
      const hijriYear = hijri.year;
      const arabicDayNum = toArabicNumerals(hijriDay);
      const arabicMonthName = getArabicMonthName(hijriMonth);
      const arabicYearNum = toArabicNumerals(hijriYear);
      const arabicMonthStr = `${arabicDayNum} ${arabicMonthName} ${arabicYearNum}`;
      
      const gregEl = document.getElementById("gregDateText");
      const arabicMonthEl = document.getElementById("arabicMonthText");
      
      if (gregEl) gregEl.innerText = gregStr;
      if (arabicMonthEl) arabicMonthEl.innerText = arabicMonthStr;
      
      savePrayerTimesToStorage(newPrayerTimes, gregStr, arabicMonthStr);
      prayerTimeList = newPrayerTimes;
      
      showToastMessage("✅ সময় আপডেট হয়েছে");
    }
  } catch (error) {
    console.log("Background update failed:", error);
  }
}

async function fetchPrayerTimesFromAPI() {
  try {
    const res = await fetch("https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=4");
    const data = await res.json();
    
    if (data.code === 200 && data.data) {
      const timings = data.data.timings;
      const hijri = data.data.date.hijri;
      const greg = data.data.date.gregorian;
      
      const gregDay = greg.day;
      const gregMonth = greg.month.en;
      const gregYear = greg.year;
      const gregStr = `${gregDay} ${gregMonth} ${gregYear}`;
      
      const hijriDay = hijri.day;
      const hijriMonth = hijri.month.en;
      const hijriYear = hijri.year;
      const arabicDayNum = toArabicNumerals(hijriDay);
      const arabicMonthName = getArabicMonthName(hijriMonth);
      const arabicYearNum = toArabicNumerals(hijriYear);
      const arabicMonthStr = `${arabicDayNum} ${arabicMonthName} ${arabicYearNum}`;
      
      const gregEl = document.getElementById("gregDateText");
      const arabicMonthEl = document.getElementById("arabicMonthText");
      
      if (gregEl) gregEl.innerText = gregStr;
      if (arabicMonthEl) arabicMonthEl.innerText = arabicMonthStr;
      
      const sunriseMinutes = timeToMinutes(timings.Sunrise || "");
      const sunsetMinutes = timeToMinutes(timings.Sunset || "");
      const ishaMinutes = timeToMinutes(timings.Isha || "");
      const midnightMinutes = timeToMinutes(timings.Midnight || timings.Lastthird || "");
      
      prayerTimeList = prayerKeys.map((key, idx) => {
        const startMinutes = timeToMinutes(timings[key]);
        const startRawTime = timings[key];
        const { endMinutes, endRawTime } = calculateEndTime(
          prayerNames[idx], startMinutes, startRawTime,
          sunriseMinutes, sunsetMinutes, ishaMinutes, midnightMinutes
        );
        return {
          name: prayerNames[idx],
          minutes: startMinutes,
          rawTime: startRawTime,
          endMinutes: endMinutes,
          endRawTime: endRawTime
        };
      });
      
      prayerTimeList.sort((a, b) => a.minutes - b.minutes);
      savePrayerTimesToStorage(prayerTimeList, gregStr, arabicMonthStr);
      showToastMessage("নামাজের সময় আপডেট হয়েছে");
    } else {
      throw new Error();
    }
  } catch (error) {
    console.error("API error", error);
    
    const storedData = loadPrayerTimesFromStorage();
    if (storedData && storedData.prayerTimes) {
      prayerTimeList = storedData.prayerTimes;
      loadStoredDates();
      showToastMessage("📱 অফলাইন মোড: সংরক্ষিত সময় দেখানো হচ্ছে");
    } else {
      prayerTimeList = prayerKeys.map((key, idx) => {
        const startMinutes = timeToMinutes(fallbackTimings[key]);
        const startRawTime = fallbackTimings[key];
        const { endMinutes, endRawTime } = calculateEndTime(prayerNames[idx], startMinutes, startRawTime, 0, 0, 0, 0);
        return {
          name: prayerNames[idx],
          minutes: startMinutes,
          rawTime: startRawTime,
          endMinutes: endMinutes,
          endRawTime: endRawTime
        };
      });
      prayerTimeList.sort((a, b) => a.minutes - b.minutes);
      showToastMessage("ডিফল্ট সময় দেখানো হচ্ছে");
      
      const fallbackArabicStr = "٦ ذُو ٱلْقَعْدَة ١٤٤٧";
      savePrayerTimesToStorage(prayerTimeList, "22 April 2026", fallbackArabicStr);
      
      const gregEl = document.getElementById("gregDateText");
      const arabicMonthEl = document.getElementById("arabicMonthText");
      
      if (gregEl) gregEl.innerText = "22 April 2026";
      if (arabicMonthEl) arabicMonthEl.innerText = fallbackArabicStr;
    }
  }
  
  if (currentTimerInterval) clearInterval(currentTimerInterval);
  updateEndTimeTimer();
  currentTimerInterval = setInterval(updateEndTimeTimer, 1000);
}

// ========== WEEKLY PRAYER TRACKER ==========
function loadWeeklyData() {
  const saved = localStorage.getItem('weeklyPrayerTracker_v2');
  if (saved) {
    try { weeklyData = JSON.parse(saved); }
    catch { weeklyData = {}; }
  }
  else weeklyData = {};
  
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
  renderWeeklyStats();
  if (recordModalDateKey === dateKey) renderRecordModal(dateKey);
}

function renderWeeklyCalendar() {
  const container = document.getElementById('weekDaysStrip');
  const rangeElem = document.getElementById('weekCalRange');
  if (!container) return;
  
  const weekDates = getWeekDates();
  const todayStr = formatDateKey(new Date());
  const dayNames = ['রবি', 'সোম', 'মঙ্গ', 'বুধ', 'বৃহ', 'শুক্র', 'শনি'];
  
  if (rangeElem) {
    const s = weekDates[0], e = weekDates[6];
    rangeElem.textContent = `${s.getDate()}/${s.getMonth() + 1} – ${e.getDate()}/${e.getMonth() + 1}`;
  }
  
  container.innerHTML = weekDates.map(date => {
    const dk = formatDateKey(date);
    const prayers = weeklyData[dk] || {};
    const completed = Object.values(prayers).filter(s => s === 'completed').length;
    const isToday = dk === todayStr;
    const isFuture = dk > todayStr;
    const pct = completed > 0 ? Math.round((completed / 5) * 100) : 0;
    const dots = prayerNames.map(p => {
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
    card.addEventListener('click', () => openRecordModal(card.dataset.date));
  });
  renderWeeklyStats();
}

function renderWeeklyStats() {
  const weekDates = getWeekDates();
  const todayStr = formatDateKey(new Date());
  let consecutiveDays = 0;
  let totalCompletedPrayers = 0;
  let totalPossiblePrayers = weekDates.length * 5;
  
  const dailyStats = weekDates.map(date => {
    const dk = formatDateKey(date);
    const prayers = weeklyData[dk] || {};
    const completed = Object.values(prayers).filter(s => s === 'completed').length;
    const isFullDay = (completed === 5);
    return {
      dateKey: dk,
      isFullDay: isFullDay,
      completedCount: completed,
      isToday: dk === todayStr,
      isFuture: dk > todayStr
    };
  });
  
  totalCompletedPrayers = dailyStats.filter(day => !day.isFuture).reduce((sum, day) => sum + day.completedCount, 0);
  
  let currentStreak = 0;
  for (let i = dailyStats.length - 1; i >= 0; i--) {
    const day = dailyStats[i];
    if (day.isFuture) continue;
    if (day.isFullDay) {
      currentStreak++;
    } else {
      break;
    }
  }
  consecutiveDays = currentStreak;
  
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
  const prayers = getDayPrayers(dateKey);
  const date = new Date(dateKey + 'T00:00:00');
  const dayNames = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  const monthNames = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
  const todayStr = formatDateKey(new Date());
  const isFuture = dateKey > todayStr;
  const dayNameEl = document.getElementById('recordModalDayName');
  const countEl = document.getElementById('recordModalCount');
  const listEl = document.getElementById('recordPrayerList');
  
  if (dayNameEl) dayNameEl.textContent = `${dayNames[date.getDay()]}, ${date.getDate()} ${monthNames[date.getMonth()]}`;
  const done = Object.values(prayers).filter(s => s === 'completed').length;
  if (countEl) countEl.textContent = `${done}/৫ সম্পন্ন`;
  if (!listEl) return;
  
  listEl.innerHTML = prayerNames.map((prayer, idx) => {
    const status = prayers[prayer] || 'pending';
    return `
      <div class="record-prayer-row">
        <div class="record-prayer-left">
          <img src="${prayerImages[idx]}" style="width:28px;height:28px;object-fit:contain;">
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
      updatePrayerStatus(dateKey, btn.dataset.prayer, btn.dataset.val);
    });
  });
}

function updateCircleCounts() {
  const todayKey = formatDateKey(new Date());
  const prayers = getDayPrayers(todayKey);
  prayerNames.forEach((prayer, idx) => {
    const countSpan = document.getElementById(`circleCount${idx}`);
    if (countSpan) {
      const status = prayers[prayer] || 'pending';
      let countText = "০/২";
      if (status === 'completed') countText = "১/২";
      else if (status === 'missed') countText = "২/২";
      else countText = "০/২";
      countSpan.textContent = countText;
    }
  });
}

function renderTodayCircles() {
  const todayKey = formatDateKey(new Date());
  const prayers = getDayPrayers(todayKey);
  let done = 0;
  
  prayerNames.forEach((prayer, idx) => {
    const status = prayers[prayer] || 'pending';
    if (status === 'completed') done++;
    const btn = document.querySelector(`.circle-btn[data-prayer-index="${idx}"]`);
    if (btn) {
      btn.className = `circle-btn ${status}`;
    }
  });
  
  updateCircleCounts();
  const totalEl = document.getElementById('trackerTotalCount');
  const fillBar = document.getElementById('progressFillBar');
  if (totalEl) totalEl.innerHTML = `${done}/৫ (${Math.round(done / 5 * 100)}%)`;
  if (fillBar) fillBar.style.width = `${(done / 5) * 100}%`;
}

// ========== THEME & MODAL ==========
function setThemeMode(mode) {
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

function initTheme() {
  setThemeMode(localStorage.getItem("deen_theme") || "light");
  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      setThemeMode(btn.dataset.theme);
      const msg = {
        dark: "🌙 ডার্ক মোড সক্রিয়",
        light: "☀️ লাইট মোড সক্রিয়",
        system: "📱 সিস্টেম থিম"
      }[btn.dataset.theme];
      showToastMessage(msg);
    });
  });
  window.matchMedia("(prefers-color-scheme:dark)").addEventListener("change", () => {
    if (localStorage.getItem("deen_theme") === "system") setThemeMode("system");
  });
}

function initModal() {
  const modal = document.getElementById("settingsModal");
  const ob = document.getElementById("openSettingsBtn");
  const cb = document.getElementById("closeModalBtn");
  if (ob) ob.onclick = () => modal?.classList.add("show");
  if (cb) cb.onclick = () => modal?.classList.remove("show");
  if (modal) modal.onclick = e => { if (e.target === modal) modal.classList.remove("show"); };
}

function showToastMessage(msg) {
  document.querySelector(".toast-msg")?.remove();
  const t = document.createElement("div");
  t.className = "toast-msg";
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(() => t?.parentNode?.removeChild(t), 2200);
}

function initQuickActions() {
  document.querySelectorAll(".action-item").forEach(item => {
    item.addEventListener("click", () =>
      showToastMessage(`✨ ${item.dataset.feature || 'বৈশিষ্ট্য'} শীঘ্রই আসছে`));
  });
  
  const navBtns = document.querySelectorAll(".nav-icon-btn");
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      navBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      showToastMessage(`🔹 ${btn.querySelector(".nav-text")?.innerText || 'পৃষ্ঠা'} শীঘ্রই আসছে`);
    });
  });
}

// ========== INITIALIZATION ==========
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initModal();
  initQuickActions();
  loadWeeklyData();
  renderWeeklyCalendar();
  renderTodayCircles();
  renderWeeklyStats();
  
  document.querySelectorAll('.circle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.prayerIndex);
      const prayer = prayerNames[idx];
      const today = formatDateKey(new Date());
      const prayers = getDayPrayers(today);
      const cur = prayers[prayer] || 'pending';
      const next = cur === 'pending' ? 'completed' : cur === 'completed' ? 'missed' : 'pending';
      updatePrayerStatus(today, prayer, next);
      const labels = {
        completed: `✅ ${prayer} আদায়`,
        missed: `❌ ${prayer} কাযা`,
        pending: `⭕ ${prayer} বাকি`
      };
      showToastMessage(labels[next]);
    });
  });
  
  document.getElementById('recordCloseBtn')?.addEventListener('click', closeRecordModal);
  document.getElementById('recordModal')?.addEventListener('click', e => {
    if (e.target.id === 'recordModal') closeRecordModal();
  });
  
  fetchPrayerTimes();
});